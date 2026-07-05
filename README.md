# 🌵 Tepexi Digital

> *Donde los fósiles cuentan historias y los sabores no se olvidan.*

Portal de turismo y promoción digital de **Tepexi de Rodríguez**, Puebla. Un municipio enclavado en la Mixteca Poblana — tierra de dinosaurios, mezcal artesanal, arquitectura colonial y cielos que no tienen competencia.

El sitio reúne lugares, gastronomía, servicios, eventos, cultura, mapa interactivo y contacto ciudadano en una sola experiencia pública.

---

## ✦ ¿Qué es esto?

Un sitio web público para promoción turística y cultural que cubre:

- 📍 **Lugares** — los rincones que vale la pena conocer
- 🍜 **Gastronomía** — la cocina que define a Tepexi
- 🛍️ **Servicios** — lo que el municipio ofrece a quienes lo visitan
- 🎉 **Eventos** — la agenda que mantiene vivo al pueblo
- 🗺️ **Mapa interactivo** — para orientarse sin perderse
- 🏛️ **Cultura** — tradiciones, historia e identidad
- ✉️ **Contacto** — Contacto con nuestro equipo local.

El contenido es gestionado por el equipo local desde un **Sanity Studio embebido** (`/studio`) — sin necesidad de tocar código.

---

## ⚙️ Stack técnico

```text
Next.js 16.2.9 (App Router)
React 19.2.4
Sanity v5 + Studio embebido
Tailwind CSS v4
Leaflet + React Leaflet
Resend
Vercel Analytics + Vercel Speed Insights
TypeScript 5
```

### Runtime fijado

- **Node.js:** `22.20.0` (`.node-version` y `.nvmrc`)
- **engines.node:** `22.x`
- **pnpm:** `10.32.1` (`packageManager`)

Usa exactamente esas versiones en local, CI y Vercel para evitar diferencias de build o dependencias nativas.

---

## 🚀 Scripts principales

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm lint
pnpm test
pnpm typecheck
pnpm build
pnpm audit:prod
```

---

## 🔐 Variables de entorno

Copiá `.env.example` a `.env.local` para desarrollo. Variables usadas por runtime:

| Variable | Requerida | Uso |
|----------|-----------|-----|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sí | Proyecto de Sanity para contenido público |
| `NEXT_PUBLIC_SANITY_DATASET` | Sí | Dataset de Sanity |
| `SANITY_API_READ_TOKEN` | Según flujo | Lectura server-side / draft data |
| `SANITY_API_BROWSER_TOKEN` | Según flujo | Draft mode browser-safe token |
| `SANITY_DRAFT_SECRET` | Sí | Habilitar `/api/draft-mode/enable` |
| `SANITY_REVALIDATE_SECRET` | Sí | Validar webhook de Sanity hacia `/api/revalidate` |
| `RESEND_API_KEY` | Sí | Envío del formulario de contacto |
| `CONTACT_RECIPIENT_EMAIL` | Sí | Destino del formulario de contacto |
| `NEXT_PUBLIC_SITE_URL` | Sí | URL pública base del sitio |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` | Opcional | Google Analytics si se desea doble medición |

### Validación mínima antes de deploy

1. Confirmar que `SANITY_REVALIDATE_SECRET` exista en Vercel.
2. Confirmar que `RESEND_API_KEY` y `CONTACT_RECIPIENT_EMAIL` estén configuradas.
3. Verificar que `NEXT_PUBLIC_SITE_URL` coincida con el dominio productivo.

---

## 🗂️ Estructura del proyecto

```text
src/
├── app/
│   ├── (site)/           # Rutas públicas
│   ├── api/              # Route handlers
│   └── studio/           # Sanity Studio
├── actions/              # Server Actions
├── components/           # Componentes reutilizables
├── lib/                  # Utilidades compartidas
├── sanity/               # Cliente, live queries y schemas
└── types/                # Tipos globales
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
| `settings` | Singleton de SEO, branding y contacto |

---

## ✅ Política de CI/CD y auditoría

### Checks que deben quedar como requeridos en branch protection

- `CI / verify`
- `Security Audit / audit`

### Qué valida CI en cada PR

1. `pnpm install --frozen-lockfile`
2. `pnpm lint`
3. `pnpm test`
4. `pnpm typecheck`
5. `pnpm build`

### Política de dependencias

- `pnpm audit:prod` **bloquea** vulnerabilidades **high** y **critical** en dependencias de producción.
- No se silencian vulnerabilidades con `|| echo warning`.
- Si aparece una excepción temporal, debe documentarse en un issue operativo con fecha de vencimiento, owner y plan de remediación antes de relajar la política.

---

## 📈 Observabilidad operativa

La app ahora expone telemetría de bajo riesgo sin secretos extra:

- **Vercel Analytics** renderizado en layout público.
- **Logs estructurados** para:
  - fallos de contacto / Resend,
  - fallos o configuración faltante de revalidación,
  - fallback a mocks de Sanity,
  - error boundary público,
  - fallo de mosaicos del mapa.

### Qué revisar en logs

- `[contact] ...`
- `[revalidate] ...`
- `[mock-fallback] ...`
- `[site-error-boundary] ...`
- `[map] ...`

### Umbrales de alerta y escalación

- **P1 inmediata:** cualquier log de configuración faltante en producción (`[revalidate] missing SANITY_REVALIDATE_SECRET configuration`, `[contact] contact form configuration is incomplete`) o cualquier `[mock-fallback]` nuevo en producción.
- **P1 inmediata:** 2 o más errores `5xx` de revalidación en 10 minutos, o webhook con firma inválida repetido después de una rotación ya validada.
- **P2 (investigar en < 30 min):** 3 o más fallos de envío `[contact] sendContactMessage failed` en 15 minutos.
- **P2 (investigar en < 30 min):** fallback visible del mapa reportado por usuarios o repetido en logs.
- **Escalación:** avisar a responsable de plataforma/Vercel y a responsable CMS cuando falle revalidación; avisar a responsable de atención/contacto cuando falle Resend; si el impacto es público, promover rollback o publicar canal alternativo mientras se corrige.

---

## 📦 Runbook de deploy, rollback y operación

### Deploy a producción en Vercel

1. Abrir PR y esperar `CI` + `Security Audit` en verde.
2. Mergear a `main`.
3. Verificar que Vercel genere deployment productivo sin errores de build.
4. Confirmar variables de entorno productivas antes de promover cualquier cambio manual.

### Promover un deployment

Si necesitas promover manualmente un deployment previo:

1. Abrí el proyecto en Vercel.
2. Entrá a **Deployments**.
3. Seleccioná el deployment validado.
4. Usa **Promote to Production**.
5. Ejecutá los checks post-deploy listados abajo.

### Rollback

Ante incidente productivo:

1. Abrí **Deployments** en Vercel.
2. Elegí el último deployment sano.
3. Usa **Promote to Production** para rollback inmediato.
4. Confirmá formulario de contacto, carga de contenido Sanity y páginas principales.
5. Abrí incidente o issue con causa raíz y timestamp del rollback.

### Validación de webhook de Sanity / revalidación

1. Confirmar `SANITY_REVALIDATE_SECRET` en Vercel.
2. Verificar que el webhook en Sanity apunte a `https://tepexidigital.com.mx/api/revalidate`.
3. Publicar un cambio menor en Sanity.
4. Confirmar respuesta `200` del webhook.
5. Revisar logs; no debe aparecer `[revalidate] invalid webhook signature`.
6. Verificar en la siguiente visita/request que el contenido se recargue con datos frescos del tag `sanity` expirado por el webhook.

### Rotación de secretos

#### `SANITY_REVALIDATE_SECRET`

1. Generar nuevo secreto.
2. Actualizar primero en Vercel.
3. Actualizar después el webhook en Sanity.
4. Repetir validación de webhook.
5. Revocar el secreto anterior.

#### `SANITY_DRAFT_SECRET`

1. Generar nuevo secreto.
2. Actualizar en Vercel.
3. Validar acceso controlado a draft mode.
4. Revocar el valor anterior.

#### `RESEND_API_KEY`

1. Crear nueva key en Resend.
2. Actualizar en Vercel.
3. Enviar mensaje de prueba desde `/contacto`.
4. Verificar recepción en `CONTACT_RECIPIENT_EMAIL`.
5. Revocar la key anterior.

### Recuperación del formulario de contacto / Resend

Si `/contacto` falla:

1. Revisar logs `[contact]` en Vercel.
2. Confirmar `RESEND_API_KEY` y `CONTACT_RECIPIENT_EMAIL`.
3. Verificar dominio/remitente permitido en Resend.
4. Ejecutar envío manual de prueba.
5. Si Resend sigue degradado, publicar aviso operativo y canal alternativo de contacto hasta restaurar el servicio.

### Checks post-deploy

Validar al menos:

1. Home carga y renderiza hero.
2. `/lugares`, `/gastronomia`, `/agenda` y `/mapa` responden.
3. `/contacto` envía un mensaje de prueba.
4. `/studio` abre correctamente para el equipo autorizado.
5. Sanity webhook revalida contenido.
6. No hay logs nuevos de `[mock-fallback]` en producción salvo incidente conocido.

---

## ⚠️ Riesgos conocidos / trabajo futuro

- **Rate limiting durable:** el rate limit actual sigue siendo en memoria y no sobrevive a múltiples instancias serverless. Para mitigación real se necesita una capa externa (por ejemplo KV/Redis). Esto queda diferido.
- **Mapa y proveedor de tiles:** ahora existe fallback visible si fallan los mosaicos, pero depende de OpenStreetMap. Si el mapa pasa a ser flujo crítico, conviene agregar monitoreo externo o proveedor redundante.

---

*Hecho con orgullo para Tepexi de Rodríguez, Puebla 🇲🇽*
