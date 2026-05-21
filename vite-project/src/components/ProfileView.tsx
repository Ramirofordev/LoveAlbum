import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import styles from '../App.module.css'
import type { AlbumProfile, Photo, ThemeMode, UserProfile, DatePlan, PhotoFormState, PlanFormState } from '../types'
import { formatDisplayDate } from '../utils'

type ProfileViewProps = {
  userEmail: string
  userProfile: UserProfile
  albumProfile: AlbumProfile
  photos: Photo[]
  plans: DatePlan[]
  onUserProfileChange: (profile: UserProfile) => void
  onAlbumProfileChange: (profile: AlbumProfile) => void
  onSaveUserProfile: (event: FormEvent<HTMLFormElement>) => void
  onSaveAlbumProfile: (event: FormEvent<HTMLFormElement>) => void
  onUserProfileImageUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onAlbumProfileImageUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onUpdatePhoto: (photoId: string, updates: PhotoFormState) => void
  onUpdatePlan: (planId: string, updates: PlanFormState) => void
}

export function ProfileView({
  userEmail,
  userProfile,
  albumProfile,
  photos,
  plans,
  onUserProfileChange,
  onAlbumProfileChange,
  onSaveUserProfile,
  onSaveAlbumProfile,
  onUserProfileImageUpload,
  onAlbumProfileImageUpload,
  onUpdatePhoto,
  onUpdatePlan,
}: ProfileViewProps) {
  const [isEditingOpen, setIsEditingOpen] = useState(false)
  const profilePhotos = photos.filter((photo) => photo.showOnProfile && (!photo.userId || photo.userId === userProfile.userId))
  const profilePlans = plans.filter((plan) => plan.showOnProfile && (!plan.userId || plan.userId === userProfile.userId))
  const highlightedCount = profilePhotos.length + profilePlans.length

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
      <section className={`${styles.heroPanel} ${styles.personalProfileHero} overflow-hidden rounded-[2rem] p-6 md:p-10`}>
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {userProfile.avatarUrl ? (
              <img className="h-32 w-32 rounded-[2rem] object-cover shadow-lg" src={userProfile.avatarUrl} alt={userProfile.displayName} />
            ) : (
              <div className={`${styles.profileAvatarFallback} grid h-32 w-32 place-items-center rounded-[2rem] text-5xl`} aria-hidden="true">
                ♡
              </div>
            )}
            <div>
              <p className={`${styles.eyebrow} text-sm uppercase tracking-[0.35em]`}>Mi perfil</p>
              <h1 className={`${styles.titleFont} ${styles.heading} mt-3 text-4xl leading-tight md:text-6xl`}>{userProfile.displayName || 'Tu presentación'}</h1>
              <p className={`${styles.muted} mt-3 max-w-2xl text-lg`}>
                {userProfile.bio || 'Agrega una biografía para contar cómo quieres aparecer dentro del álbum.'}
              </p>
              <p className={`${styles.muted} mt-2 text-sm`}>{userEmail}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 md:justify-end">
            <span className={`${styles.profileStat} rounded-full px-4 py-2 text-sm font-semibold`}>{profilePhotos.length} fotos tuyas</span>
            <span className={`${styles.profileStat} rounded-full px-4 py-2 text-sm font-semibold`}>{profilePlans.length} citas tuyas</span>
            <span className={`${styles.profileStat} rounded-full px-4 py-2 text-sm font-semibold`}>{highlightedCount} recuerdos visibles</span>
          </div>
        </div>
      </section>

      <section className={`${styles.profileEditIntro} rounded-[2rem] p-5`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className={`${styles.eyebrow} text-sm font-semibold uppercase tracking-[0.25em]`}>Editar perfil</p>
            <h2 className={`${styles.titleFont} ${styles.heading} mt-2 text-3xl`}>Ajusta cómo se ve su espacio compartido</h2>
            <p className={`${styles.muted} mt-2 max-w-3xl text-sm`}>
              Tu perfil muestra cómo apareces dentro del álbum. Abre la edición para cambiar tus datos, ajustar la portada compartida o elegir recuerdos destacados.
            </p>
          </div>
          <button
            className={`${isEditingOpen ? styles.buttonGhost : styles.buttonPrimary} px-6 py-3 font-semibold`}
            type="button"
            aria-expanded={isEditingOpen}
            aria-controls="profile-editor"
            onClick={() => setIsEditingOpen((isOpen) => !isOpen)}
          >
            {isEditingOpen ? 'Cerrar edición' : 'Editar perfil'}
          </button>
        </div>
      </section>

      {isEditingOpen && (
        <div className="grid gap-8" id="profile-editor">
          <div className="grid gap-8 lg:grid-cols-2">
            <form className={`${styles.panel} rounded-[2rem] p-6`} onSubmit={onSaveUserProfile}>
          <p className={`${styles.eyebrow} text-sm uppercase tracking-[0.25em]`}>1. Mi presentación</p>
          <h2 className={`${styles.titleFont} ${styles.heading} mt-2 text-3xl`}>Cómo apareces en el álbum</h2>
          <p className={`${styles.muted} mt-2 text-sm`}>{userEmail}</p>
          {userProfile.avatarUrl && (
            <img className="mt-5 h-28 w-28 rounded-full object-cover shadow-lg" src={userProfile.avatarUrl} alt={userProfile.displayName} />
          )}

          <div className="mt-6 grid gap-4">
            <label className={`${styles.labelText} block text-sm font-semibold`}>
              Nombre visible
              <input
                className={`${styles.input} mt-2`}
                value={userProfile.displayName}
                onChange={(event) => onUserProfileChange({ ...userProfile, displayName: event.target.value })}
              />
            </label>
            <label className={`${styles.labelText} block text-sm font-semibold`}>
              Biografía visible
              <textarea
                className={`${styles.input} mt-2`}
                placeholder="Algo bonito sobre ti o sobre cómo quieres aparecer dentro del álbum."
                value={userProfile.bio}
                onChange={(event) => onUserProfileChange({ ...userProfile, bio: event.target.value })}
              />
            </label>
            <label className={`${styles.labelText} block text-sm font-semibold`}>
              Subir foto de perfil
              <span className={`${styles.muted} mt-1 block text-xs font-normal`}>Si subes una imagen, reemplaza la URL de avatar anterior.</span>
              <input className={`${styles.input} mt-2`} type="file" accept="image/*" onChange={onUserProfileImageUpload} />
            </label>
            <label className={`${styles.labelText} block text-sm font-semibold`}>
              Avatar por URL opcional
              <span className={`${styles.muted} mt-1 block text-xs font-normal`}>Úsalo sólo si ya tienes una imagen alojada en otro sitio.</span>
              <input
                className={`${styles.input} mt-2`}
                placeholder="https://..."
                value={userProfile.avatarUrl}
                onChange={(event) => onUserProfileChange({ ...userProfile, avatarUrl: event.target.value, avatarPath: '' })}
              />
            </label>
            <label className={`${styles.labelText} block text-sm font-semibold`}>
              Tema preferido
              <select
                className={`${styles.input} mt-2`}
                value={userProfile.themeMode}
                onChange={(event) => onUserProfileChange({ ...userProfile, themeMode: event.target.value as ThemeMode })}
              >
                <option value="light">Claro</option>
                <option value="dark">Oscuro</option>
              </select>
            </label>
            <button className={`${styles.buttonPrimary} px-6 py-3 font-semibold`} type="submit">
              Guardar mi perfil
            </button>
          </div>
            </form>

            <form className={`${styles.panel} rounded-[2rem] p-6`} onSubmit={onSaveAlbumProfile}>
          <p className={`${styles.eyebrow} text-sm uppercase tracking-[0.25em]`}>2. Portada del álbum</p>
          <h2 className={`${styles.titleFont} ${styles.heading} mt-2 text-3xl`}>Su portada compartida</h2>

          <div className="mt-6 grid gap-4">
            <label className={`${styles.labelText} block text-sm font-semibold`}>
              Título
              <input
                className={`${styles.input} mt-2`}
                value={albumProfile.title}
                onChange={(event) => onAlbumProfileChange({ ...albumProfile, title: event.target.value })}
              />
            </label>
            <label className={`${styles.labelText} block text-sm font-semibold`}>
              Descripción
              <textarea
                className={`${styles.input} mt-2`}
                placeholder="Cómo describirían este álbum compartido."
                value={albumProfile.description}
                onChange={(event) => onAlbumProfileChange({ ...albumProfile, description: event.target.value })}
              />
            </label>
            <label className={`${styles.labelText} block text-sm font-semibold`}>
              Subir portada del álbum
              <span className={`${styles.muted} mt-1 block text-xs font-normal`}>La imagen subida tiene prioridad sobre la foto automática seleccionada abajo.</span>
              <input className={`${styles.input} mt-2`} type="file" accept="image/*" onChange={onAlbumProfileImageUpload} />
            </label>
            <label className={`${styles.labelText} block text-sm font-semibold`}>
              Foto de portada
              <span className={`${styles.muted} mt-1 block text-xs font-normal`}>Puedes elegir una foto del álbum si prefieres no subir una portada manual.</span>
              <select
                className={`${styles.input} mt-2`}
                value={albumProfile.coverPhotoId}
                onChange={(event) => onAlbumProfileChange({ ...albumProfile, coverPhotoId: event.target.value, coverImagePath: '', coverImage: '' })}
              >
                <option value="">Elegir automáticamente</option>
                {photos.map((photo) => (
                  <option key={photo.id} value={photo.id}>
                    {photo.place} · {photo.caption.slice(0, 36)}
                  </option>
                ))}
              </select>
            </label>
            <label className={`${styles.labelText} text-sm font-semibold`}>
              Color principal
              <input
                className="ml-3 h-10 w-16 rounded-xl border-0 bg-transparent align-middle"
                type="color"
                value={albumProfile.accentColor}
                onChange={(event) => onAlbumProfileChange({ ...albumProfile, accentColor: event.target.value })}
              />
            </label>
            <button className={`${styles.buttonPrimary} px-6 py-3 font-semibold`} type="submit">
              Guardar perfil del álbum
            </button>
          </div>
            </form>
          </div>

          <section className={`${styles.panel} rounded-[2rem] p-6`}>
        <p className={`${styles.eyebrow} text-sm uppercase tracking-[0.25em]`}>3. Recuerdos destacados</p>
        <h2 className={`${styles.titleFont} ${styles.heading} mt-2 text-3xl`}>Elige qué aparece en la portada</h2>
        <p className={`${styles.muted} mt-2 max-w-2xl text-sm`}>
          Activa o desactiva fotos y citas para mostrarlas como recuerdos destacados del álbum compartido.
        </p>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className={`${styles.softCard} rounded-3xl p-4`}>
            <h3 className={`${styles.heading} text-xl font-bold`}>Selector de fotos</h3>
            <div className="mt-4 grid gap-3">
              {photos.length > 0 ? (
                photos.map((photo) => (
                  <label className={`${styles.profileSelectorItem} ${photo.showOnProfile ? styles.profileSelectorItemSelected : ''} rounded-2xl p-3`} key={photo.id}>
                    <input
                      className="h-5 w-5 accent-[var(--rose)]"
                      type="checkbox"
                      checked={photo.showOnProfile}
                      onChange={() => handleToggleProfilePhoto(photo)}
                    />
                    <img className="h-14 w-14 rounded-xl object-cover" src={photo.image} alt={photo.description} />
                    <span>
                      <strong className={styles.heading}>{photo.place}</strong>
                      <small className={`${styles.muted} block`}>{photo.caption || photo.description}</small>
                      {photo.showOnProfile && <small className={`${styles.selectedBadge} mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold`}>Destacada</small>}
                    </span>
                  </label>
                ))
              ) : (
                <p className={`${styles.muted} text-sm`}>Aún no hay fotos para elegir.</p>
              )}
            </div>
          </div>
          <div className={`${styles.softCard} rounded-3xl p-4`}>
            <h3 className={`${styles.heading} text-xl font-bold`}>Selector de citas</h3>
            <div className="mt-4 grid gap-3">
              {plans.length > 0 ? (
                plans.map((plan) => (
                  <label className={`${styles.profileSelectorItem} ${styles.profileSelectorItemPlan} ${plan.showOnProfile ? styles.profileSelectorItemSelected : ''} rounded-2xl p-3`} key={plan.id}>
                    <input
                      className="h-5 w-5 accent-[var(--rose)]"
                      type="checkbox"
                      checked={plan.showOnProfile}
                      onChange={() => handleToggleProfilePlan(plan)}
                    />
                    <span>
                      <strong className={styles.heading}>{plan.place}</strong>
                      <small className={`${styles.muted} block`}>{formatDisplayDate(plan.date)} · {plan.description}</small>
                      {plan.showOnProfile && <small className={`${styles.selectedBadge} mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold`}>Destacada</small>}
                    </span>
                  </label>
                ))
              ) : (
                <p className={`${styles.muted} text-sm`}>Aún no hay citas para elegir.</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="grid gap-4">
            <h3 className={`${styles.heading} text-xl font-bold`}>Fotos visibles</h3>
            {profilePhotos.length > 0 ? (
              profilePhotos.map((photo) => (
                <article className={`${styles.softCard} rounded-3xl p-3`} key={photo.id}>
                  <img className="h-44 w-full rounded-2xl object-cover" src={photo.image} alt={photo.description} />
                  <p className={`${styles.labelText} mt-3 text-sm font-semibold`}>{photo.place}</p>
                  <p className={`${styles.muted} text-sm`}>{photo.caption}</p>
                </article>
              ))
            ) : (
              <p className={`${styles.muted} text-sm`}>Marca fotos como destacadas desde el álbum para que aparezcan aquí.</p>
            )}
          </div>
          <div className="grid gap-4 content-start">
            <h3 className={`${styles.heading} text-xl font-bold`}>Citas visibles</h3>
            {profilePlans.length > 0 ? (
              profilePlans.map((plan) => (
                <article className={`${styles.softCard} rounded-3xl p-4`} key={plan.id}>
                  <h4 className={`${styles.heading} font-bold`}>{plan.place}</h4>
                  <p className={`${styles.muted} text-sm`}>{formatDisplayDate(plan.date)}</p>
                  <p className={`${styles.bodyText} mt-2 text-sm`}>{plan.description}</p>
                </article>
              ))
            ) : (
              <p className={`${styles.muted} text-sm`}>Marca citas como destacadas desde Citas para que aparezcan aquí.</p>
            )}
          </div>
        </div>
          </section>
        </div>
      )}
    </section>
  )
}
