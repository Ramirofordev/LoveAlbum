import styles from '../App.module.css'
import type { ThemeMode } from '../types'

type ThemeToggleProps = {
  themeMode: ThemeMode
  onToggleTheme: () => void
}

export function ThemeToggle({ themeMode, onToggleTheme }: ThemeToggleProps) {
  const isLightMode = themeMode === 'light'

  return (
    <button
      className={`${styles.buttonGhost} ${styles.themeToggle}`}
      type="button"
      onClick={onToggleTheme}
      aria-label={isLightMode ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
      title={isLightMode ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
    >
      <span aria-hidden="true">{isLightMode ? '♡' : '♥'}</span>
    </button>
  )
}
