import styles from '../App.module.css'
import type { CSSProperties } from 'react'
import type { AlbumProfile, DatePlan, Photo } from '../types'
import { formatDisplayDate } from '../utils'

type DashboardProps = {
  albumProfile: AlbumProfile
  photos: Photo[]
  plans: DatePlan[]
  favoritePhotos: Photo[]
  favoritePlans: DatePlan[]
  upcomingPendingPlans: DatePlan[]
  onOpenAlbum: () => void
  onOpenPlans: () => void
  onOpenProfile: () => void
}

export function Dashboard({ albumProfile, photos, plans, favoritePhotos, favoritePlans, upcomingPendingPlans, onOpenAlbum, onOpenPlans, onOpenProfile }: DashboardProps) {
  const collagePhotos = favoritePhotos.length > 0 ? favoritePhotos.slice(0, 5) : photos.slice(0, 5)
  const highlightedPhotos = photos.filter((photo) => photo.showOnProfile)
  const highlightedPlans = plans.filter((plan) => plan.showOnProfile)
  const coverPhoto = photos.find((photo) => photo.id === albumProfile.coverPhotoId) ?? highlightedPhotos[0] ?? photos[0]
  const coverImage = albumProfile.coverImage || coverPhoto?.image
  const highlightedCount = highlightedPhotos.length + highlightedPlans.length

  return (
    <>
      <section className={`${styles.heroPanel} ${styles.collageHero} mx-auto mt-6 max-w-7xl overflow-hidden rounded-[2rem] p-6 md:p-10`}>
        <div className={styles.collageLayer} aria-hidden="true">
          {collagePhotos.map((photo, index) => (
            <img
              className={styles.collagePhoto}
              src={photo.image}
              alt=""
              key={photo.id}
              style={{ '--collage-index': index } as CSSProperties}
            />
          ))}
        </div>
        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className={`${styles.eyebrow} mb-3 text-sm uppercase tracking-[0.35em]`}>Álbum privado</p>
            <h1 className={`${styles.titleFont} ${styles.heading} text-5xl leading-none md:text-7xl`}>
              Nuestra historia, una cita a la vez.
            </h1>
            <p className={`${styles.muted} mt-5 text-lg`}>
              Fotos con mensajes, recuerdos por lugar o fecha, y planes románticos para seguir construyendo capítulos
              juntos.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className={`${styles.buttonPrimary} px-6 py-3 font-semibold`} type="button" onClick={onOpenAlbum}>
                Subir una foto
              </button>
              <button className={`${styles.buttonGhost} px-6 py-3 font-semibold`} type="button" onClick={onOpenPlans}>
                Planear una cita
              </button>
              <button className={`${styles.buttonGhost} px-6 py-3 font-semibold`} type="button" onClick={onOpenProfile}>
                Ver perfil del álbum
              </button>
            </div>
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

      <section
        className={`${styles.heroPanel} ${styles.profileHero} mx-auto mt-8 max-w-7xl overflow-hidden rounded-[2rem] p-6 md:p-10`}
        style={{ '--profile-accent': albumProfile.accentColor } as CSSProperties}
      >
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div className={`${styles.profilePortrait} relative rounded-[2rem] p-4`}>
            <span className={`${styles.coverBadge} rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.22em]`}>Portada</span>
            {coverImage ? (
              <img className="h-80 w-full rounded-[1.5rem] object-cover" src={coverImage} alt={coverPhoto?.description ?? albumProfile.title} />
            ) : (
              <div className={`${styles.softCard} grid h-80 place-items-center rounded-[1.5rem] text-center`}>
                <p className={styles.muted}>Elige una foto de portada desde Perfil cuando tengas recuerdos cargados.</p>
              </div>
            )}
          </div>
          <div>
            <p className={`${styles.eyebrow} text-sm uppercase tracking-[0.35em]`}>Portada compartida</p>
            <h2 className={`${styles.titleFont} ${styles.heading} mt-3 text-4xl leading-tight md:text-7xl md:leading-none`}>{albumProfile.title}</h2>
            <p className={`${styles.muted} mt-5 max-w-2xl text-lg`}>
              {albumProfile.description || 'El espacio que resume quiénes son como pareja y qué recuerdos quieren destacar.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className={`${styles.profileStat} rounded-full px-4 py-2 text-sm font-semibold`}>{highlightedPhotos.length} fotos destacadas</span>
              <span className={`${styles.profileStat} rounded-full px-4 py-2 text-sm font-semibold`}>{highlightedPlans.length} citas destacadas</span>
              <span className={`${styles.profileStat} rounded-full px-4 py-2 text-sm font-semibold`}>{highlightedCount} recuerdos visibles</span>
            </div>
            <button className={`${styles.buttonPrimary} mt-6 px-6 py-3 font-semibold`} type="button" onClick={onOpenProfile}>
              Editar portada y perfil
            </button>
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
              <div className={`${styles.emptyStateCompact} rounded-3xl p-4`}>
                <p className={`${styles.muted} text-sm`}>Aún no has marcado fotos como favoritas.</p>
                <button className={`${styles.buttonGhost} mt-3 px-4 py-2 text-sm font-semibold`} type="button" onClick={onOpenAlbum}>
                  Ir al álbum
                </button>
              </div>
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
                  <p className={`${styles.muted} text-sm`}>
                    {formatDisplayDate(plan.date)} · {plan.description}
                  </p>
                </article>
              ))
            ) : (
              <div className={`${styles.emptyStateCompact} rounded-3xl p-4`}>
                <p className={`${styles.muted} text-sm`}>No hay citas favoritas aún.</p>
                <button className={`${styles.buttonGhost} mt-3 px-4 py-2 text-sm font-semibold`} type="button" onClick={onOpenPlans}>
                  Ver citas
                </button>
              </div>
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
                  <p className={`${styles.muted} text-sm`}>{formatDisplayDate(plan.date)}</p>
                  <p className={`${styles.bodyText} mt-2 text-sm`}>{plan.description}</p>
                </article>
              ))
            ) : (
              <div className={`${styles.emptyStateCompact} rounded-3xl p-4`}>
                <p className={`${styles.muted} text-sm`}>No hay citas pendientes próximas.</p>
                <button className={`${styles.buttonGhost} mt-3 px-4 py-2 text-sm font-semibold`} type="button" onClick={onOpenPlans}>
                  Crear una cita
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
