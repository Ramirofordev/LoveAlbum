import { supabase } from '../lib/supabase'
import type { AlbumProfile, DatePlan, LoveAlbum, Photo, PhotoFormState, PlanFormState, StickerPosition, StickerSize, ThemeMode, UserProfile } from '../types'
import { createId, normalizeSafeUrl } from '../utils'

type LoveAlbumRow = {
  id: string
  name: string
  invite_code: string
}

type LovePhotoRow = {
  id: string
  user_id: string
  image_path: string
  sticker_path: string | null
  sticker_position: StickerPosition | null
  sticker_size: StickerSize | null
  is_favorite: boolean
  show_on_profile: boolean
  description: string
  caption: string
  place: string
  photo_date: string | null
  frame_color: string
  tilt: string
}

type LoveDatePlanRow = {
  id: string
  user_id: string
  place: string
  location_url: string
  description: string
  plan_date: string | null
  status: DatePlan['status']
  show_on_profile: boolean
  activities: string[]
}

type UserProfileRow = {
  user_id: string
  display_name: string
  bio: string
  avatar_url: string
  theme_mode: ThemeMode
}

type AlbumProfileRow = {
  album_id: string
  title: string
  description: string
  accent_color: string
  cover_photo_id: string | null
}

const signedUrlTtlInSeconds = 60 * 60

export const getPhotoExtension = (file: File) => file.name.split('.').pop()?.toLowerCase() || file.type.split('/').pop() || 'jpg'

export async function fetchAlbums(): Promise<LoveAlbum[]> {
  if (!supabase) return []

  const { data, error } = await supabase.from('love_albums').select('id, name, invite_code').limit(1)
  if (error) throw error

  return (data ?? []).map(mapAlbumRow)
}

export async function createAlbum(name: string): Promise<LoveAlbum> {
  if (!supabase) throw new Error('Supabase no está configurado.')

  const { data, error } = await supabase.rpc('create_love_album', { album_name: name })
  if (error) throw error

  return mapAlbumRow(data as LoveAlbumRow)
}

export async function joinAlbum(inviteCode: string): Promise<LoveAlbum> {
  if (!supabase) throw new Error('Supabase no está configurado.')

  const { data, error } = await supabase.rpc('join_love_album', { album_invite_code: inviteCode })
  if (error) throw error

  return mapAlbumRow(data as LoveAlbumRow)
}

export async function fetchPhotos(albumId: string): Promise<Photo[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('love_photos')
    .select('id, user_id, image_path, sticker_path, sticker_position, sticker_size, is_favorite, show_on_profile, description, caption, place, photo_date, frame_color, tilt')
    .eq('album_id', albumId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return Promise.all((data ?? []).map(mapPhotoRow))
}

export async function fetchPlans(albumId: string): Promise<DatePlan[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('love_date_plans')
    .select('id, user_id, place, location_url, description, plan_date, status, show_on_profile, activities')
    .eq('album_id', albumId)
    .order('plan_date', { ascending: true, nullsFirst: false })

  if (error) throw error

  return (data ?? []).map(mapPlanRow)
}

export async function createPhoto(albumId: string, photoFile: File, stickerFile: File | null, form: PhotoFormState): Promise<Photo> {
  if (!supabase) throw new Error('Supabase no está configurado.')

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError) throw userError
  if (!user) throw new Error('Necesitás iniciar sesión para guardar fotos.')

  const photoId = createId()
  const imagePath = `${albumId}/${photoId}.${getPhotoExtension(photoFile)}`
  const { error: imageError } = await supabase.storage.from('photos').upload(imagePath, photoFile)
  if (imageError) throw imageError

  let stickerPath: string | null = null
  if (stickerFile) {
    stickerPath = `${albumId}/${photoId}.${getPhotoExtension(stickerFile)}`
    const { error: stickerError } = await supabase.storage.from('stickers').upload(stickerPath, stickerFile)
    if (stickerError) throw stickerError
  }

  const row = {
    id: photoId,
    album_id: albumId,
    user_id: user.id,
    image_path: imagePath,
    sticker_path: stickerPath,
    sticker_position: stickerPath ? form.stickerPosition : null,
    sticker_size: stickerPath ? form.stickerSize : null,
    is_favorite: form.isFavorite,
    show_on_profile: form.showOnProfile,
    description: form.description,
    caption: form.caption,
    place: form.place || 'Sin lugar definido',
    photo_date: form.date || null,
    frame_color: form.frameColor,
    tilt: `${Math.random() > 0.5 ? '' : '-'}${(Math.random() * 2.5 + 0.5).toFixed(1)}deg`,
  }

  const { data, error } = await supabase.from('love_photos').insert(row).select().single()
  if (error) throw error

  return mapPhotoRow(data as LovePhotoRow)
}

export async function updatePhoto(photoId: string, updates: PhotoFormState) {
  if (!supabase) throw new Error('Supabase no está configurado.')

  const { error } = await supabase
    .from('love_photos')
    .update({
      description: updates.description,
      caption: updates.caption,
      place: updates.place || 'Sin lugar definido',
      photo_date: updates.date || null,
      frame_color: updates.frameColor,
      is_favorite: updates.isFavorite,
      show_on_profile: updates.showOnProfile,
      sticker_position: updates.stickerPosition,
      sticker_size: updates.stickerSize,
    })
    .eq('id', photoId)

  if (error) throw error
}

export async function deletePhoto(photo: Photo) {
  if (!supabase) throw new Error('Supabase no está configurado.')

  if (photo.imagePath) await supabase.storage.from('photos').remove([photo.imagePath])
  if (photo.stickerPath) await supabase.storage.from('stickers').remove([photo.stickerPath])

  const { error } = await supabase.from('love_photos').delete().eq('id', photo.id)
  if (error) throw error
}

export async function createPlan(albumId: string, form: PlanFormState): Promise<DatePlan> {
  if (!supabase) throw new Error('Supabase no está configurado.')

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError) throw userError
  if (!user) throw new Error('Necesitás iniciar sesión para guardar citas.')

  const row = {
    album_id: albumId,
    user_id: user.id,
    place: form.place,
    location_url: normalizeSafeUrl(form.locationUrl),
    description: form.description,
    plan_date: form.date || null,
    status: form.status,
    show_on_profile: form.showOnProfile,
    activities: form.activities
      .split('\n')
      .map((activity) => activity.trim())
      .filter(Boolean),
  }

  const { data, error } = await supabase.from('love_date_plans').insert(row).select().single()
  if (error) throw error

  return mapPlanRow(data as LoveDatePlanRow)
}

export async function updatePlan(planId: string, updates: PlanFormState) {
  if (!supabase) throw new Error('Supabase no está configurado.')

  const { error } = await supabase
    .from('love_date_plans')
    .update({
      place: updates.place,
      location_url: normalizeSafeUrl(updates.locationUrl),
      description: updates.description,
      plan_date: updates.date || null,
      status: updates.status,
      show_on_profile: updates.showOnProfile,
      activities: updates.activities
        .split('\n')
        .map((activity) => activity.trim())
        .filter(Boolean),
    })
    .eq('id', planId)

  if (error) throw error
}

export async function deletePlan(planId: string) {
  if (!supabase) throw new Error('Supabase no está configurado.')

  const { error } = await supabase.from('love_date_plans').delete().eq('id', planId)
  if (error) throw error
}

export async function fetchUserProfile(userId: string, email?: string): Promise<UserProfile> {
  if (!supabase) return getDefaultUserProfile(userId, email)

  const { data, error } = await supabase
    .from('love_user_profiles')
    .select('user_id, display_name, bio, avatar_url, theme_mode')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  if (!data) return getDefaultUserProfile(userId, email)

  return mapUserProfileRow(data as UserProfileRow, email)
}

export async function saveUserProfile(profile: UserProfile): Promise<UserProfile> {
  if (!supabase) throw new Error('Supabase no está configurado.')

  const { data, error } = await supabase
    .from('love_user_profiles')
    .upsert({
      user_id: profile.userId,
      display_name: profile.displayName,
      bio: profile.bio,
      avatar_url: normalizeSafeUrl(profile.avatarUrl),
      theme_mode: profile.themeMode,
      updated_at: new Date().toISOString(),
    })
    .select('user_id, display_name, bio, avatar_url, theme_mode')
    .single()

  if (error) throw error
  return mapUserProfileRow(data as UserProfileRow)
}

export async function fetchAlbumProfile(album: LoveAlbum): Promise<AlbumProfile> {
  if (!supabase) return getDefaultAlbumProfile(album)

  const { data, error } = await supabase
    .from('love_album_profiles')
    .select('album_id, title, description, accent_color, cover_photo_id')
    .eq('album_id', album.id)
    .maybeSingle()

  if (error) throw error
  if (!data) return getDefaultAlbumProfile(album)

  return mapAlbumProfileRow(data as AlbumProfileRow, album)
}

export async function saveAlbumProfile(profile: AlbumProfile): Promise<AlbumProfile> {
  if (!supabase) throw new Error('Supabase no está configurado.')

  const { data, error } = await supabase
    .from('love_album_profiles')
    .upsert({
      album_id: profile.albumId,
      title: profile.title,
      description: profile.description,
      accent_color: profile.accentColor,
      cover_photo_id: profile.coverPhotoId || null,
      updated_at: new Date().toISOString(),
    })
    .select('album_id, title, description, accent_color, cover_photo_id')
    .single()

  if (error) throw error
  return mapAlbumProfileRow(data as AlbumProfileRow)
}

function mapAlbumRow(row: LoveAlbumRow): LoveAlbum {
  return {
    id: row.id,
    name: row.name,
    inviteCode: row.invite_code,
  }
}

async function mapPhotoRow(row: LovePhotoRow): Promise<Photo> {
  const image = await createSignedUrl('photos', row.image_path)
  const stickerImage = row.sticker_path ? await createSignedUrl('stickers', row.sticker_path) : undefined

  return {
    id: row.id,
    userId: row.user_id,
    image,
    imagePath: row.image_path,
    stickerImage,
    stickerPath: row.sticker_path ?? undefined,
    stickerPosition: row.sticker_position ?? undefined,
    stickerSize: row.sticker_size ?? undefined,
    isFavorite: row.is_favorite,
    showOnProfile: row.show_on_profile,
    description: row.description,
    caption: row.caption,
    place: row.place,
    date: row.photo_date ?? '',
    frameColor: row.frame_color,
    tilt: row.tilt,
  }
}

function mapPlanRow(row: LoveDatePlanRow): DatePlan {
  return {
    id: row.id,
    userId: row.user_id,
    place: row.place,
    locationUrl: row.location_url,
    description: row.description,
    date: row.plan_date ?? '',
    status: row.status,
    showOnProfile: row.show_on_profile,
    activities: row.activities,
  }
}

function getDefaultUserProfile(userId: string, email?: string): UserProfile {
  return {
    userId,
    displayName: email?.split('@')[0] ?? 'Mi perfil',
    bio: '',
    avatarUrl: '',
    themeMode: 'light',
  }
}

function getDefaultAlbumProfile(album: LoveAlbum): AlbumProfile {
  return {
    albumId: album.id,
    title: album.name,
    description: '',
    accentColor: '#b85b72',
    coverPhotoId: '',
  }
}

function mapUserProfileRow(row: UserProfileRow, email?: string): UserProfile {
  return {
    userId: row.user_id,
    displayName: row.display_name || email?.split('@')[0] || 'Mi perfil',
    bio: row.bio,
    avatarUrl: row.avatar_url,
    themeMode: row.theme_mode,
  }
}

function mapAlbumProfileRow(row: AlbumProfileRow, fallbackAlbum?: LoveAlbum): AlbumProfile {
  return {
    albumId: row.album_id,
    title: row.title || fallbackAlbum?.name || 'Nuestro álbum',
    description: row.description,
    accentColor: row.accent_color || '#b85b72',
    coverPhotoId: row.cover_photo_id ?? '',
  }
}

async function createSignedUrl(bucket: 'photos' | 'stickers', path: string) {
  if (!supabase) return ''

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, signedUrlTtlInSeconds)
  if (error) throw error

  return data.signedUrl
}
