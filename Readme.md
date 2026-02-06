# Portfolio Fotografía – Galería + Admin

Proyecto web de galería fotográfica con selección de imágenes y envío de reservas.
Incluye un panel de administración básico para visualizar las reservas recibidas.

## Funcionalidades

- Galería de fotos por categorías
- Selección de imágenes (carrito)
- Envío de reservas desde el frontend
- Persistencia de reservas en backend (JSON)
- Panel de administración independiente

## Tecnologías

- HTML / CSS
- JavaScript (Vanilla)
- Node.js + Express
- Persistencia con fs (JSON)

## Estructura del proyecto

- `index.html` → Galería pública
- `admin.html` → Panel de administración
- `backend/` → API y persistencia
- `data.js` → Modelo de fotos
- `state.js` → Manejo de estado
- `render.js` → Renderizado de UI

## Cómo ejecutar el proyecto

1. Instalar dependencias del backend:

```bash
   npm install
