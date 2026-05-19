import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { User } from '@supabase/supabase-js'
import styles from './App.module.css'
import { AlbumGate } from './components/AlbumGate'
import { AlbumView } from './components/AlbumView'
import { Dashboard } from './components/Dashboard'
import { DatePlanner } from './components/DatePlanner'
import { LoginScreen } from './components/LoginScreen'
import { ThemeToggle } from './components/ThemeToggle'
import { initialPhotos, initialPlans } from './data'
import { supabase } from './lib/supabase'
import {
  createAlbum,
  createPhoto,
  createPlan,
  deletePhoto,
  deletePlan,
  fetchAlbums,
  fetchPhotos,
  fetchPlans,
  joinAlbum,
  updatePhoto,
  updatePlan,
} from './services/loveAlbumService'
import type { ActiveView, DatePlan, DatePlanStatus, LoveAlbum, Photo, PhotoFilter, PhotoFormState, PlanFilter, PlanFormState, ThemeMode } from './types'
import {
  createId,
  maxPhotoSizeInBytes,
  maxStickerSizeInBytes,
  normalizeSafeUrl,
  optimizePhotoFile,
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
  stickerSize: 'medium',
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

const getStoredAlbumIdKey = (userId: string) => `loveAlbum.currentAlbumId.${userId}`

const readStoredAlbumId = (userId: string) => {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage.getItem(getStoredAlbumIdKey(userId))
  } catch {
    return null
  }
}

const writeStoredAlbumId = (userId: string, albumId: string) => {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(getStoredAlbumIdKey(userId), albumId)
  } catch (error) {
    console.warn('No se pudo persistir el álbum activo en localStorage.', error)
  }
}

const getAuthErrorMessage = (message: string) => {
  if (message === 'Invalid login credentials') {
    return 'No encontramos esa cuenta o la contraseña no coincide. Si todavía no la creaste, usá “Crear cuenta”.'
  }

  if (message.toLowerCase().includes('email not confirmed')) {
    return 'La cuenta existe, pero falta confirmar el email antes de entrar.'
  }

  return message
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(Boolean(supabase))
  const [authError, setAuthError] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [dataError, setDataError] = useState('')
  const [albumError, setAlbumError] = useState('')
  const [isAlbumLoading, setIsAlbumLoading] = useState(false)
  const [albums, setAlbums] = useState<LoveAlbum[]>([])
  const [currentAlbum, setCurrentAlbum] = useState<LoveAlbum | null>(null)
  const [albumName, setAlbumName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
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
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [stickerFile, setStickerFile] = useState<File | null>(null)
  const [photoError, setPhotoError] = useState('')
  const [stickerError, setStickerError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const stickerInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => writeStoredValue('loveAlbum.photos', photos), [photos])
  useEffect(() => writeStoredValue('loveAlbum.plans', plans), [plans])
  useEffect(() => writeStoredValue('loveAlbum.themeMode', themeMode), [themeMode])

  useEffect(() => {
    if (!supabase) return

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setIsAuthLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!supabase || !user) return

    let shouldUpdate = true

    void Promise.resolve().then(async () => {
      setIsAlbumLoading(true)

      try {
        const remoteAlbums = await fetchAlbums()
        if (!shouldUpdate) return

        const storedAlbumId = readStoredAlbumId(user.id)
        const storedAlbum = remoteAlbums.find((album) => album.id === storedAlbumId)

        setAlbums(remoteAlbums)
        setCurrentAlbum((selectedAlbum) => {
          const stillAvailableAlbum = remoteAlbums.find((album) => album.id === selectedAlbum?.id)
          return stillAvailableAlbum ?? storedAlbum ?? remoteAlbums[0] ?? null
        })
        setAlbumError('')
      } catch (error) {
        if (!shouldUpdate) return
        setAlbumError(error instanceof Error ? error.message : 'No se pudieron cargar tus álbumes.')
      } finally {
        if (shouldUpdate) setIsAlbumLoading(false)
      }
    })

    return () => {
      shouldUpdate = false
    }
  }, [user])

  useEffect(() => {
    if (!user || !currentAlbum) return

    writeStoredAlbumId(user.id, currentAlbum.id)
  }, [currentAlbum, user])

  useEffect(() => {
    if (!supabase || !user || !currentAlbum) return

    Promise.all([fetchPhotos(currentAlbum.id), fetchPlans(currentAlbum.id)])
      .then(([remotePhotos, remotePlans]) => {
        setPhotos(remotePhotos)
        setPlans(remotePlans)
        setDataError('')
      })
      .catch((error) => {
        setDataError(error instanceof Error ? error.message : 'No se pudieron cargar los datos de Supabase.')
      })
  }, [currentAlbum, user])

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

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase) {
      setAuthError('Supabase no está configurado. Revisá las variables VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY.')
      return
    }

    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '')
    const password = String(formData.get('password') ?? '')
    const intent = submitter?.value === 'signup' ? 'signup' : 'login'

    setIsAuthLoading(true)
    setAuthError('')
    setAuthMessage('')

    const { data, error } =
      intent === 'signup'
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setAuthError(getAuthErrorMessage(error.message))
      setIsAuthLoading(false)
      return
    }

    setUser(data.user ?? null)
    if (intent === 'signup' && !data.session) {
      setAuthMessage('Cuenta creada. Si Supabase pide confirmación, abrí el email antes de iniciar sesión.')
    }
    setIsAuthLoading(false)
  }

  const handleGoogleLogin = async () => {
    if (!supabase) {
      setAuthError('Supabase no está configurado. Revisá las variables VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY.')
      return
    }

    setIsAuthLoading(true)
    setAuthError('')
    setAuthMessage('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })

    if (error) {
      setAuthError(getAuthErrorMessage(error.message))
      setIsAuthLoading(false)
    }
  }

  const handleCreateAlbum = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsAlbumLoading(true)
    setAlbumError('')

    try {
      const createdAlbum = await createAlbum(albumName)
      setAlbums((currentAlbums) => [...currentAlbums, createdAlbum])
      setCurrentAlbum(createdAlbum)
      setAlbumName('')
      setPhotos([])
      setPlans([])
    } catch (error) {
      setAlbumError(error instanceof Error ? error.message : 'No se pudo crear el álbum.')
    } finally {
      setIsAlbumLoading(false)
    }
  }

  const handleJoinAlbum = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsAlbumLoading(true)
    setAlbumError('')

    try {
      const joinedAlbum = await joinAlbum(inviteCode)
      setAlbums((currentAlbums) => {
        if (currentAlbums.some((album) => album.id === joinedAlbum.id)) return currentAlbums
        return [...currentAlbums, joinedAlbum]
      })
      setCurrentAlbum(joinedAlbum)
      setInviteCode('')
      setPhotos([])
      setPlans([])
    } catch (error) {
      setAlbumError(error instanceof Error ? error.message : 'No se pudo unir al álbum.')
    } finally {
      setIsAlbumLoading(false)
    }
  }

  const handlePhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setPhotoError('Elegí un archivo de imagen válido.')
      event.target.value = ''
      return
    }

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setPhotoError('Usá una imagen JPG, PNG, WEBP o GIF para guardarla en el álbum.')
      event.target.value = ''
      return
    }

    let selectedFile = file
    let wasOptimized = false

    try {
      const optimizedPhoto = await optimizePhotoFile(file)
      selectedFile = optimizedPhoto.file
      wasOptimized = optimizedPhoto.wasOptimized
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : 'No se pudo preparar la imagen seleccionada.')
      event.target.value = ''
      return
    }

    if (selectedFile.size > maxPhotoSizeInBytes) {
      setPhotoError('La imagen sigue siendo muy pesada. Probá con una foto menor a 5 MB o una captura más liviana.')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setPhotoError(wasOptimized ? 'La imagen era grande, así que la optimizamos para guardarla más rápido.' : '')
      setPhotoFile(selectedFile)
      setPhotoPreview(String(reader.result))
    }
    reader.readAsDataURL(selectedFile)
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
      setStickerFile(file)
      setStickerPreview(String(reader.result))
    }
    reader.readAsDataURL(file)
  }

  const handleAddPhoto = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!photoPreview || !photoFile) return

    if (supabase && user && currentAlbum) {
      try {
        const savedPhoto = await createPhoto(currentAlbum.id, photoFile, stickerFile, photoForm)
        setPhotos((currentPhotos) => [savedPhoto, ...currentPhotos])
      } catch (error) {
        setPhotoError(error instanceof Error ? error.message : 'No se pudo guardar la foto en Supabase.')
        return
      }
    } else {
      setPhotos((currentPhotos) => [
        {
          id: createId(),
          image: photoPreview,
          stickerImage: stickerPreview,
          stickerPosition: stickerPreview ? photoForm.stickerPosition : undefined,
          stickerSize: stickerPreview ? photoForm.stickerSize : undefined,
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
    }

    setPhotoForm(defaultPhotoForm)
    setPhotoPreview('')
    setStickerPreview('')
    setPhotoFile(null)
    setStickerFile(null)
    setPhotoError('')
    setStickerError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (stickerInputRef.current) stickerInputRef.current.value = ''
  }

  const handleAddPlan = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (supabase && user && currentAlbum) {
      try {
        const savedPlan = await createPlan(currentAlbum.id, planForm)
        setPlans((currentPlans) => [savedPlan, ...currentPlans])
      } catch (error) {
        setDataError(error instanceof Error ? error.message : 'No se pudo guardar la cita en Supabase.')
        return
      }
    } else {
      setPlans((currentPlans) => [
        {
          id: createId(),
          place: planForm.place,
          locationUrl: planForm.locationUrl,
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
    }
    setPlanForm(defaultPlanForm)
  }

  const handleTogglePhotoFavorite = async (photoId: string) => {
    const photo = photos.find((currentPhoto) => currentPhoto.id === photoId)
    if (supabase && user && photo) {
      try {
        await updatePhoto(photoId, {
          description: photo.description,
          caption: photo.caption,
          place: photo.place,
          date: photo.date,
          frameColor: photo.frameColor,
          stickerPosition: photo.stickerPosition ?? 'topRight',
          stickerSize: photo.stickerSize ?? 'medium',
          isFavorite: !photo.isFavorite,
        })
      } catch (error) {
        setDataError(error instanceof Error ? error.message : 'No se pudo actualizar la foto favorita.')
        return
      }
    }

    setPhotos((currentPhotos) =>
      currentPhotos.map((photo) => (photo.id === photoId ? { ...photo, isFavorite: !photo.isFavorite } : photo)),
    )
  }

  const handleUpdatePhoto = async (photoId: string, updates: PhotoFormState) => {
    if (supabase && user) {
      try {
        await updatePhoto(photoId, updates)
      } catch (error) {
        setDataError(error instanceof Error ? error.message : 'No se pudo actualizar la foto.')
        return
      }
    }

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
              stickerSize: photo.stickerImage ? updates.stickerSize : undefined,
            }
          : photo,
      ),
    )
  }

  const handleDeletePhoto = async (photoId: string) => {
    const photo = photos.find((currentPhoto) => currentPhoto.id === photoId)
    if (supabase && user && photo) {
      try {
        await deletePhoto(photo)
      } catch (error) {
        setDataError(error instanceof Error ? error.message : 'No se pudo borrar la foto.')
        return
      }
    }

    setPhotos((currentPhotos) => currentPhotos.filter((photo) => photo.id !== photoId))
  }

  const handleUpdatePlan = async (planId: string, updates: PlanFormState) => {
    if (supabase && user) {
      try {
        await updatePlan(planId, updates)
      } catch (error) {
        setDataError(error instanceof Error ? error.message : 'No se pudo actualizar la cita.')
        return
      }
    }

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

  const handleDeletePlan = async (planId: string) => {
    if (supabase && user) {
      try {
        await deletePlan(planId)
      } catch (error) {
        setDataError(error instanceof Error ? error.message : 'No se pudo borrar la cita.')
        return
      }
    }

    setPlans((currentPlans) => currentPlans.filter((plan) => plan.id !== planId))
  }

  const handlePlanStatusChange = async (planId: string, status: DatePlanStatus) => {
    const plan = plans.find((currentPlan) => currentPlan.id === planId)
    if (supabase && user && plan) {
      try {
        await updatePlan(planId, {
          place: plan.place,
          locationUrl: plan.locationUrl,
          description: plan.description,
          date: plan.date,
          status,
          activities: plan.activities.join('\n'),
        })
      } catch (error) {
        setDataError(error instanceof Error ? error.message : 'No se pudo cambiar el estado de la cita.')
        return
      }
    }

    setPlans((currentPlans) => currentPlans.map((plan) => (plan.id === planId ? { ...plan, status } : plan)))
  }

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut()
    setUser(null)
    setAlbums([])
    setCurrentAlbum(null)
    setPhotos(readStoredPhotos(initialPhotos))
    setPlans(readStoredPlans(initialPlans))
  }

  const handleToggleTheme = () => {
    setThemeMode((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'))
  }

  if (!user) {
    return (
      <LoginScreen
        themeMode={themeMode}
        authError={authError}
        authMessage={authMessage}
        isAuthLoading={isAuthLoading}
        onGoogleLogin={handleGoogleLogin}
        onLogin={handleLogin}
        onToggleTheme={handleToggleTheme}
      />
    )
  }

  if (!currentAlbum) {
    if (isAlbumLoading) {
      return (
        <main className={`${styles.appShell} ${styles.texture} grid min-h-screen place-items-center px-5 py-10`} data-theme={themeMode}>
          <section className={`${styles.loginCard} w-full max-w-xl rounded-[2rem] p-8 text-center`}>
            <p className={`${styles.eyebrow} text-sm uppercase tracking-[0.35em]`}>Love Album</p>
            <h1 className={`${styles.titleFont} ${styles.heading} mt-3 text-4xl leading-tight`}>Cargando tu álbum</h1>
            <p className={`${styles.muted} mt-3`}>Estamos buscando el espacio compartido de tu cuenta.</p>
          </section>
        </main>
      )
    }

    return (
      <AlbumGate
        albums={albums}
        albumName={albumName}
        inviteCode={inviteCode}
        error={albumError}
        isLoading={isAlbumLoading}
        themeMode={themeMode}
        onAlbumNameChange={setAlbumName}
        onInviteCodeChange={setInviteCode}
        onCreateAlbum={handleCreateAlbum}
        onJoinAlbum={handleJoinAlbum}
        onSelectAlbum={setCurrentAlbum}
        onLogout={handleLogout}
        onToggleTheme={handleToggleTheme}
      />
    )
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
          <ThemeToggle themeMode={themeMode} onToggleTheme={handleToggleTheme} />
          <button className={`${styles.buttonGhost} px-4 py-2 text-sm font-semibold`} type="button" onClick={handleLogout}>
            Salir
          </button>
        </nav>
      </header>

      {dataError && <p className={`${styles.panel} mx-auto mt-6 max-w-7xl rounded-3xl p-4 text-sm font-semibold`}>{dataError}</p>}

      <section className={`${styles.panel} mx-auto mt-6 flex max-w-7xl flex-col gap-3 rounded-[2rem] p-5 md:flex-row md:items-center md:justify-between`}>
        <div>
          <p className={`${styles.eyebrow} text-xs uppercase tracking-[0.25em]`}>Álbum activo</p>
          <h1 className={`${styles.heading} mt-1 text-2xl font-semibold`}>{currentAlbum.name}</h1>
          <p className={`${styles.muted} mt-1 text-sm`}>Código para invitar a tu pareja: {currentAlbum.inviteCode}</p>
        </div>
        {albums.length > 1 && (
          <select
            className={styles.input}
            value={currentAlbum.id}
            onChange={(event) => setCurrentAlbum(albums.find((album) => album.id === event.target.value) ?? currentAlbum)}
          >
            {albums.map((album) => (
              <option key={album.id} value={album.id}>
                {album.name}
              </option>
            ))}
          </select>
        )}
      </section>

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
