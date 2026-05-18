import type { FormEvent } from 'react'
import styles from '../App.module.css'
import type { ThemeMode } from '../types'

type LoginScreenProps = {
  themeMode: ThemeMode
  onLogin: (event: FormEvent<HTMLFormElement>) => void
  onToggleTheme: () => void
}

export function LoginScreen({ themeMode, onLogin, onToggleTheme }: LoginScreenProps) {
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
            Nombre de acceso
            <input className={`${styles.input} mt-2`} placeholder="Ej: Nachito y su amor" required />
          </label>
          <label className={`${styles.labelText} block text-sm font-semibold`}>
            Contraseña
            <input className={`${styles.input} mt-2`} type="password" placeholder="Por ahora es simbólica" required />
          </label>
          <p className={`${styles.softCard} ${styles.muted} rounded-2xl p-3 text-xs`}>
            Nota: este login es local para el prototipo. Para privacidad real vamos a necesitar backend y autenticación
            segura.
          </p>
          <button className={`${styles.buttonPrimary} w-full px-6 py-3 font-semibold`} type="submit">
            Entrar al álbum
          </button>
        </form>
      </section>
    </main>
  )
}
