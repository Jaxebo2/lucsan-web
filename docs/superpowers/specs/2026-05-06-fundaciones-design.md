# Spec: Fundaciones — Lucsan Design Web

**Fecha**: 2026-05-06
**Autor**: Lucio (lucsandesign.com) + Claude
**Estado**: Aprobado para implementación
**Tipo**: Spec de fundaciones (decisiones de stack e infra compartidas por todos los subsistemas)

---

## 1. Contexto y alcance

Lucsan Design es un estudio de diseño, publicidad y marketing que necesita una nueva web institucional con CMS, cotizador integrado a un CRM propio, y un portal para clientes con entrega de brand kits (logos, paletas, guidelines).

El proyecto se ha descompuesto en cuatro subsistemas con specs e implementaciones independientes:

1. **Fundaciones** *(este documento)* — stack, infra, i18n, UI, observabilidad, entornos.
2. **Sitio público + portafolio** — landing, servicios, casos de estudio (i18n ES/EN, bloques movibles).
3. **Cotizador + CRM** — formulario multipaso con lógica condicional y guardado parcial; pipeline de leads en Payload con notificaciones por email.
4. **Portal de cliente (brand kit)** — auth, logos con filtros, paleta de colores, guidelines interactivas.

Este spec define únicamente las **decisiones transversales** que todos los demás subsistemas heredan. No define modelos de datos de subsistemas, mockups visuales, ni lógica de negocio.

**Objetivo de Fundaciones**: dejar el repositorio funcional con Next.js + Payload corriendo, autenticación, i18n, storage, observabilidad y deploy a Vercel listos, de modo que cualquier subsistema posterior pueda construirse sobre esta base sin re-decidir infra.

---

## 2. Stack base

| Capa | Tecnología | Notas |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | Última estable al momento de scaffold. |
| CMS | Payload v3 | Embebido en el mismo proyecto Next.js (no monorepo). Versión fijada para evitar breaking changes. |
| Base de datos | Supabase Postgres | Dos instancias: producción y dev/preview. |
| Storage | Cloudflare R2 | Adapter S3 de Payload. Egress gratis. |
| Email transaccional | Resend | Para auth (reset password, verificación) y notificaciones del CRM. |
| Hosting | Vercel | Fluid Compute, Node 24 LTS. |
| Dominio | `lucsandesign.com` | Production. Preview URLs automáticas. |

### Estructura del proyecto

Un único proyecto Next.js con Payload montado en `/admin`. Esquema de carpetas propuesto:

```
app/
  (site)/[locale]/...          # Sitio público (landing, portafolio, servicios)
  (portal)/[locale]/portal/... # Portal de cliente (auth-gated)
  (payload)/admin/...          # Admin de Payload (generado)
  api/...                      # Route handlers (webhooks, endpoints custom)
payload/
  collections/                 # Definiciones de colecciones (Users, Leads, Projects, etc.)
  blocks/                      # Bloques reutilizables (para portafolio)
  access/                      # Funciones de access control
  payload.config.ts
components/                    # Componentes UI compartidos
lib/                           # Utilidades, clientes (Resend, R2, PostHog, Sentry)
messages/                      # Diccionarios i18n (next-intl o equivalente)
public/
  fonts/                       # Cabinet Grotesk + Switzer self-hosted
  brand/                       # Logos del estudio (SVG)
docs/
  superpowers/specs/           # Specs de cada subsistema
```

---

## 3. Autenticación

**Decisión**: Payload Auth nativo. Sin Supabase Auth ni Clerk.

Dos colecciones de usuarios separadas:

- **`Admins`** — usuarios internos del estudio. Acceso completo al admin de Payload.
- **`Clients`** — usuarios del portal de cliente. **Sin signup público**. Las cuentas las crea un Admin manualmente como parte del onboarding y se entregan credenciales.

Características:

- Email + password.
- JWT en cookie httpOnly.
- Reset de contraseña por email vía Resend.
- Verificación de email al crear la cuenta del cliente.
- Dos `loginRoutes` separadas:
  - `/admin` — login de Admins (UI default de Payload).
  - `/[locale]/portal/login` — login de Clients (UI custom traducida).

Las funciones de `access control` deben garantizar que un `Client` jamás vea o modifique data de otro cliente, y que solo `Admins` puedan crear/editar `Clients` y sus brand kits. Esto se valida con tests en el spec del portal.

**Migración futura**: si más adelante se decide abrir signup público o agregar OAuth, se evaluará migrar a Clerk o añadir adapter custom. La auth nativa de Payload no impide esa migración.

---

## 4. Internacionalización (i18n)

**Idiomas soportados**: español (`es`, default) e inglés (`en`).

**Estrategia de URL**: subpaths.
- `lucsandesign.com/es/portafolio/mi-proyecto`
- `lucsandesign.com/en/portfolio/my-project`

**Detección y persistencia**:
- Primer ingreso: leer `Accept-Language`. Si la primera coincidencia es `en*`, redirigir a `/en/...`. En cualquier otro caso, redirigir a `/es/...`.
- Selector manual en el navbar permite cambiar idioma. La elección persiste en cookie `NEXT_LOCALE` (1 año).
- Si la cookie está presente, **se respeta sobre `Accept-Language`** en visitas siguientes.

**Slugs y paths traducidos**:
- Tanto la ruta como el slug se traducen para SEO óptimo en cada idioma.
- En Payload, los campos `slug` y `title` (entre otros) se marcan `localized: true`.
- El framework de i18n a usar (`next-intl` recomendado por compatibilidad con App Router y Payload v3) se confirma en la implementación.

**Alcance de traducción**:
- ✅ Sitio público (landing, servicios, casos, blog si aplica).
- ✅ Cotizador (preguntas, opciones, mensajes, validaciones).
- ✅ UI del portal de cliente (filtros, botones, etiquetas).
- ❌ Contenido del brand kit subido por Lucio (logos, colores, guidelines): se sube en el idioma del cliente, sin duplicación.

---

## 5. Sistema de UI

**Stack**: Tailwind CSS + shadcn/ui (componentes copiados al proyecto, no como dependencia).

### Tokens de marca

Centralizados en `tailwind.config.ts` + variables CSS en `app/globals.css`. Todos los componentes consumen estos tokens.

**Paleta primaria** (proporcionada por el usuario):

| Rol | Hex | RGB |
|---|---|---|
| Black | `#08080c` | 8, 8, 12 |
| Coral | `#ff5548` | 255, 85, 72 |

**Paleta de acentos** (uso esporádico, para resaltar):

| Rol | Hex | RGB |
|---|---|---|
| Blue | `#4e47ff` | 78, 71, 255 |
| Green | `#47ff93` | 71, 255, 147 |
| Yellow | `#ffe047` | 255, 224, 71 |

**Neutros y semánticos**: a derivar en el spec del sitio público. Criterios:
- Rampa de neutros con calidez de marca (basados en el negro `#08080c` o tintes de coral en lugar de Tailwind grays default).
- Semánticos (`success`, `warning`, `error`, `info`): pueden mapearse a los acentos existentes (verde→success, amarillo→warning, coral→error, azul→info) o crearse aparte si la legibilidad/contraste no alcanza WCAG AA.

### Tipografía

- **Display / titulares**: Cabinet Grotesk (Fontshare).
- **Texto / párrafos**: Switzer (Fontshare).
- **Carga**: self-hosted vía `next/font/local`. Archivos en `public/fonts/`. Pesos a definir según uso real (probable: Cabinet 500/700, Switzer 400/500/600).

### Componentes

shadcn/ui se inicializa con `npx shadcn-ui init`. Los componentes que se usen se copian a `components/ui/`. Se editan libremente para respetar tokens de marca; no quedan como "estilo shadcn default".

### Logos del estudio

SVGs ubicados en `public/brand/` (copiados desde `Assets y referencias/Logos`). Se priorizan SVG por escalabilidad. Variantes esperadas: principal, isotipo, monocromo blanco, monocromo negro, invertido. Uso en navbar, footer, favicon, OG images, emails transaccionales.

---

## 6. Observabilidad

### PostHog (capa gratis: 1M eventos/mes)

Cubre:
- Pageviews y eventos de producto.
- **Funnels del cotizador** (`quote_started`, `step_N_viewed`, `step_N_completed`, `quote_submitted`, `quote_abandoned`).
- **Session replay** (los primeros meses para iterar UX del cotizador).
- Heatmaps de páginas clave.
- Feature flags si se requiere A/B testing.
- Eventos del portal de cliente (descargas, vistas de guidelines).

Inicialización con SDK oficial `posthog-js` en cliente. Eventos server-side desde Payload hooks vía `posthog-node`.

### Sentry (capa gratis: 5k errores/mes, 50 replays, 1 usuario)

Cubre:
- Errores **server-side** (Payload hooks, route handlers, server components, middleware) — caso principal por el cual se incluye Sentry además de PostHog.
- Errores cliente con source maps.
- Release tracking vinculado a deploys de Vercel.
- Alertas a email cuando aparece un error nuevo o sube de frecuencia.

Inicialización con `@sentry/nextjs`. Source maps subidos automáticamente en build de Vercel.

### Política

PostHog para **producto** (cómo usan los usuarios el sitio), Sentry para **errores** (qué se rompe). No se duplican eventos entre ambos.

---

## 7. Entornos y deploy

### Producción
- Rama Git: `main`.
- Dominio: `lucsandesign.com`.
- DB: instancia Supabase de prod.
- Bucket R2: bucket de prod.
- Variables de entorno: configuradas en Vercel Environment Variables (scope production).

### Preview
- Por cada Pull Request y rama no-`main`, Vercel genera URL de preview.
- DB: instancia Supabase de dev (compartida entre todas las previews).
- Bucket R2: bucket de dev (compartido).
- Variables de entorno: scope preview en Vercel.

### Local (dev)
- DB: misma instancia Supabase de dev.
- Bucket R2: bucket de dev.
- `.env.local` con credenciales (no comiteado).
- `.env.example` con plantilla de variables requeridas.

### Sin staging persistente
Las preview URLs cubren la necesidad de "última versión casi-prod". Si en el futuro un cliente necesita revisar algo en URL fija no-cambiante, se añade un entorno staging.

### Variables de entorno mínimas (a documentar en `.env.example`)

```
# Database
DATABASE_URL=

# Payload
PAYLOAD_SECRET=
PAYLOAD_PUBLIC_SERVER_URL=

# R2 / S3
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_URL=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# Sentry
SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=
```

---

## 8. Dependencias clave (versiones a fijar en `package.json`)

A confirmar al momento del scaffolding inicial. Lista indicativa:

- `next`
- `react`, `react-dom`
- `payload`, `@payloadcms/db-postgres`, `@payloadcms/storage-s3`
- `@payloadcms/next` (integración Next.js)
- `tailwindcss`, `autoprefixer`, `postcss`
- `next-intl` (o equivalente compatible con App Router + Payload)
- `posthog-js`, `posthog-node`
- `@sentry/nextjs`
- `resend`
- `zod` (validación de inputs)

---

## 9. Riesgos y supuestos

### Supuestos
- El plan free de Vercel, Supabase, R2, Resend, PostHog y Sentry alcanza para el tráfico inicial (estudio de diseño con tráfico moderado).
- El usuario provee credenciales de cada servicio antes del scaffolding.
- No se requiere cumplimiento legal específico (GDPR, LFPDPPP, etc.) más allá de un aviso de privacidad estándar — a confirmar antes de lanzar a producción.

### Riesgos identificados
- **Payload v3** evoluciona rápido. Mitigación: fijar versión exacta en `package.json`, actualizar manualmente con tests de regresión.
- **Dos colecciones de usuarios** (`Admins` + `Clients`) requieren disciplina en access control. Mitigación: tests automatizados que validen cross-tenant isolation y privilege boundaries en el spec del portal.
- **Egress de Vercel** puede crecer si el portal sirve descargas pesadas frecuentes. Mitigación: servir descargas directamente desde R2 (URLs firmadas o públicas según sensibilidad), no proxyar por Vercel Functions.
- **Costos de Supabase** si la DB de prod crece más allá del plan free (500 MB). Mitigación: monitorear y migrar a plan Pro cuando se acerque al límite.

---

## 10. Criterios de éxito de Fundaciones

Este spec se considera implementado cuando:

1. ✅ Repositorio inicializado con Next.js + Payload v3 + TypeScript, corriendo localmente.
2. ✅ Conectado a Supabase Postgres (dev), con migraciones inicializadas.
3. ✅ Storage R2 configurado y probado con upload de un archivo de prueba.
4. ✅ Tailwind + shadcn/ui inicializados, tokens de marca aplicados, fuentes self-hosted cargando correctamente.
5. ✅ i18n funcional: `/es` y `/en` resuelven, selector de idioma funciona, cookie persiste.
6. ✅ Auth de Payload funcional con colecciones `Admins` y `Clients` separadas, login de cada una probado.
7. ✅ PostHog y Sentry inicializados, captura de pageview y de error de prueba verificada en cada plataforma.
8. ✅ Resend configurado, email de prueba enviado.
9. ✅ Deploy a Vercel: producción en `lucsandesign.com`, preview funcional en URL de Vercel.
10. ✅ `.env.example` completo. README mínimo con instrucciones de setup local.

Cumplido lo anterior, los specs siguientes (sitio público, cotizador+CRM, portal) pueden empezar a implementarse sin tocar infra.

---

## 11. Fuera de alcance de este spec

Explícitamente NO se decide aquí:

- Modelos de datos de Lead, Project, Client, BrandAsset, Logo, Color, Guideline.
- Estados del pipeline del CRM y campos de cada card de lead.
- Bloques específicos del portafolio (hero, galería, video, testimonial, etc.).
- Motor del cotizador (Tally vs React Hook Form vs custom) — se decide en el spec del cotizador.
- Mockups visuales, layouts, navegación detallada.
- Estrategia de SEO técnica (sitemaps, schema.org, redirects históricos).
- Política de cookies / consentimiento (banner) — a definir antes de lanzar prod.

Cada uno de estos se aborda en su spec correspondiente.
