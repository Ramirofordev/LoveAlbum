export type StickerPosition = 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft' | 'center'

export type Photo = {
  id: string
  image: string
  stickerImage?: string
  stickerPosition?: StickerPosition
  isFavorite: boolean
  description: string
  caption: string
  place: string
  date: string
  frameColor: string
  tilt: string
}

export type DatePlanStatus = 'pendiente' | 'hecha' | 'favorita'
export type ActiveView = 'inicio' | 'album' | 'citas'
export type PhotoFilter = 'todas' | 'fecha' | 'lugar'
export type PlanFilter = 'todas' | DatePlanStatus
export type ThemeMode = 'light' | 'dark'

export type DatePlan = {
  id: string
  place: string
  locationUrl: string
  description: string
  date: string
  status: DatePlanStatus
  activities: string[]
}

export type PhotoFormState = {
  description: string
  caption: string
  place: string
  date: string
  frameColor: string
  stickerPosition: StickerPosition
  isFavorite: boolean
}

export type PlanFormState = {
  place: string
  locationUrl: string
  description: string
  date: string
  status: DatePlanStatus
  activities: string
}
