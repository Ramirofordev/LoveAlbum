import { useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import styles from '../App.module.css'
import { stickerPositionLabels, stickerSizeLabels } from '../data'
import type { Photo, PhotoFormState, StickerPosition, StickerSize } from '../types'
import { formatDisplayDate } from '../utils'

const stickerPositionClasses: Record<StickerPosition, string> = {
  topRight: styles.stickerTopRight,
  topLeft: styles.stickerTopLeft,
}

const stickerSizeClasses: Record<StickerSize, string> = {
  small: styles.stickerSmall,
  medium: styles.stickerMedium,
  large: styles.stickerLarge,
}

type PhotoCardProps = {
  photo: Photo
  onToggleFavorite: (photoId: string) => void
  onUpdate: (photoId: string, updates: PhotoFormState) => void
  onDelete: (photoId: string) => void
}

export function PhotoCard({ photo, onToggleFavorite, onUpdate, onDelete }: PhotoCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState<PhotoFormState>({
    description: photo.description,
    caption: photo.caption,
    place: photo.place,
    date: photo.date,
    frameColor: photo.frameColor,
    stickerPosition: photo.stickerPosition ?? 'topRight',
    stickerSize: photo.stickerSize ?? 'medium',
    isFavorite: photo.isFavorite,
    showOnProfile: photo.showOnProfile,
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onUpdate(photo.id, draft)
    setIsEditing(false)
  }

  const refreshDraft = () => {
    setDraft({
      description: photo.description,
      caption: photo.caption,
      place: photo.place,
      date: photo.date,
      frameColor: photo.frameColor,
      stickerPosition: photo.stickerPosition ?? 'topRight',
      stickerSize: photo.stickerSize ?? 'medium',
      isFavorite: photo.isFavorite,
      showOnProfile: photo.showOnProfile,
    })
  }

  const handleStartEditing = () => {
    refreshDraft()
    setIsEditing(true)
  }

  const handleCancelEditing = () => {
    refreshDraft()
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (window.confirm('¿Seguro que quieres borrar esta foto? Esta acción no se puede deshacer.')) {
      onDelete(photo.id)
    }
  }

  return (
    <article
      className={styles.polaroid}
      style={
        {
          '--frame-color': photo.frameColor,
          '--tilt': photo.tilt,
        } as CSSProperties
      }
    >
      <img className="h-72 w-full object-cover" src={photo.image} alt={photo.description} />
      {photo.stickerImage && (
        <img
          className={`${styles.sticker} ${stickerPositionClasses[photo.stickerPosition ?? 'topRight']} ${stickerSizeClasses[photo.stickerSize ?? 'medium']}`}
          src={photo.stickerImage}
          alt=""
          aria-hidden="true"
        />
      )}
      <button
        className={`${styles.favoriteButton} absolute left-3 top-3 rounded-full px-3 py-2 text-sm font-bold shadow-sm`}
        type="button"
        onClick={() => onToggleFavorite(photo.id)}
        aria-label={photo.isFavorite ? 'Quitar de favoritas' : 'Marcar como favorita'}
      >
        {photo.isFavorite ? '♡ Favorita' : '♡'}
      </button>
      <div className="absolute right-3 top-3 flex gap-2">
        <button className={`${styles.buttonGhost} px-3 py-2 text-xs font-semibold`} type="button" onClick={handleStartEditing}>
          Editar
        </button>
        <button className={`${styles.buttonGhost} px-3 py-2 text-xs font-semibold`} type="button" onClick={handleDelete}>
          Borrar
        </button>
      </div>
      <div className={styles.polaroidNote}>{photo.caption}</div>
      <div className="mt-5 px-1 pb-2 text-left">
        {isEditing ? (
          <form className={`${styles.polaroidEditForm} grid gap-3`} onSubmit={handleSubmit}>
            <input className={styles.input} aria-label="Lugar de la foto" value={draft.place} onChange={(event) => setDraft({ ...draft, place: event.target.value })} />
            <input className={styles.input} aria-label="Fecha de la foto" type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} />
            <textarea className={styles.input} aria-label="Descripción de la foto" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} required />
            <textarea className={styles.input} aria-label="Pie de foto amoroso" value={draft.caption} onChange={(event) => setDraft({ ...draft, caption: event.target.value })} required />
            <label className={`${styles.labelText} text-sm font-semibold`}>
              Color
              <input
                className="ml-3 h-10 w-16 rounded-xl border-0 bg-transparent align-middle"
                type="color"
                value={draft.frameColor}
                onChange={(event) => setDraft({ ...draft, frameColor: event.target.value })}
              />
            </label>
            {photo.stickerImage && (
              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  className={styles.input}
                  aria-label="Posición del sticker"
                  value={draft.stickerPosition}
                  onChange={(event) => setDraft({ ...draft, stickerPosition: event.target.value as StickerPosition })}
                >
                  {Object.entries(stickerPositionLabels).map(([position, label]) => (
                    <option key={position} value={position}>
                      {label}
                    </option>
                  ))}
                </select>
                <select
                  className={styles.input}
                  aria-label="Tamaño del sticker"
                  value={draft.stickerSize}
                  onChange={(event) => setDraft({ ...draft, stickerSize: event.target.value as StickerSize })}
                >
                  {Object.entries(stickerSizeLabels).map(([size, label]) => (
                    <option key={size} value={size}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <label className={`${styles.labelText} flex items-center gap-2 text-sm font-semibold`}>
              <input
                className="h-5 w-5 accent-[var(--rose)]"
                type="checkbox"
                checked={draft.isFavorite}
                onChange={(event) => setDraft({ ...draft, isFavorite: event.target.checked })}
              />
              Favorita
            </label>
            <label className={`${styles.labelText} flex items-center gap-2 text-sm font-semibold`}>
              <input
                className="h-5 w-5 accent-[var(--rose)]"
                type="checkbox"
                checked={draft.showOnProfile}
                onChange={(event) => setDraft({ ...draft, showOnProfile: event.target.checked })}
              />
              Destacar en la portada
            </label>
            <div className="flex flex-wrap gap-2">
              <button className={`${styles.buttonPrimary} px-4 py-2 text-sm font-semibold`} type="submit">
                Guardar
              </button>
              <button className={`${styles.buttonGhost} px-4 py-2 text-sm font-semibold`} type="button" onClick={handleCancelEditing}>
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <>
            <h3 className={`${styles.heading} font-semibold`}>{photo.place}</h3>
            <p className={`${styles.muted} text-sm`}>
              {formatDisplayDate(photo.date)} · {photo.description}
            </p>
            {photo.showOnProfile && <p className={`${styles.eyebrow} mt-2 text-xs font-semibold`}>Destacada en la portada</p>}
          </>
        )}
      </div>
    </article>
  )
}
