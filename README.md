# 🌵 Tepexi Digital

> *Donde los fósiles cuentan historias y los sabores no se olvidan.*

Portal de turismo y promoción digital de **Tepexi de Rodríguez**, un municipio enclavado en la Mixteca Poblana — tierra de dinosaurios, mezcal artesanal, arquitectura colonial y cielos que no tienen competencia.

Este proyecto es la ventana digital del municipio: un espacio donde visitantes y locales encuentran todo lo que Tepexi tiene para ofrecer.

---

## ✦ ¿Qué es esto?

Un sitio web completo que cubre:

- 📍 **Lugares** — los rincones que vale la pena conocer
- 🍜 **Gastronomía** — la cocina que define a Tepexi
- 🛍️ **Servicios** — lo que el municipio ofrece a quienes lo visitan
- 🎉 **Eventos** — la agenda que mantiene vivo al pueblo
- 🗺️ **Mapa interactivo** — para orientarse sin perderse
- 🏛️ **Cultura** — tradiciones, historia e identidad
- ✉️ **Contacto** — línea directa con el municipio

El contenido es gestionado por el equipo local desde un **Sanity Studio embebido** (`/studio`) — sin necesidad de tocar código.

---

## ⚙️ Stack técnico

```
Next.js 15 (App Router)   →  estructura y rendimiento
Sanity v5                 →  CMS headless con Studio embebido
Tailwind CSS v4           →  estilos utilitarios
Leaflet + React Leaflet   →  mapas interactivos
Resend                    →  emails desde el formulario de contacto
Vercel Analytics          →  métricas de visitas
TypeScript 5              →  tipado estricto en todo el proyecto
```

---

## 🗂️ Estructura del proyecto

```
src/
├── app/
│   ├── (site)/           # Rutas públicas del sitio
│   │   ├── page.tsx      # Inicio
│   │   ├── lugares/
│   │   ├── gastronomia/
│   │   ├── servicios/
│   │   ├── agenda/
│   │   ├── cultura/
│   │   ├── mapa/
│   │   ├── como-llegar/
│   │   └── contacto/
│   ├── api/              # Route handlers (emails, etc.)
│   └── studio/           # Sanity Studio
├── components/           # Componentes reutilizables
├── sanity/               # Schemas, queries y cliente de Sanity
├── lib/                  # Utilidades compartidas
├── actions/              # Server Actions
└── types/                # Tipos TypeScript globales
```

---

## 📝 Contenido en Sanity

| Tipo | Descripción |
|------|-------------|
| `lugar` | Puntos de interés con imágenes, descripción y coordenadas |
| `gastronomia` | Platillos y establecimientos locales |
| `servicio` | Servicios disponibles para visitantes |
| `evento` | Agenda de eventos con fecha y lugar |
| `categoria` | Taxonomía transversal del contenido |
| `settings` | Singleton — SEO, nombre del sitio, redes sociales |

---

*Hecho con orgullo para Tepexi de Rodríguez, Puebla 🇲🇽*
