import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import styles from './App.module.css'
import { AlbumView } from './components/AlbumView'
import { Dashboard } from './components/Dashboard'
import { DatePlanner } from './components/DatePlanner'
import { LoginScreen } from './components/LoginScreen'
import { initialPhotos, initialPlans } from './data'
import type { ActiveView, DatePlan, DatePlanStatus, Photo, PhotoFilter, PhotoFormState, PlanFilter, PlanFormState, ThemeMode } from './types'
import {
  createId,
  maxPhotoSizeInBytes,
  maxStickerSizeInBytes,
  normalizeSafeUrl,
  readStoredPhotos,
  readStoredPlans,
  readStoredTheme,
  todayIsoDate,
  writeStoredValue,
} from './utils'

const defaultPhotoForm: PhotoFormState = {
  description: '',
  caption: '',
  place: '',
  date: '',
  frameColor: '#fffaf4',
  stickerPosition: 'topRight',
  isFavorite: false,
}

const defaultPlanForm: PlanFormState = {
  place: '',
  locationUrl: '',
  description: '',
  date: '',
  status: 'pendiente',
  activities: '',
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => readStoredTheme('light'))
  const [activeView, setActiveView] = useState<ActiveView>('inicio')
  const [isPhotoFormOpen, setIsPhotoFormOpen] = useState(false)
  const [isPlanFormOpen, setIsPlanFormOpen] = useState(false)
  const [photoFilter, setPhotoFilter] = useState<PhotoFilter>('todas')
  const [planFilter, setPlanFilter] = useState<PlanFilter>('todas')
  const [photos, setPhotos] = useState<Photo[]>(() => readStoredPhotos(initialPhotos))
  const [plans, setPlans] = useState<DatePlan[]>(() => readStoredPlans(initialPlans))
  const [photoForm, setPhotoForm] = useState<PhotoFormState>(defaultPhotoForm)
  const [photoPreview, setPhotoPreview] = useState('')
  const [stickerPreview, setStickerPreview] = useState('')
  const [planForm, setPlanForm] = useState<PlanFormState>(defaultPlanForm)
  const [photoError, setPhotoError] = useState('')
  const [stickerError, setStickerError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const stickerInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => writeStoredValue('loveAlbum.photos', photos), [photos])
  useEffect(() => writeStoredValue('loveAlbum.plans', plans), [plans])
  useEffect(() => writeStoredValue('loveAlbum.themeMode', themeMode), [themeMode])

  const groupedPlaces = useMemo(() => Array.from(new Set(photos.map((photo) => photo.place))).join(' · '), [photos])

  const favoritePhotos = useMemo(() => photos.filter((photo) => photo.isFavorite), [photos])

  const favoritePlans = useMemo(() => plans.filter((plan) => plan.status === 'favorita'), [plans])

  const upcomingPendingPlans = useMemo(
    () =>
      plans
        .filter((plan) => plan.status === 'pendiente' && plan.date >= todayIsoDate())
        .sort((firstPlan, secondPlan) => firstPlan.date.localeCompare(secondPlan.date))
        .slice(0, 3),
    [plans],
  )

  const filteredPhotos = useMemo(() => {
    const sortedPhotos = [...photos]

    if (photoFilter === 'fecha') {
      return sortedPhotos.sort((firstPhoto, secondPhoto) => secondPhoto.date.localeCompare(firstPhoto.date))
    }

    if (photoFilter === 'lugar') {
      return sortedPhotos.sort((firstPhoto, secondPhoto) => firstPhoto.place.localeCompare(secondPhoto.place))
    }

    return sortedPhotos
  }, [photoFilter, photos])

  const filteredPlans = useMemo(
    () => (planFilter === 'todas' ? plans : plans.filter((plan) => plan.status === planFilter)),
    [planFilter, plans],
  )

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsAuthenticated(true)
  }

  const handlePhotoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setPhotoError('Elegí un archivo de imagen válido.')
      event.target.value = ''
      return
    }

    if (file.size > maxPhotoSizeInBytes) {
      setPhotoError('La imagen debe pesar menos de 1.5 MB para poder guardarse localmente.')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setPhotoError('')
      setPhotoPreview(String(reader.result))
    }
    reader.readAsDataURL(file)
  }

  const handleStickerUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setStickerError('El sticker también debe ser una imagen.')
      event.target.value = ''
      return
    }

    if (file.size > maxStickerSizeInBytes) {
      setStickerError('El sticker debe pesar menos de 512 KB para poder guardarse localmente.')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setStickerError('')
      setStickerPreview(String(reader.result))
    }
    reader.readAsDataURL(file)
  }

  const handleAddPhoto = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!photoPreview) return

    setPhotos((currentPhotos) => [
      {
        id: createId(),
        image: photoPreview,
        stickerImage: stickerPreview,
        stickerPosition: stickerPreview ? photoForm.stickerPosition : undefined,
        isFavorite: photoForm.isFavorite,
        description: photoForm.description,
        caption: photoForm.caption,
        place: photoForm.place || 'Sin lugar definido',
        date: photoForm.date,
        frameColor: photoForm.frameColor,
        tilt: `${Math.random() > 0.5 ? '' : '-'}${(Math.random() * 2.5 + 0.5).toFixed(1)}deg`,
      },
      ...currentPhotos,
    ])

    setPhotoForm(defaultPhotoForm)
    setPhotoPreview('')
    setStickerPreview('')
    setPhotoError('')
    setStickerError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (stickerInputRef.current) stickerInputRef.current.value = ''
  }

  const handleAddPlan = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPlans((currentPlans) => [
      {
        id: createId(),
        place: planForm.place,
        locationUrl: normalizeSafeUrl(planForm.locationUrl),
        description: planForm.description,
        date: planForm.date,
        status: planForm.status,
        activities: planForm.activities
          .split('\n')
          .map((activity) => activity.trim())
          .filter(Boolean),
      },
      ...currentPlans,
    ])
    setPlanForm(defaultPlanForm)
  }

  const handleTogglePhotoFavorite = (photoId: string) => {
    setPhotos((currentPhotos) =>
      currentPhotos.map((photo) => (photo.id === photoId ? { ...photo, isFavorite: !photo.isFavorite } : photo)),
    )
  }

  const handleUpdatePhoto = (photoId: string, updates: PhotoFormState) => {
    setPhotos((currentPhotos) =>
      currentPhotos.map((photo) =>
        photo.id === photoId
          ? {
              ...photo,
              description: updates.description,
              caption: updates.caption,
              place: updates.place || 'Sin lugar definido',
              date: updates.date,
              frameColor: updates.frameColor,
              isFavorite: updates.isFavorite,
              stickerPosition: photo.stickerImage ? updates.stickerPosition : undefined,
            }
          : photo,
      ),
    )
  }

  const handleDeletePhoto = (photoId: string) => {
    setPhotos((currentPhotos) => currentPhotos.filter((photo) => photo.id !== photoId))
  }

  const handleUpdatePlan = (planId: string, updates: PlanFormState) => {
    setPlans((currentPlans) =>
      currentPlans.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              place: updates.place,
              locationUrl: normalizeSafeUrl(updates.locationUrl),
              description: updates.description,
              date: updates.date,
              status: updates.status,
              activities: updates.activities
                .split('\n')
                .map((activity) => activity.trim())
                .filter(Boolean),
            }
          : plan,
      ),
    )
  }

  const handleDeletePlan = (planId: string) => {
    setPlans((currentPlans) => currentPlans.filter((plan) => plan.id !== planId))
  }

  const handlePlanStatusChange = (planId: string, status: DatePlanStatus) => {
    setPlans((currentPlans) => currentPlans.map((plan) => (plan.id === planId ? { ...plan, status } : plan)))
  }

  const handleToggleTheme = () => {
    setThemeMode((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'))
  }

  if (!isAuthenticated) {
    return <LoginScreen themeMode={themeMode} onLogin={handleLogin} onToggleTheme={handleToggleTheme} />
  }

  return (
    <main className={`${styles.appShell} ${styles.texture} px-4 py-6 md:px-8`} data-theme={themeMode}>
      <header className="sticky top-4 z-20 mx-auto flex max-w-7xl justify-end">
        <nav className={`${styles.navBar} flex flex-wrap justify-end gap-2 rounded-full p-2`} aria-label="Secciones principales">
          {(['inicio', 'album', 'citas'] as ActiveView[]).map((view) => (
            <button
              className={`${styles.navButton} ${activeView === view ? styles.navButtonActive : ''} px-4 py-2 text-sm font-semibold`}
              key={view}
              type="button"
              onClick={() => setActiveView(view)}
            >
              {view === 'inicio' ? 'Inicio' : view === 'album' ? 'Álbum' : 'Citas'}
            </button>
          ))}
          <button
            className={`${styles.buttonGhost} ${styles.themeToggle} px-4 py-2 text-sm font-semibold`}
            type="button"
            onClick={handleToggleTheme}
          >
            {themeMode === 'light' ? 'Modo oscuro' : 'Modo claro'}
          </button>
        </nav>
      </header>

      {activeView === 'inicio' && (
        <Dashboard
          photos={photos}
          plans={plans}
          favoritePhotos={favoritePhotos}
          favoritePlans={favoritePlans}
          upcomingPendingPlans={upcomingPendingPlans}
        />
      )}

      {activeView === 'album' && (
        <AlbumView
          groupedPlaces={groupedPlaces}
          isPhotoFormOpen={isPhotoFormOpen}
          photoFilter={photoFilter}
          photos={filteredPhotos}
          photoForm={photoForm}
          photoPreview={photoPreview}
          stickerPreview={stickerPreview}
          photoError={photoError}
          stickerError={stickerError}
          fileInputRef={fileInputRef}
          stickerInputRef={stickerInputRef}
          onToggleForm={() => setIsPhotoFormOpen((isOpen) => !isOpen)}
          onFilterChange={setPhotoFilter}
          onFormChange={setPhotoForm}
          onPhotoUpload={handlePhotoUpload}
          onStickerUpload={handleStickerUpload}
          onAddPhoto={handleAddPhoto}
          onTogglePhotoFavorite={handleTogglePhotoFavorite}
          onUpdatePhoto={handleUpdatePhoto}
          onDeletePhoto={handleDeletePhoto}
        />
      )}

      {activeView === 'citas' && (
        <DatePlanner
          isPlanFormOpen={isPlanFormOpen}
          planFilter={planFilter}
          plans={filteredPlans}
          planForm={planForm}
          onToggleForm={() => setIsPlanFormOpen((isOpen) => !isOpen)}
          onFilterChange={setPlanFilter}
          onFormChange={setPlanForm}
          onAddPlan={handleAddPlan}
          onUpdatePlan={handleUpdatePlan}
          onDeletePlan={handleDeletePlan}
          onStatusChange={handlePlanStatusChange}
        />
      )}
    </main>
  )
}

export default App
