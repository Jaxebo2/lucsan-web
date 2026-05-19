# Lucsan Design — Web pública (Astro Rewrite) — Plan ejecutable

**Fecha:** 2026-05-16
**Spec:** [`../specs/2026-05-16-astro-rewrite-design.md`](../specs/2026-05-16-astro-rewrite-design.md)
**Modo de ejecución:** Subagent-Driven Development
**Reemplaza:** `2026-05-06-fundaciones.md` (Payload/Next.js stack)

---

## Tareas

Cada tarea es atómica, ejecutable por un subagente con prompt autocontenido. El orden es importante hasta T05; de ahí en adelante varias se pueden paralelizar.

### T01 — Safety net y limpieza destructiva
**Objetivo:** Preservar historial, vaciar repo manteniendo solo lo reutilizable.

- Crear tag `legacy/v0.1.0-payload` apuntando a `v0.1.0-foundations`.
- Crear branch `astro-rewrite` desde `main`.
- En `astro-rewrite`, borrar:
  - `src/payload.config.ts`, `src/collections/`, `src/app/`, `src/middleware.ts`, `src/i18n/`, `src/messages/`, `src/components/` (todo), `src/lib/`, `sentry.*.config.ts`, `src/instrumentation*.ts`, `next.config.ts`, `next-env.d.ts`, `payload-types.ts`, `postcss.config.cjs`, `tailwind.config.ts` (se regenera), `components.json`.
  - `package.json`: dejar solo `name`, `version`, `private`. Reescribir desde cero en T02.
  - `package-lock.json`: borrar (se regenera).
  - `.next/`, `node_modules/` (si presentes).
- Conservar:
  - `Assets y referencias/` (intacto).
  - `.env.example` (se actualiza en T13).
  - `.gitignore` (auditar y ajustar).
  - `README.md` (se reescribe en T18).
  - `docs/`.
  - `public/` (si tiene SVGs de marca).
  - Las **fuentes** dentro de `Assets y referencias/` o donde estén.
- Commit: `chore: clean slate for Astro rewrite (preserve assets + docs)`.

**Verificación:** `git status` limpio, `ls src/` muestra carpeta vacía o no existe.

---

### T02 — Bootstrap Astro 5 + TypeScript estricto
**Objetivo:** Proyecto Astro funcional con `npm run dev`.

- `npm create astro@latest .` con flags: `--template minimal --typescript strict --install --no-git`.
- Si el create asistente no permite flags directas, instalar manualmente:
  ```json
  {
    "dependencies": { "astro": "^5.0.0" },
    "devDependencies": { "@astrojs/check": "^0.9.0", "typescript": "^5.6.0" }
  }
  ```
- `tsconfig.json` extiende `astro/tsconfigs/strict` + `noUncheckedIndexedAccess: true`.
- `astro.config.mjs` minimal con `site: 'https://lucsandesign.com'`.
- Crear `src/pages/index.astro` placeholder: `<h1>Lucsan Design</h1>`.
- Verificar: `npm run dev` → http://localhost:4321 muestra el placeholder.
- Commit: `chore: scaffold Astro 5 + TypeScript strict`.

**Verificación:** `npm run build` exitoso, `dist/index.html` generado.

---

### T03 — Tailwind v4 + tokens de marca
**Objetivo:** Tailwind v4 funcionando con tokens del estudio.

- `npm install tailwindcss@^4 @tailwindcss/vite@^4`.
- `astro.config.mjs`: importar `@tailwindcss/vite` y agregar a `vite.plugins`.
- Crear `src/styles/global.css` con:
  ```css
  @import "tailwindcss";

  @theme {
    --color-brand-black: #08080c;
    --color-brand-coral: #ff5548;
    --color-brand-blue:  #4e47ff;
    --color-brand-green: #47ff93;
    --color-brand-yellow:#ffe047;
    --color-brand-white: #fafaf7;
    --color-brand-gray:  #6b6b75;

    --font-display: 'Cabinet Grotesk', system-ui, sans-serif;
    --font-sans:    'Switzer', system-ui, sans-serif;
  }
  ```
- Importar `global.css` en un layout base mínimo.
- Página placeholder actualizada para probar `bg-brand-black text-brand-coral font-display`.
- Commit: `feat: tailwind v4 + brand tokens`.

**Verificación:** clases de marca aplican correctamente en navegador.

---

### T04 — Fuentes locales (Cabinet Grotesk + Switzer)
**Objetivo:** Servir solo los 3 pesos usados, subset latin, font-display swap.

- Copiar desde `Assets y referencias/` (o ubicación actual) al `src/assets/fonts/`:
  - `CabinetGrotesk-Bold.woff2`
  - `Switzer-Regular.woff2`
  - `Switzer-Semibold.woff2`
- En `global.css`, declarar `@font-face` con `font-display: swap` para los 3.
- Verificar con DevTools que solo 3 woff2 se cargan.
- Commit: `feat: load Cabinet Grotesk + Switzer subset`.

**Verificación:** Network panel muestra exactamente 3 fonts cargadas, headlines renderizan con Cabinet.

---

### T05 — Layout base + Navbar + Footer
**Objetivo:** `BaseLayout.astro` con head completo, nav y footer reutilizables.

- `src/layouts/BaseLayout.astro`:
  - `<head>`: charset, viewport, title prop, description prop, canonical, og defaults, favicon, GTM placeholder (con flag para deshabilitar en dev).
  - `<body>`: `<Navbar />` + `<slot />` + `<Footer />`.
- `src/components/nav/Navbar.astro`:
  - Logo (SVG inline o desde `/public`).
  - Links: Servicios, Proyectos, Sobre nosotros, Contacto.
  - Sticky, transparente en home top, sólido al scroll.
  - Mobile: hamburger → drawer.
- `src/components/nav/Footer.astro`:
  - Links a TODOS los servicios + sobre + contacto.
  - Redes sociales (placeholder URLs).
  - Datos legales: "Lucsan Design SpA · Chile".
  - Año dinámico.
- Mobile-first. Sin animaciones todavía.
- Commit: `feat: base layout with navbar and footer`.

**Verificación:** layout renderiza en mobile + desktop, links funcionan (a páginas que aún no existen → 404 OK).

---

### T06 — Astro Content Collections (sin Keystatic todavía)
**Objetivo:** Definir schemas Zod para `services`, `projects`, `pages`. Validación en build.

- `src/content.config.ts`:
  - `services` collection (loader: glob `src/content/services/**/*.md`) con Zod schema según §6.1 del spec.
  - `projects` collection idem según §6.2.
  - `pages` collection con loader específico para los 3 singletons (home, sobre, contacto) según §6.3.
- Crear 1 archivo de muestra por colección con datos dummy completos para validar schema.
- `npm run build` debe pasar sin errores de schema.
- Commit: `feat: content collections schemas (services, projects, pages)`.

**Verificación:** TypeScript autocompleta los campos al hacer `getCollection('services')`. Build exitoso.

---

### T07 — Keystatic integración (local-only)
**Objetivo:** Panel de edición en `/keystatic` para editar contenido localmente.

- `npm install @keystatic/core @keystatic/astro`.
- `astro.config.mjs`: agregar integration `keystatic()`, output `'server'` o `'hybrid'` (mínimo para que panel funcione en dev).
- `keystatic.config.ts`:
  - `storage: { kind: 'local' }`.
  - `collections`: mapear a `src/content/services` y `src/content/projects` con schemas equivalentes a §6.1/6.2.
  - `singletons`: `home`, `sobre`, `contacto` mapeados a `src/content/pages/*.json`.
- Imágenes: Keystatic guarda en `src/assets/keystatic/` por default. Reglas:
  - Imágenes pesadas (galería casos, hero proyectos) → suben a R2 manualmente, en CMS solo guardamos URL pública.
  - Imágenes ligeras (avatares testimonios, iconos) → directo en repo.
- `src/pages/keystatic/[...params].astro` + `src/pages/api/keystatic/[...params].ts` según docs Keystatic Astro.
- Solo accesible en dev (`import.meta.env.DEV`).
- Commit: `feat: keystatic CMS integration (local-only)`.

**Verificación:** `npm run dev` → `/keystatic` carga panel, editar un campo y guardar refleja cambio en archivo md/json.

---

### T08 — Componentes UI base (Astro)
**Objetivo:** Set mínimo reutilizable: `Button`, `Container`, `Section`, `Card`, `CTABlock`, `FAQItem`, `MetricBadge`.

- Todos `.astro`, sin React (excepto donde se requiera interactividad explícita).
- Variantes vía Tailwind classes + props.
- Documentación inline (JSDoc).
- Commit: `feat: ui primitives (button, container, section, card, cta, faq, metric)`.

**Verificación:** página `/test-ui` (eliminada al final) renderiza todos los componentes en todos sus estados.

---

### T09 — Páginas estáticas: Home, Sobre, Contacto, Servicios (listado)
**Objetivo:** 4 páginas estáticas con datos desde `pages` collection + listado de servicios desde `services`.

- `src/pages/index.astro`:
  - Lee `pages.home`.
  - Renderiza Hero, prueba social, servicios destacados, método resumen, casos destacados, testimonios, CTA final.
- `src/pages/sobre-nosotros.astro`:
  - Lee `pages.sobre`.
  - Manifiesto, método (timeline), equipo, valores.
- `src/pages/contacto.astro`:
  - Lee `pages.contacto`.
  - Header + form (placeholder estructural por ahora) + WhatsApp CTA + datos.
- `src/pages/servicios/index.astro`:
  - Lee todos los `services` publicados, orden según `orden`.
  - Grid de cards con título + 1 línea de descripción + link.
- Mobile-first. Sin animaciones todavía (vendrán en T14).
- Commit: `feat: static pages (home, about, contact, services index)`.

**Verificación:** las 4 páginas renderizan con contenido dummy, Lighthouse SEO ≥ 90 en cada una.

---

### T10 — Páginas dinámicas: Servicios [slug] y Proyectos [slug] + listado
**Objetivo:** Generar `/servicios/[slug]` y `/proyectos/[slug]` desde collections + listado de proyectos.

- `src/pages/servicios/[slug].astro` usando `getStaticPaths` desde `services`.
  - Estructura obligatoria §5 del spec (8 bloques).
  - Layout `ServiceLayout.astro`.
- `src/pages/proyectos/[slug].astro` usando `getStaticPaths` desde `projects`.
  - Hero cover + cliente + sector + año.
  - Bloques caso (contexto, desafío, enfoque, solución, galería, resultado, testimonio).
  - "Proyectos relacionados" (mismo servicio o sector).
  - Layout `ProjectLayout.astro`.
- `src/pages/proyectos/index.astro`:
  - Grid de proyectos publicados.
  - Filtro binario simple: "Todos / Branding / Diseño Web" (toggle visual, sin estado URL en v1 — JS islita opcional).
- Commit: `feat: dynamic pages (services [slug], projects [slug] + index)`.

**Verificación:** rutas dinámicas pre-renderizadas en build. Cada slug carga con contenido completo.

---

### T11 — SEO técnico (Schema.org, OG, sitemap, robots)
**Objetivo:** Cada página con head completo, Schema.org válido, sitemap automático.

- `npm install @astrojs/sitemap`.
- `astro.config.mjs`: integration sitemap activa.
- `src/lib/seo.ts`: helper que construye meta + og + twitter + canonical desde props.
- `src/components/seo/SEO.astro`: usa el helper, recibe `{ title, description, ogImage?, canonical? }`.
- `src/components/seo/Schema.astro`: recibe `type` ('Organization'|'Service'|'CreativeWork'|'ContactPage'|'AboutPage'|'WebSite') y data, emite JSON-LD válido.
- Integrar en `BaseLayout`, `ServiceLayout`, `ProjectLayout`.
- `public/robots.txt` con sitemap reference.
- Validar 3 páginas en https://search.google.com/test/rich-results.
- Commit: `feat: SEO infrastructure (meta, OG, Schema.org, sitemap, robots)`.

**Verificación:** Rich Results Test verde en home, 1 servicio, 1 proyecto. Sitemap accesible en `/sitemap-index.xml`.

---

### T12 — Form de contacto funcional (Resend + Turnstile)
**Objetivo:** Form en `/contacto` envía email vía Resend con anti-spam Turnstile.

- `npm install resend zod`.
- `src/components/forms/ContactForm.tsx` (React island, `client:load`):
  - Campos según §9 del spec.
  - Validación Zod cliente.
  - Turnstile widget (script desde Cloudflare).
  - Honeypot field oculto.
  - Estado loading / success / error.
- `src/pages/api/contact.ts`:
  - Validar payload Zod.
  - Verificar Turnstile token contra `https://challenges.cloudflare.com/turnstile/v0/siteverify`.
  - Llamar `resend.emails.send(...)` con HTML estructurado.
  - Respuestas: 200 / 400 (validación o turnstile) / 500 (resend).
- `src/lib/resend.ts`: cliente Resend.
- `src/lib/turnstile.ts`: helper verify.
- Variables `.env.local`: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_TO_EMAIL`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`.
- **Bloqueado por:** verificar dominio `lucsandesign.com` en Resend (DNS Hostinger). Mientras tanto usar `onboarding@resend.dev` con destinatario `lucio@lucsandesign.com` para smoke test.
- Commit: `feat: contact form with Resend + Turnstile`.

**Verificación:** envío real desde el form llega a `contacto@lucsandesign.com` (o destino sandbox).

---

### T13 — Analytics (GTM + GA4 + Meta Pixel)
**Objetivo:** Tracking funcional con eventos custom según §10 spec.

- Crear container GTM nuevo (`GTM-LUCSAN`).
- Configurar tags:
  - GA4 base.
  - Meta Pixel base.
  - Eventos custom (triggers por URL pattern + dataLayer pushes).
- En `BaseLayout`, inyectar snippet GTM (`<head>` + `<body>` noscript).
- Helper `src/lib/analytics.ts` con `pushEvent(name, payload)`.
- Disparar eventos en:
  - `ContactForm` (form_submit success).
  - CTA WhatsApp (whatsapp_click).
  - CTAs dentro de servicios (service_cta_click).
- Banner consentimiento minimalista (componente `<CookieConsent>`).
- Variable `PUBLIC_GTM_ID` en `.env.example`.
- Commit: `feat: analytics (GTM + GA4 + Meta Pixel + custom events)`.

**Verificación:** GTM Preview Mode muestra eventos disparándose correctamente.

---

### T14 — Animaciones (GSAP + Lenis + View Transitions)
**Objetivo:** Animaciones permitidas según §8 del spec, lazy-loaded.

- `npm install gsap lenis`.
- `src/components/animations/GSAPReveal.astro`:
  - Wrapper que aplica split-text reveal a su slot al estar en viewport.
  - Dynamic import GSAP solo si componente está presente en página.
- `src/components/animations/LenisProvider.astro`:
  - Inicializa Lenis solo en `/` y `/proyectos/[slug]` (via `client:idle`).
  - Respeta `prefers-reduced-motion`.
- `astro.config.mjs`: habilitar View Transitions globales.
- Aplicar:
  - Home hero: split-text reveal del headline + image mask reveal.
  - `/proyectos/[slug]`: pinning de hero, parallax suave en galería.
- CSS-only hover en cards (no JS).
- Commit: `feat: animations (GSAP reveals, Lenis on selected pages, View Transitions)`.

**Verificación:** Lighthouse Performance ≥ 90 con animaciones activas, `prefers-reduced-motion` desactiva animaciones JS.

---

### T15 — Carga inicial de contenido real
**Objetivo:** Reemplazar dummies con contenido real provisto por Lucio.

**Bloqueado por:** Lucio provee:
- Copy de home (headline, subhead, CTA, manifiesto resumen).
- Copy de sobre-nosotros (manifiesto completo, método, bio).
- 8 servicios con: hero copy, para quién, problema, método, entregables, FAQ. Casos relacionados se asignan post.
- 5–8 proyectos con: cliente (real o anonimizado), sector, año, imágenes (cover + galería), narrativa caso, métricas, testimonio (opcional).
- Datos contacto: WhatsApp, email, redes sociales.
- Logos clientes para prueba social (con permiso).

**Modo de trabajo:**
- Lucio escribe / Claude pule / Lucio aprueba.
- Imágenes pesadas subidas a R2 (bucket prod `lucsan-web-media-prod`) en path `/projects/[slug]/` y `/services/[slug]/`.
- Optimización: AVIF + WebP servidos con `<picture>` o `astro:assets` cuando el asset esté en repo.
- Commits incrementales: 1 por servicio o proyecto cargado.

**Verificación:** las 8 páginas de servicio + 5-8 proyectos + 3 estáticas tienen contenido real, sin lorem ipsum.

---

### T16 — Optimización de imágenes + media en R2
**Objetivo:** Todas las imágenes servidas con formato moderno, tamaños correctos, lazy excepto LCP.

- Imágenes en R2:
  - Pre-procesar localmente: convertir a AVIF + WebP en 3 tamaños (mobile 800w, desktop 1600w, retina 2400w).
  - Subir vía `wrangler r2 object put` o panel CF.
  - Custom domain opcional: `media.lucsandesign.com` apuntando al bucket público.
- Imágenes en repo (logos, iconos): pasar por `astro:assets` `<Image>` o `<Picture>` con `formats: ['avif', 'webp']`.
- Audit con Lighthouse: ninguna imagen marcada "next-gen formats", ninguna sirviendo tamaño excesivo.
- Commit: `chore: optimize images (AVIF/WebP, R2 with multiple sizes)`.

**Verificación:** Lighthouse Performance ≥ 95 en home y página de servicio.

---

### T17 — Deploy a Vercel + verificación dominio
**Objetivo:** Producción accesible en `lucsandesign.com`, todos los smoke tests verdes.

- Vercel proyecto `lucsan-web` ya existe → cambiar el framework preset a "Astro".
- `astro.config.mjs`: agregar `@astrojs/vercel` adapter (`output: 'server'` solo si Keystatic exige; idealmente `output: 'static'` con form siendo edge function).
- Variables de entorno Vercel (dev/preview/production):
  - `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_TO_EMAIL`
  - `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`
  - `PUBLIC_GTM_ID`
  - `PUBLIC_R2_URL` (si custom domain configurado)
- Deploy preview → smoke test completo:
  - 4 páginas estáticas cargan
  - 8 páginas de servicio cargan
  - 5–8 páginas de proyecto cargan
  - Form envía y llega email
  - GTM dispara eventos
  - Sitemap accesible
- Promover a producción.
- Verificar `lucsandesign.com` apunta al nuevo deploy.
- Submit sitemap a Search Console.
- Commit (si quedaron ajustes): `chore: production deploy + env vars`.

**Verificación:** Lighthouse mobile en producción ≥ 90 perf, ≥ 95 SEO/A11y/BP. LCP < 2.0s.

---

### T18 — Documentación + cierre v1
**Objetivo:** README actualizado, CHANGELOG, tag.

- Reescribir `README.md`:
  - Stack
  - Setup local (`npm install`, `npm run dev`)
  - Cómo editar contenido (Keystatic en `/keystatic` en dev)
  - Variables de entorno requeridas
  - Deploy
  - Estructura de carpetas
- `CHANGELOG.md`: entry v1.0.0 con cambios desde `legacy/v0.1.0-payload`.
- Merge `astro-rewrite` → `main`.
- Tag `v1.0.0`.
- Commit: `docs: README + CHANGELOG for v1.0.0`.

**Verificación:** un dev nuevo siguiendo el README llega a `npm run dev` funcional en < 10 min.

---

## Dependencias entre tareas

```
T01 → T02 → T03 → T04 → T05 → T06 → T07 → T08
                                              ↓
                                              T09 ┬→ T10 ┬→ T11
                                                  │      │
                                                  │      └→ T14
                                                  │
                                                  └→ T12 → T13
                                                                ↓
                                                                T15 → T16 → T17 → T18
```

T11 y T12 se pueden paralelizar después de T10.
T13 y T14 idealmente después de T12.
T15 (carga de contenido real) es la barrera principal — depende de Lucio.

---

## Riesgos identificados

| Riesgo | Mitigación |
|---|---|
| Keystatic incompatible con Astro 5 latest | Validar versiones compatibles en T07. Fallback: edición manual de markdown sin panel. |
| Dominio `lucsandesign.com` aún no verificado en Resend | T12 puede arrancar con sandbox; bloquear T17 hasta DNS verificado. |
| Tailwind v4 breaking changes vs v3 | Spec asume v4. Migrar tokens directo al `@theme` block sin reusar `tailwind.config.ts` viejo. |
| Performance del form con Turnstile + island React | T14 audita; si Turnstile pesa demasiado, evaluar hCaptcha invisible o solo honeypot + rate limit. |
| Volumen de contenido para 8 servicios + 5-8 proyectos | T15 es el cuello de botella real. Asignar tiempo dedicado de Lucio. |
| Vercel adapter modo SSR si Keystatic requiere | Si Keystatic Astro requiere SSR para que el panel funcione, output será `hybrid` con páginas públicas pre-rendered y panel server-side. Costo: cold starts en panel, irrelevante porque es solo dev. |
