import { supabase } from '../lib/supabase'
import type { DatePlan, LoveAlbum, Photo, PhotoFormState, PlanFormState, StickerPosition } from '../types'
import { createId, normalizeSafeUrl } from '../utils'

type LoveAlbumRow = {
  id: string
  name: string
  invite_code: string
}

type LovePhotoRow = {
  id: string
  image_path: string
  sticker_path: string | null
  sticker_position: StickerPosition | null
  is_favorite: boolean
  description: string
  caption: string
  place: string
  photo_date: string | null
  frame_color: string
  tilt: string
}

type LoveDatePlanRow = {
  id: string
  place: string
  location_url: string
  description: string
  plan_date: string | null
  status: DatePlan['status']
  activities: string[]
}

const signedUrlTtlInSeconds = 60 * 60

export const getPhotoExtension = (file: File) => file.name.split('.').pop()?.toLowerCase() || file.type.split('/').pop() || 'jpg'

export async function fetchAlbums(): Promise<LoveAlbum[]> {
  if (!supabase) return []

  const { data, error } = await supabase.from('love_albums').select('id, name, invite_code').order('created_at', { ascending: true })
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
    .select('id, image_path, sticker_path, sticker_position, is_favorite, description, caption, place, photo_date, frame_color, tilt')
    .eq('album_id', albumId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return Promise.all((data ?? []).map(mapPhotoRow))
}

export async function fetchPlans(albumId: string): Promise<DatePlan[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('love_date_plans')
    .select('id, place, location_url, description, plan_date, status, activities')
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
    is_favorite: form.isFavorite,
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
      sticker_position: updates.stickerPosition,
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
    image,
    imagePath: row.image_path,
    stickerImage,
    stickerPath: row.sticker_path ?? undefined,
    stickerPosition: row.sticker_position ?? undefined,
    isFavorite: row.is_favorite,
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
    place: row.place,
    locationUrl: row.location_url,
    description: row.description,
    date: row.plan_date ?? '',
    status: row.status,
    activities: row.activities,
  }
}

async function createSignedUrl(bucket: 'photos' | 'stickers', path: string) {
  if (!supabase) return ''

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, signedUrlTtlInSeconds)
  if (error) throw error

  return data.signedUrl
}
