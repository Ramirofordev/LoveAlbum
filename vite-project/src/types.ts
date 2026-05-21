export type StickerPosition = 'topRight' | 'topLeft'
export type StickerSize = 'small' | 'medium' | 'large'

export type Photo = {
  id: string
  userId?: string
  image: string
  imagePath?: string
  stickerImage?: string
  stickerPath?: string
  stickerPosition?: StickerPosition
  stickerSize?: StickerSize
  isFavorite: boolean
  showOnProfile: boolean
  description: string
  caption: string
  place: string
  date: string
  frameColor: string
  tilt: string
}

export type DatePlanStatus = 'pendiente' | 'hecha' | 'favorita'
export type ActiveView = 'inicio' | 'album' | 'citas' | 'perfil' | 'configuracion'
export type PhotoFilter = 'todas' | 'fecha' | 'lugar'
export type PlanFilter = 'todas' | DatePlanStatus
export type ThemeMode = 'light' | 'dark'

export type LoveAlbum = {
  id: string
  name: string
  inviteCode: string
}

export type UserProfile = {
  userId: string
  displayName: string
  bio: string
  avatarUrl: string
  avatarPath: string
  themeMode: ThemeMode
}

export type AlbumProfile = {
  albumId: string
  title: string
  description: string
  accentColor: string
  coverPhotoId: string
  coverImage: string
  coverImagePath: string
}

export type DatePlan = {
  id: string
  userId?: string
  place: string
  locationUrl: string
  description: string
  date: string
  status: DatePlanStatus
  showOnProfile: boolean
  activities: string[]
}

export type PhotoFormState = {
  description: string
  caption: string
  place: string
  date: string
  frameColor: string
  stickerPosition: StickerPosition
  stickerSize: StickerSize
  isFavorite: boolean
  showOnProfile: boolean
}

export type PlanFormState = {
  place: string
  locationUrl: string
  description: string
  date: string
  status: DatePlanStatus
  showOnProfile: boolean
  activities: string
}
