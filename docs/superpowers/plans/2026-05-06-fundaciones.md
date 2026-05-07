# Fundaciones — Lucsan Design Web — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dejar el repositorio funcional con Next.js + Payload v3 + TypeScript desplegado en `lucsandesign.com`, con Supabase Postgres, Cloudflare R2, Tailwind + shadcn, fuentes self-hosted, i18n ES/EN, auth con dos colecciones de usuarios, PostHog, Sentry y Resend operando, listo para que los specs de subsistemas (sitio público, cotizador+CRM, portal) construyan sobre él.

**Architecture:** Un único proyecto Next.js (App Router) con Payload v3 montado en `/admin`. Postgres en Supabase (dev + prod), assets en R2 vía adapter S3, i18n con `next-intl` (subpaths `/es` `/en`), auth nativa de Payload con colecciones `Admins` y `Clients` separadas. Despliegue Vercel con dos entornos (production + preview).

**Tech Stack:** Next.js 15+, TypeScript, Payload v3, `@payloadcms/db-postgres`, `@payloadcms/storage-s3`, Tailwind CSS, shadcn/ui, `next-intl`, `posthog-js`/`posthog-node`, `@sentry/nextjs`, `resend`, `zod`.

**Spec referenciado:** `docs/superpowers/specs/2026-05-06-fundaciones-design.md`

**Notas para el implementador:**
- Trabajamos en **Windows + bash**. Usar forward slashes en rutas dentro de comandos.
- Antes de empezar, el usuario debe tener cuentas creadas en: GitHub, Vercel, Supabase, Cloudflare (R2 habilitado), Resend, PostHog, Sentry. El plan **no** automatiza la creación de cuentas; pide credenciales en los pasos donde se necesitan.
- Cada task termina con un commit. Si un test/verificación falla, **no marcar el commit como completo** — diagnosticar y corregir.
- "Test" en un proyecto de scaffolding es muchas veces "verificar que arranca y la ruta responde". Se mantiene el ciclo: escribir verificación → ver fallar → implementar → ver pasar → commit.

---

## File Structure

Archivos clave que se crean o modifican durante este plan:

```
.env.example                          # Plantilla de variables (Task 2, 5, 7, 12, 13, 14)
.env.local                            # Local dev (no comiteado) (Task 2)
.gitignore                            # Excluye .env.local, .next, node_modules (Task 1)
README.md                             # Setup local + comandos (Task 17)
package.json                          # Deps fijadas (Task 1, 2, 5, 6, 9, 12, 13, 14)
next.config.ts                        # Config Next + Sentry wrap (Task 13)
payload.config.ts                     # Config raíz de Payload (Task 2, 4, 5)
tailwind.config.ts                    # Tokens de marca (Task 6)
postcss.config.js                     # Tailwind/Postcss (Task 6)
components.json                       # shadcn config (Task 6)
src/
  app/
    (payload)/admin/[[...segments]]/page.tsx   # Admin route (auto by create-payload-app)
    (site)/[locale]/layout.tsx        # Layout público con i18n (Task 9)
    (site)/[locale]/page.tsx          # Home placeholder (Task 9)
    (portal)/[locale]/portal/login/page.tsx    # Login portal cliente (Task 11)
    api/health/route.ts               # Health check (Task 1)
    api/test-email/route.ts           # Smoke test Resend (Task 14)
    globals.css                       # Variables CSS de marca + Tailwind (Task 6, 7)
    layout.tsx                        # Root layout con fuentes (Task 7, 12, 13)
  collections/
    Admins.ts                         # Colección Payload Admins (Task 4)
    Clients.ts                        # Colección Payload Clients (Task 4)
    Media.ts                          # Colección de archivos R2 (Task 5)
  i18n/
    routing.ts                        # Config locales next-intl (Task 9)
    request.ts                        # Carga de mensajes (Task 9)
  middleware.ts                       # i18n middleware + selector cookie (Task 9, 10)
  components/
    locale-switcher.tsx               # Selector de idioma (Task 10)
    ui/                               # shadcn components (Task 6)
  lib/
    posthog.ts                        # Cliente PostHog (Task 12)
    resend.ts                         # Cliente Resend (Task 14)
  messages/
    es.json                           # Diccionario ES (Task 9)
    en.json                           # Diccionario EN (Task 9)
public/
  fonts/                              # Cabinet Grotesk + Switzer (Task 7)
  brand/                              # Logos del estudio (Task 7)
sentry.client.config.ts               # Sentry cliente (Task 13)
sentry.server.config.ts               # Sentry server (Task 13)
sentry.edge.config.ts                 # Sentry edge (Task 13)
instrumentation.ts                    # Hooks Next.js (Sentry + PostHog server) (Task 13)
```

---

## Task 1: Inicializar repo y crear proyecto Payload + Next.js

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `payload.config.ts`, `.gitignore`, repo entero (vía `create-payload-app`)
- Create: `src/app/api/health/route.ts`

- [ ] **Step 1: Verificar que la carpeta del proyecto está vacía**

Run:
```bash
cd "E:/Claude Code/Lucsan web"
ls -la
```
Expected: solo `docs/` (con specs y plans). Si hay otros archivos, parar y consultar al usuario.

- [ ] **Step 2: Inicializar git si no existe**

Run:
```bash
git init
git branch -M main
```

- [ ] **Step 3: Crear proyecto con `create-payload-app`**

Run desde el padre `E:/Claude Code`:
```bash
cd "E:/Claude Code"
npx create-payload-app@latest lucsan-web-tmp --template blank --db postgres
```

Cuando pregunte por `DATABASE_URI`, dejar vacío o usar placeholder — se completa en Task 2.

- [ ] **Step 4: Mover el contenido de `lucsan-web-tmp` a la carpeta del proyecto**

Run:
```bash
cd "E:/Claude Code"
# Copiar todo (incluido oculto) preservando docs existente
cp -r lucsan-web-tmp/. "Lucsan web/"
rm -rf lucsan-web-tmp
cd "Lucsan web"
ls -la
```
Expected: ver `package.json`, `src/`, `payload.config.ts`, `next.config.ts`, `tsconfig.json`, etc., junto a `docs/`.

- [ ] **Step 5: Verificar `.gitignore` incluye lo crítico**

Asegurar que `.gitignore` contenga al menos:
```
node_modules
.next
.env
.env.local
.env*.local
*.log
.vercel
.DS_Store
```

Si falta alguna línea, añadirla.

- [ ] **Step 6: Crear health check endpoint**

Create `src/app/api/health/route.ts`:
```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
}
```

- [ ] **Step 7: Smoke test — instalar deps y arrancar dev server**

Run:
```bash
npm install
npm run dev
```
Expected: server arranca en `http://localhost:3000`. Puede fallar la conexión a DB; eso es esperable y se resuelve en Task 2. Lo importante es que Next compile.

En otra terminal:
```bash
curl http://localhost:3000/api/health
```
Expected: `{"status":"ok","timestamp":"..."}`. Detener el dev server (Ctrl+C).

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "chore: scaffold Next.js + Payload v3 with Postgres adapter

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Conectar Supabase Postgres (dev) y validar Payload

**Files:**
- Create: `.env.local` (no comiteado), `.env.example`
- Modify: `payload.config.ts` (si hace falta ajuste de pooler)

- [ ] **Step 1: El usuario crea proyecto Supabase de dev**

Pedir al usuario:
1. Entrar a `supabase.com`, crear proyecto nuevo llamado `lucsan-web-dev`.
2. Region cercana al uso (ej. `us-east-1` o `sa-east-1`).
3. Guardar la contraseña de DB.
4. Copiar la **Connection String** (modo `Transaction pooler`, puerto 6543) desde Settings → Database → Connection string → "Transaction" → "URI" mode.

Formato esperado:
```
postgres://postgres.PROJECTREF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres
```

- [ ] **Step 2: Crear `.env.local` con la connection string**

Create `.env.local`:
```
DATABASE_URI=postgres://postgres.PROJECTREF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres
PAYLOAD_SECRET=GENERATE_RANDOM_STRING_BELOW
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
```

Generar `PAYLOAD_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Pegar el output como valor de `PAYLOAD_SECRET`.

- [ ] **Step 3: Crear `.env.example` plantilla (sí comiteable)**

Create `.env.example`:
```
# === Database ===
DATABASE_URI=postgres://postgres.<PROJECT_REF>:<PASSWORD>@<HOST>.pooler.supabase.com:6543/postgres

# === Payload ===
PAYLOAD_SECRET=
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000

# === Cloudflare R2 (S3-compatible) ===
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_URL=

# === Resend ===
RESEND_API_KEY=
RESEND_FROM_EMAIL=no-reply@lucsandesign.com

# === PostHog ===
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# === Sentry ===
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=
```

- [ ] **Step 4: Verificar config de Payload usa pooler correctamente**

Abrir `payload.config.ts`. Confirmar el adapter Postgres:
```typescript
import { postgresAdapter } from '@payloadcms/db-postgres'

// ...
db: postgresAdapter({
  pool: {
    connectionString: process.env.DATABASE_URI || '',
  },
}),
```

Si el template usa otra forma, ajustar. El pooler de Supabase requiere `connectionString` plano, no `host/port` separados.

- [ ] **Step 5: Arrancar dev server y verificar conexión**

Run:
```bash
npm run dev
```

Expected en consola: Payload arranca, sincroniza schema con Postgres, no hay errores de conexión.

Visitar `http://localhost:3000/admin`. Expected: Payload pide crear el primer usuario admin (formulario "Create First User").

**No crear el usuario aún** — se hace en Task 4 después de definir las colecciones correctas. Detener dev server.

- [ ] **Step 6: Commit**

```bash
git add .env.example payload.config.ts
git commit -m "feat: connect to Supabase Postgres dev database

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Limpiar template y preparar estructura base

**Files:**
- Delete: ejemplos del template que no usemos
- Create: `src/collections/` directorio
- Modify: `payload.config.ts` (limpiar imports/colecciones default)

- [ ] **Step 1: Inspeccionar qué crea el template `blank`**

Run:
```bash
ls src/
ls src/collections 2>/dev/null || echo "no collections dir yet"
```

El template `blank` típicamente crea `Users.ts` y `Media.ts` en `src/collections/`. Las vamos a reemplazar.

- [ ] **Step 2: Borrar `Users.ts` default (lo reemplazamos por `Admins` y `Clients`)**

Run:
```bash
rm src/collections/Users.ts 2>/dev/null || true
```

(Si no existe, ignorar.)

- [ ] **Step 3: Borrar `Media.ts` default (lo redefinimos en Task 5 con R2)**

Run:
```bash
rm src/collections/Media.ts 2>/dev/null || true
```

- [ ] **Step 4: Editar `payload.config.ts` — quitar imports de colecciones borradas**

Modificar `payload.config.ts` para que el array `collections` quede vacío temporalmente:
```typescript
collections: [],
```
Y borrar las líneas `import Users from './collections/Users'` y similares si existen.

- [ ] **Step 5: Verificar que el dev server sigue arrancando**

Run:
```bash
npm run dev
```
Expected: arranca sin errores. `localhost:3000/admin` ahora dará error o pantalla vacía porque no hay colección `users` para auth — eso es esperable y se arregla en Task 4.

Detener dev server.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: remove default Users and Media collections (will redefine)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Definir colecciones `Admins` y `Clients` con auth

**Files:**
- Create: `src/collections/Admins.ts`
- Create: `src/collections/Clients.ts`
- Modify: `payload.config.ts`

- [ ] **Step 1: Crear `src/collections/Admins.ts`**

Create:
```typescript
import type { CollectionConfig } from 'payload'

export const Admins: CollectionConfig = {
  slug: 'admins',
  auth: true,
  admin: {
    useAsTitle: 'email',
    description: 'Equipo interno de Lucsan Design con acceso al admin de Payload.',
  },
  access: {
    // Solo admins logueados pueden listar/leer admins
    read: ({ req }) => Boolean(req.user && req.user.collection === 'admins'),
    create: ({ req }) => Boolean(req.user && req.user.collection === 'admins'),
    update: ({ req }) => Boolean(req.user && req.user.collection === 'admins'),
    delete: ({ req }) => Boolean(req.user && req.user.collection === 'admins'),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Owner', value: 'owner' },
        { label: 'Editor', value: 'editor' },
      ],
    },
  ],
}
```

- [ ] **Step 2: Crear `src/collections/Clients.ts`**

Create:
```typescript
import type { CollectionConfig } from 'payload'

export const Clients: CollectionConfig = {
  slug: 'clients',
  auth: {
    // No signup público: solo Admins crean Clients
    verify: true, // Email de verificación al crear cuenta
  },
  admin: {
    useAsTitle: 'email',
    description:
      'Clientes con acceso al portal. Las cuentas las crea un Admin manualmente.',
  },
  access: {
    // Admins ven todo. Clients solo se ven a sí mismos.
    read: ({ req }) => {
      if (!req.user) return false
      if (req.user.collection === 'admins') return true
      if (req.user.collection === 'clients') {
        return { id: { equals: req.user.id } }
      }
      return false
    },
    // Solo Admins crean clients
    create: ({ req }) => Boolean(req.user && req.user.collection === 'admins'),
    update: ({ req }) => {
      if (!req.user) return false
      if (req.user.collection === 'admins') return true
      if (req.user.collection === 'clients') {
        return { id: { equals: req.user.id } }
      }
      return false
    },
    delete: ({ req }) => Boolean(req.user && req.user.collection === 'admins'),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'company',
      type: 'text',
    },
    {
      name: 'preferredLanguage',
      type: 'select',
      defaultValue: 'es',
      options: [
        { label: 'Español', value: 'es' },
        { label: 'English', value: 'en' },
      ],
    },
  ],
}
```

- [ ] **Step 3: Registrar colecciones en `payload.config.ts`**

Modify `payload.config.ts`:
```typescript
import { Admins } from './collections/Admins'
import { Clients } from './collections/Clients'

// ...dentro del export default buildConfig:
admin: {
  user: 'admins', // ← La colección que controla el login del admin panel
},
collections: [Admins, Clients],
```

- [ ] **Step 4: Arrancar y crear primer Admin**

Run:
```bash
npm run dev
```

Visitar `http://localhost:3000/admin`. Expected: pantalla "Create First User" para colección `admins`.

Crear admin con tu email real, contraseña fuerte, name y role=owner.

Verificar que entra al admin de Payload y ve `Admins` y `Clients` en la sidebar.

- [ ] **Step 5: Verificar separación de colecciones**

En el admin, intentar crear un Client manualmente (Collections → Clients → New). Expected: se crea con éxito. El Client puede recibir email de verificación si ya está conectado Resend (Task 14); por ahora puede fallar el envío — está OK.

Detener dev server.

- [ ] **Step 6: Commit**

```bash
git add src/collections payload.config.ts
git commit -m "feat: add Admins and Clients collections with separated auth

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Configurar Cloudflare R2 storage

**Files:**
- Create: `src/collections/Media.ts`
- Modify: `payload.config.ts`
- Modify: `.env.local`, `.env.example`

- [ ] **Step 1: El usuario crea bucket R2 de dev**

Pedir al usuario:
1. Cloudflare Dashboard → R2 → Create bucket → name `lucsan-dev`.
2. R2 → Manage R2 API Tokens → Create API token con permisos "Object Read & Write" sobre el bucket.
3. Guardar: `Access Key ID`, `Secret Access Key`, `Account ID` (visible en R2 overview).
4. (Opcional pero recomendado) Settings del bucket → Public access → conectar dominio público o usar el `pub-*.r2.dev` provisional para servir archivos públicos.

- [ ] **Step 2: Actualizar `.env.local` con credenciales R2**

Añadir a `.env.local`:
```
R2_ACCOUNT_ID=<account_id>
R2_ACCESS_KEY_ID=<access_key>
R2_SECRET_ACCESS_KEY=<secret_key>
R2_BUCKET=lucsan-dev
R2_PUBLIC_URL=https://pub-XXXX.r2.dev
```

- [ ] **Step 3: Instalar adapter S3 de Payload**

Run:
```bash
npm install @payloadcms/storage-s3
```

- [ ] **Step 4: Crear colección `Media`**

Create `src/collections/Media.ts`:
```typescript
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true, // archivos públicos por defecto; los privados se manejan por colección específica
    create: ({ req }) => Boolean(req.user && req.user.collection === 'admins'),
    update: ({ req }) => Boolean(req.user && req.user.collection === 'admins'),
    delete: ({ req }) => Boolean(req.user && req.user.collection === 'admins'),
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    mimeTypes: ['image/*', 'application/pdf', 'image/svg+xml'],
  },
}
```

- [ ] **Step 5: Configurar adapter S3 en `payload.config.ts`**

Modify `payload.config.ts`:
```typescript
import { s3Storage } from '@payloadcms/storage-s3'
import { Admins } from './collections/Admins'
import { Clients } from './collections/Clients'
import { Media } from './collections/Media'

// ...
collections: [Admins, Clients, Media],
plugins: [
  s3Storage({
    collections: {
      media: {
        prefix: 'media',
      },
    },
    bucket: process.env.R2_BUCKET || '',
    config: {
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
      region: 'auto',
      forcePathStyle: true,
    },
  }),
],
```

- [ ] **Step 6: Smoke test — subir archivo de prueba**

Run:
```bash
npm run dev
```

En `localhost:3000/admin` → Collections → Media → Create New. Subir cualquier imagen pequeña con un texto en `alt`.

Verificar:
1. Aparece en la lista de Media.
2. En Cloudflare R2 dashboard → bucket `lucsan-dev` → ver el archivo bajo `media/`.
3. Si hay `R2_PUBLIC_URL` configurada, copiar la URL del archivo y abrirla en navegador → debe descargarse/mostrarse.

Detener dev server.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: configure Cloudflare R2 storage for media collection

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Tailwind CSS + shadcn/ui

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`
- Create: `components.json` (shadcn config)
- Create: `src/components/ui/button.tsx` (smoke test)

- [ ] **Step 1: Verificar Tailwind ya instalado por create-payload-app**

Run:
```bash
cat package.json | grep tailwind
```
Si Tailwind ya está en deps (probable), saltar la instalación. Si no:
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

- [ ] **Step 2: Inicializar shadcn/ui**

Run:
```bash
npx shadcn@latest init
```

Responder:
- Style: `Default`
- Base color: `Neutral` (luego sobrescribimos con tokens de marca)
- CSS variables: `Yes`

Esto crea `components.json`, ajusta `tailwind.config.ts` y `src/app/globals.css`.

- [ ] **Step 3: Sobrescribir `tailwind.config.ts` con tokens de marca**

Modify `tailwind.config.ts`. El archivo final debe contener:
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // === Marca Lucsan ===
        brand: {
          black: '#08080c',
          coral: '#ff5548',
          blue: '#4e47ff',
          green: '#47ff93',
          yellow: '#ffe047',
        },
        // === Tokens semánticos (consumen las variables CSS de globals.css) ===
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      fontFamily: {
        display: ['var(--font-cabinet)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-switzer)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

Si `tailwindcss-animate` no está instalado:
```bash
npm install -D tailwindcss-animate
```

- [ ] **Step 4: Sobrescribir `src/app/globals.css` con variables de marca**

Modify `src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Mapeo de tokens semánticos a paleta de marca */
    /* Light mode */
    --background: 0 0% 100%;
    --foreground: 240 20% 4%;          /* near brand-black */
    --primary: 240 20% 4%;             /* brand-black como acción primaria neutra */
    --primary-foreground: 0 0% 100%;
    --secondary: 5 100% 64%;           /* brand-coral */
    --secondary-foreground: 0 0% 100%;
    --muted: 0 0% 96%;
    --muted-foreground: 240 5% 35%;
    --accent: 243 100% 64%;            /* brand-blue */
    --accent-foreground: 0 0% 100%;
    --destructive: 5 100% 64%;         /* coral también vale como destructive si hace falta */
    --destructive-foreground: 0 0% 100%;
    --border: 240 5% 90%;
    --input: 240 5% 90%;
    --ring: 5 100% 64%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 240 20% 4%;          /* brand-black */
    --foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 240 20% 4%;
    --secondary: 5 100% 64%;
    --secondary-foreground: 240 20% 4%;
    --muted: 240 10% 12%;
    --muted-foreground: 240 5% 65%;
    --accent: 243 100% 64%;
    --accent-foreground: 0 0% 98%;
    --destructive: 5 100% 64%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 10% 18%;
    --input: 240 10% 18%;
    --ring: 5 100% 64%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground font-sans antialiased;
  }
  h1, h2, h3, h4, h5, h6 {
    @apply font-display;
  }
}
```

- [ ] **Step 5: Instalar componente Button de shadcn**

Run:
```bash
npx shadcn@latest add button
```
Esto crea `src/components/ui/button.tsx`.

- [ ] **Step 6: Smoke test — botón con tokens de marca**

Modify `src/app/page.tsx` (si no existe, crear `src/app/(site)/page.tsx` temporalmente — luego se reorganiza con i18n):

Para ahora, edita el `page.tsx` raíz (lo que sea que exista) para mostrar:
```tsx
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-12">
      <h1 className="text-6xl">Lucsan Design</h1>
      <p className="text-lg text-muted-foreground">Foundations smoke test</p>
      <div className="flex gap-3">
        <Button>Primary</Button>
        <Button variant="secondary">Coral</Button>
        <Button variant="outline">Outline</Button>
      </div>
      <div className="flex gap-2">
        <div className="h-12 w-12 rounded-md bg-brand-black" />
        <div className="h-12 w-12 rounded-md bg-brand-coral" />
        <div className="h-12 w-12 rounded-md bg-brand-blue" />
        <div className="h-12 w-12 rounded-md bg-brand-green" />
        <div className="h-12 w-12 rounded-md bg-brand-yellow" />
      </div>
    </main>
  )
}
```

Run:
```bash
npm run dev
```
Visitar `localhost:3000`. Expected: ver heading, botones con paleta de marca y los 5 swatches de marca correctos. Detener dev server.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: configure Tailwind + shadcn/ui with Lucsan brand tokens

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Fuentes self-hosted (Cabinet Grotesk + Switzer) y assets de marca

**Files:**
- Create: `public/fonts/cabinet-grotesk-*.woff2` (descargados de Fontshare)
- Create: `public/fonts/switzer-*.woff2`
- Create: `public/brand/*.svg` (logos del estudio)
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Descargar fuentes de Fontshare**

Pedir al usuario que descargue:
- Cabinet Grotesk: https://www.fontshare.com/fonts/cabinet-grotesk → "Download family"
- Switzer: https://www.fontshare.com/fonts/switzer → "Download family"

Descomprimir y copiar **solo los .woff2** de los pesos que vamos a usar a `public/fonts/`:
- `CabinetGrotesk-Medium.woff2` (500)
- `CabinetGrotesk-Bold.woff2` (700)
- `Switzer-Regular.woff2` (400)
- `Switzer-Medium.woff2` (500)
- `Switzer-Semibold.woff2` (600)

Verificar:
```bash
ls public/fonts/
```

- [ ] **Step 2: Copiar logos del estudio**

Copiar todos los SVG desde `Assets y referencias/Logos/` a `public/brand/`:
```bash
mkdir -p public/brand
cp "Assets y referencias/Logos/"*.svg public/brand/ 2>/dev/null || echo "Verificar manualmente la ruta"
ls public/brand/
```

- [ ] **Step 3: Configurar fuentes con `next/font/local` en root layout**

Modify `src/app/layout.tsx`:
```tsx
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const cabinet = localFont({
  src: [
    { path: '../../public/fonts/CabinetGrotesk-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/CabinetGrotesk-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-cabinet',
  display: 'swap',
})

const switzer = localFont({
  src: [
    { path: '../../public/fonts/Switzer-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/Switzer-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/Switzer-Semibold.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-switzer',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Lucsan Design',
  description: 'Estudio de diseño, publicidad y marketing.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${cabinet.variable} ${switzer.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

(El ajuste de `lang` dinámico por locale se hace en Task 9.)

- [ ] **Step 4: Smoke test fuentes**

Run:
```bash
npm run dev
```

Visitar `localhost:3000`. Expected:
- Heading con Cabinet Grotesk (más display, geométrico).
- Texto con Switzer (más limpio, neutral).

Si las fuentes no cargan, abrir DevTools → Network → filtrar por "font" — verificar que los .woff2 cargan con 200. Si dan 404, revisar paths en `localFont`.

Detener dev server.

- [ ] **Step 5: Smoke test logos**

En `src/app/page.tsx` (temporal), añadir al inicio del `<main>`:
```tsx
<img src="/brand/[NOMBRE_DEL_SVG_PRINCIPAL].svg" alt="Lucsan Design" className="h-12" />
```

Reemplazar `[NOMBRE_DEL_SVG_PRINCIPAL]` con el nombre real del archivo (consultar `ls public/brand/`).

Verificar en navegador que el logo se muestra.

- [ ] **Step 6: Commit**

```bash
git add public/fonts public/brand src/app/layout.tsx src/app/page.tsx
git commit -m "feat: add Cabinet Grotesk and Switzer fonts (self-hosted) and brand logos

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Reorganizar app routes en grupos `(site)` y `(portal)`

**Files:**
- Mover: `src/app/page.tsx` → eventualmente bajo `(site)/[locale]/page.tsx`
- Mantener: el grupo `(payload)` que generó create-payload-app

- [ ] **Step 1: Inspeccionar estructura actual de `app/`**

Run:
```bash
ls -la src/app/
ls -la "src/app/(payload)" 2>/dev/null
```

Confirmar que existe `(payload)/admin/...` (creado por template). No tocarlo.

- [ ] **Step 2: Crear grupos `(site)` y `(portal)` vacíos**

Run:
```bash
mkdir -p "src/app/(site)"
mkdir -p "src/app/(portal)"
```

- [ ] **Step 3: Mover `page.tsx` raíz dentro de `(site)/` (temporalmente sin locale)**

Run:
```bash
mv src/app/page.tsx "src/app/(site)/page.tsx" 2>/dev/null || true
```

(Si no se mueve por algún motivo en Windows bash, hacer copy + delete manual.)

- [ ] **Step 4: Verificar que el sitio sigue cargando**

Run:
```bash
npm run dev
```
Visitar `localhost:3000`. Expected: misma home renderiza (Next App Router resuelve route groups transparentemente).

Detener dev server.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: organize app routes into (site) and (portal) groups

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Configurar i18n con `next-intl` (subpaths /es y /en)

**Files:**
- Create: `src/i18n/routing.ts`
- Create: `src/i18n/request.ts`
- Create: `src/middleware.ts`
- Create: `src/messages/es.json`, `src/messages/en.json`
- Move: `src/app/(site)/page.tsx` → `src/app/(site)/[locale]/page.tsx`
- Create: `src/app/(site)/[locale]/layout.tsx`
- Modify: `next.config.ts`

- [ ] **Step 1: Instalar `next-intl`**

Run:
```bash
npm install next-intl
```

- [ ] **Step 2: Crear config de routing**

Create `src/i18n/routing.ts`:
```typescript
import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localePrefix: 'always', // siempre /es o /en, nunca raíz sin locale
})

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing)
```

- [ ] **Step 3: Crear loader de mensajes**

Create `src/i18n/request.ts`:
```typescript
import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
```

- [ ] **Step 4: Crear middleware**

Create `src/middleware.ts`:
```typescript
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Excluir admin de Payload, API, archivos estáticos
  matcher: ['/((?!admin|api|_next|_vercel|.*\\..*).*)'],
}
```

- [ ] **Step 5: Crear diccionarios de mensajes**

Create `src/messages/es.json`:
```json
{
  "Home": {
    "title": "Lucsan Design",
    "subtitle": "Estudio de diseño, publicidad y marketing"
  },
  "Common": {
    "switchToEnglish": "English",
    "switchToSpanish": "Español"
  }
}
```

Create `src/messages/en.json`:
```json
{
  "Home": {
    "title": "Lucsan Design",
    "subtitle": "Design, advertising and marketing studio"
  },
  "Common": {
    "switchToEnglish": "English",
    "switchToSpanish": "Español"
  }
}
```

- [ ] **Step 6: Configurar `next.config.ts` con plugin de next-intl**

Modify `next.config.ts`. Si el archivo es `.ts`:
```typescript
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig = {
  // ...config existente que haya añadido create-payload-app...
}

export default withNextIntl(nextConfig)
```

Si el archivo es `next.config.mjs`, hacer la traducción equivalente (sintaxis ESM).

- [ ] **Step 7: Mover home a `[locale]`**

Run:
```bash
mkdir -p "src/app/(site)/[locale]"
mv "src/app/(site)/page.tsx" "src/app/(site)/[locale]/page.tsx"
```

- [ ] **Step 8: Crear `[locale]/layout.tsx` que provee mensajes**

Create `src/app/(site)/[locale]/layout.tsx`:
```tsx
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  return (
    <NextIntlClientProvider locale={locale}>
      {children}
    </NextIntlClientProvider>
  )
}
```

- [ ] **Step 9: Actualizar root layout para `lang` dinámico**

Modify `src/app/layout.tsx` — quitar `lang="es"` hardcoded:
```tsx
return (
  <html className={`${cabinet.variable} ${switzer.variable}`}>
    <body>{children}</body>
  </html>
)
```

(El `lang` correcto se setea dentro del `[locale]/layout.tsx` con un `<html>` que ya no podemos usar ahí porque solo hay uno; alternativa válida: dejar `<html lang="es">` por defecto, ya que ES es default y `next-intl` no requiere el atributo correcto para funcionar. Aceptable para Fundaciones; revisamos en el spec del sitio público si SEO requiere `lang` exacto.)

- [ ] **Step 10: Actualizar home para usar mensajes traducidos**

Modify `src/app/(site)/[locale]/page.tsx`:
```tsx
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

export default function Home() {
  const t = useTranslations('Home')
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-12">
      <h1 className="text-6xl">{t('title')}</h1>
      <p className="text-lg text-muted-foreground">{t('subtitle')}</p>
      <div className="flex gap-3">
        <Button>Primary</Button>
        <Button variant="secondary">Coral</Button>
      </div>
    </main>
  )
}
```

- [ ] **Step 11: Smoke test i18n**

Run:
```bash
npm run dev
```

Verificar:
- `localhost:3000` → redirige a `/es`.
- `localhost:3000/es` → muestra "Lucsan Design / Estudio de diseño, publicidad y marketing".
- `localhost:3000/en` → muestra "Lucsan Design / Design, advertising and marketing studio".
- `localhost:3000/admin` → admin Payload sigue funcionando (no afectado por middleware).

Detener dev server.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: add i18n with next-intl (es default, en, subpaths)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: Selector de idioma (navbar) con persistencia en cookie

**Files:**
- Create: `src/components/locale-switcher.tsx`
- Modify: `src/app/(site)/[locale]/page.tsx` (mostrar el selector temporalmente)

- [ ] **Step 1: Crear componente selector**

Create `src/components/locale-switcher.tsx`:
```tsx
'use client'

import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'
import { Button } from '@/components/ui/button'

export function LocaleSwitcher() {
  const t = useTranslations('Common')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchTo = (target: 'es' | 'en') => {
    router.replace(pathname, { locale: target })
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant={locale === 'es' ? 'default' : 'outline'}
        onClick={() => switchTo('es')}
        aria-current={locale === 'es' ? 'true' : undefined}
      >
        {t('switchToSpanish')}
      </Button>
      <Button
        size="sm"
        variant={locale === 'en' ? 'default' : 'outline'}
        onClick={() => switchTo('en')}
        aria-current={locale === 'en' ? 'true' : undefined}
      >
        {t('switchToEnglish')}
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Configurar `localePrefix` y cookie en routing**

`next-intl` por defecto persiste la elección en cookie `NEXT_LOCALE` cuando el usuario navega manualmente entre locales. Verificar que `routing.ts` no desactiva esto. Confirmación: en `defineRouting`, no setear `localeCookie: false`.

- [ ] **Step 3: Mostrar selector en home**

Modify `src/app/(site)/[locale]/page.tsx`:
```tsx
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { LocaleSwitcher } from '@/components/locale-switcher'

export default function Home() {
  const t = useTranslations('Home')
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-12">
      <div className="absolute top-6 right-6">
        <LocaleSwitcher />
      </div>
      <h1 className="text-6xl">{t('title')}</h1>
      <p className="text-lg text-muted-foreground">{t('subtitle')}</p>
      <div className="flex gap-3">
        <Button>Primary</Button>
        <Button variant="secondary">Coral</Button>
      </div>
    </main>
  )
}
```

- [ ] **Step 4: Smoke test**

Run `npm run dev`. Visitar `/es`. Click "English" → debe ir a `/en` y persistir el idioma. Refrescar `localhost:3000` (raíz) → ahora redirige a `/en` (cookie). Borrar cookie en DevTools → vuelve a `/es` por default.

Detener dev server.

- [ ] **Step 5: Commit**

```bash
git add src/components/locale-switcher.tsx src/app/(site)/[locale]/page.tsx
git commit -m "feat: add locale switcher with cookie persistence

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: Login del portal de cliente (custom UI traducida)

**Files:**
- Create: `src/app/(portal)/[locale]/portal/login/page.tsx`
- Create: `src/app/(portal)/[locale]/layout.tsx`
- Modify: `src/messages/es.json`, `src/messages/en.json`

- [ ] **Step 1: Añadir mensajes al diccionario**

Modify `src/messages/es.json` añadiendo:
```json
{
  "Portal": {
    "loginTitle": "Acceso a clientes",
    "emailLabel": "Correo electrónico",
    "passwordLabel": "Contraseña",
    "submitButton": "Entrar",
    "errorInvalid": "Credenciales inválidas. Verifica tu email y contraseña."
  }
}
```

Modify `src/messages/en.json`:
```json
{
  "Portal": {
    "loginTitle": "Client access",
    "emailLabel": "Email",
    "passwordLabel": "Password",
    "submitButton": "Sign in",
    "errorInvalid": "Invalid credentials. Check your email and password."
  }
}
```

(Mergear con el JSON existente; no sobrescribir las claves de `Home` y `Common`.)

- [ ] **Step 2: Crear layout del portal**

Create `src/app/(portal)/[locale]/layout.tsx`:
```tsx
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  return (
    <NextIntlClientProvider locale={locale}>
      <div className="min-h-screen bg-muted/30">{children}</div>
    </NextIntlClientProvider>
  )
}
```

- [ ] **Step 3: Crear página de login**

Create `src/app/(portal)/[locale]/portal/login/page.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { Button } from '@/components/ui/button'

export default function PortalLoginPage() {
  const t = useTranslations('Portal')
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/clients/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    setLoading(false)

    if (!res.ok) {
      setError(t('errorInvalid'))
      return
    }
    router.push('/portal')
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-background rounded-lg border p-8 flex flex-col gap-4"
      >
        <h1 className="text-2xl font-display">{t('loginTitle')}</h1>
        <label className="flex flex-col gap-1 text-sm">
          {t('emailLabel')}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded-md px-3 py-2 bg-input/30"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          {t('passwordLabel')}
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded-md px-3 py-2 bg-input/30"
          />
        </label>
        {error && <p className="text-sm text-brand-coral">{error}</p>}
        <Button type="submit" disabled={loading}>
          {t('submitButton')}
        </Button>
      </form>
    </main>
  )
}
```

(Endpoint `/api/clients/login` lo provee Payload v3 automáticamente cuando una colección tiene `auth: true` — la ruta es `/api/<slug>/login`. En este caso `/api/clients/login`.)

- [ ] **Step 4: Smoke test login**

Run `npm run dev`.

1. Crear un cliente desde el admin: `localhost:3000/admin` → Clients → Create. Email tuyo de prueba, password fuerte.
2. (Si falla email de verificación porque Resend no está conectado aún, marcar `_verified: true` manualmente desde el admin o desde DB. Esto se resuelve definitivamente en Task 14.)
3. Visitar `localhost:3000/es/portal/login`. Login con esas credenciales. Expected: redirige a `/portal` (que aún no existe → 404 esperado, pero la auth pasó).
4. Visitar `localhost:3000/en/portal/login` → ver UI en inglés.

Detener dev server.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add client portal login page (i18n)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 12: Integrar PostHog (cliente y server)

**Files:**
- Create: `src/lib/posthog.ts`
- Create: `src/components/posthog-provider.tsx`
- Modify: `src/app/(site)/[locale]/layout.tsx` (envolver en provider)
- Modify: `.env.local`, `.env.example`
- Install: `posthog-js`, `posthog-node`

- [ ] **Step 1: El usuario crea proyecto PostHog**

Pedir:
1. Crear cuenta en `posthog.com` (free).
2. Crear proyecto `lucsan-web`. Region: US Cloud (más rápido para LATAM/US/EU mix) o EU si prefieres residencia EU.
3. Copiar el `Project API Key` (empieza con `phc_`).

- [ ] **Step 2: Instalar deps**

Run:
```bash
npm install posthog-js posthog-node
```

- [ ] **Step 3: Añadir env vars**

Añadir a `.env.local`:
```
NEXT_PUBLIC_POSTHOG_KEY=phc_XXXXXXXX
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

(O `https://eu.i.posthog.com` si elegiste EU.)

`.env.example` ya las tiene declaradas (Task 2).

- [ ] **Step 4: Crear cliente PostHog server-side**

Create `src/lib/posthog.ts`:
```typescript
import { PostHog } from 'posthog-node'

let posthogClient: PostHog | null = null

export function getPostHogServer() {
  if (!posthogClient) {
    posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      flushAt: 1,
      flushInterval: 0,
    })
  }
  return posthogClient
}
```

- [ ] **Step 5: Crear provider PostHog client-side**

Create `src/components/posthog-provider.tsx`:
```tsx
'use client'

import posthog from 'posthog-js'
import { PostHogProvider as Provider } from 'posthog-js/react'
import { useEffect } from 'react'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: 'history_change',
    capture_pageleave: true,
    person_profiles: 'identified_only',
  })
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return <Provider client={posthog}>{children}</Provider>
}
```

- [ ] **Step 6: Envolver el layout del sitio público y portal con el provider**

Modify `src/app/(site)/[locale]/layout.tsx`:
```tsx
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { PostHogProvider } from '@/components/posthog-provider'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  return (
    <NextIntlClientProvider locale={locale}>
      <PostHogProvider>{children}</PostHogProvider>
    </NextIntlClientProvider>
  )
}
```

Hacer lo mismo en `src/app/(portal)/[locale]/layout.tsx`.

- [ ] **Step 7: Smoke test eventos**

Run `npm run dev`. Visitar `localhost:3000/es`, navegar a `/en`. Esperar ~30s.

En PostHog dashboard → Activity / Live → ver eventos `$pageview` con paths `/es` y `/en`. Si no aparecen:
- Verificar que `NEXT_PUBLIC_POSTHOG_KEY` está bien (debe empezar con `phc_`).
- Abrir DevTools Network, filtrar por `posthog` → confirmar requests a `i.posthog.com` con 200.

Detener dev server.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: integrate PostHog (client + server) with pageview tracking

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 13: Integrar Sentry (cliente, server, edge)

**Files:**
- Create: `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
- Create/Modify: `instrumentation.ts`
- Modify: `next.config.ts` (envolver con `withSentryConfig`)
- Create: `src/app/api/sentry-test/route.ts` (smoke test)

- [ ] **Step 1: El usuario crea proyecto Sentry**

Pedir:
1. Crear cuenta `sentry.io` (Developer plan free).
2. Crear proyecto: platform = `Next.js`. Nombre `lucsan-web`.
3. Copiar el `DSN` mostrado.
4. Settings → Auth Tokens → crear token con scope `project:write` y `release:admin`. Guardar.
5. Anotar `org slug` y `project slug` (visibles en URL del proyecto).

- [ ] **Step 2: Añadir env vars**

Añadir a `.env.local`:
```
NEXT_PUBLIC_SENTRY_DSN=https://XXXXXX@XXXX.ingest.sentry.io/XXXXX
SENTRY_AUTH_TOKEN=sntrys_XXXXXX
SENTRY_ORG=lucsan
SENTRY_PROJECT=lucsan-web
```

- [ ] **Step 3: Instalar wizard de Sentry o setup manual**

Opción A (recomendada — wizard automatiza):
```bash
npx @sentry/wizard@latest -i nextjs
```
Responder preguntas (selecciona el proyecto creado, acepta source maps upload).

Opción B (manual):
```bash
npm install @sentry/nextjs
```
Y crear los archivos de config a mano según pasos siguientes.

- [ ] **Step 4: Verificar archivos de config Sentry**

Tras el wizard, deben existir:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `instrumentation.ts`
- `next.config.ts` envuelto con `withSentryConfig(...)`

Si faltan, crearlos manualmente. Ejemplo `sentry.client.config.ts`:
```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0,
})
```

(Equivalentes en `server.config.ts` y `edge.config.ts` sin la parte de replays.)

- [ ] **Step 5: Crear endpoint de prueba de error**

Create `src/app/api/sentry-test/route.ts`:
```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  throw new Error('Sentry smoke test — server side')
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 6: Smoke test errores**

Run `npm run dev`.

1. **Server-side**: visitar `localhost:3000/api/sentry-test` → 500 esperado.
2. **Client-side**: en DevTools console, ejecutar `throw new Error('Sentry smoke test — client side')` desde `localhost:3000/es`.

Esperar ~30s. En Sentry → Issues → ver dos errores nuevos (uno server, uno client) con stack trace de tu código (no minificado).

Detener dev server.

- [ ] **Step 7: Borrar el endpoint de prueba**

Run:
```bash
rm src/app/api/sentry-test/route.ts
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: integrate Sentry (client, server, edge) for error tracking

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 14: Configurar Resend (email transaccional)

**Files:**
- Create: `src/lib/resend.ts`
- Create: `src/app/api/test-email/route.ts` (smoke test, se borra al final)
- Modify: `payload.config.ts` (si Payload v3 soporta email adapter Resend)
- Modify: `.env.local`

- [ ] **Step 1: El usuario crea cuenta Resend y verifica dominio**

Pedir:
1. Crear cuenta `resend.com`.
2. Domains → Add Domain → `lucsandesign.com`. Configurar registros DNS (SPF, DKIM, DMARC) en Cloudflare DNS.
3. Esperar verificación (puede tardar minutos a horas según DNS).
4. Mientras tanto, se puede usar el dominio sandbox `onboarding@resend.dev` para pruebas — funciona pero solo envía a la dirección verificada de tu cuenta Resend.
5. API Keys → Create API Key con scope `Sending access`. Copiar.

- [ ] **Step 2: Añadir env vars**

Añadir a `.env.local`:
```
RESEND_API_KEY=re_XXXXXX
RESEND_FROM_EMAIL=onboarding@resend.dev
```

(Cuando `lucsandesign.com` esté verificado, cambiar a `RESEND_FROM_EMAIL=no-reply@lucsandesign.com`.)

- [ ] **Step 3: Instalar Resend SDK**

Run:
```bash
npm install resend
```

- [ ] **Step 4: Crear cliente Resend**

Create `src/lib/resend.ts`:
```typescript
import { Resend } from 'resend'

let client: Resend | null = null

export function getResend() {
  if (!client) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set')
    }
    client = new Resend(process.env.RESEND_API_KEY)
  }
  return client
}

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
```

- [ ] **Step 5: Conectar Resend al sistema de email de Payload**

En Payload v3, el email se configura con un adapter. Modify `payload.config.ts`:
```typescript
import { resendAdapter } from '@payloadcms/email-resend'

// ...
email: resendAdapter({
  defaultFromAddress: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
  defaultFromName: 'Lucsan Design',
  apiKey: process.env.RESEND_API_KEY || '',
}),
```

Instalar el adapter:
```bash
npm install @payloadcms/email-resend
```

- [ ] **Step 6: Endpoint de prueba**

Create `src/app/api/test-email/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { getResend, FROM_EMAIL } from '@/lib/resend'

export async function GET() {
  const resend = getResend()
  const result = await resend.emails.send({
    from: FROM_EMAIL,
    to: 'lucio@lucsandesign.com',
    subject: 'Lucsan web — Resend smoke test',
    html: '<p>Si ves este correo, Resend funciona desde el proyecto.</p>',
  })
  return NextResponse.json(result)
}
```

- [ ] **Step 7: Smoke test**

Run `npm run dev`. Visitar `localhost:3000/api/test-email`. Expected: response con `id` del email. Revisar bandeja de `lucio@lucsandesign.com`.

Si no llega, revisar:
- Resend dashboard → Logs → ver si el envío salió.
- DNS del dominio si usas `no-reply@lucsandesign.com`.
- Carpeta spam.

Detener dev server.

- [ ] **Step 8: Probar reset password de Payload**

En `localhost:3000/admin`, hacer logout y luego "Forgot password" con tu email. Expected: llega correo de Payload (vía Resend). Mismo procedimiento desde `/es/portal/login` para Clients.

- [ ] **Step 9: Borrar endpoint de prueba**

```bash
rm src/app/api/test-email/route.ts
```

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: integrate Resend for transactional email (Payload + custom)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 15: Setup repositorio GitHub y push inicial

**Files:**
- ninguno nuevo

- [ ] **Step 1: El usuario crea repo en GitHub**

Pedir:
1. Crear repo `lucsan-web` (privado) en `github.com/<usuario>`.
2. **No** inicializar con README/gitignore/license (ya los tenemos local).
3. Copiar la URL `git@github.com:<usuario>/lucsan-web.git` o `https://...`.

- [ ] **Step 2: Añadir remote y push**

Run:
```bash
git remote add origin <URL>
git push -u origin main
```

- [ ] **Step 3: Verificar**

Abrir el repo en GitHub. Confirmar que están todos los archivos excepto `.env.local`, `node_modules`, `.next`, `.vercel`.

- [ ] **Step 4: Commit (no aplica — solo push)**

(Si añadiste algo, commit normal. Si no, sigue al siguiente task.)

---

## Task 16: Deploy a Vercel + dominio + DB de producción

**Files:**
- Modify: variables de entorno en Vercel UI

- [ ] **Step 1: El usuario crea proyecto Vercel**

Pedir:
1. `vercel.com` → Add New → Project → Import del repo `lucsan-web`.
2. Framework Preset: `Next.js` (auto-detectado).
3. Root Directory: `./`.
4. **NO desplegar todavía** — primero hay que configurar env vars y DB de prod.

- [ ] **Step 2: El usuario crea DB Supabase de producción**

Pedir:
1. Crear segundo proyecto Supabase llamado `lucsan-web-prod`.
2. Misma región que dev.
3. Copiar la connection string (transaction pooler, puerto 6543).

- [ ] **Step 3: El usuario crea bucket R2 de producción**

Pedir:
1. Cloudflare → R2 → Create bucket `lucsan-prod`.
2. Crear API token con permisos de read/write sobre `lucsan-prod`. Guardar credenciales.

- [ ] **Step 4: Configurar env vars en Vercel — Production scope**

En Vercel project → Settings → Environment Variables → añadir todas las variables del `.env.example`, scope **Production**:
- `DATABASE_URI` → connection string de `lucsan-web-prod`
- `PAYLOAD_SECRET` → generar uno NUEVO (no reutilizar el de dev)
- `PAYLOAD_PUBLIC_SERVER_URL` → `https://lucsandesign.com`
- `R2_*` → credenciales del bucket `lucsan-prod`
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (cuando dominio verificado: `no-reply@lucsandesign.com`)
- `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`

- [ ] **Step 5: Configurar env vars — Preview scope**

Mismo set de variables, pero **Preview** scope, apuntando a la **DB y bucket de DEV** (mismas credenciales que `.env.local`):
- `DATABASE_URI` → DB dev
- `PAYLOAD_SECRET` → mismo secret de dev (acceptable para preview, no producción)
- `PAYLOAD_PUBLIC_SERVER_URL` → vacío (Vercel lo override con la preview URL)
- `R2_*` → bucket `lucsan-dev`
- Resto igual a Production (PostHog/Sentry/Resend pueden compartirse).

- [ ] **Step 6: Trigger primer deploy**

Vercel → Deployments → Deploy latest commit on `main`.

Esperar build. Expected: ✅ verde. Si falla:
- Revisar logs (típicos: env var faltante, DB connection refused, source maps Sentry sin token).
- Corregir y re-trigger.

- [ ] **Step 7: Crear primer Admin en producción**

Visitar `<vercel-url>/admin`. Crear primer admin con email + password real (estos son los reales de prod).

- [ ] **Step 8: Configurar dominio `lucsandesign.com`**

Vercel project → Settings → Domains → Add `lucsandesign.com` y `www.lucsandesign.com`.

Vercel da los registros DNS a configurar en Cloudflare:
- `lucsandesign.com` (apex) → A record o ALIAS según opción Vercel ofrezca
- `www.lucsandesign.com` → CNAME → `cname.vercel-dns.com`

Configurar en Cloudflare DNS. Esperar propagación (minutos).

Verificar HTTPS automático (Vercel emite cert).

- [ ] **Step 9: Smoke test producción**

Visitar `https://lucsandesign.com`:
- ✅ home renderiza con fuentes y paleta.
- ✅ `/es` y `/en` funcionan.
- ✅ `/admin` funciona.
- ✅ `/api/health` retorna `{ status: "ok" }`.
- ✅ PostHog Live → ver eventos llegando con `host: lucsandesign.com`.
- ✅ Sentry → release nuevo creado con commit hash.

- [ ] **Step 10: Commit (si aplicable)**

Si hubo cambios locales para que pasara el build (ajustes config), commit y push:
```bash
git add -A
git commit -m "fix: adjustments for production build

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
git push
```

---

## Task 17: README mínimo y documentación de setup

**Files:**
- Create: `README.md`

- [ ] **Step 1: Crear README**

Create `README.md`:
```markdown
# Lucsan Web

Sitio institucional + CMS + portal de clientes de [Lucsan Design](https://lucsandesign.com).

## Stack

Next.js 15 (App Router) · TypeScript · Payload v3 · Supabase Postgres · Cloudflare R2 · Tailwind + shadcn/ui · next-intl · PostHog · Sentry · Resend · Vercel.

## Setup local

### Prerrequisitos
- Node 20+
- Cuenta en Supabase, Cloudflare R2, Resend, PostHog, Sentry.

### Pasos

1. Clonar repo:
   \`\`\`bash
   git clone <repo-url>
   cd "Lucsan web"
   npm install
   \`\`\`

2. Copiar `.env.example` a `.env.local` y rellenar todas las variables (ver sección "Variables de entorno").

3. Generar `PAYLOAD_SECRET`:
   \`\`\`bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   \`\`\`

4. Levantar dev server:
   \`\`\`bash
   npm run dev
   \`\`\`

5. Abrir `http://localhost:3000`. Admin de Payload en `http://localhost:3000/admin`.

## Estructura

Ver `docs/superpowers/specs/2026-05-06-fundaciones-design.md` para el detalle.

## Specs y planes

- `docs/superpowers/specs/` — specs de subsistemas
- `docs/superpowers/plans/` — planes de implementación

## Variables de entorno

Ver `.env.example` para lista completa con descripciones.

## Deploy

Push a `main` → deploy automático a producción en Vercel.
Cualquier rama o PR → preview URL automática.

DBs: dos proyectos Supabase separados (`lucsan-web-prod` y `lucsan-web-dev`).
Storage: dos buckets R2 separados (`lucsan-prod` y `lucsan-dev`).

## Comandos útiles

\`\`\`bash
npm run dev          # dev server
npm run build        # build de producción
npm run start        # arrancar build local
npm run lint         # lint
\`\`\`
```

- [ ] **Step 2: Commit y push**

```bash
git add README.md
git commit -m "docs: add README with setup instructions

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
git push
```

---

## Task 18: Verificación final de criterios de éxito

Esta task **no escribe código** — solo recorre los 10 criterios de éxito del spec (sección 10) y confirma que cada uno cumple. Si alguno falla, abrir un sub-bug y regresar al task correspondiente.

- [ ] **Criterio 1**: Repo Next.js + Payload v3 + TS corriendo localmente. ✅ confirmado en Task 1-4.

- [ ] **Criterio 2**: Conectado a Supabase Postgres dev, migraciones inicializadas. ✅ confirmado en Task 2.

- [ ] **Criterio 3**: R2 configurado, upload de archivo de prueba verificado. ✅ confirmado en Task 5 step 6.

- [ ] **Criterio 4**: Tailwind + shadcn inicializados, tokens de marca aplicados, fuentes self-hosted cargando. ✅ confirmado en Task 6-7.

- [ ] **Criterio 5**: i18n funcional, `/es` y `/en` resuelven, selector funciona, cookie persiste. ✅ confirmado en Task 9-10.

- [ ] **Criterio 6**: Auth Payload con `Admins` y `Clients` separadas, login probado en cada uno. Confirmar:
  - Admin login en `/admin`: ✅
  - Client login en `/es/portal/login`: ✅ (Task 11)

- [ ] **Criterio 7**: PostHog y Sentry inicializados, eventos y errores de prueba verificados.
  - PostHog: ver pageview de prueba en dashboard. ✅ Task 12.
  - Sentry: ver issue de prueba en dashboard. ✅ Task 13.

- [ ] **Criterio 8**: Resend configurado, email de prueba enviado. ✅ Task 14.

- [ ] **Criterio 9**: Deploy Vercel, producción en `lucsandesign.com`, preview funcional.
  - https://lucsandesign.com responde 200. ✅ Task 16.
  - Crear PR de prueba con cambio cosmético → preview URL renderiza. Si no ha sido testeado, hacerlo ahora.

- [ ] **Criterio 10**: `.env.example` completo. README con instrucciones de setup.
  - `.env.example`: ✅ Task 2 + actualizado en cada task posterior.
  - README: ✅ Task 17.

- [ ] **Step final: Tag de release y handoff**

```bash
git tag v0.1.0-foundations -m "Foundations spec implemented"
git push --tags
```

A partir de aquí, los specs de subsistemas (sitio público, cotizador+CRM, portal) pueden empezar.

---

## Self-review notes (post-write)

Antes de entregar el plan, repasé contra el spec sección por sección:

- ✅ Stack base — Tasks 1, 2, 5 (Next, Payload, Postgres, R2).
- ✅ Auth dos colecciones — Task 4.
- ✅ i18n subpaths + cookie + slugs traducidos (config) — Tasks 9, 10. Nota: traducción de slugs de colecciones se ejercita cuando se creen colecciones de contenido en specs siguientes — la config base con `localized: true` queda lista en este plan vía adapter de next-intl.
- ✅ Tailwind + shadcn + tokens marca — Task 6.
- ✅ Fuentes self-hosted — Task 7.
- ✅ Logos en `public/brand/` — Task 7 step 2.
- ✅ PostHog — Task 12.
- ✅ Sentry — Task 13.
- ✅ Resend — Task 14.
- ✅ Entornos prod + preview, dos DBs y dos buckets — Task 16.
- ✅ `.env.example` — Tasks 2, 5, 12, 13, 14.
- ✅ README — Task 17.
- ✅ 10 criterios de éxito — Task 18 verifica uno por uno.

Sin placeholders, sin TBD. Tipos y nombres consistentes (`admins`, `clients`, `media` slugs reutilizados en todas partes; `R2_*` env vars consistentes; etc.).
