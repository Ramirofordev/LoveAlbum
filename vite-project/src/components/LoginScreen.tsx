import type { FormEvent } from 'react'
import styles from '../App.module.css'
import type { ThemeMode } from '../types'
import { ThemeToggle } from './ThemeToggle'

const featureCards = [
  {
    title: 'Álbumes',
    description: 'Un espacio privado por pareja para guardar fotos queridas e inmortalizar recuerdos.',
  },
  {
    title: 'Citas',
    description: 'Planes pendientes, citas hechas y momentos favoritos organizados con cariño.',
  },
  {
    title: 'Stickers',
    description: 'Detalles decorativos para que cada foto se sienta única y personal.',
  },
  {
    title: 'Favoritos',
    description: 'Un rincón rápido para ver las fotos y planes que más quieren recordar.',
  },
]

type LoginScreenProps = {
  themeMode: ThemeMode
  authError: string
  authMessage: string
  isAuthLoading: boolean
  onGoogleLogin: () => void
  onLogin: (event: FormEvent<HTMLFormElement>) => void
  onToggleTheme: () => void
}

export function LoginScreen({ themeMode, authError, authMessage, isAuthLoading, onGoogleLogin, onLogin, onToggleTheme }: LoginScreenProps) {
  return (
    <main className={`${styles.appShell} ${styles.texture} px-5 py-10`} data-theme={themeMode}>
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className={`${styles.heroPanel} rounded-[2rem] p-7 md:p-10`}>
          <div className="flex items-center justify-between gap-4">
            <p className={`${styles.eyebrow} text-sm uppercase tracking-[0.35em]`}>Love Album</p>
            <ThemeToggle themeMode={themeMode} onToggleTheme={onToggleTheme} />
          </div>
          <h1 className={`${styles.titleFont} ${styles.heading} mt-6 text-5xl leading-none md:text-7xl`}>Un museo privado para dos corazones.</h1>
          <p className={`${styles.muted} mt-5 max-w-2xl text-lg`}>
            Guardá recuerdos, planeá citas y decorá los momentos que merecen quedarse. Love Album está pensado como
            una página íntima para que una pareja construya su propia cápsula de memoria.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {featureCards.map((feature) => (
              <article className={`${styles.softCard} rounded-3xl p-5 text-left`} key={feature.title}>
                <h2 className={`${styles.heading} text-lg font-bold`}>{feature.title}</h2>
                <p className={`${styles.muted} mt-2 text-sm`}>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>

        <div className={`${styles.loginCard} rounded-[2rem] p-8 text-center`}>
          <div className="mb-6 flex justify-center lg:hidden">
          <ThemeToggle themeMode={themeMode} onToggleTheme={onToggleTheme} />
        </div>
        <p className={`${styles.eyebrow} mb-3 text-sm uppercase tracking-[0.35em]`}>Love Album</p>
        <h1 className={`${styles.titleFont} ${styles.heading} text-5xl leading-tight`}>Nuestro pequeño museo</h1>
        <p className={`${styles.muted} mt-4`}>Entrá para guardar fotos, mensajes y planes que merecen quedarse.</p>

        <form className="mt-8 space-y-4 text-left" onSubmit={onLogin}>
          <label className={`${styles.labelText} block text-sm font-semibold`}>
            Email
            <input className={`${styles.input} mt-2`} name="email" type="email" placeholder="ustedes@email.com" required />
          </label>
          <label className={`${styles.labelText} block text-sm font-semibold`}>
            Contraseña
            <input className={`${styles.input} mt-2`} name="password" type="password" placeholder="Mínimo 6 caracteres" required />
          </label>
          {authError && <p className={`${styles.eyebrow} text-sm font-semibold`}>{authError}</p>}
          {authMessage && <p className={`${styles.softCard} ${styles.muted} rounded-2xl p-3 text-xs`}>{authMessage}</p>}
          <p className={`${styles.softCard} ${styles.muted} rounded-2xl p-3 text-xs`}>
            Ahora el acceso usa Supabase Auth. Si creás una cuenta y tu proyecto pide confirmación por email, revisá tu
            correo antes de entrar.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button className={`${styles.buttonPrimary} px-6 py-3 font-semibold`} type="submit" name="intent" value="login" disabled={isAuthLoading}>
              {isAuthLoading ? 'Entrando...' : 'Entrar'}
            </button>
            <button className={`${styles.buttonGhost} px-6 py-3 font-semibold`} type="submit" name="intent" value="signup" disabled={isAuthLoading}>
              Crear cuenta
            </button>
          </div>
          <div className="flex items-center gap-3 py-1">
            <span className="h-px flex-1 bg-[var(--line)]" />
            <span className={`${styles.muted} text-xs uppercase tracking-[0.24em]`}>o</span>
            <span className="h-px flex-1 bg-[var(--line)]" />
          </div>
          <button className={`${styles.buttonGhost} flex w-full items-center justify-center gap-3 px-6 py-3 font-semibold`} type="button" onClick={onGoogleLogin} disabled={isAuthLoading}>
            <span aria-hidden="true">G</span>
            Continuar con Google
          </button>
        </form>
        </div>
      </section>
    </main>
  )
}
