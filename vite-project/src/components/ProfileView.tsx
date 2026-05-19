import type { FormEvent } from 'react'
import type { CSSProperties } from 'react'
import styles from '../App.module.css'
import type { AlbumProfile, Photo, ThemeMode, UserProfile, DatePlan } from '../types'

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
}: ProfileViewProps) {
  const profilePhotos = photos.filter((photo) => photo.showOnProfile && (!photo.userId || photo.userId === userProfile.userId))
  const profilePlans = plans.filter((plan) => plan.showOnProfile && (!plan.userId || plan.userId === userProfile.userId))
  const coverPhoto = photos.find((photo) => photo.id === albumProfile.coverPhotoId) ?? profilePhotos[0] ?? photos[0]

  return (
    <section className="mx-auto mt-8 grid max-w-7xl gap-8">
      <section
        className={`${styles.heroPanel} overflow-hidden rounded-[2rem] p-6 md:p-10`}
        style={{ '--profile-accent': albumProfile.accentColor } as CSSProperties}
      >
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div className={`${styles.profilePortrait} rounded-[2rem] p-4`}>
            {coverPhoto ? (
              <img className="h-80 w-full rounded-[1.5rem] object-cover" src={coverPhoto.image} alt={coverPhoto.description} />
            ) : (
              <div className={`${styles.softCard} grid h-80 place-items-center rounded-[1.5rem] text-center`}>
                <p className={styles.muted}>Elegí una foto de portada cuando tengas recuerdos cargados.</p>
              </div>
            )}
          </div>
          <div>
            <p className={`${styles.eyebrow} text-sm uppercase tracking-[0.35em]`}>Perfil compartido</p>
            <h1 className={`${styles.titleFont} ${styles.heading} mt-3 text-5xl leading-none md:text-7xl`}>{albumProfile.title}</h1>
            <p className={`${styles.muted} mt-5 max-w-2xl text-lg`}>
              {albumProfile.description || 'Un lugar para contar quiénes son como pareja y qué recuerdos quieren mostrar.'}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <form className={`${styles.panel} rounded-[2rem] p-6`} onSubmit={onSaveUserProfile}>
          <p className={`${styles.eyebrow} text-sm uppercase tracking-[0.25em]`}>Mi perfil</p>
          <h2 className={`${styles.titleFont} ${styles.heading} mt-2 text-3xl`}>Tu carta de presentación</h2>
          <p className={`${styles.muted} mt-2 text-sm`}>{userEmail}</p>

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
              Biografía
              <textarea
                className={`${styles.input} mt-2`}
                placeholder="Algo bonito sobre vos o sobre cómo querés aparecer en el álbum."
                value={userProfile.bio}
                onChange={(event) => onUserProfileChange({ ...userProfile, bio: event.target.value })}
              />
            </label>
            <label className={`${styles.labelText} block text-sm font-semibold`}>
              Avatar por URL
              <input
                className={`${styles.input} mt-2`}
                placeholder="https://..."
                value={userProfile.avatarUrl}
                onChange={(event) => onUserProfileChange({ ...userProfile, avatarUrl: event.target.value })}
              />
            </label>
            <label className={`${styles.labelText} block text-sm font-semibold`}>
              Tema preferido
              <select
                className={`${styles.input} mt-2`}
                value={userProfile.themeMode}
                onChange={(event) => onUserProfileChange({ ...userProfile, themeMode: event.target.value as ThemeMode })}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
            <button className={`${styles.buttonPrimary} px-6 py-3 font-semibold`} type="submit">
              Guardar mi perfil
            </button>
          </div>
        </form>

        <form className={`${styles.panel} rounded-[2rem] p-6`} onSubmit={onSaveAlbumProfile}>
          <p className={`${styles.eyebrow} text-sm uppercase tracking-[0.25em]`}>Perfil del álbum</p>
          <h2 className={`${styles.titleFont} ${styles.heading} mt-2 text-3xl`}>La portada de ustedes</h2>

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
              Foto de portada
              <select
                className={`${styles.input} mt-2`}
                value={albumProfile.coverPhotoId}
                onChange={(event) => onAlbumProfileChange({ ...albumProfile, coverPhotoId: event.target.value })}
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
        <p className={`${styles.eyebrow} text-sm uppercase tracking-[0.25em]`}>Lo que querés enseñar</p>
        <h2 className={`${styles.titleFont} ${styles.heading} mt-2 text-3xl`}>Recuerdos visibles en tu perfil</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="grid gap-4">
            <h3 className={`${styles.heading} text-xl font-bold`}>Fotos</h3>
            {profilePhotos.length > 0 ? (
              profilePhotos.map((photo) => (
                <article className={`${styles.softCard} rounded-3xl p-3`} key={photo.id}>
                  <img className="h-44 w-full rounded-2xl object-cover" src={photo.image} alt={photo.description} />
                  <p className={`${styles.labelText} mt-3 text-sm font-semibold`}>{photo.place}</p>
                  <p className={`${styles.muted} text-sm`}>{photo.caption}</p>
                </article>
              ))
            ) : (
              <p className={`${styles.muted} text-sm`}>Marcá fotos como visibles desde el álbum para que aparezcan acá.</p>
            )}
          </div>
          <div className="grid gap-4 content-start">
            <h3 className={`${styles.heading} text-xl font-bold`}>Citas</h3>
            {profilePlans.length > 0 ? (
              profilePlans.map((plan) => (
                <article className={`${styles.softCard} rounded-3xl p-4`} key={plan.id}>
                  <h4 className={`${styles.heading} font-bold`}>{plan.place}</h4>
                  <p className={`${styles.muted} text-sm`}>{plan.date}</p>
                  <p className={`${styles.bodyText} mt-2 text-sm`}>{plan.description}</p>
                </article>
              ))
            ) : (
              <p className={`${styles.muted} text-sm`}>Marcá citas como visibles desde Citas para que aparezcan acá.</p>
            )}
          </div>
        </div>
      </section>
    </section>
  )
}
