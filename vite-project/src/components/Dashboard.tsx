import styles from '../App.module.css'
import type { CSSProperties } from 'react'
import type { DatePlan, Photo } from '../types'

type DashboardProps = {
  photos: Photo[]
  plans: DatePlan[]
  favoritePhotos: Photo[]
  favoritePlans: DatePlan[]
  upcomingPendingPlans: DatePlan[]
}

export function Dashboard({ photos, plans, favoritePhotos, favoritePlans, upcomingPendingPlans }: DashboardProps) {
  const collagePhotos = favoritePhotos.length > 0 ? favoritePhotos.slice(0, 5) : photos.slice(0, 5)

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
                  <p className={`${styles.muted} text-sm`}>
                    {plan.date} · {plan.description}
                  </p>
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
  )
}
