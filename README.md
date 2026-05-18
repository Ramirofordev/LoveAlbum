# Love Album

Love Album es una web romántica pensada como un álbum de fotos de pareja y un planificador de citas. La idea es guardar recuerdos especiales, decorar fotos con un estilo tipo polaroid y organizar planes futuros en un solo lugar privado.

## Funcionalidades actuales

- Login visual/local para entrar al álbum.
- Página principal con resumen de:
  - fotos favoritas,
  - citas favoritas,
  - citas pendientes próximas.
- Álbum de fotos con:
  - subida de imágenes desde formulario,
  - descripción,
  - pie de foto amoroso,
  - lugar,
  - fecha,
  - color de contorno personalizable,
  - stickers decorativos subidos por el usuario,
  - posición configurable del sticker,
  - marcado de fotos favoritas,
  - filtros/ordenamiento por fecha y lugar.
- Planificador de citas con:
  - lugar,
  - link de ubicación,
  - fecha,
  - resumen de la cita,
  - actividades,
  - estados: pendiente, hecha o favorita,
  - filtros por estado.
- Formularios desplegables para mantener la interfaz limpia.

## Stack técnico

- Vite
- React
- TypeScript
- Tailwind CSS
- CSS Modules

## Cómo ejecutar el proyecto

Desde la raíz del repositorio:

```bash
cd vite-project
npm install
npm run dev
```

Para verificar build y lint:

```bash
npm run build
npm run lint
```

## Estado actual

El proyecto está en fase de prototipo frontend. Actualmente los datos viven en memoria del navegador, por lo que las fotos, citas y favoritos agregados se pierden al recargar la página.

El login todavía es simbólico/local. Para una versión privada real se recomienda implementar autenticación y persistencia con backend.

## Próximas mejoras sugeridas

- Persistencia local con `localStorage` o IndexedDB.
- Autenticación real.
- Backend y storage para imágenes, por ejemplo con Supabase.
- Edición y eliminación de fotos.
- Edición y eliminación de citas.
- Cambio de estado de citas desde cada tarjeta.
- Refactor por componentes para reducir el tamaño de `App.tsx`.
- Tests para filtros, favoritos y validaciones.

## Nota

Este proyecto fue creado como una experiencia personal y romántica, priorizando una estética cálida, elegante y de álbum polaroid.
