# Love Album

Love Album es una web romántica pensada como un álbum de fotos de pareja y un planificador de citas. La idea es guardar recuerdos especiales, decorar fotos con un estilo tipo polaroid y organizar planes futuros en un solo lugar privado.

## Funcionalidades actuales

- Login con email/contraseña y Google mediante Supabase Auth.
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
- Supabase Auth, Database y Storage

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

## Variables de entorno

El frontend usa Supabase mediante variables de Vite:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

En desarrollo local se pueden guardar en `vite-project/.env.local`. Ese archivo está ignorado por Git gracias al patrón `*.local`.

## Deploy recomendado

Para mantener la app siempre activa se recomienda desplegar el frontend en Vercel y conservar Supabase como backend.

Configuración sugerida en Vercel:

- Framework: Vite
- Root Directory: `vite-project`
- Build Command: `npm run build`
- Output Directory: `dist`
- Variables de entorno:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`

Para que Google Login funcione en producción, en Supabase Auth hay que configurar:

- Site URL: la URL final de Vercel, por ejemplo `https://love-album.vercel.app`.
- Redirect URLs:
  - `http://localhost:5173`
  - `https://love-album.vercel.app`

Si se usa un dominio propio, también hay que agregar ese dominio como redirect URL.

## Estado actual

El proyecto ya tiene una primera integración backend con Supabase. El acceso usa Supabase Auth con email/contraseña y Google, las fotos se suben a Storage privado y los metadatos de fotos/citas se guardan en tablas protegidas con Row Level Security.

La preferencia de tema sigue guardándose localmente en el navegador. Los datos iniciales locales quedan como referencia/fallback de prototipo.

## Próximas mejoras sugeridas

- Flujo de invitación para que dos cuentas compartan el mismo álbum.
- Migración asistida desde recuerdos guardados previamente en `localStorage` hacia Supabase.
- Modelo multi-pareja con álbumes y miembros para que varias parejas usen la app sin mezclar datos.
- Tests para filtros, favoritos y validaciones.

## Nota

Este proyecto fue creado como una experiencia personal y romántica, priorizando una estética cálida, elegante y de álbum polaroid.
