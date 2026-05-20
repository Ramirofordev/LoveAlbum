import type { ChangeEvent, FormEvent, RefObject } from 'react'
import styles from '../App.module.css'
import { photoFilterLabels } from '../data'
import type { Photo, PhotoFilter, PhotoFormState } from '../types'
import { PhotoCard } from './PhotoCard'
import { PhotoForm } from './PhotoForm'

type AlbumViewProps = {
  groupedPlaces: string
  isPhotoFormOpen: boolean
  photoFilter: PhotoFilter
  photos: Photo[]
  photoForm: PhotoFormState
  photoPreview: string
  stickerPreview: string
  photoError: string
  stickerError: string
  fileInputRef: RefObject<HTMLInputElement | null>
  stickerInputRef: RefObject<HTMLInputElement | null>
  onToggleForm: () => void
  onFilterChange: (filter: PhotoFilter) => void
  onFormChange: (form: PhotoFormState) => void
  onPhotoUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onStickerUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onAddPhoto: (event: FormEvent<HTMLFormElement>) => void
  onTogglePhotoFavorite: (photoId: string) => void
  onUpdatePhoto: (photoId: string, updates: PhotoFormState) => void
  onDeletePhoto: (photoId: string) => void
}

export function AlbumView({
  groupedPlaces,
  isPhotoFormOpen,
  photoFilter,
  photos,
  photoForm,
  photoPreview,
  stickerPreview,
  photoError,
  stickerError,
  fileInputRef,
  stickerInputRef,
  onToggleForm,
  onFilterChange,
  onFormChange,
  onPhotoUpload,
  onStickerUpload,
  onAddPhoto,
  onTogglePhotoFavorite,
  onUpdatePhoto,
  onDeletePhoto,
}: AlbumViewProps) {
  return (
    <section className="mx-auto mt-8 grid max-w-7xl gap-8">
      <div className={`${styles.panel} flex flex-col gap-4 rounded-[2rem] p-6 md:flex-row md:items-center md:justify-between`}>
        <div>
          <p className={`${styles.eyebrow} text-sm uppercase tracking-[0.25em]`}>Nueva foto</p>
          <h2 className={`${styles.titleFont} ${styles.heading} mt-2 text-3xl`}>Gestionar álbum</h2>
        </div>
        <button className={`${styles.buttonPrimary} px-6 py-3 font-semibold`} type="button" onClick={onToggleForm}>
          {isPhotoFormOpen ? 'Cerrar formulario' : 'Agregar foto'}
        </button>
      </div>

      {isPhotoFormOpen && (
        <PhotoForm
          form={photoForm}
          photoPreview={photoPreview}
          stickerPreview={stickerPreview}
          photoError={photoError}
          stickerError={stickerError}
          fileInputRef={fileInputRef}
          stickerInputRef={stickerInputRef}
          onChange={onFormChange}
          onPhotoUpload={onPhotoUpload}
          onStickerUpload={onStickerUpload}
          onSubmit={onAddPhoto}
        />
      )}

      <div className={`${styles.panel} rounded-[2rem] p-6`}>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className={`${styles.eyebrow} text-sm uppercase tracking-[0.25em]`}>Recuerdos</p>
            <h2 className={`${styles.titleFont} ${styles.heading} mt-2 text-3xl`}>Álbum polaroid</h2>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <p className={`${styles.muted} max-w-md text-sm`}>
              {groupedPlaces ? `Lugares registrados: ${groupedPlaces}` : 'Cuando suban fotos, aquí aparecerán sus lugares.'}
            </p>
            <div className="flex flex-wrap gap-2">
              {(['todas', 'fecha', 'lugar'] as PhotoFilter[]).map((filter) => (
                <button
                  className={`${styles.filterPill} ${photoFilter === filter ? styles.filterPillActive : ''} px-4 py-2 text-sm font-semibold`}
                  key={filter}
                  type="button"
                  aria-pressed={photoFilter === filter}
                  onClick={() => onFilterChange(filter)}
                >
                  {photoFilterLabels[filter]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {photos.length > 0 ? (
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            {photos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onToggleFavorite={onTogglePhotoFavorite}
                onUpdate={onUpdatePhoto}
                onDelete={onDeletePhoto}
              />
            ))}
          </div>
        ) : (
          <div className={`${styles.emptyState} mt-8 rounded-[2rem] p-8 text-center`}>
            <p className={`${styles.eyebrow} text-sm uppercase tracking-[0.25em]`}>Primer recuerdo</p>
            <h3 className={`${styles.titleFont} ${styles.heading} mt-2 text-3xl`}>Aún no hay fotos en este álbum</h3>
            <p className={`${styles.muted} mx-auto mt-3 max-w-xl text-sm`}>
              Sube una foto, agrega un pie amoroso y empieza a construir su historia visual.
            </p>
            <button className={`${styles.buttonPrimary} mt-5 px-6 py-3 font-semibold`} type="button" onClick={onToggleForm} disabled={isPhotoFormOpen}>
              {isPhotoFormOpen ? 'Formulario abierto arriba' : 'Agregar primera foto'}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
