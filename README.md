# Lucsan Web

Sitio institucional + CMS + portal de clientes de [Lucsan Design](https://lucsandesign.com).

Repo privado: <https://github.com/Jaxebo2/lucsan-web>

## Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **CMS**: Payload v3 (embebido en `/admin`)
- **Base de datos**: Supabase Postgres (dev + prod separados)
- **Storage**: Cloudflare R2 (S3-compatible)
- **UI**: Tailwind CSS + shadcn/ui + tokens de marca
- **Tipografía**: Cabinet Grotesk + Switzer (self-hosted vía `next/font/local`)
- **i18n**: next-intl (subpaths `/es` y `/en`, ES default)
- **Email transaccional**: Resend
- **Analytics**: PostHog (Product, Web, Session Replay, Feature Flags)
- **Errores**: Sentry (client + server + edge)
- **Hosting**: Vercel
- **Dominio**: lucsandesign.com

## Documentación viva

- Spec de Fundaciones: [`docs/superpowers/specs/2026-05-06-fundaciones-design.md`](docs/superpowers/specs/2026-05-06-fundaciones-design.md)
- Plan de implementación: [`docs/superpowers/plans/2026-05-06-fundaciones.md`](docs/superpowers/plans/2026-05-06-fundaciones.md)
- Specs de subsistemas (sitio público, cotizador+CRM, portal): se irán añadiendo en `docs/superpowers/specs/`.

## Setup local

### Prerrequisitos

- Node 20+ (recomendado 24 LTS)
- npm
- Cuentas activas en Supabase, Cloudflare R2, Resend, PostHog, Sentry, Vercel

### Pasos

1. Clonar y entrar al repo:
   ```bash
   git clone https://github.com/Jaxebo2/lucsan-web.git
   cd lucsan-web
   npm install
   ```

2. Copiar `.env.example` → `.env`:
   ```bash
   cp .env.example .env
   ```
   Rellenar todas las variables. Ver sección "Variables de entorno" abajo para el detalle de cada una.

3. Generar `PAYLOAD_SECRET` aleatorio:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Pegar el output como valor en `.env`.

4. Para tener todas las env vars de Vercel localmente sin escribirlas a mano:
   ```bash
   npx vercel env pull .env.development.local
   ```
   (Requiere `vercel login` previo y permisos sobre el proyecto.)

5. Levantar el dev server:
   ```bash
   npm run dev
   ```

6. Abrir:
   - Sitio público: <http://localhost:3000/es> (o `/en`)
   - Admin de Payload: <http://localhost:3000/admin>
   - Login portal: <http://localhost:3000/es/portal/login>
   - Health check: <http://localhost:3000/api/health>

### Notas importantes

- **Dev server usa Webpack**, no Turbopack. El script `dev` está fijado a `next dev --webpack` porque Turbopack rompía la compilación del admin de Payload v3 al momento del scaffolding (Next 16.2.x). Si en el futuro Turbopack soporta Payload limpio, evaluar volver a default.
- La primera compilación de `/admin` puede tomar 25–30 s en webpack. Posterior es instantánea por HMR.

## Estructura del proyecto

```
src/
  app/
    (site)/[locale]/        # Sitio público (es/en)
    (portal)/[locale]/      # Portal de cliente (es/en)
    (payload)/admin/        # Admin Payload (auto-generado)
    api/                    # Route handlers (health, etc.)
  collections/              # Colecciones Payload (Admins, Clients, Media)
  components/               # UI compartida + shadcn
  i18n/                     # routing.ts, request.ts (next-intl)
  lib/                      # Clientes (resend, posthog, etc.)
  messages/                 # Diccionarios es.json + en.json
  middleware.ts             # next-intl middleware
public/
  fonts/                    # Cabinet Grotesk + Switzer (.woff2)
  brand/                    # SVGs de marca
docs/superpowers/
  specs/                    # Specs de fundaciones + subsistemas
  plans/                    # Planes de implementación
sentry.{server,edge}.config.ts
src/instrumentation.ts
src/instrumentation-client.ts
```

## Variables de entorno

Ver `.env.example` para la plantilla completa. Resumen:

| Variable | Descripción |
|---|---|
| `DATABASE_URI` | Conexión Postgres (Supabase transaction pooler, puerto 6543). |
| `PAYLOAD_SECRET` | 32 bytes hex aleatorios. Distinto por entorno (dev / prod). |
| `PAYLOAD_PUBLIC_SERVER_URL` | URL pública. Local: `http://localhost:3000`. Prod: `https://lucsandesign.com`. |
| `R2_ACCOUNT_ID` | Cloudflare Account ID. |
| `R2_ACCESS_KEY_ID` | Token ID del API token de R2 (se obtiene del payload JSON del token). |
| `R2_SECRET_ACCESS_KEY` | SHA-256 del cfat_ value del token. |
| `R2_BUCKET` | Nombre del bucket (`lucsan-dev` o `lucsan-prod`). |
| `R2_PUBLIC_URL` | URL pública del bucket (`https://pub-XXXX.r2.dev` o custom domain). |
| `RESEND_API_KEY` | API key de Resend. |
| `RESEND_FROM_EMAIL` | Sender de los emails. Sandbox: `onboarding@resend.dev`. Prod: `no-reply@lucsandesign.com` (requiere dominio verificado en Resend). |
| `NEXT_PUBLIC_POSTHOG_KEY` | Project API Key de PostHog (`phc_*`). |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://us.i.posthog.com` (US Cloud). |
| `NEXT_PUBLIC_SENTRY_DSN` | DSN del proyecto Sentry. |
| `SENTRY_AUTH_TOKEN` | Auth token de Sentry para upload de source maps en build. **No se commitea**. Se guarda en `.env.sentry-build-plugin` (gitignored). |
| `SENTRY_ORG` | Org slug en Sentry (`lucsan-design`). |
| `SENTRY_PROJECT` | Project slug en Sentry. |

## Deploy

### Producción
- Trigger: `git push` a `main` (cuando GitHub esté conectado a Vercel) o `vercel --prod` desde local.
- URL: <https://lucsandesign.com> (apunta vía DNS a Vercel; SSL automático).
- DB: Supabase proyecto `lucsan-web-prod`.
- Storage: Cloudflare R2 bucket `lucsan-prod`.
- Vercel proyecto: `lucsan-web` (slug `lucio-3391s-projects/lucsan-web`).

### Preview
- Trigger: cualquier rama no-`main` o PR genera una preview URL automática.
- DB: Supabase proyecto `lucsan-web-dev` (compartido con local).
- Storage: Cloudflare R2 bucket `lucsan-dev`.

## Comandos útiles

```bash
npm run dev          # Dev server (webpack, no Turbopack)
npm run build        # Build de producción
npm run start        # Servir build local
npm run lint         # Lint
npx vercel --prod    # Deploy manual a producción
npx vercel logs      # Ver logs del último deploy
npx vercel env ls    # Listar env vars en Vercel
```

## Decisiones técnicas notables

- **Auth de Payload nativa, dos colecciones** (`admins`, `clients`). No Supabase Auth ni Clerk: spec sec. 3 lo justifica (acceso curado de clientes, sin signup público, fuente de verdad única en Payload).
- **R2 vía S3 adapter** (`@payloadcms/storage-s3`). Cloudflare ya migró a tokens unificados (formato `cfat_*`); las S3 credentials se derivan: `Access Key ID = token id`, `Secret = SHA-256(cfat value)`.
- **Webpack para `next dev`** (no Turbopack) — incompatibilidad de Turbopack con Payload v3 admin compile.
- **Fonts en cada `<route-group>/layout.tsx`** (no en root layout). Payload v3 auto-genera `(payload)/layout.tsx` con su propio `<html>`/`<body>`; los grupos `(site)` y `(portal)` declaran los suyos para tener fonts/CSS. Trade-off: el admin no usa Cabinet/Switzer (usa los estilos de Payload).
- **PostHog manual pageview** vía `usePathname` (App Router no dispara navegación full entre RSC transitions, así que `capture_pageview: true` se pierde transitions).

## Plan a futuro (post-Foundations)

Foundations entrega infra y plumbing. Los specs siguientes (a desarrollar) implementan:

1. **Sitio público + portafolio** (landing, servicios, casos de estudio con bloques movibles).
2. **Cotizador + CRM** (formulario multipaso, lógica condicional, guardado parcial, pipeline de leads, notificaciones).
3. **Portal de cliente (brand kit)** (logos con filtros, paleta con conversiones HEX/RGB/CMYK, guidelines interactivas).

Cada uno tendrá su spec en `docs/superpowers/specs/`.

## Licencia

Propietario. Todos los derechos reservados.
