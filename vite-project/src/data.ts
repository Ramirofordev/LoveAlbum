import type { DatePlan, DatePlanStatus, Photo, StickerPosition, StickerSize } from './types'

export const initialPhotos: Photo[] = [
  {
    id: 'photo-first-walk',
    image:
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80',
    description: 'Una tarde cualquiera que terminó sintiéndose inolvidable.',
    caption: 'Contigo, hasta lo simple parece una escena de película.',
    place: 'Nuestro rincón favorito',
    date: '2026-02-14',
    frameColor: '#fffaf4',
    tilt: '-2deg',
    isFavorite: true,
    showOnProfile: true,
  },
  {
    id: 'photo-city-walk',
    image:
      'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=80',
    description: 'Ese paseo lento donde no hacía falta apurarse a ningún lado.',
    caption: 'Mi plan favorito siempre empieza cuando me tomas la mano.',
    place: 'Centro',
    date: '2026-03-08',
    frameColor: '#f5cbd4',
    tilt: '1.5deg',
    isFavorite: false,
    showOnProfile: false,
  },
]

export const initialPlans: DatePlan[] = [
  {
    id: 'plan-terrace-cafe',
    place: 'Café con terraza',
    locationUrl: 'https://maps.google.com',
    description: 'Merienda tranquila, fotos lindas y una caminata sin mirar el reloj.',
    date: '2026-06-01',
    status: 'pendiente',
    showOnProfile: false,
    activities: ['Reservar una mesa linda', 'Probar un postre nuevo', 'Sacar una polaroid'],
  },
  {
    id: 'plan-home-movie-night',
    place: 'Noche de películas en casa',
    locationUrl: '',
    description: 'Cena casera, mantas, velas y una lista de películas elegidas por ambos.',
    date: '2026-06-12',
    status: 'favorita',
    showOnProfile: true,
    activities: ['Preparar pasta', 'Elegir dos películas', 'Hacer pochoclos dulces'],
  },
]

export const statusLabels: Record<DatePlanStatus, string> = {
  pendiente: 'Pendiente',
  hecha: 'Hecha',
  favorita: 'Favorita',
}

export const stickerPositionLabels: Record<StickerPosition, string> = {
  topRight: 'Arriba derecha',
  topLeft: 'Arriba izquierda',
}

export const stickerSizeLabels: Record<StickerSize, string> = {
  small: 'Pequeño',
  medium: 'Mediano',
  large: 'Grande',
}

export const photoFilterLabels = {
  todas: 'Todas',
  fecha: 'Por fecha',
  lugar: 'Por lugar',
} as const
