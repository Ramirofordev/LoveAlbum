import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { User } from '@supabase/supabase-js'
import styles from './App.module.css'
import { AlbumGate } from './components/AlbumGate'
import { AlbumView } from './components/AlbumView'
import { Dashboard } from './components/Dashboard'
import { DatePlanner } from './components/DatePlanner'
import { LoginScreen } from './components/LoginScreen'
import { ProfileView } from './components/ProfileView'
import { SettingsView } from './components/SettingsView'
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
  fetchAlbumProfile,
  fetchPhotos,
  fetchPlans,
  fetchUserProfile,
  joinAlbum,
  saveAlbumProfile,
  saveUserProfile,
  uploadAlbumProfileImage,
  uploadUserProfileImage,
  updatePhoto,
  updatePlan,
} from './services/loveAlbumService'
import type { ActiveView, AlbumProfile, DatePlan, DatePlanStatus, LoveAlbum, Photo, PhotoFilter, PhotoFormState, PlanFilter, PlanFormState, ThemeMode, UserProfile } from './types'
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
  showOnProfile: false,
}

const defaultPlanForm: PlanFormState = {
  place: '',
  locationUrl: '',
  description: '',
  date: '',
  status: 'pendiente',
  showOnProfile: false,
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
    return 'No encontramos esa cuenta o la contraseña no coincide. Si aún no la has creado, usa “Crear cuenta”.'
  }

  if (message.toLowerCase().includes('email not confirmed')) {
    return 'La cuenta existe, pero falta confirmar el email antes de entrar.'
  }

  return message
}

const getFormValue = (formData: FormData, key: string) => String(formData.get(key) ?? '').trim()

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(Boolean(supabase))
  const [authError, setAuthError] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [accountError, setAccountError] = useState('')
  const [accountMessage, setAccountMessage] = useState('')
  const [isAccountActionLoading, setIsAccountActionLoading] = useState(false)
  const [dataError, setDataError] = useState('')
  const [albumError, setAlbumError] = useState('')
  const [isAlbumLoading, setIsAlbumLoading] = useState(false)
  const [albums, setAlbums] = useState<LoveAlbum[]>([])
  const [currentAlbum, setCurrentAlbum] = useState<LoveAlbum | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [albumProfile, setAlbumProfile] = useState<AlbumProfile | null>(null)
  const [albumName, setAlbumName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => readStoredTheme('light'))
  const [activeView, setActiveView] = useState<ActiveView>('inicio')
  const [isNavOpen, setIsNavOpen] = useState(true)
  const [inviteCopyMessage, setInviteCopyMessage] = useState('')
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

    Promise.all([
      fetchPhotos(currentAlbum.id),
      fetchPlans(currentAlbum.id),
      fetchUserProfile(user.id, user.email ?? undefined),
      fetchAlbumProfile(currentAlbum),
    ])
      .then(([remotePhotos, remotePlans, remoteUserProfile, remoteAlbumProfile]) => {
        setPhotos(remotePhotos)
        setPlans(remotePlans)
        setUserProfile(remoteUserProfile)
        setAlbumProfile(remoteAlbumProfile)
        setThemeMode(remoteUserProfile.themeMode)
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
      setAuthMessage('Cuenta creada. Si Supabase pide confirmación, abre el correo antes de iniciar sesión.')
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
      setPhotoError('Elige un archivo de imagen válido.')
      event.target.value = ''
      return
    }

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setPhotoError('Usa una imagen JPG, PNG, WEBP o GIF para guardarla en el álbum.')
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
      setPhotoError('La imagen sigue siendo muy pesada. Prueba con una foto menor a 5 MB o una captura más liviana.')
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
          showOnProfile: photoForm.showOnProfile,
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
          showOnProfile: planForm.showOnProfile,
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
          showOnProfile: photo.showOnProfile,
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
              showOnProfile: updates.showOnProfile,
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
              showOnProfile: updates.showOnProfile,
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
          showOnProfile: plan.showOnProfile,
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
    setUserProfile(null)
    setAlbumProfile(null)
    setPhotos(readStoredPhotos(initialPhotos))
    setPlans(readStoredPlans(initialPlans))
  }

  const verifyCurrentPassword = async (password: string) => {
    if (!supabase) throw new Error('Supabase no está configurado.')
    if (!user?.email) throw new Error('No encontramos un email para verificar esta cuenta.')
    if (!password) throw new Error('Ingresa tu contraseña actual para verificar que eres tú.')

    const { error } = await supabase.auth.signInWithPassword({ email: user.email, password })
    if (error) throw new Error('La contraseña actual no coincide.')
  }

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase) return

    const formData = new FormData(event.currentTarget)
    const currentPassword = getFormValue(formData, 'currentPassword')
    const newPassword = getFormValue(formData, 'newPassword')
    const confirmPassword = getFormValue(formData, 'confirmPassword')

    setIsAccountActionLoading(true)
    setAccountError('')
    setAccountMessage('')

    try {
      if (newPassword !== confirmPassword) throw new Error('La nueva contraseña y su confirmación no coinciden.')
      if (newPassword.length < 6) throw new Error('La nueva contraseña debe tener al menos 6 caracteres.')

      await verifyCurrentPassword(currentPassword)
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error

      event.currentTarget.reset()
      setAccountMessage('Contraseña actualizada correctamente.')
    } catch (error) {
      setAccountError(error instanceof Error ? error.message : 'No se pudo actualizar la contraseña.')
    } finally {
      setIsAccountActionLoading(false)
    }
  }

  const handleChangeEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase) return

    const formData = new FormData(event.currentTarget)
    const newEmail = getFormValue(formData, 'newEmail')
    const currentPassword = getFormValue(formData, 'currentPassword')

    setIsAccountActionLoading(true)
    setAccountError('')
    setAccountMessage('')

    try {
      if (!newEmail) throw new Error('Ingresa el nuevo email.')
      if (currentPassword) await verifyCurrentPassword(currentPassword)

      const { error } = await supabase.auth.updateUser(
        { email: newEmail },
        { emailRedirectTo: window.location.origin },
      )
      if (error) throw error

      event.currentTarget.reset()
      setAccountMessage('Te enviamos un correo para confirmar el cambio de email.')
    } catch (error) {
      setAccountError(error instanceof Error ? error.message : 'No se pudo iniciar el cambio de email.')
    } finally {
      setIsAccountActionLoading(false)
    }
  }

  const handleLinkGoogle = async () => {
    if (!supabase) return

    setIsAccountActionLoading(true)
    setAccountError('')
    setAccountMessage('')

    const { error } = await supabase.auth.linkIdentity({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })

    if (error) {
      setAccountError(getAuthErrorMessage(error.message))
      setIsAccountActionLoading(false)
    }
  }

  const handleDeleteAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase) return

    const formData = new FormData(event.currentTarget)
    const currentPassword = getFormValue(formData, 'currentPassword')
    const confirmation = getFormValue(formData, 'confirmation')

    setIsAccountActionLoading(true)
    setAccountError('')
    setAccountMessage('')

    try {
      if (confirmation !== 'ELIMINAR MI CUENTA') throw new Error('Escribe ELIMINAR MI CUENTA para confirmar.')
      const accepted = window.confirm('Esta acción eliminará tu cuenta de forma permanente. ¿Quieres continuar?')
      if (!accepted) return

      if (currentPassword) await verifyCurrentPassword(currentPassword)

      const { error } = await supabase.functions.invoke('delete-account', {
        body: { confirmation },
      })
      if (error) throw error

      await handleLogout()
    } catch (error) {
      setAccountError(error instanceof Error ? error.message : 'No se pudo eliminar la cuenta.')
    } finally {
      setIsAccountActionLoading(false)
    }
  }

  const handleToggleTheme = () => {
    setThemeMode((currentTheme) => {
      const nextTheme = currentTheme === 'light' ? 'dark' : 'light'
      setUserProfile((currentProfile) => (currentProfile ? { ...currentProfile, themeMode: nextTheme } : currentProfile))
      return nextTheme
    })
  }

  const handleSelectView = (view: ActiveView) => {
    setActiveView(view)

    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      setIsNavOpen(false)
    }
  }

  const handleCopyInviteCode = async () => {
    if (!currentAlbum) return

    try {
      await navigator.clipboard.writeText(currentAlbum.inviteCode)
      setInviteCopyMessage('Código copiado')
    } catch {
      setInviteCopyMessage('No se pudo copiar. Cópialo manualmente.')
    }
  }

  useEffect(() => {
    if (!inviteCopyMessage) return

    const timeoutId = window.setTimeout(() => setInviteCopyMessage(''), 2500)

    return () => window.clearTimeout(timeoutId)
  }, [inviteCopyMessage])

  const handleSaveUserProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!userProfile) return

    if (supabase && user) {
      try {
        const savedProfile = await saveUserProfile(userProfile)
        setUserProfile(savedProfile)
        setThemeMode(savedProfile.themeMode)
        setDataError('')
      } catch (error) {
        setDataError(error instanceof Error ? error.message : 'No se pudo guardar tu perfil.')
      }
    }
  }

  const handleSaveAlbumProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!albumProfile) return

    if (supabase && user) {
      try {
        const savedProfile = await saveAlbumProfile(albumProfile)
        setAlbumProfile(savedProfile)
        setDataError('')
      } catch (error) {
        setDataError(error instanceof Error ? error.message : 'No se pudo guardar el perfil del álbum.')
      }
    }
  }

  const handleUserProfileImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !userProfile || !currentAlbum) return

    try {
      const avatarPath = await uploadUserProfileImage(currentAlbum.id, userProfile.userId, file)
      const savedProfile = await saveUserProfile({ ...userProfile, avatarPath, avatarUrl: '' })
      setUserProfile(savedProfile)
      setDataError('')
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'No se pudo subir la foto de perfil.')
    } finally {
      event.target.value = ''
    }
  }

  const handleAlbumProfileImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !albumProfile || !currentAlbum) return

    try {
      const coverImagePath = await uploadAlbumProfileImage(currentAlbum.id, file)
      const savedProfile = await saveAlbumProfile({ ...albumProfile, coverImagePath, coverPhotoId: '' })
      setAlbumProfile(savedProfile)
      setDataError('')
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'No se pudo subir la portada del álbum.')
    } finally {
      event.target.value = ''
    }
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
      <div className={`${styles.appLayout} mx-auto grid max-w-7xl gap-6 lg:grid-cols-[17rem_1fr]`}>
        <header className="relative z-20">
          <nav className={`${styles.navBar} ${styles.navBarRetractable} sticky top-4 flex flex-col gap-3 rounded-[2rem] p-3`} aria-label="Secciones principales">
            <div className="flex items-center gap-2">
              <button
                className={`${styles.navToggle} ${styles.buttonGhost} flex-1 px-4 py-2 text-sm font-semibold`}
                type="button"
                onClick={() => setIsNavOpen((isOpen) => !isOpen)}
                aria-expanded={isNavOpen}
                aria-label={isNavOpen ? 'Ocultar navegación' : 'Mostrar navegación'}
              >
                <span aria-hidden="true">♡</span>
                <span className={styles.navToggleText}>Love Album</span>
              </button>
              <ThemeToggle themeMode={themeMode} onToggleTheme={handleToggleTheme} />
            </div>

            {isNavOpen && (
              <>
                <div className={styles.navGroup}>
                  <p className={`${styles.navGroupTitle} ${styles.eyebrow}`}>Álbum</p>
                  {(['inicio', 'album', 'citas'] as ActiveView[]).map((view) => (
                    <button
                      className={`${styles.navButton} ${activeView === view ? styles.navButtonActive : ''} px-4 py-3 text-left text-sm font-semibold`}
                      key={view}
                      type="button"
                      onClick={() => handleSelectView(view)}
                    >
                      {view === 'inicio' ? 'Inicio' : view === 'album' ? 'Álbum' : 'Citas'}
                    </button>
                  ))}
                </div>

                <div className={styles.navGroup}>
                  <p className={`${styles.navGroupTitle} ${styles.eyebrow}`}>Cuenta</p>
                  <div className={styles.accountTabs} role="tablist" aria-label="Área de cuenta">
                    <button
                      className={`${styles.accountTab} ${activeView === 'perfil' ? styles.accountTabActive : ''} px-4 py-3 text-left text-sm font-semibold`}
                      type="button"
                      role="tab"
                      aria-selected={activeView === 'perfil'}
                      onClick={() => handleSelectView('perfil')}
                    >
                      Perfil
                    </button>
                    <button
                      className={`${styles.accountTab} ${activeView === 'configuracion' ? styles.accountTabActive : ''} px-4 py-3 text-left text-sm font-semibold`}
                      type="button"
                      role="tab"
                      aria-selected={activeView === 'configuracion'}
                      onClick={() => handleSelectView('configuracion')}
                    >
                      Configuración
                    </button>
                  </div>
                </div>
              </>
            )}
          </nav>
        </header>

        <div className="min-w-0">
          {dataError && <p className={`${styles.panel} rounded-3xl p-4 text-sm font-semibold`}>{dataError}</p>}

          <section className={`${styles.panel} flex flex-col gap-3 rounded-[2rem] p-5 md:flex-row md:items-center md:justify-between`}>
            <div>
              <p className={`${styles.eyebrow} text-xs uppercase tracking-[0.25em]`}>Álbum activo</p>
              <h1 className={`${styles.heading} mt-1 text-2xl font-semibold`}>{currentAlbum.name}</h1>
              <p className={`${styles.muted} mt-1 text-sm`}>Comparte este código para que tu pareja se una al álbum.</p>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <div className={`${styles.inviteCodeBox} rounded-2xl px-4 py-3 text-sm font-semibold`} aria-label={`Código de invitación ${currentAlbum.inviteCode}`}>
                {currentAlbum.inviteCode}
              </div>
              <button className={`${styles.buttonGhost} px-4 py-2 text-sm font-semibold`} type="button" onClick={handleCopyInviteCode}>
                Copiar código
              </button>
              {inviteCopyMessage && <p className={`${styles.eyebrow} text-xs font-semibold`} aria-live="polite">{inviteCopyMessage}</p>}
            </div>
          </section>

          {activeView === 'inicio' && albumProfile && (
            <Dashboard
              albumProfile={albumProfile}
              photos={photos}
              plans={plans}
              favoritePhotos={favoritePhotos}
              favoritePlans={favoritePlans}
              upcomingPendingPlans={upcomingPendingPlans}
              onOpenAlbum={() => handleSelectView('album')}
              onOpenPlans={() => handleSelectView('citas')}
              onOpenProfile={() => handleSelectView('configuracion')}
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

          {activeView === 'perfil' && userProfile && albumProfile && (
            <ProfileView
              userEmail={user.email ?? 'Cuenta sin email visible'}
              userProfile={userProfile}
              photos={photos}
              plans={plans}
              onOpenSettings={() => handleSelectView('configuracion')}
            />
          )}

          {activeView === 'configuracion' && userProfile && albumProfile && (
            <SettingsView
              userEmail={user.email ?? 'Cuenta sin email visible'}
              userProfile={userProfile}
              albumProfile={albumProfile}
              photos={photos}
              plans={plans}
              accountMessage={accountMessage}
              accountError={accountError}
              isAccountActionLoading={isAccountActionLoading}
              onUserProfileChange={setUserProfile}
              onAlbumProfileChange={setAlbumProfile}
              onSaveUserProfile={handleSaveUserProfile}
              onSaveAlbumProfile={handleSaveAlbumProfile}
              onUserProfileImageUpload={handleUserProfileImageUpload}
              onAlbumProfileImageUpload={handleAlbumProfileImageUpload}
              onUpdatePhoto={handleUpdatePhoto}
              onUpdatePlan={handleUpdatePlan}
              onChangePassword={handleChangePassword}
              onChangeEmail={handleChangeEmail}
              onLinkGoogle={handleLinkGoogle}
              onDeleteAccount={handleDeleteAccount}
              onLogout={handleLogout}
            />
          )}
        </div>
      </div>
    </main>
  )
}

export default App
