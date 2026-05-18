import type { FormEvent } from 'react'
import styles from '../App.module.css'
import type { ThemeMode } from '../types'

type LoginScreenProps = {
  themeMode: ThemeMode
  authError: string
  authMessage: string
  isAuthLoading: boolean
  onLogin: (event: FormEvent<HTMLFormElement>) => void
  onToggleTheme: () => void
}

export function LoginScreen({ themeMode, authError, authMessage, isAuthLoading, onLogin, onToggleTheme }: LoginScreenProps) {
  return (
    <main className={`${styles.appShell} ${styles.texture} grid place-items-center px-5 py-10`} data-theme={themeMode}>
      <section className={`${styles.loginCard} w-full max-w-md rounded-[2rem] p-8 text-center`}>
        <button
          className={`${styles.buttonGhost} ${styles.themeToggle} mb-6 px-4 py-2 text-sm font-semibold`}
          type="button"
          onClick={onToggleTheme}
        >
          {themeMode === 'light' ? 'Modo oscuro' : 'Modo claro'}
        </button>
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
        </form>
      </section>
    </main>
  )
}
