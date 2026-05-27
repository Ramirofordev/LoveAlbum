import styles from '../App.module.css'
import type { AlbumMemberProfile, DatePlan, Photo, UserProfile } from '../types'

type ProfileViewProps = {
  userEmail: string
  userProfile: UserProfile
  photos: Photo[]
  plans: DatePlan[]
  albumMembers: AlbumMemberProfile[]
  onOpenSettings: () => void
}

export function ProfileView({
  userEmail,
  userProfile,
  photos,
  plans,
  albumMembers,
  onOpenSettings,
}: ProfileViewProps) {
  const profilePhotos = photos.filter((photo) => photo.showOnProfile && (!photo.userId || photo.userId === userProfile.userId))
  const profilePlans = plans.filter((plan) => plan.showOnProfile && (!plan.userId || plan.userId === userProfile.userId))
  const highlightedCount = profilePhotos.length + profilePlans.length
  const sharedMembers = albumMembers.filter((member) => !member.isCurrentUser)

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

      <section className={`${styles.panel} rounded-[2rem] p-6`}>
        <p className={`${styles.eyebrow} text-sm font-semibold uppercase tracking-[0.25em]`}>Álbum compartido</p>
        <h2 className={`${styles.titleFont} ${styles.heading} mt-2 text-3xl`}>Compartes este álbum con</h2>
        {sharedMembers.length > 0 ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {sharedMembers.map((member) => (
              <article className={`${styles.softCard} flex items-center gap-4 rounded-3xl p-4`} key={member.userId}>
                {member.avatarUrl ? (
                  <img className="h-16 w-16 rounded-2xl object-cover" src={member.avatarUrl} alt={member.displayName} />
                ) : (
                  <div className={`${styles.profileAvatarFallback} grid h-16 w-16 place-items-center rounded-2xl text-2xl`} aria-hidden="true">
                    ♡
                  </div>
                )}
                <div>
                  <h3 className={`${styles.heading} text-lg font-bold`}>{member.displayName}</h3>
                  <p className={`${styles.muted} mt-1 text-sm`}>{member.bio || 'También forma parte de este álbum.'}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className={`${styles.emptyStateCompact} mt-5 rounded-3xl p-5`}>
            <p className={`${styles.heading} font-semibold`}>Todavía no hay otra persona unida a este álbum.</p>
            <p className={`${styles.muted} mt-2 text-sm`}>Comparte el código de invitación para que tu pareja pueda sumarse.</p>
          </div>
        )}
      </section>

      <section className={`${styles.profileEditIntro} rounded-[2rem] p-5`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className={`${styles.eyebrow} text-sm font-semibold uppercase tracking-[0.25em]`}>Ajustes de cuenta</p>
            <h2 className={`${styles.titleFont} ${styles.heading} mt-2 text-3xl`}>Edita tu perfil desde Configuración</h2>
            <p className={`${styles.muted} mt-2 max-w-3xl text-sm`}>
              Mantuvimos esta vista limpia para que funcione como presentación personal. Los formularios y la seguridad viven en Configuración.
            </p>
          </div>
          <button
            className={`${styles.buttonPrimary} px-6 py-3 font-semibold`}
            type="button"
            onClick={onOpenSettings}
          >
            Abrir configuración
          </button>
        </div>
      </section>
    </section>
  )
}
