import type { ChangeEvent, FormEvent, RefObject } from 'react'
import styles from '../App.module.css'
import { stickerPositionLabels } from '../data'
import type { PhotoFormState, StickerPosition } from '../types'

type PhotoFormProps = {
  form: PhotoFormState
  photoPreview: string
  stickerPreview: string
  photoError: string
  stickerError: string
  fileInputRef: RefObject<HTMLInputElement | null>
  stickerInputRef: RefObject<HTMLInputElement | null>
  onChange: (form: PhotoFormState) => void
  onPhotoUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onStickerUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function PhotoForm({
  form,
  photoPreview,
  stickerPreview,
  photoError,
  stickerError,
  fileInputRef,
  stickerInputRef,
  onChange,
  onPhotoUpload,
  onStickerUpload,
  onSubmit,
}: PhotoFormProps) {
  return (
    <form className={`${styles.panel} rounded-[2rem] p-6`} onSubmit={onSubmit}>
      <p className={`${styles.eyebrow} text-sm uppercase tracking-[0.25em]`}>Nueva foto</p>
      <h2 className={`${styles.titleFont} ${styles.heading} mt-2 text-3xl`}>Guardar un recuerdo</h2>

      <div className="mt-6 grid gap-4">
        <label className={`${styles.labelText} block text-sm font-semibold`}>
          Imagen
          <input
            ref={fileInputRef}
            className={`${styles.input} mt-2`}
            type="file"
            accept="image/*"
            onChange={onPhotoUpload}
            required
          />
        </label>
        {photoError && <p className={`${styles.eyebrow} text-sm font-semibold`}>{photoError}</p>}
        {photoPreview && <img className="h-52 w-full rounded-3xl object-cover" src={photoPreview} alt="Vista previa" />}
        <label className={`${styles.labelText} block text-sm font-semibold`}>
          Sticker decorativo opcional
          <input
            ref={stickerInputRef}
            className={`${styles.input} mt-2`}
            type="file"
            accept="image/*"
            onChange={onStickerUpload}
          />
        </label>
        {stickerError && <p className={`${styles.eyebrow} text-sm font-semibold`}>{stickerError}</p>}
        {stickerPreview && (
          <div className={`${styles.softCard} ${styles.muted} flex items-center gap-3 rounded-3xl p-3 text-sm`}>
            <img className="h-14 w-14 rounded-2xl object-contain" src={stickerPreview} alt="Sticker elegido" />
            Sticker listo para pegar: {stickerPositionLabels[form.stickerPosition]}.
          </div>
        )}
        <label className={`${styles.labelText} block text-sm font-semibold`}>
          Posición del sticker
          <select
            className={`${styles.input} mt-2`}
            value={form.stickerPosition}
            onChange={(event) => onChange({ ...form, stickerPosition: event.target.value as StickerPosition })}
          >
            {Object.entries(stickerPositionLabels).map(([position, label]) => (
              <option key={position} value={position}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className={`${styles.labelText} block text-sm font-semibold`}>
          Lugar
          <input
            className={`${styles.input} mt-2`}
            placeholder="Ej: La plaza donde caminamos"
            value={form.place}
            onChange={(event) => onChange({ ...form, place: event.target.value })}
          />
        </label>
        <label className={`${styles.labelText} block text-sm font-semibold`}>
          Fecha
          <input
            className={`${styles.input} mt-2`}
            type="date"
            value={form.date}
            onChange={(event) => onChange({ ...form, date: event.target.value })}
          />
        </label>
        <label className={`${styles.labelText} block text-sm font-semibold`}>
          Descripción
          <textarea
            className={`${styles.input} mt-2`}
            placeholder="Qué estaba pasando en esta foto"
            value={form.description}
            onChange={(event) => onChange({ ...form, description: event.target.value })}
            required
          />
        </label>
        <label className={`${styles.labelText} block text-sm font-semibold`}>
          Pie de foto amoroso
          <textarea
            className={`${styles.input} mt-2`}
            placeholder="Un mensaje personal para esa foto"
            value={form.caption}
            onChange={(event) => onChange({ ...form, caption: event.target.value })}
            required
          />
        </label>
        <label className={`${styles.labelText} text-sm font-semibold`}>
          Color del contorno
          <input
            className="ml-3 h-10 w-16 rounded-xl border-0 bg-transparent align-middle"
            type="color"
            value={form.frameColor}
            onChange={(event) => onChange({ ...form, frameColor: event.target.value })}
          />
        </label>
        <label className={`${styles.softCard} ${styles.labelText} flex items-center gap-3 rounded-3xl p-4 text-sm font-semibold`}>
          <input
            className="h-5 w-5 accent-[var(--rose)]"
            type="checkbox"
            checked={form.isFavorite}
            onChange={(event) => onChange({ ...form, isFavorite: event.target.checked })}
          />
          Marcar como foto favorita
        </label>
        <button className={`${styles.buttonPrimary} px-6 py-3 font-semibold`} type="submit">
          Añadir al álbum
        </button>
      </div>
    </form>
  )
}
