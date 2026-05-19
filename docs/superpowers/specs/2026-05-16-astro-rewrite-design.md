# Lucsan Design — Web pública (Astro Rewrite) — Design Spec

**Fecha:** 2026-05-16
**Autor:** Lucio Santana + Claude
**Estado:** Aprobado, listo para planificación de ejecución
**Reemplaza:** `2026-05-06-fundaciones-design.md` (Payload/Next.js, archivado en branch `legacy/payload-foundations`)

---

## 1. Propósito

`lucsandesign.com` es la **web pública del estudio Lucsan Design SpA**. Su único trabajo es:

1. Captar leads cualificados (CEO/founder/marketing manager de pymes chilenas).
2. Posicionar la marca en Google Chile por keywords de servicios clave.
3. Comunicar el método del estudio con suficiente densidad para que un prospecto entienda cómo trabajamos y qué esperar.

**No hace:** CRM, gestión interna, portal de clientes, biblioteca de assets, autenticación. Todo eso vive en **Lucsan OS** (`app.lucsandesign.com`, proyecto separado).

---

## 2. Norte estratégico

### Audiencia
- **Primario:** CEO/founder de pyme chilena (10–200 empleados) que necesita branding, web o marketing y busca en Google.
- **Secundario:** Marketing manager de empresa mediana evaluando agencias.
- **Terciario:** Otros estudios/freelancers (red profesional, referidos).

### Promesa
> Estrategia + diseño + tecnología integrados. Resolvemos problemas de negocio con diseño, no solo "hacemos cosas bonitas".

### Tono editorial
- Chileno neutro, "tú" no "usted".
- Profesional sin ser frío. Confianza sin arrogancia.
- Copy **rational + emotional**: data al servicio de la historia, historia al servicio de la decisión de compra.
- Cada headline ataca un dolor o aspiración concreta del CEO. Nada genérico ("Soluciones creativas para tu marca" prohibido).

### Referencias destiladas
- **Pulpo (AR), Muthafunk, Bakdesign, Demosle, Blanca (CL)** — sobriedad latina, casos con historia.
- **Mucho `/brand-dna`, `/services`** — método expuesto como contenido, no escondido.
- **TwoPoints** — jerarquía editorial fuerte, tipografía protagonista.

### Anti-referencias
- Active Theory, Resn, Locomotive, Cuberto — técnica deslumbrante sin venta.
- WordPress agency themes — genérico, mute, sin personalidad.

---

## 3. Stack tecnológico

| Capa | Elección | Versión objetivo |
|---|---|---|
| Framework | **Astro** | 5.x |
| Lenguaje | TypeScript estricto (`strict: true`, `noUncheckedIndexedAccess`) | 5.x |
| Estilos | **Tailwind CSS v4** vía `@tailwindcss/vite` | 4.x |
| CMS | **Keystatic** (local-only, sin Keystatic Cloud) | latest |
| Animaciones | **GSAP 3** + **ScrollTrigger** + **Lenis** (lazy, por página) | latest |
| Componentes React (islas) | Cuando JS interactivo lo justifica (form, filtros) | 19.x |
| Iconos | **Phosphor Icons** vía `astro-icon` + `@iconify-json/ph` | latest |
| Email transaccional | **Resend** (mantener cuenta existente) | SDK 4.x |
| Anti-spam form | **Cloudflare Turnstile** (gratis, mejor UX que reCAPTCHA) | latest |
| Storage imágenes pesadas | **Cloudflare R2** (buckets existentes `lucsan-web-media-{dev,prod}`) | — |
| Hosting | **Vercel** (proyecto existente `lucsan-web`) | — |
| Analytics | **GTM** → GA4 + Meta Pixel | — |
| Search Console | Verificación vía meta tag o DNS | — |
| Sentry | **No** (sitio mayormente estático, surface de error mínima) | — |
| PostHog | **No** (se reserva para Lucsan OS) | — |

### Descartes explícitos
- Next.js, Payload, Supabase, Drizzle, next-intl, shadcn → eliminados.
- Cloudflare Pages → Vercel gana por DX + dominio ya configurado.
- Tally → form nativo desde v1.
- Brevo → Resend (decisión revisable cuando se construya Lucsan OS).
- WebGL / Three.js → no.

---

## 4. Arquitectura de información

### 4.0 Navbar adaptativa (glass + dynamic theming)

Comportamiento exigido:

- **Apariencia base:** sticky, fondo `backdrop-filter: blur(16px)` con opacidad sutil sobre la sección actual.
- **Detección de fondo:** cada `<section>` declara `data-theme="light"` o `data-theme="dark"`. Un `IntersectionObserver` en el navbar detecta cuál sección ocupa la franja superior y aplica clase `nav--light` o `nav--dark`.
- **Swap dinámico:**
  - `nav--light` → logo color `brand-black`, links color `brand-black`, hover `brand-coral`.
  - `nav--dark` → logo color `neutral-50`, links color `neutral-50`, hover `brand-coral`.
- **Transición:** `transition: color 200ms, background 200ms`. Sin saltos bruscos.
- **Accesibilidad:** `prefers-reduced-motion` desactiva transición de color, swap instantáneo.
- **Móvil:** drawer abre con fondo opaco `brand-black`, siempre tema oscuro.

Archivos involucrados: `Navbar.astro` + `navbar-theme.ts` (cliente, IntersectionObserver).

### 4.1 Páginas estáticas

| Ruta | Propósito | Conversión esperada |
|---|---|---|
| `/` | Hook + propuesta + prueba social + servicios destacados + casos featured + CTA | Click a servicio o contacto |
| `/sobre-nosotros` | Manifiesto, método, fases de trabajo, equipo (Lucio + colaboradores) | Confianza → contacto |
| `/contacto` | Form simple + WhatsApp + datos de contacto + tiempo de respuesta esperado | Envío de form |

### 4.2 Páginas dinámicas (Keystatic)

| Ruta | Colección | Cantidad inicial |
|---|---|---|
| `/servicios` | listado de `services` | 8 (ver §5) |
| `/servicios/[slug]` | item de `services` | 8 |
| `/proyectos` | listado de `projects` | 5–8 (definido por Lucio) |
| `/proyectos/[slug]` | item de `projects` | 5–8 |

### 4.3 i18n
- **v1:** ES-only. Estructura preparada para EN, sin contenido EN.
- **v1.1 (post-lanzamiento):** mirror EN en `/en/...`. Default ES sin prefijo. `hreflang` automatizado.
- Astro i18n nativo (`@astrojs/i18n` o `defaultLocale: 'es'` config nativo).

---

## 5. Servicios SEO-prioritarios

Páginas dedicadas, optimizadas por keyword Chile.

| Slug | Keyword principal | Prioridad |
|---|---|---|
| `branding` | "diseño de marca chile" / "branding chile" | P0 |
| `diseno-web` | "diseño web santiago" / "agencia diseño web chile" | P0 |
| `marketing-digital` | "agencia marketing digital chile" | P0 |
| `identidad-visual` | "identidad visual empresa chile" | P1 |
| `rediseno-de-marca` | "rebranding empresa" | P1 |
| `estrategia-de-marca` | "estrategia de marca" | P1 |
| `diseno-ux-ui` | "diseño ux ui chile" | P2 |
| `contenido-redes-sociales` | "contenido redes sociales empresas" | P2 |

### Estructura obligatoria de cada `/servicios/[slug]`

1. **Hero:** headline ataja dolor (ej. "Tu marca no se parece a lo que vendes. Arreglémoslo.") + subhead + CTA primario.
2. **Para quién es este servicio** (3–4 perfiles concretos).
3. **El problema que resolvemos** (síntomas reconocibles).
4. **Nuestro método** (3–5 fases con entregables por fase).
5. **Qué entregamos** (lista concreta, no abstracta).
6. **Casos relacionados** (2–3 proyectos featured con esta categoría).
7. **FAQ** (5–8 preguntas: precio aproximado, duración, qué incluye, qué no incluye, qué necesitas tener listo).
8. **CTA final:** form contacto + WhatsApp.

---

## 6. Schemas de contenido (Keystatic + Astro Collections)

### 6.1 `services`

```ts
{
  title: text                     // "Branding"
  slug: slug                      // "branding"
  keyword: text                   // "diseño de marca chile"
  hero: {
    headline: text
    subhead: text
    image: image                  // R2 reference
  }
  para_quien: array<{
    perfil: text                  // "Founder lanzando producto nuevo"
    descripcion: text
  }>
  problema: {
    titulo: text
    sintomas: array<text>
  }
  metodo: array<{
    fase: text                    // "1. Estrategia"
    descripcion: text
    entregables: array<text>
  }>
  entregables: array<text>
  casos_relacionados: array<reference<projects>>
  faq: array<{
    pregunta: text
    respuesta: rich-text
  }>
  cta: {
    headline: text
    boton_texto: text
  }
  seo: {
    title: text                   // 50-60 char
    description: text             // 140-160 char
    og_image: image
  }
  orden: number                   // para listado /servicios
  publicado: boolean
}
```

### 6.2 `projects`

```ts
{
  titulo: text                    // "Rebranding Acme Corp"
  slug: slug
  cliente: text
  sector: select<["tecnologia", "retail", "salud", "educacion", "gastronomia", "servicios", "otro"]>
  servicios_aplicados: array<reference<services>>   // multi-select
  ano: number
  cover: image                    // hero del caso
  thumbnail: image                // listado /proyectos (formato 4:5 o 1:1)
  resumen_corto: text             // 1-2 frases para card
  caso: {
    contexto: rich-text           // quién es el cliente
    desafio: rich-text            // qué problema tenían
    enfoque: rich-text            // cómo lo abordamos
    solucion: rich-text           // qué hicimos (con imágenes embebidas)
    galeria: array<image>
    resultado: {
      narrativa: rich-text        // historia del resultado
      metricas: array<{
        valor: text                // "+47%"
        descripcion: text          // "aumento en leads cualificados primer trimestre"
      }>
    }
    testimonio: {
      cita: text
      autor: text
      cargo: text
      avatar: image (opcional)
    }
  }
  destacado: boolean              // aparece en home
  publicado: boolean
  seo: { /* idem services */ }
}
```

### 6.3 `pages` (singletons)

```ts
home: {
  hero: { headline, subhead, cta_primario, cta_secundario, imagen_o_video }
  prueba_social: { titulo, logos_clientes: array<image> }
  servicios_destacados: array<reference<services>>   // max 3
  metodo_resumen: { titulo, fases: array<{titulo, descripcion}> }
  casos_destacados: array<reference<projects>>       // max 3
  testimonios: array<{cita, autor, cargo, empresa}>
  cta_final: { headline, boton_texto }
  seo: { /* */ }
}

sobre_nosotros: {
  manifiesto: rich-text
  metodo: array<{fase, descripcion, entregables}>
  equipo: array<{nombre, rol, foto, bio_corta}>
  valores: array<{titulo, descripcion}>
  seo: { /* */ }
}

contacto: {
  headline: text
  subhead: text
  tiempo_respuesta: text           // "Te respondemos en menos de 24h hábiles"
  whatsapp: { numero, mensaje_pre_llenado }
  email: text
  servicios_disponibles: array<reference<services>>  // dropdown del form
  rangos_presupuesto: array<text>  // opciones del form
  seo: { /* */ }
}
```

---

## 7. SEO técnico (no negociable)

### URLs
- Kebab-case en español: `/servicios/diseno-de-marca`.
- Sin trailing slash.
- Sin extensión.

### Sitemap + robots
- `sitemap-index.xml` generado por `@astrojs/sitemap` con `lastmod` automático.
- `robots.txt` permite todo, referencia sitemap.

### Meta + Open Graph
- Helper `src/lib/seo.ts` genera `<SEO>` component con: `title`, `description`, `canonical`, `og:*`, `twitter:*`, `hreflang` (cuando exista EN).
- OG image: 1200×630, estática inicial (Figma → R2), una por servicio + una por proyecto + una default.

### Schema.org JSON-LD
| Página | Tipo |
|---|---|
| `/` | `Organization` + `WebSite` con `SearchAction` |
| `/sobre-nosotros` | `AboutPage` + `Organization` |
| `/contacto` | `ContactPage` + `Organization` con `contactPoint` |
| `/servicios/[slug]` | `Service` + `BreadcrumbList` |
| `/proyectos/[slug]` | `CreativeWork` + `BreadcrumbList` + `ImageObject` |

### Performance budgets (Lighthouse mobile)
- LCP < 2.0s
- CLS < 0.05
- TBT < 200ms
- JS inicial < 80kb gzip
- Imágenes: AVIF primero, WebP fallback, `width`/`height` siempre, `loading="lazy"` salvo LCP image.
- Fuentes: subset latín, max 3 pesos cargados (Cabinet Grotesk 700, Switzer 400, Switzer 600). Resto fuera.
- `font-display: swap`.

### Internal linking
- Home → 3 servicios destacados + 3 casos destacados.
- Cada servicio → 2-3 proyectos relacionados.
- Cada proyecto → servicio padre + 2 proyectos similares.
- Footer: link a TODOS los servicios + sobre + contacto + redes.

---

## 8. Estrategia de animaciones

### Criterio binario
Cada animación responde "sí" a al menos una pregunta:
1. ¿Refuerza el mensaje comercial?
2. ¿Demuestra capacidad del estudio?
3. ¿Dirige la atención al CTA o al contenido clave?

Si la respuesta es "no" en las tres → fuera.

### Permitidas (con presupuesto)
- **Home hero:** split-text reveal del headline + entrada de imagen con mask. Una vez al cargar.
- **Scroll narrativo en proyectos:** pinning de secciones clave, parallax suave en imágenes. Solo dentro de `/proyectos/[slug]`.
- **Hover de cards** (servicios + proyectos): scale 1.02 + overlay opacity. CSS, no JS.
- **Transiciones entre páginas:** Astro View Transitions (nativo).
- **CTAs:** micro-animación hover (CSS, no JS).
- **Lenis smooth scroll:** solo en `/` y `/proyectos/[slug]`. Lazy import.

### Prohibidas
- Cursor custom global.
- Smooth scroll en TODAS las páginas.
- Loaders > 200ms.
- Video hero > 3MB sin poster.
- Animaciones en form contacto.
- 3D, WebGL, parallax extremos.

### Accesibilidad
- `@media (prefers-reduced-motion: reduce)` desactiva todo animation no-CSS-hover.
- Focus visible siempre.
- ARIA labels en CTAs no textuales.

### Carga
- GSAP + ScrollTrigger: dynamic import en páginas que los usan.
- Lenis: dynamic import idem.
- Astro View Transitions: nativo, costo cero.

---

## 9. Form de contacto

### Campos
1. Nombre completo (required)
2. Email (required, validación)
3. Empresa (required)
4. Cargo (opcional)
5. Servicio de interés (select, multi-select, options desde Keystatic)
6. Rango presupuesto aproximado (select, opcional, options desde Keystatic — ej. "<$1.5M", "$1.5–5M", "$5–15M", "+$15M", "No estoy seguro")
7. Cuéntanos sobre tu proyecto (textarea, required, min 50 char)
8. Cómo nos conociste (select opcional: Google, Instagram, recomendación, otro)

### Flujo técnico
1. Form submit (cliente) → Astro API route `POST /api/contact`.
2. API valida con Zod, llama a Cloudflare Turnstile verify endpoint.
3. Si OK, llama a Resend `sendEmail`:
   - `from: "Lucsan Design <contacto@lucsandesign.com>"` (requiere verificar dominio en Resend, ya en proceso).
   - `to: ["contacto@lucsandesign.com"]`.
   - `reply_to: <email del prospecto>`.
   - Body HTML estructurado con todos los campos.
4. Respuesta 200 → cliente muestra mensaje de confirmación + GA4 event `form_submit`.
5. Si falla Turnstile o Resend → 400/500 + mensaje genérico al cliente, error real solo en logs Vercel.

### Anti-abuso
- Cloudflare Turnstile invisible (challenge solo si sospechoso).
- Honeypot field (`<input name="website" tabindex="-1" autocomplete="off">` oculto vía CSS).
- Rate limit por IP: 3 envíos / 10 min (Vercel KV o Upstash si surge necesidad, no v1).

---

## 10. Analytics

### Stack
- **GTM** como capa única.
- **GA4** vía GTM.
- **Meta Pixel** vía GTM.
- **Search Console** verificado por meta tag.

### Eventos custom GA4 (vía GTM)
| Evento | Trigger |
|---|---|
| `service_view` | Visita a `/servicios/[slug]` |
| `project_view` | Visita a `/proyectos/[slug]` |
| `form_submit` | Envío exitoso del form contacto |
| `whatsapp_click` | Click en CTA WhatsApp |
| `service_cta_click` | Click en CTA dentro de página de servicio |

### Privacidad
- Banner consentimiento minimalista (chile no exige GDPR pero LATAM friendly).
- Sin tracking de PII en GA4.
- `Anonymize IP` activado.

---

## 11. Estructura de carpetas

```
lucsan-web/
├── astro.config.mjs              # integrations, i18n, sitemap, vercel adapter
├── keystatic.config.ts           # schemas CMS
├── tailwind.config.ts            # v4 config (CSS-first)
├── tsconfig.json                 # strict
├── package.json
├── public/
│   ├── robots.txt
│   ├── favicon/
│   └── og-default.png
├── src/
│   ├── content/                  # Keystatic data
│   │   ├── services/             # 8 .md
│   │   ├── projects/             # 5-8 .md
│   │   └── pages/                # home.json, about.json, contact.json
│   ├── content.config.ts         # Astro collections + Zod
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   ├── ServiceLayout.astro
│   │   └── ProjectLayout.astro
│   ├── components/
│   │   ├── ui/                   # Button, Card, Section, Container
│   │   ├── marketing/            # Hero, ServicesGrid, CaseStudyCard, CTABlock, MethodBlock, FAQ
│   │   ├── seo/                  # SEO.astro, Schema.astro
│   │   ├── animations/           # GSAPReveal.astro, LenisProvider.astro
│   │   ├── forms/                # ContactForm.tsx (React island)
│   │   └── nav/                  # Navbar.astro, Footer.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── sobre-nosotros.astro
│   │   ├── contacto.astro
│   │   ├── servicios/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── proyectos/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   └── api/
│   │       └── contact.ts
│   ├── lib/
│   │   ├── resend.ts
│   │   ├── turnstile.ts
│   │   ├── seo.ts
│   │   └── i18n.ts
│   ├── styles/
│   │   └── global.css            # Tailwind v4 + tokens
│   └── assets/
│       ├── fonts/                # 3 woff2 (Cabinet 700, Switzer 400, Switzer 600)
│       └── logos/                # SVG marca
└── docs/
    └── superpowers/
        ├── specs/
        └── plans/
```

---

## 12. Tokens de diseño (heredados, validados)

### Paleta completa (Tailwind v4 `@theme`)

**Marca (primarios + accentos):**
```css
--color-brand-black:  #08080c;   /* primario */
--color-brand-coral:  #ff5548;   /* primario */
--color-brand-blue:   #4e47ff;   /* accent */
--color-brand-green:  #47ff93;   /* accent */
--color-brand-yellow: #ffe047;   /* accent */
```

**Neutrales (temperatura azulada-cálida derivada del black de marca):**
```css
--color-neutral-50:  #fafaf7;   /* fondo body por defecto */
--color-neutral-100: #f4f4ef;
--color-neutral-200: #e6e6e1;
--color-neutral-300: #d1d1cc;
--color-neutral-400: #9c9ca0;
--color-neutral-500: #6b6b75;   /* texto secundario */
--color-neutral-600: #4a4a55;
--color-neutral-700: #2e2e38;
--color-neutral-800: #1a1a22;
--color-neutral-900: #08080c;   /* === brand-black */
```

**Estados (UI funcional — form, toasts, validación):**
```css
--color-success:     #2eb86b;
--color-success-bg:  #e7f9ee;
--color-warning:     #d9a000;
--color-warning-bg:  #fdf5d8;
--color-error:       #d63a2d;
--color-error-bg:    #fde6e3;
--color-info:        #3b35d9;
--color-info-bg:     #e6e4ff;
```

**Reglas de uso:**
- `brand-coral` reservado a CTA primario, acentos clave, hover destacado. NO body text sobre fondo claro (contraste insuficiente).
- `brand-green/yellow/blue` solo en métricas, badges, highlights puntuales.
- Estados (`success/error/...`) SOLO en UI funcional, nunca decorativos.

### Tipografía
- **Display:** Cabinet Grotesk 700 — headlines, hero, números.
- **Sans:** Switzer 400 / 600 — body, UI.
- Escala modular `1.25` (major third). Base 16px desktop, 17px mobile.

### Espaciado
- Sistema 4px (Tailwind default).
- Containers: max-w 1280px desktop, padding 24px mobile / 64px desktop.

### Modo oscuro
- **No en v1.** Sitio en light mode con bloques oscuros puntuales (hero, CTA finales). Dark mode global se evalúa post-lanzamiento.

---

## 13. Environment variables

```bash
# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=contacto@lucsandesign.com
RESEND_TO_EMAIL=contacto@lucsandesign.com

# Cloudflare Turnstile
TURNSTILE_SITE_KEY=...
TURNSTILE_SECRET_KEY=...

# Cloudflare R2 (lectura pública para imágenes; escritura solo desde local cuando suba assets manualmente)
PUBLIC_R2_URL=https://media.lucsandesign.com  # custom domain del bucket, opcional

# Analytics
PUBLIC_GTM_ID=GTM-XXXXXXX
```

`PUBLIC_*` se expone al cliente (Astro convention). El resto solo en server.

---

## 14. Definición de "hecho" (v1)

- [ ] 4 páginas estáticas (home, sobre, contacto, servicios listado) en español.
- [ ] 8 páginas de servicio completas con contenido real.
- [ ] 5–8 case studies con contenido real, imágenes optimizadas en R2.
- [ ] Form contacto funcional, llega email a `contacto@lucsandesign.com`.
- [ ] Lighthouse mobile ≥ 90 en Performance, ≥ 95 en SEO/Accesibilidad/Best Practices.
- [ ] LCP < 2.0s en home y página de servicio.
- [ ] Sitemap submitted a Search Console.
- [ ] GTM + GA4 + Meta Pixel + eventos custom funcionando.
- [ ] Schema.org válido en todas las páginas (Rich Results Test pass).
- [ ] WhatsApp CTA funcional.
- [ ] Dominio `lucsandesign.com` apuntando a la nueva build.
- [ ] `prefers-reduced-motion` respetado.
- [ ] Mobile-first verificado en iOS Safari + Android Chrome reales.

---

## 15. Out of scope (post-v1)

- Versión EN.
- Blog / artículos / SEO content marketing.
- Form multi-paso condicional (vendrá embebido desde Lucsan OS).
- Calculadora de cotización.
- Newsletter.
- Dark mode global.
- A/B testing.
- Personalization.
- Cliente portal embedded (vive en Lucsan OS).
