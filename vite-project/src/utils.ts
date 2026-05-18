import type { DatePlan, Photo, ThemeMode } from './types'

export const maxPhotoSizeInBytes = 1.5 * 1024 * 1024
export const maxStickerSizeInBytes = 512 * 1024

const validStatuses = new Set(['pendiente', 'hecha', 'favorita'])
const validStickerPositions = new Set(['topRight', 'topLeft'])

export const todayIsoDate = () => new Date().toISOString().slice(0, 10)

export const createId = () => crypto.randomUUID()

export const normalizeSafeUrl = (url: string) => {
  const trimmedUrl = url.trim()

  if (!trimmedUrl) return ''

  try {
    const parsedUrl = new URL(trimmedUrl)
    return ['http:', 'https:'].includes(parsedUrl.protocol) ? parsedUrl.toString() : ''
  } catch {
    return ''
  }
}

export const readStoredPhotos = (fallback: Photo[]) =>
  readStoredArray('loveAlbum.photos', fallback, isPhoto).map(normalizePhoto)
export const readStoredPlans = (fallback: DatePlan[]) =>
  readStoredArray('loveAlbum.plans', fallback, isDatePlan)

export const readStoredTheme = (fallback: ThemeMode): ThemeMode => {
  if (typeof window === 'undefined') return fallback

  try {
    const storedTheme = window.localStorage.getItem('loveAlbum.themeMode')
    return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : fallback
  } catch {
    return fallback
  }
}

export const writeStoredValue = (key: string, value: unknown) => {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn(`No se pudo persistir ${key} en localStorage.`, error)
  }
}

const normalizePhoto = (photo: Photo): Photo => ({
  ...photo,
  stickerPosition:
    photo.stickerPosition && validStickerPositions.has(photo.stickerPosition)
      ? photo.stickerPosition
      : photo.stickerImage
        ? 'topRight'
        : undefined,
})

const readStoredArray = <T>(key: string, fallback: T[], isValidItem: (item: unknown) => item is T): T[] => {
  if (typeof window === 'undefined') return fallback

  try {
    const storedValue = window.localStorage.getItem(key)
    if (!storedValue) return fallback


    const parsedValue = JSON.parse(storedValue)
    if (!Array.isArray(parsedValue)) return fallback

    const validItems = parsedValue.filter(isValidItem)
    return validItems.length === parsedValue.length ? validItems : fallback
  } catch {
    return fallback
  }
}

const isString = (value: unknown): value is string => typeof value === 'string'

const isPhoto = (value: unknown): value is Photo => {
  if (!value || typeof value !== 'object') return false

  const photo = value as Partial<Photo>

  return (
    isString(photo.id) &&
    isString(photo.image) &&
    isString(photo.description) &&
    isString(photo.caption) &&
    isString(photo.place) &&
    isString(photo.date) &&
    isString(photo.frameColor) &&
    isString(photo.tilt) &&
    typeof photo.isFavorite === 'boolean' &&
    (photo.stickerImage === undefined || isString(photo.stickerImage))
  )
}

const isDatePlan = (value: unknown): value is DatePlan => {
  if (!value || typeof value !== 'object') return false

  const plan = value as Partial<DatePlan>

  return (
    isString(plan.id) &&
    isString(plan.place) &&
    isString(plan.locationUrl) &&
    isString(plan.description) &&
    isString(plan.date) &&
    typeof plan.status === 'string' &&
    validStatuses.has(plan.status) &&
    Array.isArray(plan.activities) &&
    plan.activities.every(isString)
  )
}
