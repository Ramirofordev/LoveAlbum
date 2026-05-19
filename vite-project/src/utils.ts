import type { DatePlan, Photo, ThemeMode } from './types'

export const photoOptimizationThresholdInBytes = 1.5 * 1024 * 1024
export const maxPhotoSizeInBytes = 5 * 1024 * 1024
export const maxStickerSizeInBytes = 512 * 1024
export const maxOptimizedPhotoSide = 1920

const validStatuses = new Set(['pendiente', 'hecha', 'favorita'])
const validStickerPositions = new Set(['topRight', 'topLeft'])
const validStickerSizes = new Set(['small', 'medium', 'large'])

export const todayIsoDate = () => new Date().toISOString().slice(0, 10)

export const createId = () => crypto.randomUUID()

export async function optimizePhotoFile(file: File): Promise<{ file: File; wasOptimized: boolean }> {
  if (file.size <= photoOptimizationThresholdInBytes || file.type === 'image/gif') {
    return { file, wasOptimized: false }
  }

  const image = await loadImage(file)
  const scale = Math.min(1, maxOptimizedPhotoSide / Math.max(image.width, image.height))
  const width = Math.max(1, Math.round(image.width * scale))
  const height = Math.max(1, Math.round(image.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) return { file, wasOptimized: false }

  context.drawImage(image, 0, 0, width, height)
  URL.revokeObjectURL(image.src)

  const optimizedBlob = await canvasToBlob(canvas, 'image/jpeg', 0.82)
  if (!optimizedBlob || optimizedBlob.size >= file.size) {
    return { file, wasOptimized: false }
  }

  const optimizedFile = new File([optimizedBlob], replaceFileExtension(file.name, 'jpg'), {
    type: 'image/jpeg',
    lastModified: Date.now(),
  })

  return { file: optimizedFile, wasOptimized: true }
}

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
  readStoredArray('loveAlbum.plans', fallback, isDatePlan).map(normalizePlan)

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

const loadImage = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => {
      URL.revokeObjectURL(image.src)
      reject(new Error('No se pudo preparar la imagen para optimizarla.'))
    }
    image.src = URL.createObjectURL(file)
  })

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, type, quality)
  })

const replaceFileExtension = (fileName: string, extension: string) => {
  const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, '')
  return `${nameWithoutExtension || 'photo'}.${extension}`
}

const normalizePhoto = (photo: Photo): Photo => ({
  ...photo,
  stickerPosition:
    photo.stickerPosition && validStickerPositions.has(photo.stickerPosition)
      ? photo.stickerPosition
      : photo.stickerImage
        ? 'topRight'
        : undefined,
  stickerSize:
    photo.stickerSize && validStickerSizes.has(photo.stickerSize)
      ? photo.stickerSize
      : photo.stickerImage
        ? 'medium'
        : undefined,
  showOnProfile: Boolean(photo.showOnProfile),
})

const normalizePlan = (plan: DatePlan): DatePlan => ({
  ...plan,
  showOnProfile: Boolean(plan.showOnProfile),
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
    (photo.showOnProfile === undefined || typeof photo.showOnProfile === 'boolean') &&
    (photo.stickerImage === undefined || isString(photo.stickerImage)) &&
    (photo.stickerSize === undefined || validStickerSizes.has(photo.stickerSize))
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
    (plan.showOnProfile === undefined || typeof plan.showOnProfile === 'boolean') &&
    Array.isArray(plan.activities) &&
    plan.activities.every(isString)
  )
}
