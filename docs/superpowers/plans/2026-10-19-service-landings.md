# Landings de servicio para captar y convertir: plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir Branding, Diseño web y Estrategia en landings que captan leads calificados desde Google y Meta con los formularios de Lucsan OS, y dejar el sitio completo listo para un lanzamiento único.

**Architecture:** Se amplían los esquemas de `services`, `projects` y `pages/sobre`; `src/pages/servicios/[slug].astro` se rehace con componentes de sección en `src/components/landing/`, sin WebGL y sin animaciones que oculten contenido. Todo formulario del sitio es un `LeadForm.astro` con un único punto de cambio (`src/scripts/leadForm.ts`) entre el modo simulado y el embed real de OS; el formulario propio con Resend se retira. Las reglas de copia se vuelven pruebas automáticas (Vitest) sobre el JSON de contenido y el HTML generado en `dist/client`. Los casos se construyen al final: las landings funcionan y se prueban sin ningún caso publicado.

**Tech Stack:** Astro 5, TypeScript strict, Tailwind v4, React islands, GSAP + Lenis, Keystatic, content collections, pnpm 11, Vitest 3 (nuevo).

**Spec:** `docs/superpowers/specs/2026-10-19-service-landings-design.md` (contrato con OS: `docs/superpowers/specs/2026-10-19-lucsan-os-forms-handoff.md`).

## Global Constraints

- Idioma: español neutro con tuteo, sin argentinismos (no "vos", "tenés", "elegí").
- Sin guiones largos (carácter U+2014) en ningún texto del sitio, del contenido ni de este plan.
- Sin precios ni cotizaciones en la web. La única cifra visible es el piso de la pregunta de presupuesto del formulario, que vive en Lucsan OS.
- Sin afirmaciones no verificables: cifras, clientes, logros de terceros. Los casos usan "resultados observables"; sin métricas inventadas ni testimonios.
- Capacidad: "Tomamos un máximo de 3 proyectos a la vez" (texto fijo, sin fechas en el formulario; el próximo cupo vive solo en la web, editable a mano).
- Mercado: todo el mundo hispanohablante. `lang="es"` general, sin versiones por país. H1 sin "en Chile" ni referencias a un solo país; el dólar es la referencia; sin referencias fiscales de un país ("+ IVA").
- SEO local Chile: palabras clave locales en títulos de página y metadescripciones, `ProfessionalService` con Chile como área de servicio, NAP idéntico en todas partes, sin páginas por ciudad.
- Elektroservice excluido: ni nombre ni logo en ningún archivo publicado.
- Servicios visibles: Branding, Diseño web, Estrategia. Gestión de campañas existe con `publicado: false`.
- Todos los formularios del sitio son de Lucsan OS (decidido por Lucio). La web no recibe datos personales: nada de PII en URL, eventos ni almacenamiento del navegador.
- Ningún script de marketing (píxel de Meta o TikTok) carga antes del consentimiento. El aviso de cookies es obligatorio antes del lanzamiento.
- El lanzamiento espera los formularios reales de OS; no hay lanzamiento con respaldo. Las tareas bloqueadas por OS (Tareas 13 a 15) no se saltan: el resto avanza con el formulario simulado. La Tarea 23 exige las Tareas 14 y 15; la 13 (ciclo 1b) no bloquea el lanzamiento, pero sí las campañas de Meta.
- Nada se despliega ni se toca en Vercel salvo en la Tarea 23, con aprobación explícita de Lucio. No se toca el repositorio de Lucsan OS.
- Verificación local: `pnpm build` genera `dist/client/**` y luego falla con `EPERM symlink` dentro de `@astrojs/vercel`; ese error es esperado. Se verifica la generación de páginas. `npx astro check` debe dar 0 errores.
- Tareas de contenido: redacta el agente a partir de los briefs, presentaciones y fotos que Lucio indique (solo extractos revisados y anonimizados); Lucio valida. Cada una termina en una puerta de revisión y la tarea dependiente no empieza sin aprobación explícita.

## Review Focus

1. Si el JS falla o tarda, una landing muestra secciones invisibles (el reveal de `src/scripts/animations.ts` deja `opacity: 0`). Se espera todo visible sin JS. Prueba: Tarea 6, `todas las secciones de las landings llevan data-reveal-skip`.
2. Si el iframe de OS no carga en producción (bloqueador, red, OS caído), la página no tiene forma de convertir. Se espera un respaldo visible con correo. Prueba: Tarea 4 (`mountStrategy`, timeout) y Tarea 6, `cada LeadForm trae un respaldo con mailto`.
3. Un servicio con `publicado: false` (Gestión de campañas) se filtra en nav, footer, sitemap o sectores. Prueba: Tarea 8, `gestion-campanas no aparece en dist ni en el sitemap`.
4. Una landing sin casos publicados muestra una sección vacía, o un enlace interno apunta a un caso no publicado o a una tarjeta sin página. Pruebas: Tarea 6, `sin casos publicados no hay sección de casos` y `todo enlace interno resuelve a una página generada`.
5. Con `UNDER_CONSTRUCTION=true` una ruta nueva queda fuera de la reescritura, o la API de Keystatic queda bloqueada. Prueba: Tarea 2, `isAllowedDuringConstruction`, y Tarea 23, build con la variable activa.
6. (Complementaria) Desborde horizontal a 375 px. Verificación: Tareas 6 y 21, `document.documentElement.scrollWidth <= 375`.

---

## Mapa de archivos

| Archivo | Responsabilidad |
| ------- | --------------- |
| `vitest.config.ts`, `vitest.dist.config.ts` | Pruebas de contenido/unitarias y pruebas sobre `dist/client` |
| `tests/helpers/content.ts`, `tests/helpers/dist.ts` | Carga de JSON de colecciones y lectura de HTML generado |
| `tests/content/known-violations.ts` | Archivos que aún violan reglas; se reduce; vacía al lanzar |
| `tests/content/expected.ts` | Valores fijados por la spec (slugs, alcances, landings listas) |
| `src/lib/construction.ts` | Regla pura de rutas permitidas en modo construcción |
| `src/lib/leadForm.ts`, `src/scripts/leadForm.ts` | Tipos y reglas del formulario; montaje en el navegador (punto de cambio OS) |
| `src/lib/business.ts`, `src/lib/content.ts` | NAP y textos fijos; filtro de publicados |
| `src/lib/consent.ts`, `src/scripts/pixels.ts` | Consentimiento y carga condicionada de píxeles |
| `src/components/forms/{LeadForm,MobileCtaBar}.astro` | Formulario insertado con respaldo; barra fija móvil |
| `src/components/landing/*.astro`, `src/components/projects/ProjectCard.astro` | Secciones de la landing; tarjeta de proyecto |
| `src/components/legal/CookieConsent.astro` | Aviso de cookies |

---

## Fase 0: Base de pruebas

### Tarea 1: Vitest y suite de reglas de copia

Vitest porque comparte Vite con Astro 5 y corre TypeScript sin configuración extra.

**Files:**
- Modify: `package.json` (scripts `test`, `test:dist`; devDependency `vitest`)
- Create: `vitest.config.ts`, `vitest.dist.config.ts`, `tests/helpers/content.ts`, `tests/helpers/dist.ts`, `tests/content/copy-rules.test.ts`, `tests/content/known-violations.ts`, `tests/content/expected.ts`

**Interfaces:**
- Produces:
  - `loadCollection(name: 'services' | 'projects' | 'sectores' | 'pages'): Array<{ file: string; data: any }>`; `publishedServiceSlugs(): string[]`
  - `listCopyFiles(): string[]` (JSON de `src/content/**` más `src/pages/**/*.astro` y `src/components/**/*.astro`, sin `src/pages/style-guide.astro`)
  - `findViolations(text: string): Array<{ rule: CopyRule; match: string }>`, `type CopyRule = 'guion-largo' | 'voseo' | 'precio' | 'iva' | 'elektroservice'`
  - `KNOWN_VIOLATIONS: Record<string, CopyRule[]>`
  - `readPage(route: string): string` (lanza si no existe), `listPages(): string[]`, `listAssets(): string[]` (todo archivo de texto de `dist/client`), `readFile(path: string): string`, `exists(path: string): boolean`, `readSitemap(): string`
  - En `expected.ts`: `LANDING_SLUGS: string[] = []` (Tareas 7, 9 y 10 lo amplían), `MIN_CASOS_POR_LANDING = 0` (la Tarea 17 lo sube a 2)
  - Scripts: `pnpm test` (`tests/content/**`, `tests/unit/**`) y `pnpm test:dist` (`tests/dist/**`, siempre después de `pnpm build`)

- [ ] **Paso 1: Instalar y configurar.** Run: `pnpm add -D vitest@^3`. Dos configuraciones con `environment: 'node'` y los `include` indicados.
- [ ] **Paso 2: Escribir las pruebas de reglas**

```ts
// tests/content/copy-rules.test.ts
describe('findViolations', () => {
  const EM = String.fromCharCode(0x2014);
  it('detecta guion largo', () => expect(rules(`Marca ${EM} web`)).toContain('guion-largo'));
  it.each(['vos', 'tenés', 'querés', 'podés', 'sabés', 'elegí', 'contanos', 'escribinos', 'sumate', 'fijate', 'mirá'])
    ('detecta voseo: %s', (w) => expect(rules(`Si ${w} algo`)).toContain('voseo'));
  it.each(['USD 3.000', 'CLP', 'EUR', '$500', '$ 1.500', 'desde 500', 'desde US$1.500'])
    ('detecta precio: %s', (t) => expect(rules(t)).toContain('precio'));
  it('detecta IVA', () => expect(rules('valor + IVA')).toContain('iva'));
  it('detecta Elektroservice', () => expect(rules('Caso Elektro Service')).toContain('elektroservice'));
  it('no marca texto neutro', () => expect(rules('Tienes una marca que ya no te representa')).toEqual([]));
});
describe('contenido y plantillas', () => {
  it('no hay violaciones fuera de KNOWN_VIOLATIONS', ...);
  it('KNOWN_VIOLATIONS no lista archivos ya limpios', ...);
  it('ningún archivo de public/ ni src/ se llama como Elektroservice', ...);
});
```

Patrones: guion largo `new RegExp(String.fromCharCode(0x2014))`; voseo con límites de palabra sobre la lista anterior más `laburo` y `che`; precio `/\b(USD|CLP|EUR|US\$)\b/`, `/\$\s?\d/`, `/\bdesde\s+(US)?\$?\s?\d/i`; IVA `/\bIVA\b/`; Elektroservice `/elektro\s?service/i`.

- [ ] **Paso 3: Ejecutar y ver fallar.** Run: `pnpm test`. Expected: FAIL en `no hay violaciones fuera de KNOWN_VIOLATIONS`, con al menos `src/content/services/branding.json`, `src/content/services/marketing-publicidad-digital.json` y `src/content/pages/contacto.json`.
- [ ] **Paso 4: Implementar `findViolations` y poblar `KNOWN_VIOLATIONS`** con exactamente lo que reporta la ejecución.
- [ ] **Paso 5: Verificar.** Run: `pnpm test; npx astro check`. Expected: PASS y 0 errors.
- [ ] **Paso 6: Commit.** `git add package.json pnpm-lock.yaml vitest.config.ts vitest.dist.config.ts tests && git commit -m "test: add vitest and copy-rule suite with known-violations baseline"`

### Tarea 2: Regla pura del modo construcción

**Files:**
- Create: `src/lib/construction.ts`, `tests/unit/construction.test.ts`
- Modify: `src/middleware.ts` (usar el helper; sin cambio de comportamiento)

**Interfaces:**
- Produces: `CONSTRUCTION_ALLOWED_PREFIXES: readonly string[]` (`['/en-construccion', '/api', '/keystatic', '/_astro', '/_image']`), `isAllowedDuringConstruction(path: string): boolean`

- [ ] **Paso 1: Escribir la prueba**

```ts
it.each([
  ['/en-construccion', true], ['/api/keystatic', true], ['/keystatic', true], ['/_astro/x.js', true],
  ['/servicios/branding', false], ['/proyectos/sports-medicina-deportiva', false], ['/', false],
  ['/apiary', false], ['/en-construccion-2', false],
])('isAllowedDuringConstruction(%s) = %s', (p, ok) => expect(isAllowedDuringConstruction(p)).toBe(ok));
```

- [ ] **Paso 2: Ejecutar y ver fallar.** Run: `pnpm test construction`. Expected: FAIL, módulo no encontrado.
- [ ] **Paso 3: Implementar** moviendo la lógica de `src/middleware.ts` al helper.
- [ ] **Paso 4: Verificar.** Run: `pnpm test construction; npx astro check`. Expected: PASS y 0 errors.
- [ ] **Paso 5: Commit.** `git commit -m "refactor: extract construction-mode route rule"`

---

## Fase 1: Esquema, plantilla, formulario simulado y Branding

### Tarea 3: Esquemas de `services`, `projects` y `sobre`

**Files:**
- Create: `src/content/schemas.ts` (esquemas zod puros, importables desde Vitest; `reference()` se queda en `content.config.ts`), `tests/content/schema.test.ts`
- Modify: `src/content.config.ts`, `keystatic.config.ts` (campos equivalentes), `src/content/projects/acme-rebrand.json`

**Interfaces:**
- Produces (opcionales en zod; su presencia en las landings la exige la prueba):
  - `services.pruebaRapida?: string` (20 a 140 caracteres), `services.paraQuienNo?: string[]` (2 a 6)
  - `services.consecuencias?: { titulo: string; items: string[] }` (items 2 a 6), `services.beneficios?: { titulo: string; descripcion: string }[]` (3 a 6)
  - `services.variantes?: { titulo: string; descripcion: string; casos: reference('projects')[] }[]` (máx. 4; `casos` default `[]`)
  - `services.capacidad?: { plazoTipico: string; proximoCupo?: string }`, `services.formulario?: { slug: 'branding' | 'diseno-web' | 'estrategia' }`
  - `projects.nivel: 'completo' | 'tarjeta'` (default `'tarjeta'`); `projects.alcance: AlcanceItem[]` (min 1), `type AlcanceItem = 'marca' | 'rebranding' | 'fachada' | 'estrategia-de-marca' | 'estrategia-de-marketing' | 'web' | 'web-ecommerce' | 'agendamiento' | 'plataforma-interna' | 'redes-sociales'`; `projects.caso` opcional con `superRefine`: obligatorio si `nivel === 'completo'`
  - `sobre.formacion?: { lineaCorta: string; detalle: { programa: string; institucion: string; estado: string }[] }`
  - `sobre.charla?: { lugar: string; lineaDuoc: string; extractos: { titulo: string; videoSrc: string; subtitulosSrc: string; autorizado: boolean }[] }`
  - `sobre.metodologia?: { frase: string; referencias: { titulo: string; autor: string }[] }`

- [ ] **Paso 1: Escribir las pruebas**

```ts
describe('servicios con landing', () => {   // itera LANDING_SLUGS; hoy vacío
  it.each(LANDING_SLUGS)('%s tiene pruebaRapida, paraQuienNo, consecuencias, beneficios, capacidad y formulario', ...);
  it.each(LANDING_SLUGS)('%s: formulario.slug coincide con el slug del servicio', ...);
  it.each(LANDING_SLUGS)('%s: hero.headline sin Chile, Santiago ni otro país', (s) => expect(h1(s)).not.toMatch(/Chile|Santiago|Argentina|México|España/));
  it.each(LANDING_SLUGS)('%s: seo.title o seo.description menciona Chile o Santiago', ...);
  it.each(LANDING_SLUGS)('%s: entre MIN_CASOS_POR_LANDING y 3 casosRelacionados, todos existentes y publicados', ...);
});
describe('proyectos', () => {
  it('ningún proyecto tiene métricas ni testimonio', ...);
  it('esquema: un proyecto completo sin caso no valida', ...); // zod sobre un objeto sintético
});
```

- [ ] **Paso 2: Ejecutar y ver fallar.** Run: `pnpm test schema`. Expected: FAIL en `esquema: un proyecto completo sin caso no valida`.
- [ ] **Paso 3: Implementar** en `schemas.ts`, `content.config.ts` y `keystatic.config.ts`. `acme-rebrand.json` recibe `nivel: 'completo'`, `alcance: ['rebranding']` y `metricas: []` para validar hasta la Tarea 18.
- [ ] **Paso 4: Verificar.** Run: `pnpm test; npx astro check; pnpm build`. Expected: PASS, 0 errors, páginas en `dist/client` y solo `EPERM symlink`.
- [ ] **Paso 5: Commit.** `git commit -m "feat(content): landing, project level and authority fields"`

### Tarea 4: Formulario simulado con la interfaz final

**Files:**
- Create: `src/lib/leadForm.ts`, `src/scripts/leadForm.ts`, `src/components/forms/LeadForm.astro`, `src/components/forms/MobileCtaBar.astro`, `tests/unit/leadForm.test.ts`

**Interfaces:**
- Consumes: `getEntry('pages', 'contacto')` para `email`.
- Produces:
  - `type LeadFormSlug = 'diagnostico' | 'branding' | 'diseno-web' | 'estrategia'`; `type LeadFormPosition = 'top' | 'bottom'`; `type LeadFormMode = 'mock' | 'live'`
  - `type DiagnosticoResult = 'branding_nuevo' | 'branding_renovar' | 'estrategia' | 'web'`
  - `LEAD_FORM_EMBED_SRC = 'https://app.lucsandesign.com/embed/v1.js'`, `DESKTOP_MIN_WIDTH = 768`, `LEAD_FORM_READY_TIMEOUT_MS = 8000`
  - `isLeadFormSlug(v: string): v is LeadFormSlug`; `resolveLeadFormMode(raw: string | undefined): LeadFormMode` (solo `'live'` exacto; lee `PUBLIC_LEAD_FORM_MODE`)
  - `mountStrategy(position: LeadFormPosition, viewportWidth: number): 'eager' | 'lazy' | 'skip'`
  - `type LeadAnalyticsEvent = { event: 'lead_form_submitted'; form_slug: LeadFormSlug; form_position?: LeadFormPosition; diagnostico_result?: DiagnosticoResult }`; `toAnalyticsEvent(detail: unknown): LeadAnalyticsEvent | null`
  - `LeadForm.astro` Props: `{ slug: LeadFormSlug; position: LeadFormPosition; anchorId?: string; titulo?: string }`. Raíz `<div data-lead-form data-slug data-position data-mode>` con `<div data-lead-form-fallback>` visible por defecto y `mailto:`.
  - `MobileCtaBar.astro` Props: `{ href: string; label: string }` (bajo 768 px, fija abajo)
  - `src/scripts/leadForm.ts`: `mountMock(el: HTMLElement): void`, `mountLive(el: HTMLElement): void` (comentario `// PUNTO DE CAMBIO OS`; único lugar que conoce los atributos del script de OS), `initLeadForms(): void`

- [ ] **Paso 1: Escribir las pruebas**

```ts
it('mountStrategy', () => {
  expect(mountStrategy('top', 375)).toBe('skip');
  expect(mountStrategy('top', 768)).toBe('eager');
  expect(mountStrategy('top', 1280)).toBe('eager');
  expect(mountStrategy('bottom', 375)).toBe('lazy');
  expect(mountStrategy('bottom', 1280)).toBe('lazy');
});
it('resolveLeadFormMode', () => {
  expect(resolveLeadFormMode(undefined)).toBe('mock');
  expect(resolveLeadFormMode('LIVE')).toBe('mock');
  expect(resolveLeadFormMode('live')).toBe('live');
});
it('toAnalyticsEvent descarta cualquier dato que no sea slug, posición o resultado', () => {
  expect(toAnalyticsEvent({ slug: 'branding', position: 'top', email: 'a@b.cl', name: 'X' }))
    .toEqual({ event: 'lead_form_submitted', form_slug: 'branding', form_position: 'top' });
  expect(toAnalyticsEvent({ slug: 'otro' })).toBeNull();
  expect(toAnalyticsEvent({ slug: 'diagnostico', result: 'web' })?.diagnostico_result).toBe('web');
  expect(toAnalyticsEvent({ slug: 'diagnostico', result: 'a@b.cl' })?.diagnostico_result).toBeUndefined();
  expect(toAnalyticsEvent('x')).toBeNull();
});
```

- [ ] **Paso 2: Ejecutar y ver fallar.** Run: `pnpm test leadForm`. Expected: FAIL, módulo no encontrado.
- [ ] **Paso 3: Implementar `src/lib/leadForm.ts`.**
- [ ] **Paso 4: Implementar componentes y script.** `mock`: vista previa estática de los pasos del handoff 3.2 con campos deshabilitados y la etiqueta "Vista previa del formulario"; respaldo visible. `live`: inyecta `LEAD_FORM_EMBED_SRC` con slug y `data-position`; oculta el respaldo con el `load` del iframe; sin `load` en `LEAD_FORM_READY_TIMEOUT_MS`, el respaldo sigue visible. `lazy` usa `IntersectionObserver` con `rootMargin: '600px'`. `initLeadForms` escucha `lucsan:form-submitted`, aplica `toAnalyticsEvent` y hace `dataLayer.push` solo si no es `null`. Nada en `localStorage` ni en la URL. Texto del respaldo: "Si el formulario no carga, escríbenos a {email}."
- [ ] **Paso 5: Verificar.** Run: `pnpm test; npx astro check`. Expected: PASS y 0 errors.
- [ ] **Paso 6: Commit.** `git commit -m "feat(forms): LeadForm with mock mode, fallback and OS swap point"`

### Tarea 5: Datos del estudio y `ProfessionalService`

**Files:**
- Create: `src/lib/business.ts`, `tests/unit/seo.test.ts`
- Modify: `src/lib/seo.ts`

**Interfaces:**
- Produces:
  - `type Business = { name: string; url: string; locality: string; region: string; country: 'CL'; telephone: string | null; streetAddress: string | null; sameAs: string[] }`
  - `BUSINESS: Business` (`'Lucsan Design'`, `'https://lucsandesign.com'`, `'Santiago'`, `'Región Metropolitana'`, `'CL'`; `telephone` y `streetAddress` en `null` hasta la Tarea 22)
  - `CAPACIDAD_TEXTO = 'Tomamos un máximo de 3 proyectos a la vez'`
  - `professionalServiceSchema(b: Business): Record<string, unknown>` en `seo.ts`

- [ ] **Paso 1: Escribir las pruebas**

```ts
it('tipo y área de servicio', () => {
  const s: any = professionalServiceSchema(BUSINESS);
  expect(s['@type']).toBe('ProfessionalService');
  expect(s.areaServed).toContainEqual({ '@type': 'Country', name: 'Chile' });
});
it('sin dirección pública solo publica ciudad, región y país', () => {
  const s: any = professionalServiceSchema({ ...BUSINESS, streetAddress: null, telephone: null });
  expect(s.address).toEqual({ '@type': 'PostalAddress', addressLocality: 'Santiago', addressRegion: 'Región Metropolitana', addressCountry: 'CL' });
  expect(s).not.toHaveProperty('telephone');
});
it('con dirección la incluye', () => expect((professionalServiceSchema({ ...BUSINESS, streetAddress: 'Calle 1' }) as any).address.streetAddress).toBe('Calle 1'));
it('CAPACIDAD_TEXTO coincide con el texto fijo de OS', () => expect(CAPACIDAD_TEXTO).toBe('Tomamos un máximo de 3 proyectos a la vez'));
```

- [ ] **Paso 2: Ejecutar y ver fallar.** Run: `pnpm test seo`. Expected: FAIL.
- [ ] **Paso 3: Implementar.**
- [ ] **Paso 4: Verificar.** Run: `pnpm test seo`. Expected: PASS.
- [ ] **Paso 5: Commit.** `git commit -m "feat(seo): ProfessionalService schema with Chile service area"`

### Tarea 6: Plantilla de landing

**Files:**
- Create: `src/components/landing/{LandingHero,ProblemaSection,CostoSection,BeneficiosSection,AlcanceSection,MetodoSection,CasosSection,ConfianzaSection,ObjecionesSection,FormularioFinal,OtrosServicios}.astro`, `src/components/projects/ProjectCard.astro`, `src/lib/content.ts`, `tests/unit/content.test.ts`, `tests/dist/landings.test.ts`, `tests/dist/links.test.ts`
- Modify: `src/pages/servicios/[slug].astro` (reescritura completa)

**Interfaces:**
- Consumes: Tarea 3 (campos), Tarea 4 (`LeadForm`, `MobileCtaBar`, `isLeadFormSlug`), Tarea 5 (`professionalServiceSchema`, `BUSINESS`, `CAPACIDAD_TEXTO`), `serviceSchema`, `faqSchema`, `breadcrumbSchema` de `seo.ts`, `publishedServiceSlugs` (Tarea 1).
- Produces:
  - `onlyPublished<T extends { data: { publicado: boolean } }>(entries: T[]): T[]` en `src/lib/content.ts`
  - `ProjectCard.astro` Props: `{ project: CollectionEntry<'projects'> }`; enlaza a `/proyectos/{slug}` solo si `nivel === 'completo'`
  - `CasosSection.astro` Props: `{ casos: CollectionEntry<'projects'>[] }`; con lista vacía no renderiza nada (ni `<section>` ni título); con casos, raíz `<section data-section="casos" data-reveal-skip>`
  - `ConfianzaSection.astro` Props: `{ capacidad?: { plazoTipico: string; proximoCupo?: string }; sobre: Extract<CollectionEntry<'pages'>['data'], { tipo: 'sobre' }> }`; muestra `CAPACIDAD_TEXTO`, plazo y próximo cupo si existen, `formacion.lineaCorta` si existe, `charla.lineaDuoc` si existe y solo extractos con `autorizado: true`
  - Ancla del formulario final: `id="formulario"`

Orden (spec, "Estructura de la landing"): hero con `LeadForm position="top"` (escritorio), botón "Completar el formulario" a `#formulario` (móvil) y `pruebaRapida`; problema con síntomas, `paraQuien` y `paraQuienNo`; costo (`consecuencias`); beneficios y `variantes`; alcance y entregables; método con `sobre.metodologia.frase`; casos; confianza; objeciones (FAQ); `FormularioFinal` con `LeadForm position="bottom"`; enlaces a las otras landings publicadas; `MobileCtaBar href="#formulario"`. `slug` del `LeadForm`: `formulario.slug`, o el del servicio si `isLeadFormSlug` lo acepta. Toda `<section>` lleva `data-reveal-skip`. Sin `HeroFluid` ni `<canvas>`. Secciones sin datos no se renderizan. JSON-LD: `serviceSchema`, `faqSchema`, `breadcrumbSchema`, `professionalServiceSchema`.

- [ ] **Paso 1: Escribir las pruebas**

```ts
// tests/unit/content.test.ts
it('onlyPublished', () => expect(onlyPublished([{ data: { publicado: true } }, { data: { publicado: false } }])).toHaveLength(1));

// tests/dist/landings.test.ts  (S = publishedServiceSlugs())
it.each(S)('%s: sin canvas ni HeroFluid', (s) => expect(readPage(`servicios/${s}`)).not.toMatch(/<canvas/));
it.each(S)('%s: todas las secciones de las landings llevan data-reveal-skip', (s) => {
  const html = readPage(`servicios/${s}`);
  expect(count(html, /<section\b/g)).toBe(count(html, /<section\b[^>]*data-reveal-skip/g));
});
it.each(S)('%s: dos LeadForm (top y bottom) y ancla #formulario', ...);
it.each(S)('%s: cada LeadForm trae un respaldo con mailto', (s) => expect(fallbacks(readPage(`servicios/${s}`)).every((f) => /href="mailto:/.test(f))).toBe(true));
it.each(S)('%s: sin casos publicados no hay sección de casos', (s) => {
  if (publishedCasesOf(s).length > 0) return;   // helper: casosRelacionados del JSON filtrados por publicado
  const html = readPage(`servicios/${s}`);
  expect(html).not.toContain('data-section="casos"');
  expect(html).not.toMatch(/href="\/proyectos\//);
});
it.each(S)('%s: JSON-LD incluye ProfessionalService, Service y FAQPage', ...);
it.each(S)('%s: un solo h1', ...);

// tests/dist/links.test.ts
it('todo enlace interno resuelve a una página generada', ...); // href="/..." sin query ni hash; ignora /api, /keystatic, /_astro y rutas con extensión
it('ningún HTML menciona Elektroservice', ...);
```

- [ ] **Paso 2: Ejecutar y ver fallar.** Run: `pnpm build; pnpm test:dist`. Expected: FAIL en `sin canvas ni HeroFluid` y `data-reveal-skip`.
- [ ] **Paso 3: Implementar `onlyPublished`** y aplicarlo a `casosRelacionados` y `variantes[].casos` antes de renderizar.
- [ ] **Paso 4: Implementar las secciones y reescribir `[slug].astro`** reutilizando `Section`, `Container`, `Eyebrow`, `Heading`, `Prose`, `Button`, `Card`, `MediaSlot`, `MotionFAQ`.
- [ ] **Paso 5: Verificar.** Run: `pnpm test; pnpm build; pnpm test:dist`. Expected: PASS (solo `EPERM symlink`).
- [ ] **Paso 6: Revisión a 375 px.** `pnpm dev`, viewport 375x812, `/servicios/branding` con JS activo y desactivado. Expected: `document.documentElement.scrollWidth <= 375`; texto visible sin JS; botón y barra llevan a `#formulario`.
- [ ] **Paso 7: Verificar el modo construcción.** Run (bash): `UNDER_CONSTRUCTION=true pnpm build`. Expected: `dist/client/servicios/branding/index.html` muestra `/en-construccion`. Reconstruir sin la variable.
- [ ] **Paso 8: Commit.** `git commit -m "feat(landing): conversion template without WebGL, two form slots, local SEO"`

### Tarea 7: Contenido de la landing de Branding

**Files:**
- Modify: `src/content/services/branding.json` (`casosRelacionados: []` hasta la Tarea 17), `tests/content/known-violations.ts`, `tests/content/expected.ts` (`LANDING_SLUGS` agrega `branding`)

**Interfaces:**
- Consumes: Tareas 3 y 6.

Contenido: titular desde el problema real del cliente (nunca "ofrecemos servicios profesionales de..."); `variantes` con la sección de rebranding (sin casos hasta la Tarea 17); papelería solo como mención dentro de aplicaciones; FAQ sobre plazos, proceso y qué pasa si el proyecto no encaja, sin precios; `capacidad.plazoTipico` acorde a "proyectos de hasta 2 meses"; `seo.title` local, por ejemplo "Agencia de branding en Santiago, Chile | Lucsan Design" (máx. 70); `keyword` propuesta a Lucio. Fuente: briefs y presentaciones que Lucio indique.

- [ ] **Paso 1: Agregar `branding` a `LANDING_SLUGS` y quitarlo de `KNOWN_VIOLATIONS`.** Run: `pnpm test`. Expected: FAIL.
- [ ] **Paso 2: Redactar** el JSON.
- [ ] **Paso 3: Verificar.** Run: `pnpm test; pnpm build; pnpm test:dist`. Expected: PASS, incluido `sin casos publicados no hay sección de casos`.
- [ ] **Paso 4: Puerta de revisión de Lucio.** Texto completo y URL local. Detenerse hasta aprobación explícita.
- [ ] **Paso 5: Commit.** `git commit -m "content(branding): conversion landing copy"`

---

## Fase 2: Diseño web, Estrategia y reorganización

### Tarea 8: De 4 servicios visibles a 3 más uno oculto

**Files:**
- Create: `src/content/services/estrategia.json` (`publicado: false` hasta la Tarea 10), `src/content/services/gestion-campanas.json` (desde `marketing-publicidad-digital.json`, `publicado: false`), `tests/content/services.test.ts`, `tests/dist/hidden-service.test.ts`
- Delete: `src/content/services/asesoria-consultoria.json`, `src/content/services/marketing-publicidad-digital.json`
- Modify: `src/content/sectores/*.json` (referencias a `estrategia`; ninguna a `gestion-campanas`), `src/content/pages/home.json`, `src/components/nav/Footer.astro` (servicios desde `getCollection('services', (s) => s.data.publicado)`), `src/components/forms/ContactFormAstro.astro` (opciones de servicio; se retira en la Tarea 14), `src/pages/index.astro`, `src/pages/servicios/index.astro`, `src/pages/sectores/[slug].astro` (`onlyPublished` sobre `serviciosAplicables` y `casosRelacionados`), `tests/content/known-violations.ts`

**Interfaces:**
- Consumes: `onlyPublished` (Tarea 6).
- Produces: slugs definitivos `branding`, `diseno-web`, `estrategia`, `gestion-campanas`. Sin redirecciones: las rutas antiguas nunca fueron públicas.

- [ ] **Paso 1: Escribir las pruebas**

```ts
it('existen exactamente branding, diseno-web, estrategia y gestion-campanas', ...);
it('gestion-campanas tiene publicado false', ...);
it('ningún archivo de src/ menciona asesoria-consultoria ni marketing-publicidad-digital', ...);
it('ningún sector, proyecto ni página referencia gestion-campanas', ...);
// tests/dist/hidden-service.test.ts
it('gestion-campanas no aparece en dist ni en el sitemap', () => {
  expect(listPages().some((p) => readFile(p).includes('gestion-campanas'))).toBe(false);
  expect(readSitemap()).not.toContain('gestion-campanas');
  expect(exists('dist/client/servicios/gestion-campanas/index.html')).toBe(false);
});
it('el footer enlaza solo servicios publicados', ...);
```

- [ ] **Paso 2: Ejecutar y ver fallar.** Run: `pnpm test services`. Expected: FAIL.
- [ ] **Paso 3: Implementar** los cambios listados.
- [ ] **Paso 4: Verificar.** Run: `pnpm test; npx astro check; pnpm build; pnpm test:dist`. Expected: PASS y 0 errors.
- [ ] **Paso 5: Commit.** `git commit -m "refactor(services): merge into Estrategia, hide Gestion de campanas"`

### Tarea 9: Contenido de la landing de Diseño web

**Files:**
- Modify: `src/content/services/diseno-web.json` (`casosRelacionados: []` hasta la Tarea 17), `tests/content/expected.ts` (`LANDING_SLUGS` agrega `diseno-web`), `tests/content/known-violations.ts`

Contenido: `variantes` landing, web corporativa o informativa, tienda online y rediseño de un sitio existente, sin cifras ni casos; `formulario.slug: 'diseno-web'`; `seo.title` local.

- [ ] **Paso 1: Agregar `diseno-web` a `LANDING_SLUGS`.** Run: `pnpm test`. Expected: FAIL.
- [ ] **Paso 2: Redactar** a partir de los briefs indicados por Lucio.
- [ ] **Paso 3: Verificar.** Run: `pnpm test; pnpm build; pnpm test:dist`. Expected: PASS.
- [ ] **Paso 4: Puerta de revisión de Lucio.** Detenerse hasta aprobación explícita.
- [ ] **Paso 5: Commit.** `git commit -m "content(diseno-web): conversion landing copy"`

### Tarea 10: Contenido de la landing de Estrategia

**Files:**
- Modify: `src/content/services/estrategia.json` (`publicado: true`, `casosRelacionados: []`), `tests/content/expected.ts` (`LANDING_SLUGS` agrega `estrategia`)

Contenido: estrategia de marca y de marketing, diagnóstico de la marca actual, acompañamiento estratégico; sin campañas pagadas como servicio.

- [ ] **Paso 1: Agregar `estrategia` a `LANDING_SLUGS`.** Run: `pnpm test`. Expected: FAIL.
- [ ] **Paso 2: Redactar.**
- [ ] **Paso 3: Verificar.** Run: `pnpm test; pnpm build; pnpm test:dist`. Expected: PASS.
- [ ] **Paso 4: Puerta de revisión de Lucio.** Detenerse hasta aprobación explícita.
- [ ] **Paso 5: Commit.** `git commit -m "content(estrategia): conversion landing copy"`

---

## Fase 3: Sobre nosotros

### Tarea 11: Sobre nosotros con autoridad

**Files:**
- Modify: `src/content/pages/sobre.json`, `src/pages/sobre-nosotros.astro`, `tests/content/schema.test.ts`, `tests/dist/landings.test.ts`

**Interfaces:**
- Consumes: `sobre.formacion`, `sobre.charla`, `sobre.metodologia` (Tarea 3); `ConfianzaSection` (Tarea 6) ya los lee.

Contenido: `formacion.lineaCorta` "Formación en diseño y branding en Chile y España"; `detalle` con el magíster (LABASAD, Escuela Superior de Arte y Diseño de Barcelona) y el diplomado de la UDD como terminados, con programa y año solo si Lucio los entrega; `charla.lineaDuoc` "Charlas y talleres en programas de Duoc UC Viña del Mar y Valparaíso", sin logo de Duoc; extractos de 30 a 60 s con subtítulos y `autorizado: false` hasta el permiso de Duoc UC y de quienes aparecen; el taller online no se usa; `metodologia.frase` simple (propuesta: "Metodologías de branding probadas en Chile y el mundo, aplicadas a negocios de todos los tamaños"), autores solo aquí, sin insinuar relación con clientes de terceros. Menciones naturales de Santiago, Chile y la región de Valparaíso.

- [ ] **Paso 1: Escribir las pruebas**

```ts
it('formacion.lineaCorta es la de la spec', () => expect(sobre.formacion.lineaCorta).toBe('Formación en diseño y branding en Chile y España'));
it('charla.lineaDuoc es la de la spec', () => expect(sobre.charla.lineaDuoc).toBe('Charlas y talleres en programas de Duoc UC Viña del Mar y Valparaíso'));
// dist
it('ningún extracto no autorizado se publica', ...);
it('no hay logo de Duoc UC en dist', () => expect(listPages().some((p) => /duoc[^"]*\.(svg|png|webp)/i.test(readFile(p)))).toBe(false));
```

- [ ] **Paso 2: Ejecutar y ver fallar.** Run: `pnpm test schema`. Expected: FAIL.
- [ ] **Paso 3: Redactar `sobre.json` y renderizar** formación, charla (video solo con extractos autorizados; si no, solo la línea de Duoc) y metodología.
- [ ] **Paso 4: Verificar.** Run: `pnpm test; pnpm build; pnpm test:dist`. Expected: PASS.
- [ ] **Paso 5: Puerta de revisión de Lucio.** Confirmar si la formación se muestra (la spec registra su duda). Detenerse hasta aprobación explícita.
- [ ] **Paso 6: Commit.** `git commit -m "content(sobre): education, talk and methodology"`

---

## Fase 5 (spec): Consentimiento y píxeles

### Tarea 12: Aviso de cookies, Consent Mode y consentimiento para Meta y TikTok

Obligatoria antes del lanzamiento. No depende de OS.

**Files:**
- Create: `src/lib/consent.ts`, `src/components/legal/CookieConsent.astro`, `src/scripts/pixels.ts`, `tests/unit/consent.test.ts`, `tests/dist/consent.test.ts`
- Modify: `src/components/analytics/Analytics.astro` (Consent Mode denegado por defecto antes de GTM; se elimina la carga incondicional del píxel por `PUBLIC_META_PIXEL_ID`), `src/layouts/BaseLayout.astro`, `src/pages/legal/cookies.astro`, `src/pages/legal/privacidad.astro`, `.env.example` (`PUBLIC_META_PIXEL_ID`, `PUBLIC_TIKTOK_PIXEL_ID`, `PUBLIC_META_DOMAIN_VERIFICATION`)

**Interfaces:**
- Produces:
  - `type ConsentState = { version: 1; analytics: boolean; marketing: boolean; decidedAt: string }`
  - `CONSENT_STORAGE_KEY = 'lucsan-consent-v1'` (decisión recordada en `localStorage`; no es PII)
  - `parseConsent(raw: string | null): ConsentState | null`
  - `toGtagConsent(s: ConsentState | null): { analytics_storage: 'granted' | 'denied'; ad_storage: 'granted' | 'denied'; ad_user_data: 'granted' | 'denied'; ad_personalization: 'granted' | 'denied' }`
  - `shouldLoadPixels(s: ConsentState | null, ids: { meta?: string; tiktok?: string }): { meta: boolean; tiktok: boolean }`
  - Evento de ventana `lucsan:consent-changed` con `ConsentState`; enlace "Configurar cookies" en el footer que reabre el aviso

- [ ] **Paso 1: Escribir las pruebas**

```ts
it('sin decisión todo denegado', () => expect(Object.values(toGtagConsent(null))).toEqual(['denied', 'denied', 'denied', 'denied']));
it('JSON inválido o versión distinta da null', () => { expect(parseConsent('x')).toBeNull(); expect(parseConsent('{"version":2}')).toBeNull(); });
it('analytics sin marketing solo concede analytics_storage', ...);
it('marketing concede ad_storage, ad_user_data y ad_personalization', ...);
it('sin marketing no carga ningún píxel', () => expect(shouldLoadPixels({ version: 1, analytics: true, marketing: false, decidedAt: 'x' }, { meta: '1', tiktok: '2' })).toEqual({ meta: false, tiktok: false }));
it('con marketing y sin ID no carga ese píxel', () => expect(shouldLoadPixels({ version: 1, analytics: false, marketing: true, decidedAt: 'x' }, { meta: '1' })).toEqual({ meta: true, tiktok: false }));
// dist
it('consent default aparece antes del script de GTM', ...);
it('ningún archivo de dist/client carga fbq( ni ttq. fuera de pixels.ts', ...); // listAssets()
it('el aviso tiene Aceptar, Rechazar y Configurar, con analytics y marketing', ...);
it('Aceptar y Rechazar usan la misma clase de botón', ...);
```

- [ ] **Paso 2: Ejecutar y ver fallar.** Run: `pnpm test consent`. Expected: FAIL.
- [ ] **Paso 3: Implementar.** El aviso pide consentimiento por categoría (analítica; marketing, que nombra Meta y TikTok) y lo recuerda. `pixels.ts` carga los píxeles base solo si `shouldLoadPixels` lo permite, al iniciar y con `lucsan:consent-changed`. Meta `facebook-domain-verification` desde `PUBLIC_META_DOMAIN_VERIFICATION`. Las páginas legales describen las categorías y dicen que el aviso de privacidad de los datos del lead vive en el formulario de OS.
- [ ] **Paso 4: Verificar.** Run: `pnpm test; pnpm build; pnpm test:dist`. Expected: PASS. En navegador: sin decidir o rechazando, ninguna petición a `facebook.com`, `facebook.net` ni `tiktok.com`; al aceptar marketing, cargan; al recargar, la decisión se respeta.
- [ ] **Paso 5: Commit.** `git commit -m "feat(consent): cookie banner, Consent Mode and consent-gated pixels"`

### Tarea 13: Evento `Lead` deduplicado con la API de conversiones (BLOQUEADA hasta OS ciclo 1b)

No se salta. Mientras OS no cierre 1b, seguir con la Tarea 16 y volver aquí.

**Files:**
- Create: `tests/unit/pixels.test.ts`
- Modify: `src/lib/leadForm.ts` (`LeadAnalyticsEvent` suma `event_id?: string`, identificador no sensible definido por OS), `src/scripts/pixels.ts` (`trackLead`), `src/scripts/leadForm.ts` (reenvía el evento)

**Interfaces:**
- Consumes: `ConsentState`, `shouldLoadPixels` (Tarea 12); `LeadAnalyticsEvent` (Tarea 4).
- Produces: `trackLead(e: LeadAnalyticsEvent, s: ConsentState | null): void`

- [ ] **Paso 1: Confirmar con Lucio que OS cerró 1b** y el formato del `event_id`.
- [ ] **Paso 2: Escribir las pruebas.** `trackLead no envía nada sin marketing`; `toAnalyticsEvent conserva event_id y sigue descartando email`. Run: `pnpm test pixels`. Expected: FAIL.
- [ ] **Paso 3: Implementar.** `Lead` con el `event_id` de OS, solo con `marketing: true`. Las UTM, `gclid` y `fbclid` llegan intactas.
- [ ] **Paso 4: Verificar.** Run: `pnpm test`. Expected: PASS. En navegador, con marketing aceptado, un envío de prueba produce un `Lead` con `event_id`.
- [ ] **Paso 5: Commit.** `git commit -m "feat(ads): Lead event deduplicated with OS conversions API"`

---

## Fase 4 (spec): Formularios reales de Lucsan OS (BLOQUEADA hasta que OS publique)

Dependencia: OS publica `embed/v1.js` con los puntos 5 y 8 del handoff y los formularios `branding`, `diseno-web`, `estrategia`; después `diagnostico` con los puntos 1 a 4. Estas tareas no se saltan: mientras OS no publique, seguir con la Tarea 16 y volver.

### Tarea 14: Conectar el embed real y retirar el formulario propio

**Files:**
- Modify: `src/scripts/leadForm.ts` (solo `mountLive`), `src/pages/contacto.astro` (`LeadForm slug="diagnostico" position="bottom"` más correo y WhatsApp visibles), `.env.example` (`PUBLIC_LEAD_FORM_MODE=live`; quitar variables de Resend), `tests/unit/leadForm.test.ts`
- Delete: `src/pages/api/contact.ts`, `src/components/forms/ContactForm.tsx`, `src/components/forms/ContactFormAstro.astro`, `src/lib/resend.ts` y `src/lib/turnstile.ts` si nada más los importa
- Create: `tests/dist/no-own-form.test.ts`

**Interfaces:**
- Consumes: documentación del embed de OS (atributos, ajuste de altura, `lucsan:form-submitted`).
- Produces: sin cambios en `LeadForm` Props ni en `toAnalyticsEvent`.

- [ ] **Paso 1: Confirmar con Lucio que OS publicó el embed** y leer su documentación. Si un atributo difiere de `data-position` o del slug, ajustar solo `mountLive`.
- [ ] **Paso 2: Verificar quién llama a `/api/contact`.** Run: `git grep -n "api/contact"`. Expected hoy: solo `ContactForm.tsx`, `ContactFormAstro.astro` y la propia ruta. Si aparece otro llamador, migrarlo a `LeadForm` antes de borrar.
- [ ] **Paso 3: Escribir las pruebas.** Detalle real de OS pasando por `toAnalyticsEvent`; y en `no-own-form.test.ts`:

```ts
it('ninguna página ni script envía a /api/contact', () => expect(listAssets().some((f) => readFile(f).includes('/api/contact'))).toBe(false));
it('la ruta propia ya no existe', () => expect(exists('src/pages/api/contact.ts')).toBe(false));
it('ninguna página tiene un <form> propio con campo email', () => expect(listPages().some((p) => /<form\b[\s\S]*?type="email"/.test(readFile(p)))).toBe(false));
it('contacto tiene un LeadForm', () => expect(readPage('contacto')).toContain('data-lead-form'));
```

Run: `pnpm build; pnpm test:dist`. Expected: FAIL.
- [ ] **Paso 4: Implementar** `mountLive` real, el cambio en `/contacto` y los borrados.
- [ ] **Paso 5: Verificar.** Run: `pnpm test; npx astro check; PUBLIC_LEAD_FORM_MODE=live pnpm build; pnpm test:dist`. Expected: PASS y 0 errors. En navegador (escritorio 1280 px): dos iframes por landing; un envío crea un solo lead en OS (lo confirma Lucio) y no dispara el otro. Móvil 375 px: un iframe, cargado al acercarse al final. Bloqueando `app.lucsandesign.com`: el respaldo queda visible. Ningún dato personal en URL ni `dataLayer`.
- [ ] **Paso 6: Commit.** `git commit -m "feat(forms): wire Lucsan OS embed and retire own contact form"`

### Tarea 15: Diagnóstico en la home y en Servicios

**Files:**
- Modify: `src/pages/index.astro`, `src/pages/servicios/index.astro`, `tests/dist/landings.test.ts`

- [ ] **Paso 1: Confirmar con Lucio que OS publicó `diagnostico`** con los puntos 1 a 4.
- [ ] **Paso 2: Escribir las pruebas.** `index y servicios tienen un LeadForm diagnostico`; `ninguna landing tiene LeadForm diagnostico`. Run: `pnpm build; pnpm test:dist`. Expected: FAIL.
- [ ] **Paso 3: Implementar** las inserciones.
- [ ] **Paso 4: Verificar.** Run: `pnpm test; pnpm build; pnpm test:dist`. Expected: PASS. En navegador (modo `live`): "Continuar con el formulario de {servicio}" navega dentro del mismo iframe sin pedir de nuevo nombre ni correo; la orientación no muestra cifras.
- [ ] **Paso 5: Commit.** `git commit -m "feat(forms): diagnostic on home and services index"`

---

## Fase 3 (spec): Casos

Se construyen al final. Las landings ya funcionan sin casos; aquí se enlazan.

### Tarea 16: Caso Sports completo y las 8 tarjetas

**Files:**
- Create: `src/content/projects/{sports-medicina-deportiva,halvory,tekhome,marca-center,ibiro,keenduck,celeress,roberto-bello,beastlab}.json`, `public/proyectos/<slug>/{cover,thumbnail}.webp` (más la galería de Sports), `tests/content/projects.test.ts`
- Modify: `src/pages/proyectos/[slug].astro` (`getStaticPaths` filtra `publicado && nivel === 'completo'`; secciones con `data-reveal-skip`; el hero `ZoomParallax` muestra la imagen sin JS), `src/pages/proyectos/index.astro` (usa `ProjectCard`), `tests/content/expected.ts`

**Interfaces:**
- Consumes: `ProjectCard` (Tarea 6), esquema (Tarea 3), slugs de servicio (Tarea 8).
- Produces en `expected.ts`: `FULL_CASES = ['sports-medicina-deportiva', 'ulen-patagonia', 'impulso-salud']`, `CARD_CASES = ['halvory', 'tekhome', 'marca-center', 'ibiro', 'keenduck', 'celeress', 'roberto-bello', 'beastlab']`, `EXPECTED_ALCANCE: Record<string, AlcanceItem[]>`.

Fuente: briefs, manuales, fotos y presentaciones que Lucio indique. Redacta el agente; "decisiones" va en `caso.enfoque` y "qué cambió" en `caso.resultado.narrativa`; `metricas: []`, sin `testimonio`. `serviciosAplicados` solo con servicios publicados (Tekhome: `diseno-web`, nunca `gestion-campanas`).

- [ ] **Paso 1: Pedir insumos a Lucio.** Rutas de material y sector de cada proyecto (lista de 20 del esquema). Detenerse hasta tenerlos.
- [ ] **Paso 2: Escribir las pruebas**

```ts
const EXPECTED_ALCANCE = {
  'halvory': ['marca', 'web'], 'tekhome': ['web', 'redes-sociales'], 'marca-center': ['marca', 'web'],
  'ibiro': ['marca'], 'keenduck': ['marca', 'estrategia-de-marca'], 'impulso-salud': ['marca', 'web', 'estrategia-de-marketing'],
  'beastlab': ['web-ecommerce'], 'celeress': ['marca'], 'roberto-bello': ['marca', 'estrategia-de-marca'],
  'ulen-patagonia': ['marca', 'estrategia-de-marca', 'estrategia-de-marketing', 'web'],
  'sports-medicina-deportiva': ['rebranding', 'fachada', 'estrategia-de-marca', 'estrategia-de-marketing', 'web', 'agendamiento', 'plataforma-interna'],
};
it.each(CARD_CASES)('%s es tarjeta publicada con el alcance de la spec', ...);
it('sports-medicina-deportiva es completo con el alcance de la spec', ...);
it('imágenes de proyectos existen en public/ y ninguna es de Unsplash (salvo acme-rebrand hasta la Tarea 18)', ...);
it('ningún proyecto referencia gestion-campanas', ...);
```

- [ ] **Paso 3: Ejecutar y ver fallar.** Run: `pnpm test projects`. Expected: FAIL.
- [ ] **Paso 4: Redactar los JSON y adaptar las páginas de proyectos.**
- [ ] **Paso 5: Verificar.** Run: `pnpm test; npx astro check; pnpm build; pnpm test:dist`. Expected: PASS y 0 errors; `dist/client/proyectos/halvory` no existe y `dist/client/proyectos/sports-medicina-deportiva/index.html` sí.
- [ ] **Paso 6: Puerta de revisión de Lucio.** Texto de Sports y las 8 líneas de tarjeta. Detenerse hasta aprobación explícita.
- [ ] **Paso 7: Commit.** `git commit -m "content(projects): Sports full case and 8 light cards"`

### Tarea 17: Casos Ulen Patagonia e Impulso Salud, y enlace de casos en las landings

**Files:**
- Create: `src/content/projects/{ulen-patagonia,impulso-salud}.json`, `public/proyectos/{ulen-patagonia,impulso-salud}/*`
- Modify: `src/content/services/{branding,diseno-web,estrategia}.json` (`casosRelacionados` de 2 a 3 y `variantes[].casos`: rebranding con Sports; tienda con Beastlab), `src/content/sectores/*.json` (`casosRelacionados` donde corresponda), `tests/content/expected.ts` (`MIN_CASOS_POR_LANDING = 2`), `tests/content/projects.test.ts`

- [ ] **Paso 1: Escribir las pruebas.** `exactamente FULL_CASES tienen nivel completo` (sin `acme-rebrand`, que se retira en la Tarea 18) y subir `MIN_CASOS_POR_LANDING` a 2. Run: `pnpm test`. Expected: FAIL.
- [ ] **Paso 2: Redactar** ambos casos desde briefs y presentaciones (extractos anonimizados) y proponer los casos de cada landing según alcance.
- [ ] **Paso 3: Verificar.** Run: `pnpm test; pnpm build; pnpm test:dist`. Expected: PASS; cada landing muestra `data-section="casos"` y `todo enlace interno resuelve`.
- [ ] **Paso 4: Puerta de revisión de Lucio.** Casos y asignación por landing. Detenerse hasta aprobación explícita.
- [ ] **Paso 5: Commit.** `git commit -m "content(projects): Ulen and Impulso full cases, link cases to landings"`

### Tarea 18: Retirar datos de ejemplo y cerrar violaciones conocidas

**Files:**
- Delete: `src/content/projects/acme-rebrand.json`
- Modify: `src/content/pages/home.json` (sin `acme-rebrand`), `src/content/pages/contacto.json` (sin montos en `rangosPresupuesto` ni "+ IVA"), `src/pages/proyectos/[slug].astro` y `src/pages/index.astro` (sin URLs de Unsplash), `tests/content/known-violations.ts`, `tests/content/copy-rules.test.ts`, `tests/content/projects.test.ts` (sin excepción de `acme-rebrand`)

- [ ] **Paso 1: Escribir las pruebas.** `KNOWN_VIOLATIONS está vacío`; `ningún archivo de src/ contiene unsplash.com ni acme`. Run: `pnpm test`. Expected: FAIL.
- [ ] **Paso 2: Limpiar** y vaciar `KNOWN_VIOLATIONS`.
- [ ] **Paso 3: Verificar.** Run: `pnpm test; npx astro check; pnpm build; pnpm test:dist`. Expected: PASS y 0 errors.
- [ ] **Paso 4: Commit.** `git commit -m "chore: remove placeholder data and close copy violations"`

---

## Fase 6: Preparar el lanzamiento

### Tarea 19: Home reescrita

**Files:**
- Modify: `src/content/pages/home.json`, `src/pages/index.astro`, `tests/content/expected.ts` (`HOME_CIFRAS_CONFIRMADAS: boolean`), `tests/content/schema.test.ts`

**Interfaces:**
- Consumes: casos completos (Tareas 16 y 17), `LeadForm slug="diagnostico"` (Tarea 15; con `mock` si OS aún no publica), `CAPACIDAD_TEXTO`.

- [ ] **Paso 1: Pedir a Lucio** confirmar o retirar "5 años", "20 sectores", "+30 marcas" y "100%"; registrar en `HOME_CIFRAS_CONFIRMADAS`.
- [ ] **Paso 2: Escribir la prueba** `la home no muestra cifras no confirmadas`: con `HOME_CIFRAS_CONFIRMADAS === false`, `home.json` e `index.astro` no contienen `5 años`, `+30`, `100%` ni `20 sectores`. Run: `pnpm test`. Expected: FAIL.
- [ ] **Paso 3: Redactar** la home: `HeroFluid` se mantiene; 3 servicios, casos completos, confianza y diagnóstico.
- [ ] **Paso 4: Verificar.** Run: `pnpm test; pnpm build; pnpm test:dist`. Expected: PASS.
- [ ] **Paso 5: Puerta de revisión de Lucio.** Detenerse hasta aprobación explícita.
- [ ] **Paso 6: Commit.** `git commit -m "content(home): rewrite for launch"`

### Tarea 20: Revisión de los 20 sectores antes de indexar

**Files:**
- Modify: `src/content/sectores/*.json`
- Create: `tests/content/sectores.test.ts`

- [ ] **Paso 1: Escribir la prueba** `sectores publicados no se parecen entre sí`: para cada par publicado, similitud de Jaccard sobre trigramas de palabras del texto del JSON menor a 0,5. Run: `pnpm test sectores` y registrar los pares que fallan.
- [ ] **Paso 2: Revisar cada sector.** Con contenido propio suficiente, `publicado: true`; si no, `publicado: false`. Entregar a Lucio la tabla sector, decisión y motivo.
- [ ] **Paso 3: Verificar.** Run: `pnpm test; pnpm build; pnpm test:dist`. Expected: PASS, incluido `todo enlace interno resuelve`.
- [ ] **Paso 4: Puerta de revisión de Lucio.** Detenerse hasta aprobación explícita.
- [ ] **Paso 5: Commit.** `git commit -m "content(sectores): review before indexing"`

### Tarea 21: Revisión de móvil y rendimiento

**Files:**
- Modify: solo los componentes que la revisión señale.

- [ ] **Paso 1: Revisar a 375x812** home, las 3 landings, los 3 casos, `/proyectos`, `/sobre-nosotros`, `/contacto`, con el aviso de cookies abierto y cerrado. Expected: `document.documentElement.scrollWidth <= 375`; zonas táctiles de 44 px; ni la barra fija ni el aviso tapan el formulario.
- [ ] **Paso 2: Medir** con Lighthouse móvil sobre `pnpm preview` las 3 landings. Expected: LCP menor a 2,5 s, CLS menor a 0,1, sin `<canvas>`; el iframe no es el elemento LCP.
- [ ] **Paso 3: Corregir** y repetir los pasos 1 y 2.
- [ ] **Paso 4: Verificar.** Run: `pnpm test; pnpm build; pnpm test:dist`. Expected: PASS.
- [ ] **Paso 5: Commit.** `git commit -m "perf: mobile and performance review"`

### Tarea 22: SEO local operativo

**Files:**
- Modify: `src/lib/business.ts` (teléfono, dirección o área, nombre definitivo), `src/components/nav/Footer.astro` (NAP desde `BUSINESS`), `src/pages/contacto.astro`, `public/robots.txt` (`Sitemap: https://lucsandesign.com/sitemap-index.xml`)
- Create: `tests/dist/local-seo.test.ts`

- [ ] **Paso 1: Pedir a Lucio** nombre exacto, dirección pública o área de servicio, teléfono y horario. Detenerse hasta tenerlos.
- [ ] **Paso 2: Escribir las pruebas.** `el NAP del footer, de contacto y del JSON-LD coincide con BUSINESS`; `robots.txt declara el sitemap`. Run: `pnpm build; pnpm test:dist`. Expected: FAIL.
- [ ] **Paso 3: Implementar** y validar el JSON-LD de una landing en la prueba de resultados enriquecidos de Google pegando el HTML local.
- [ ] **Paso 4: Entregar a Lucio la lista para el día del lanzamiento:** Perfil de Google con categoría de agencia de branding o diseño y el mismo NAP; Search Console con el sitemap; NAP igual en redes y directorios chilenos; reseñas de clientes chilenos (opcional). Las hace Lucio con sus cuentas.
- [ ] **Paso 5: Verificar.** Run: `pnpm test; pnpm build; pnpm test:dist`. Expected: PASS.
- [ ] **Paso 6: Commit.** `git commit -m "feat(seo): consistent NAP and sitemap declaration"`

### Tarea 23: Lanzamiento (requiere formularios reales de OS y aprobación explícita de Lucio)

**Files:**
- Create: `tests/dist/launch.test.ts`

- [ ] **Paso 1: Escribir las pruebas de lanzamiento**

```ts
it('servicios publicados = LANDING_SLUGS = [branding, diseno-web, estrategia]', () => {
  expect([...publishedServiceSlugs()].sort()).toEqual([...LANDING_SLUGS].sort());
  expect([...LANDING_SLUGS].sort()).toEqual(['branding', 'diseno-web', 'estrategia']);
});
it('KNOWN_VIOLATIONS vacío y MIN_CASOS_POR_LANDING es 2', ...);
it('todos los LeadForm generados están en modo live', ...); // data-mode="live" en cada página, construyendo con PUBLIC_LEAD_FORM_MODE=live
it('home y servicios tienen diagnostico; contacto tiene LeadForm; no existe /api/contact', ...);
it('toda página incluye el aviso de cookies', ...);
it('el sitemap incluye las 3 landings y los 3 casos completos y no incluye gestion-campanas', ...);
```

- [ ] **Paso 2: Ejecutar todo.** Run (bash): `pnpm test; npx astro check; PUBLIC_LEAD_FORM_MODE=live pnpm build; pnpm test:dist`. Expected: PASS, 0 errors, solo `EPERM symlink`.
- [ ] **Paso 3: Comprobar el modo construcción una última vez.** Run (bash): `UNDER_CONSTRUCTION=true pnpm build`. Expected: `dist/client/index.html` y `dist/client/servicios/branding/index.html` muestran la página de construcción; `dist/client/en-construccion/index.html` existe.
- [ ] **Paso 4: Puerta de lanzamiento.** Presentar a Lucio: pruebas, Lighthouse, checklist de textos verificables y estado de las Tareas 12, 14 y 15 (obligatorias; sin ellas no se lanza) y de la Tarea 13. Detenerse hasta un "sí" explícito.
- [ ] **Paso 5: Lanzar (solo con el sí).** En el proyecto de Vercel `lucsan-web`: quitar `UNDER_CONSTRUCTION` de Production, definir `PUBLIC_LEAD_FORM_MODE=live` y ejecutar `vercel deploy --prod`. Expected: `https://lucsandesign.com/servicios/branding` responde 200 con la landing.
- [ ] **Paso 6: Verificar en producción.** Las 3 landings, el aviso de cookies, un envío de prueba desde cada formulario (lead en OS) y el sitemap. Avisar a Lucio para ejecutar la lista de la Tarea 22.
- [ ] **Paso 7: Commit.** `git commit -m "test: launch checks"`

---

## Dependencias externas

| Dependencia | Bloquea |
| ----------- | ------- |
| OS publica `embed/v1.js` (puntos 5 y 8) y los formularios `branding`, `diseno-web`, `estrategia` | Tarea 14 y, por ella, el lanzamiento |
| OS publica `diagnostico` (puntos 1 a 4) | Tarea 15 y el lanzamiento |
| OS ciclo 1b (API de conversiones) | Tarea 13 (no bloquea el lanzamiento; sí las campañas de Meta) |
| Lucio: briefs y presentaciones por servicio | Tareas 7, 9 y 10 |
| Lucio: rutas de material y sector de cada proyecto | Tareas 16 y 17 |
| Lucio: validación de textos | Tareas 7, 9, 10, 11, 16, 17, 19, 20 |
| Lucio: permiso de Duoc UC y de quienes aparecen | Extractos con `autorizado: true` (Tarea 11) |
| Lucio: IDs de píxel de Meta y TikTok | Carga real de píxeles (Tarea 12) |
| Lucio: cifras de la home | Tarea 19 |
| Lucio: NAP y Perfil de Google | Tarea 22 |
| Lucio: aprobación de lanzamiento | Tarea 23 |
