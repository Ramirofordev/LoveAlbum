import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import styles from '../App.module.css'
import type { AlbumProfile, DatePlan, Photo, PhotoFormState, PlanFormState, ThemeMode, UserProfile } from '../types'
import { formatDisplayDate } from '../utils'

type SettingsSection = 'perfil' | 'album' | 'seguridad' | 'google' | 'destacados' | 'sesion'

type SettingsViewProps = {
  userEmail: string
  userProfile: UserProfile
  albumProfile: AlbumProfile
  photos: Photo[]
  plans: DatePlan[]
  accountMessage: string
  accountError: string
  isAccountActionLoading: boolean
  onUserProfileChange: (profile: UserProfile) => void
  onAlbumProfileChange: (profile: AlbumProfile) => void
  onSaveUserProfile: (event: FormEvent<HTMLFormElement>) => void
  onSaveAlbumProfile: (event: FormEvent<HTMLFormElement>) => void
  onUserProfileImageUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onAlbumProfileImageUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onUpdatePhoto: (photoId: string, updates: PhotoFormState) => void
  onUpdatePlan: (planId: string, updates: PlanFormState) => void
  onChangePassword: (event: FormEvent<HTMLFormElement>) => void
  onChangeEmail: (event: FormEvent<HTMLFormElement>) => void
  onLinkGoogle: () => void
  onDeleteAccount: (event: FormEvent<HTMLFormElement>) => void
  onLogout: () => void
}

const settingsSections: { id: SettingsSection; label: string; description: string }[] = [
  { id: 'perfil', label: 'Perfil público', description: 'Nombre, biografía y foto personal' },
  { id: 'album', label: 'Portada del álbum', description: 'Título, descripción y portada compartida' },
  { id: 'seguridad', label: 'Cuenta y contraseña', description: 'Email y contraseña' },
  { id: 'google', label: 'Cuenta de Google', description: 'Conectar OAuth' },
  { id: 'destacados', label: 'Recuerdos destacados', description: 'Fotos y citas visibles' },
  { id: 'sesion', label: 'Sesión y eliminación', description: 'Cerrar sesión o eliminar cuenta' },
]

export function SettingsView(props: SettingsViewProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('perfil')
  const {
    userEmail,
    userProfile,
    albumProfile,
    photos,
    plans,
    accountMessage,
    accountError,
    isAccountActionLoading,
    onUserProfileChange,
    onAlbumProfileChange,
    onSaveUserProfile,
    onSaveAlbumProfile,
    onUserProfileImageUpload,
    onAlbumProfileImageUpload,
    onUpdatePhoto,
    onUpdatePlan,
    onChangePassword,
    onChangeEmail,
    onLinkGoogle,
    onDeleteAccount,
    onLogout,
  } = props

  const handleToggleProfilePhoto = (photo: Photo) => {
    onUpdatePhoto(photo.id, {
      description: photo.description,
      caption: photo.caption,
      place: photo.place,
      date: photo.date,
      frameColor: photo.frameColor,
      stickerPosition: photo.stickerPosition ?? 'topRight',
      stickerSize: photo.stickerSize ?? 'medium',
      isFavorite: photo.isFavorite,
      showOnProfile: !photo.showOnProfile,
    })
  }

  const handleToggleProfilePlan = (plan: DatePlan) => {
    onUpdatePlan(plan.id, {
      place: plan.place,
      locationUrl: plan.locationUrl,
      description: plan.description,
      date: plan.date,
      status: plan.status,
      showOnProfile: !plan.showOnProfile,
      activities: plan.activities.join('\n'),
    })
  }

  return (
    <section className="mx-auto mt-8 grid max-w-7xl gap-8">
      <section className={`${styles.heroPanel} rounded-[2rem] p-6 md:p-8`}>
        <p className={`${styles.eyebrow} text-sm font-semibold uppercase tracking-[0.3em]`}>Configuración</p>
        <h1 className={`${styles.titleFont} ${styles.heading} mt-2 text-4xl md:text-6xl`}>Tu cuenta y perfil</h1>
        <p className={`${styles.muted} mt-3 max-w-3xl text-sm`}>Administra tu perfil, seguridad, cuenta de Google y sesión desde secciones separadas.</p>
        {(accountMessage || accountError) && (
          <div className="mt-5 grid gap-2" aria-live="polite">
            {accountMessage && <p className={`${styles.softCard} ${styles.muted} rounded-2xl p-3 text-sm`}>{accountMessage}</p>}
            {accountError && <p className={`${styles.emptyStateCompact} ${styles.heading} rounded-2xl p-3 text-sm font-semibold`}>{accountError}</p>}
          </div>
        )}
      </section>

      <div className={styles.settingsLayout}>
        <aside className={styles.settingsSidebar} aria-label="Opciones de configuración">
          <div className="mb-5 flex items-center gap-3 px-2">
            {userProfile.avatarUrl ? <img className="h-12 w-12 rounded-full object-cover" src={userProfile.avatarUrl} alt="" /> : <div className={`${styles.profileAvatarFallback} grid h-12 w-12 place-items-center rounded-full`}>♡</div>}
            <div>
              <p className={`${styles.heading} font-bold`}>{userProfile.displayName || 'Mi perfil'}</p>
              <p className={`${styles.muted} text-sm`}>{userEmail}</p>
            </div>
          </div>
          <div className="grid gap-1">
            {settingsSections.map((section) => (
              <button className={`${styles.settingsNavItem} ${activeSection === section.id ? styles.settingsNavItemActive : ''}`} key={section.id} type="button" onClick={() => setActiveSection(section.id)}>
                <span className="font-semibold">{section.label}</span>
                <small>{section.description}</small>
              </button>
            ))}
          </div>
        </aside>

        <div className="min-w-0">
          {activeSection === 'perfil' && (
            <form className={`${styles.panel} rounded-[2rem] p-6`} onSubmit={onSaveUserProfile}>
              <p className={`${styles.eyebrow} text-sm uppercase tracking-[0.25em]`}>Perfil público</p>
              <h2 className={`${styles.titleFont} ${styles.heading} mt-2 text-3xl`}>Cómo apareces en el álbum</h2>
              {userProfile.avatarUrl && <img className="mt-5 h-28 w-28 rounded-full object-cover shadow-lg" src={userProfile.avatarUrl} alt={userProfile.displayName} />}
              <div className="mt-6 grid gap-4">
                <label className={`${styles.labelText} block text-sm font-semibold`}>Nombre visible<input className={`${styles.input} mt-2`} value={userProfile.displayName} onChange={(event) => onUserProfileChange({ ...userProfile, displayName: event.target.value })} /></label>
                <label className={`${styles.labelText} block text-sm font-semibold`}>Biografía visible<textarea className={`${styles.input} mt-2`} value={userProfile.bio} onChange={(event) => onUserProfileChange({ ...userProfile, bio: event.target.value })} /></label>
                <label className={`${styles.labelText} block text-sm font-semibold`}>Subir foto de perfil<input className={`${styles.input} mt-2`} type="file" accept="image/*" onChange={onUserProfileImageUpload} /></label>
                <label className={`${styles.labelText} block text-sm font-semibold`}>Avatar por URL opcional<input className={`${styles.input} mt-2`} placeholder="https://..." value={userProfile.avatarUrl} onChange={(event) => onUserProfileChange({ ...userProfile, avatarUrl: event.target.value, avatarPath: '' })} /></label>
                <label className={`${styles.labelText} block text-sm font-semibold`}>Tema preferido<select className={`${styles.input} mt-2`} value={userProfile.themeMode} onChange={(event) => onUserProfileChange({ ...userProfile, themeMode: event.target.value as ThemeMode })}><option value="light">Claro</option><option value="dark">Oscuro</option></select></label>
                <button className={`${styles.buttonPrimary} px-6 py-3 font-semibold`} type="submit">Guardar perfil</button>
              </div>
            </form>
          )}

          {activeSection === 'album' && (
            <form className={`${styles.panel} rounded-[2rem] p-6`} onSubmit={onSaveAlbumProfile}>
              <p className={`${styles.eyebrow} text-sm uppercase tracking-[0.25em]`}>Portada del álbum</p>
              <h2 className={`${styles.titleFont} ${styles.heading} mt-2 text-3xl`}>Su portada compartida</h2>
              <div className="mt-6 grid gap-4">
                <label className={`${styles.labelText} block text-sm font-semibold`}>Título<input className={`${styles.input} mt-2`} value={albumProfile.title} onChange={(event) => onAlbumProfileChange({ ...albumProfile, title: event.target.value })} /></label>
                <label className={`${styles.labelText} block text-sm font-semibold`}>Descripción<textarea className={`${styles.input} mt-2`} value={albumProfile.description} onChange={(event) => onAlbumProfileChange({ ...albumProfile, description: event.target.value })} /></label>
                <label className={`${styles.labelText} block text-sm font-semibold`}>Subir portada del álbum<input className={`${styles.input} mt-2`} type="file" accept="image/*" onChange={onAlbumProfileImageUpload} /></label>
                <label className={`${styles.labelText} block text-sm font-semibold`}>Foto de portada<select className={`${styles.input} mt-2`} value={albumProfile.coverPhotoId} onChange={(event) => onAlbumProfileChange({ ...albumProfile, coverPhotoId: event.target.value, coverImagePath: '', coverImage: '' })}><option value="">Elegir automáticamente</option>{photos.map((photo) => <option key={photo.id} value={photo.id}>{photo.place} · {photo.caption.slice(0, 36)}</option>)}</select></label>
                <label className={`${styles.labelText} text-sm font-semibold`}>Color principal<input className="ml-3 h-10 w-16 rounded-xl border-0 bg-transparent align-middle" type="color" value={albumProfile.accentColor} onChange={(event) => onAlbumProfileChange({ ...albumProfile, accentColor: event.target.value })} /></label>
                <button className={`${styles.buttonPrimary} px-6 py-3 font-semibold`} type="submit">Guardar portada</button>
              </div>
            </form>
          )}

          {activeSection === 'seguridad' && (
            <div className="grid gap-6">
              <form className={`${styles.panel} rounded-[2rem] p-6`} onSubmit={onChangePassword}>
                <p className={`${styles.eyebrow} text-sm uppercase tracking-[0.25em]`}>Cambiar contraseña</p>
                <div className="mt-5 grid gap-4"><input className={styles.input} name="currentPassword" type="password" placeholder="Contraseña actual" autoComplete="current-password" required /><input className={styles.input} name="newPassword" type="password" placeholder="Nueva contraseña" minLength={6} required /><input className={styles.input} name="confirmPassword" type="password" placeholder="Confirmar nueva contraseña" minLength={6} required /><button className={`${styles.buttonPrimary} px-6 py-3 font-semibold`} type="submit" disabled={isAccountActionLoading}>Actualizar contraseña</button></div>
              </form>
              <form className={`${styles.panel} rounded-[2rem] p-6`} onSubmit={onChangeEmail}>
                <p className={`${styles.eyebrow} text-sm uppercase tracking-[0.25em]`}>Cambiar email</p>
                <div className="mt-5 grid gap-4"><input className={styles.input} name="newEmail" type="email" placeholder={userEmail} required /><input className={styles.input} name="currentPassword" type="password" placeholder="Contraseña actual, si aplica" /><button className={`${styles.buttonPrimary} px-6 py-3 font-semibold`} type="submit" disabled={isAccountActionLoading}>Enviar confirmación de email</button></div>
              </form>
            </div>
          )}

          {activeSection === 'google' && <section className={`${styles.panel} rounded-[2rem] p-6`}><p className={`${styles.eyebrow} text-sm uppercase tracking-[0.25em]`}>Cuenta de Google</p><h2 className={`${styles.titleFont} ${styles.heading} mt-2 text-3xl`}>Conectar Google</h2><p className={`${styles.muted} mt-2 text-sm`}>Agrega Google como método de acceso sin perder tu perfil actual.</p><button className={`${styles.buttonGhost} mt-5 px-6 py-3 font-semibold`} type="button" onClick={onLinkGoogle} disabled={isAccountActionLoading}>Conectar Google</button></section>}

          {activeSection === 'destacados' && (
            <section className={`${styles.panel} rounded-[2rem] p-6`}>
              <p className={`${styles.eyebrow} text-sm uppercase tracking-[0.25em]`}>Recuerdos destacados</p>
              <h2 className={`${styles.titleFont} ${styles.heading} mt-2 text-3xl`}>Elige qué aparece en la portada</h2>
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className={`${styles.softCard} rounded-3xl p-4`}><h3 className={`${styles.heading} text-xl font-bold`}>Fotos</h3><div className="mt-4 grid gap-3">{photos.length > 0 ? photos.map((photo) => <label className={`${styles.profileSelectorItem} ${photo.showOnProfile ? styles.profileSelectorItemSelected : ''} rounded-2xl p-3`} key={photo.id}><input className="h-5 w-5 accent-[var(--rose)]" type="checkbox" checked={photo.showOnProfile} onChange={() => handleToggleProfilePhoto(photo)} /><img className="h-14 w-14 rounded-xl object-cover" src={photo.image} alt={photo.description} /><span><strong className={styles.heading}>{photo.place}</strong><small className={`${styles.muted} block`}>{photo.caption || photo.description}</small></span></label>) : <p className={`${styles.muted} text-sm`}>Aún no hay fotos.</p>}</div></div>
                <div className={`${styles.softCard} rounded-3xl p-4`}><h3 className={`${styles.heading} text-xl font-bold`}>Citas</h3><div className="mt-4 grid gap-3">{plans.length > 0 ? plans.map((plan) => <label className={`${styles.profileSelectorItem} ${styles.profileSelectorItemPlan} ${plan.showOnProfile ? styles.profileSelectorItemSelected : ''} rounded-2xl p-3`} key={plan.id}><input className="h-5 w-5 accent-[var(--rose)]" type="checkbox" checked={plan.showOnProfile} onChange={() => handleToggleProfilePlan(plan)} /><span><strong className={styles.heading}>{plan.place}</strong><small className={`${styles.muted} block`}>{formatDisplayDate(plan.date)} · {plan.description}</small></span></label>) : <p className={`${styles.muted} text-sm`}>Aún no hay citas.</p>}</div></div>
              </div>
            </section>
          )}

          {activeSection === 'sesion' && (
            <section className={`${styles.panel} rounded-[2rem] border border-red-200 p-6`}>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-500">Sesión y zona peligrosa</p>
              <div className="mt-5 grid gap-6 lg:grid-cols-2"><div className={`${styles.softCard} rounded-3xl p-5`}><h2 className={`${styles.heading} text-2xl font-bold`}>Cerrar sesión</h2><button className={`${styles.buttonGhost} mt-4 px-6 py-3 font-semibold`} type="button" onClick={onLogout}>Cerrar sesión</button></div><form className={`${styles.emptyStateCompact} rounded-3xl p-5`} onSubmit={onDeleteAccount}><h2 className={`${styles.heading} text-2xl font-bold`}>Eliminar cuenta</h2><p className={`${styles.muted} mt-2 text-sm`}>Escribe ELIMINAR MI CUENTA y confirma el aviso final.</p><div className="mt-4 grid gap-3"><input className={styles.input} name="currentPassword" type="password" placeholder="Contraseña actual, si aplica" /><input className={styles.input} name="confirmation" placeholder="ELIMINAR MI CUENTA" required /><button className={`${styles.buttonPrimary} px-6 py-3 font-semibold`} type="submit" disabled={isAccountActionLoading}>Eliminar mi cuenta</button></div></form></div>
            </section>
          )}
        </div>
      </div>
    </section>
  )
}
