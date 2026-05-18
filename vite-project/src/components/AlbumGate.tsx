import type { FormEvent } from 'react'
import styles from '../App.module.css'
import type { LoveAlbum, ThemeMode } from '../types'

type AlbumGateProps = {
  albums: LoveAlbum[]
  albumName: string
  inviteCode: string
  error: string
  isLoading: boolean
  themeMode: ThemeMode
  onAlbumNameChange: (name: string) => void
  onInviteCodeChange: (code: string) => void
  onCreateAlbum: (event: FormEvent<HTMLFormElement>) => void
  onJoinAlbum: (event: FormEvent<HTMLFormElement>) => void
  onSelectAlbum: (album: LoveAlbum) => void
  onLogout: () => void
  onToggleTheme: () => void
}

export function AlbumGate({
  albums,
  albumName,
  inviteCode,
  error,
  isLoading,
  themeMode,
  onAlbumNameChange,
  onInviteCodeChange,
  onCreateAlbum,
  onJoinAlbum,
  onSelectAlbum,
  onLogout,
  onToggleTheme,
}: AlbumGateProps) {
  return (
    <main className={`${styles.appShell} ${styles.texture} grid min-h-screen place-items-center px-5 py-10`} data-theme={themeMode}>
      <section className={`${styles.loginCard} w-full max-w-3xl rounded-[2rem] p-8`}>
        <div className="flex flex-col gap-3 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
          <div>
            <p className={`${styles.eyebrow} text-sm uppercase tracking-[0.35em]`}>Love Album</p>
            <h1 className={`${styles.titleFont} ${styles.heading} mt-3 text-4xl leading-tight`}>Elegí su álbum compartido</h1>
            <p className={`${styles.muted} mt-3`}>Creen un espacio privado de pareja o únanse con el código que les compartieron.</p>
          </div>
          <div className="flex justify-center gap-2">
            <button className={`${styles.buttonGhost} px-4 py-2 text-sm font-semibold`} type="button" onClick={onToggleTheme}>
              {themeMode === 'light' ? 'Modo oscuro' : 'Modo claro'}
            </button>
            <button className={`${styles.buttonGhost} px-4 py-2 text-sm font-semibold`} type="button" onClick={onLogout}>
              Salir
            </button>
          </div>
        </div>

        {error && <p className={`${styles.eyebrow} mt-5 text-sm font-semibold`}>{error}</p>}

        {albums.length > 0 && (
          <div className="mt-8 grid gap-3">
            <p className={`${styles.labelText} text-sm font-semibold`}>Tus álbumes</p>
            {albums.map((album) => (
              <button
                className={`${styles.softCard} ${styles.labelText} rounded-3xl p-4 text-left font-semibold`}
                key={album.id}
                type="button"
                onClick={() => onSelectAlbum(album)}
              >
                {album.name}
                <span className={`${styles.muted} ml-2 text-xs`}>Código: {album.inviteCode}</span>
              </button>
            ))}
          </div>
        )}

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <form className={`${styles.panel} rounded-[2rem] p-5`} onSubmit={onCreateAlbum}>
            <p className={`${styles.eyebrow} text-xs uppercase tracking-[0.25em]`}>Crear</p>
            <h2 className={`${styles.heading} mt-2 text-xl font-semibold`}>Nuevo álbum</h2>
            <label className={`${styles.labelText} mt-4 block text-sm font-semibold`}>
              Nombre del álbum
              <input
                className={`${styles.input} mt-2`}
                placeholder="Ej: Nachito y su amor"
                value={albumName}
                onChange={(event) => onAlbumNameChange(event.target.value)}
              />
            </label>
            <button className={`${styles.buttonPrimary} mt-4 w-full px-6 py-3 font-semibold`} type="submit" disabled={isLoading}>
              Crear nuestro álbum
            </button>
          </form>

          <form className={`${styles.panel} rounded-[2rem] p-5`} onSubmit={onJoinAlbum}>
            <p className={`${styles.eyebrow} text-xs uppercase tracking-[0.25em]`}>Unirse</p>
            <h2 className={`${styles.heading} mt-2 text-xl font-semibold`}>Tengo un código</h2>
            <label className={`${styles.labelText} mt-4 block text-sm font-semibold`}>
              Código de invitación
              <input
                className={`${styles.input} mt-2 uppercase tracking-[0.25em]`}
                placeholder="abc123ef"
                value={inviteCode}
                onChange={(event) => onInviteCodeChange(event.target.value)}
                required
              />
            </label>
            <button className={`${styles.buttonGhost} mt-4 w-full px-6 py-3 font-semibold`} type="submit" disabled={isLoading}>
              Unirme al álbum
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
