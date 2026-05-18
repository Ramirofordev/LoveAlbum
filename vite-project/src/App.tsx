import { useMemo, useRef, useState } from 'react'
import type { ChangeEvent, CSSProperties, FormEvent } from 'react'
import styles from './App.module.css'

type Photo = {
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

type DatePlanStatus = 'pendiente' | 'hecha' | 'favorita'
type ActiveView = 'inicio' | 'album' | 'citas'
type StickerPosition = 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft' | 'center'
type PhotoFilter = 'todas' | 'fecha' | 'lugar'
type PlanFilter = 'todas' | DatePlanStatus
type ThemeMode = 'light' | 'dark'

type DatePlan = {
  id: string
  place: string
  locationUrl: string
  description: string
  date: string
  status: DatePlanStatus
  activities: string[]
}

const initialPhotos: Photo[] = [
  {
    id: 'photo-first-walk',
    image:
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80',
    description: 'Una tarde cualquiera que terminó sintiéndose inolvidable.',
    caption: 'Contigo, hasta lo simple parece una escena de película.',
    place: 'Nuestro rincón favorito',
    date: '2026-02-14',
    frameColor: '#fffaf4',
    tilt: '-2deg',
    isFavorite: true,
  },
  {
    id: 'photo-city-walk',
    image:
      'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=80',
    description: 'Ese paseo lento donde no hacía falta apurarse a ningún lado.',
    caption: 'Mi plan favorito siempre empieza cuando me tomas la mano.',
    place: 'Centro',
    date: '2026-03-08',
    frameColor: '#f5cbd4',
    tilt: '1.5deg',
    isFavorite: false,
  },
]

const initialPlans: DatePlan[] = [
  {
    id: 'plan-terrace-cafe',
    place: 'Café con terraza',
    locationUrl: 'https://maps.google.com',
    description: 'Merienda tranquila, fotos lindas y una caminata sin mirar el reloj.',
    date: '2026-06-01',
    status: 'pendiente',
    activities: ['Reservar una mesa linda', 'Probar un postre nuevo', 'Sacar una polaroid'],
  },
  {
    id: 'plan-home-movie-night',
    place: 'Noche de películas en casa',
    locationUrl: '',
    description: 'Cena casera, mantas, velas y una lista de películas elegidas por ambos.',
    date: '2026-06-12',
    status: 'favorita',
    activities: ['Preparar pasta', 'Elegir dos películas', 'Hacer pochoclos dulces'],
  },
]

const statusLabels: Record<DatePlanStatus, string> = {
  pendiente: 'Pendiente',
  hecha: 'Hecha',
  favorita: 'Favorita',
}

const stickerPositionLabels: Record<StickerPosition, string> = {
  topRight: 'Arriba derecha',
  topLeft: 'Arriba izquierda',
  bottomRight: 'Abajo derecha',
  bottomLeft: 'Abajo izquierda',
  center: 'Centro',
}

const stickerPositionClasses: Record<StickerPosition, string> = {
  topRight: styles.stickerTopRight,
  topLeft: styles.stickerTopLeft,
  bottomRight: styles.stickerBottomRight,
  bottomLeft: styles.stickerBottomLeft,
  center: styles.stickerCenter,
}

const todayIsoDate = () => new Date().toISOString().slice(0, 10)

const maxPhotoSizeInBytes = 5 * 1024 * 1024
const maxStickerSizeInBytes = 2 * 1024 * 1024

const createId = () => crypto.randomUUID()

const normalizeSafeUrl = (url: string) => {
  const trimmedUrl = url.trim()

  if (!trimmedUrl) return ''

  try {
    const parsedUrl = new URL(trimmedUrl)
    return ['http:', 'https:'].includes(parsedUrl.protocol) ? parsedUrl.toString() : ''
  } catch {
    return ''
  }
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [themeMode, setThemeMode] = useState<ThemeMode>('light')
  const [activeView, setActiveView] = useState<ActiveView>('inicio')
  const [isPhotoFormOpen, setIsPhotoFormOpen] = useState(false)
  const [isPlanFormOpen, setIsPlanFormOpen] = useState(false)
  const [photoFilter, setPhotoFilter] = useState<PhotoFilter>('todas')
  const [planFilter, setPlanFilter] = useState<PlanFilter>('todas')
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [plans, setPlans] = useState<DatePlan[]>(initialPlans)
  const [photoForm, setPhotoForm] = useState({
    description: '',
    caption: '',
    place: '',
    date: '',
    frameColor: '#fffaf4',
    stickerPosition: 'topRight' as StickerPosition,
    isFavorite: false,
  })
  const [photoPreview, setPhotoPreview] = useState('')
  const [stickerPreview, setStickerPreview] = useState('')
  const [planForm, setPlanForm] = useState({
    place: '',
    locationUrl: '',
    description: '',
    date: '',
    status: 'pendiente' as DatePlanStatus,
    activities: '',
  })
  const [photoError, setPhotoError] = useState('')
  const [stickerError, setStickerError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const stickerInputRef = useRef<HTMLInputElement>(null)

  const groupedPlaces = useMemo(
    () => Array.from(new Set(photos.map((photo) => photo.place))).join(' · '),
    [photos],
  )

  const favoritePhotos = useMemo(() => photos.filter((photo) => photo.isFavorite), [photos])

  const favoritePlans = useMemo(
    () => plans.filter((plan) => plan.status === 'favorita'),
    [plans],
  )

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
      setPhotoError('La imagen debe pesar menos de 5 MB para esta versión local.')
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
      setStickerError('El sticker debe pesar menos de 2 MB.')
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

    setPhotoForm({
      description: '',
      caption: '',
      place: '',
      date: '',
      frameColor: '#fffaf4',
      stickerPosition: 'topRight',
      isFavorite: false,
    })
    setPhotoPreview('')
    setStickerPreview('')
    setPhotoError('')
    setStickerError('')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    if (stickerInputRef.current) {
      stickerInputRef.current.value = ''
    }
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

    setPlanForm({
      place: '',
      locationUrl: '',
      description: '',
      date: '',
      status: 'pendiente',
      activities: '',
    })
  }

  const handleTogglePhotoFavorite = (photoId: string) => {
    setPhotos((currentPhotos) =>
      currentPhotos.map((photo) =>
        photo.id === photoId ? { ...photo, isFavorite: !photo.isFavorite } : photo,
      ),
    )
  }

  const handleToggleTheme = () => {
    setThemeMode((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'))
  }

  if (!isAuthenticated) {
    return (
      <main className={`${styles.appShell} ${styles.texture} grid place-items-center px-5 py-10`} data-theme={themeMode}>
        <section className={`${styles.loginCard} w-full max-w-md rounded-[2rem] p-8 text-center`}>
          <button
            className={`${styles.buttonGhost} ${styles.themeToggle} mb-6 px-4 py-2 text-sm font-semibold`}
            type="button"
            onClick={handleToggleTheme}
          >
            {themeMode === 'light' ? 'Modo oscuro' : 'Modo claro'}
          </button>
          <p className={`${styles.eyebrow} mb-3 text-sm uppercase tracking-[0.35em]`}>Love Album</p>
          <h1 className={`${styles.titleFont} ${styles.heading} text-5xl leading-tight`}>
            Nuestro pequeño museo
          </h1>
          <p className={`${styles.muted} mt-4`}>
            Entrá para guardar fotos, mensajes y planes que merecen quedarse.
          </p>

          <form className="mt-8 space-y-4 text-left" onSubmit={handleLogin}>
            <label className={`${styles.labelText} block text-sm font-semibold`}>
              Nombre de acceso
              <input className={`${styles.input} mt-2`} placeholder="Ej: Nachito y su amor" required />
            </label>
            <label className={`${styles.labelText} block text-sm font-semibold`}>
              Contraseña
              <input className={`${styles.input} mt-2`} type="password" placeholder="Por ahora es simbólica" required />
            </label>
            <p className={`${styles.softCard} ${styles.muted} rounded-2xl p-3 text-xs`}>
              Nota: este login es local para el prototipo. Para privacidad real vamos a necesitar
              backend y autenticación segura.
            </p>
            <button className={`${styles.buttonPrimary} w-full px-6 py-3 font-semibold`} type="submit">
              Entrar al álbum
            </button>
          </form>
        </section>
      </main>
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
      <>
      <section className={`${styles.heroPanel} mx-auto mt-6 max-w-7xl rounded-[2rem] p-6 md:p-10`}>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className={`${styles.eyebrow} mb-3 text-sm uppercase tracking-[0.35em]`}>Álbum privado</p>
            <h1 className={`${styles.titleFont} ${styles.heading} text-5xl leading-none md:text-7xl`}>
              Nuestra historia, una cita a la vez.
            </h1>
            <p className={`${styles.muted} mt-5 text-lg`}>
              Fotos con mensajes, recuerdos por lugar o fecha, y planes románticos para seguir
              construyendo capítulos juntos.
            </p>
          </div>

          <div className={`${styles.labelText} grid grid-cols-3 gap-3 text-center text-sm`}>
            <div className={`${styles.softCard} rounded-3xl p-4`}>
              <strong className="block text-3xl">{photos.length}</strong> fotos
            </div>
            <div className={`${styles.softCard} rounded-3xl p-4`}>
              <strong className="block text-3xl">{plans.length}</strong> citas
            </div>
            <div className={`${styles.softCard} rounded-3xl p-4`}>
              <strong className="block text-3xl">♡</strong> privado
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 grid max-w-7xl gap-6 xl:grid-cols-3">
        <div className={`${styles.panel} rounded-[2rem] p-6`}>
          <p className={`${styles.eyebrow} text-sm uppercase tracking-[0.25em]`}>Fotos favoritas</p>
          <h2 className={`${styles.titleFont} ${styles.heading} mt-2 text-3xl`}>Recuerdos elegidos</h2>
          <div className="mt-5 grid gap-4">
            {favoritePhotos.length > 0 ? (
              favoritePhotos.slice(0, 2).map((photo) => (
                <article className={`${styles.softCard} rounded-3xl p-3`} key={photo.id}>
                  <img className="h-36 w-full rounded-2xl object-cover" src={photo.image} alt={photo.description} />
                  <p className={`${styles.labelText} mt-3 text-sm font-semibold`}>♡ {photo.place}</p>
                  <p className={`${styles.muted} text-sm`}>{photo.caption}</p>
                </article>
              ))
            ) : (
              <p className={`${styles.muted} text-sm`}>Todavía no marcaste fotos como favoritas.</p>
            )}
          </div>
        </div>

        <div className={`${styles.panel} rounded-[2rem] p-6`}>
          <p className={`${styles.eyebrow} text-sm uppercase tracking-[0.25em]`}>Citas favoritas</p>
          <h2 className={`${styles.titleFont} ${styles.heading} mt-2 text-3xl`}>Planes especiales</h2>
          <div className="mt-5 grid gap-3">
            {favoritePlans.length > 0 ? (
              favoritePlans.map((plan) => (
                <article className={`${styles.softCard} rounded-3xl p-4`} key={plan.id}>
                  <h3 className={`${styles.heading} font-bold`}>{plan.place}</h3>
                  <p className={`${styles.muted} text-sm`}>{plan.date} · {plan.description}</p>
                </article>
              ))
            ) : (
              <p className={`${styles.muted} text-sm`}>No hay citas favoritas aún.</p>
            )}
          </div>
        </div>

        <div className={`${styles.panel} rounded-[2rem] p-6`}>
          <p className={`${styles.eyebrow} text-sm uppercase tracking-[0.25em]`}>Pendientes próximas</p>
          <h2 className={`${styles.titleFont} ${styles.heading} mt-2 text-3xl`}>Lo que viene</h2>
          <div className="mt-5 grid gap-3">
            {upcomingPendingPlans.length > 0 ? (
              upcomingPendingPlans.map((plan) => (
                <article className={`${styles.softCard} rounded-3xl p-4`} key={plan.id}>
                  <h3 className={`${styles.heading} font-bold`}>{plan.place}</h3>
                  <p className={`${styles.muted} text-sm`}>{plan.date}</p>
                  <p className={`${styles.bodyText} mt-2 text-sm`}>{plan.description}</p>
                </article>
              ))
            ) : (
              <p className={`${styles.muted} text-sm`}>No hay citas pendientes próximas.</p>
            )}
          </div>
        </div>
      </section>
      </>
      )}

      {activeView === 'album' && (
      <section className="mx-auto mt-8 grid max-w-7xl gap-8">
        <div className={`${styles.panel} flex flex-col gap-4 rounded-[2rem] p-6 md:flex-row md:items-center md:justify-between`}>
          <div>
            <p className={`${styles.eyebrow} text-sm uppercase tracking-[0.25em]`}>Nueva foto</p>
            <h2 className={`${styles.titleFont} ${styles.heading} mt-2 text-3xl`}>Gestionar álbum</h2>
          </div>
          <button
            className={`${styles.buttonPrimary} px-6 py-3 font-semibold`}
            type="button"
            onClick={() => setIsPhotoFormOpen((isOpen) => !isOpen)}
          >
            {isPhotoFormOpen ? 'Cerrar formulario' : 'Agregar foto'}
          </button>
        </div>

        {isPhotoFormOpen && (
        <form className={`${styles.panel} rounded-[2rem] p-6`} onSubmit={handleAddPhoto}>
          <p className={`${styles.eyebrow} text-sm uppercase tracking-[0.25em]`}>Nueva foto</p>
          <h2 className={`${styles.titleFont} ${styles.heading} mt-2 text-3xl`}>Guardar un recuerdo</h2>

          <div className="mt-6 grid gap-4">
            <label className={`${styles.labelText} block text-sm font-semibold`}>
              Imagen
              <input
                ref={fileInputRef}
                className={`${styles.input} mt-2`}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                required
              />
            </label>
            {photoError && <p className={`${styles.eyebrow} text-sm font-semibold`}>{photoError}</p>}
            {photoPreview && (
              <img className="h-52 w-full rounded-3xl object-cover" src={photoPreview} alt="Vista previa" />
            )}
            <label className={`${styles.labelText} block text-sm font-semibold`}>
              Sticker decorativo opcional
              <input
                ref={stickerInputRef}
                className={`${styles.input} mt-2`}
                type="file"
                accept="image/*"
                onChange={handleStickerUpload}
              />
            </label>
            {stickerError && <p className={`${styles.eyebrow} text-sm font-semibold`}>{stickerError}</p>}
            {stickerPreview && (
              <div className={`${styles.softCard} ${styles.muted} flex items-center gap-3 rounded-3xl p-3 text-sm`}>
                <img className="h-14 w-14 rounded-2xl object-contain" src={stickerPreview} alt="Sticker elegido" />
                Sticker listo para pegar: {stickerPositionLabels[photoForm.stickerPosition]}.
              </div>
            )}
            <label className={`${styles.labelText} block text-sm font-semibold`}>
              Posición del sticker
              <select
                className={`${styles.input} mt-2`}
                value={photoForm.stickerPosition}
                onChange={(event) =>
                  setPhotoForm({
                    ...photoForm,
                    stickerPosition: event.target.value as StickerPosition,
                  })
                }
              >
                {Object.entries(stickerPositionLabels).map(([position, label]) => (
                  <option key={position} value={position}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className={`${styles.labelText} block text-sm font-semibold`}>
              Lugar
              <input
                className={`${styles.input} mt-2`}
                placeholder="Ej: La plaza donde caminamos"
                value={photoForm.place}
                onChange={(event) => setPhotoForm({ ...photoForm, place: event.target.value })}
              />
            </label>
            <label className={`${styles.labelText} block text-sm font-semibold`}>
              Fecha
              <input
                className={`${styles.input} mt-2`}
                type="date"
                value={photoForm.date}
                onChange={(event) => setPhotoForm({ ...photoForm, date: event.target.value })}
              />
            </label>
            <label className={`${styles.labelText} block text-sm font-semibold`}>
              Descripción
              <textarea
                className={`${styles.input} mt-2`}
                placeholder="Qué estaba pasando en esta foto"
                value={photoForm.description}
                onChange={(event) => setPhotoForm({ ...photoForm, description: event.target.value })}
                required
              />
            </label>
            <label className={`${styles.labelText} block text-sm font-semibold`}>
              Pie de foto amoroso
              <textarea
                className={`${styles.input} mt-2`}
                placeholder="Un mensaje personal para esa foto"
                value={photoForm.caption}
                onChange={(event) => setPhotoForm({ ...photoForm, caption: event.target.value })}
                required
              />
            </label>
            <label className={`${styles.labelText} text-sm font-semibold`}>
              Color del contorno
              <input
                className="ml-3 h-10 w-16 rounded-xl border-0 bg-transparent align-middle"
                type="color"
                value={photoForm.frameColor}
                onChange={(event) => setPhotoForm({ ...photoForm, frameColor: event.target.value })}
              />
            </label>
            <label className={`${styles.softCard} ${styles.labelText} flex items-center gap-3 rounded-3xl p-4 text-sm font-semibold`}>
              <input
                className="h-5 w-5 accent-[var(--rose)]"
                type="checkbox"
                checked={photoForm.isFavorite}
                onChange={(event) => setPhotoForm({ ...photoForm, isFavorite: event.target.checked })}
              />
              Marcar como foto favorita
            </label>
            <button className={`${styles.buttonPrimary} px-6 py-3 font-semibold`} type="submit">
              Añadir al álbum
            </button>
          </div>
        </form>
        )}

        <div className={`${styles.panel} rounded-[2rem] p-6`}>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className={`${styles.eyebrow} text-sm uppercase tracking-[0.25em]`}>Recuerdos</p>
              <h2 className={`${styles.titleFont} ${styles.heading} mt-2 text-3xl`}>Álbum polaroid</h2>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <p className={`${styles.muted} max-w-md text-sm`}>Clasificado por lugares: {groupedPlaces}</p>
              <div className="flex flex-wrap gap-2">
                {(['todas', 'fecha', 'lugar'] as PhotoFilter[]).map((filter) => (
                  <button
                    className={`${styles.navButton} ${photoFilter === filter ? styles.navButtonActive : ''} px-4 py-2 text-sm font-semibold`}
                    key={filter}
                    type="button"
                    onClick={() => setPhotoFilter(filter)}
                  >
                    {filter === 'todas' ? 'Todas' : filter === 'fecha' ? 'Por fecha' : 'Por lugar'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            {filteredPhotos.map((photo) => (
              <article
                className={styles.polaroid}
                key={photo.id}
                style={{
                  '--frame-color': photo.frameColor,
                  '--tilt': photo.tilt,
                } as CSSProperties}
              >
                <img className="h-72 w-full object-cover" src={photo.image} alt={photo.description} />
                {photo.stickerImage && (
                  <img
                    className={`${styles.sticker} ${stickerPositionClasses[photo.stickerPosition ?? 'topRight']}`}
                    src={photo.stickerImage}
                    alt="Sticker decorativo"
                  />
                )}
                <button
                  className={`${styles.favoriteButton} absolute left-3 top-3 rounded-full px-3 py-2 text-sm font-bold shadow-sm`}
                  type="button"
                  onClick={() => handleTogglePhotoFavorite(photo.id)}
                  aria-label={photo.isFavorite ? 'Quitar de favoritas' : 'Marcar como favorita'}
                >
                  {photo.isFavorite ? '♡ Favorita' : '♡'}
                </button>
                <span className={styles.polaroidNote}>{photo.caption}</span>
                <div className="mt-4 px-1 pb-2 text-left">
                  <h3 className={`${styles.heading} font-semibold`}>{photo.place}</h3>
                  <p className={`${styles.muted} text-sm`}>{photo.date || 'Sin fecha'} · {photo.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      )}

      {activeView === 'citas' && (
      <section className="mx-auto mt-8 grid max-w-7xl gap-8">
        <div className={`${styles.panel} flex flex-col gap-4 rounded-[2rem] p-6 md:flex-row md:items-center md:justify-between`}>
          <div>
            <p className={`${styles.eyebrow} text-sm uppercase tracking-[0.25em]`}>Agenda romántica</p>
            <h2 className={`${styles.titleFont} ${styles.heading} mt-2 text-3xl`}>Gestionar citas</h2>
          </div>
          <button
            className={`${styles.buttonPrimary} px-6 py-3 font-semibold`}
            type="button"
            onClick={() => setIsPlanFormOpen((isOpen) => !isOpen)}
          >
            {isPlanFormOpen ? 'Cerrar formulario' : 'Crear cita'}
          </button>
        </div>

        {isPlanFormOpen && (
        <form className={`${styles.panel} rounded-[2rem] p-6`} onSubmit={handleAddPlan}>
          <p className={`${styles.eyebrow} text-sm uppercase tracking-[0.25em]`}>Nueva cita</p>
          <h2 className={`${styles.titleFont} ${styles.heading} mt-2 text-3xl`}>Planificar una cita</h2>

          <div className="mt-6 grid gap-4">
            <label className={`${styles.labelText} block text-sm font-semibold`}>
              Lugar
              <input
                className={`${styles.input} mt-2`}
                placeholder="Ej: Café con terraza"
                value={planForm.place}
                onChange={(event) => setPlanForm({ ...planForm, place: event.target.value })}
                required
              />
            </label>
            <label className={`${styles.labelText} block text-sm font-semibold`}>
              Link de ubicación
              <input
                className={`${styles.input} mt-2`}
                placeholder="https://maps.google.com/..."
                value={planForm.locationUrl}
                onChange={(event) => setPlanForm({ ...planForm, locationUrl: event.target.value })}
              />
            </label>
            <label className={`${styles.labelText} block text-sm font-semibold`}>
              Fecha
              <input
                className={`${styles.input} mt-2`}
                type="date"
                value={planForm.date}
                onChange={(event) => setPlanForm({ ...planForm, date: event.target.value })}
                required
              />
            </label>
            <label className={`${styles.labelText} block text-sm font-semibold`}>
              Estado
              <select
                className={`${styles.input} mt-2`}
                value={planForm.status}
                onChange={(event) =>
                  setPlanForm({ ...planForm, status: event.target.value as DatePlanStatus })
                }
              >
                <option value="pendiente">Pendiente</option>
                <option value="hecha">Hecha</option>
                <option value="favorita">Favorita</option>
              </select>
            </label>
            <label className={`${styles.labelText} block text-sm font-semibold`}>
              Resumen de la cita
              <textarea
                className={`${styles.input} mt-2`}
                placeholder="La idea general de la cita"
                value={planForm.description}
                onChange={(event) => setPlanForm({ ...planForm, description: event.target.value })}
                required
              />
            </label>
            <label className={`${styles.labelText} block text-sm font-semibold`}>
              Actividades
              <textarea
                className={`${styles.input} mt-2`}
                placeholder="Una actividad por línea"
                value={planForm.activities}
                onChange={(event) => setPlanForm({ ...planForm, activities: event.target.value })}
                required
              />
            </label>
            <button className={`${styles.buttonPrimary} px-6 py-3 font-semibold`} type="submit">
              Guardar cita
            </button>
          </div>
        </form>
        )}

        <div className={`${styles.panel} rounded-[2rem] p-6`}>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className={`${styles.eyebrow} text-sm uppercase tracking-[0.25em]`}>Agenda romántica</p>
              <h2 className={`${styles.titleFont} ${styles.heading} mt-2 text-3xl`}>Citas guardadas</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['todas', 'pendiente', 'hecha', 'favorita'] as PlanFilter[]).map((filter) => (
                <button
                  className={`${styles.navButton} ${planFilter === filter ? styles.navButtonActive : ''} px-4 py-2 text-sm font-semibold`}
                  key={filter}
                  type="button"
                  onClick={() => setPlanFilter(filter)}
                >
                  {filter === 'todas' ? 'Todas' : statusLabels[filter]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            {filteredPlans.map((plan) => (
              <article className={`${styles.softCard} rounded-[1.5rem] p-5 shadow-sm`} key={plan.id}>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className={`${styles.heading} text-xl font-bold`}>{plan.place}</h3>
                    <p className={`${styles.muted} mt-1 text-sm`}>{plan.date}</p>
                  </div>
                  <span className={`${styles.statusPill} ${styles.labelText} rounded-full px-4 py-2 text-sm`}>
                    {statusLabels[plan.status]}
                  </span>
                </div>
                <p className={`${styles.bodyText} mt-4`}>{plan.description}</p>
                <ul className={`${styles.labelText} mt-4 grid gap-2 text-sm`}>
                  {plan.activities.map((activity, activityIndex) => (
                    <li className={`${styles.activityItem} rounded-2xl px-4 py-2`} key={`${activity}-${activityIndex}`}>
                      ♡ {activity}
                    </li>
                  ))}
                </ul>
                {plan.locationUrl && (
                  <a
                    className={`${styles.eyebrow} mt-4 inline-flex text-sm font-semibold underline-offset-4 hover:underline`}
                    href={plan.locationUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver ubicación
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
      )}
    </main>
  )
}

export default App
