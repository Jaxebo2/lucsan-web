import { config, fields, collection, singleton } from '@keystatic/core';

// ============================================================
// Reusable field groups
// ============================================================

const seoFields = fields.object(
  {
    title: fields.text({
      label: 'Title (SEO)',
      description: '50–70 caracteres. Aparece en Google y pestañas del navegador.',
      validation: { length: { min: 10, max: 70 } },
    }),
    description: fields.text({
      label: 'Description (SEO)',
      description: '140–180 caracteres. Aparece en resultados de Google.',
      multiline: true,
      validation: { length: { min: 50, max: 180 } },
    }),
    ogImage: fields.text({
      label: 'Open Graph image (path o URL)',
      description: 'Ej: /og-branding.png — 1200×630px.',
    }),
  },
  { label: 'SEO' },
);

const imageField = fields.object(
  {
    src: fields.text({ label: 'Src (URL o path /imagen.jpg)' }),
    alt: fields.text({ label: 'Alt text' }),
    width: fields.integer({ label: 'Width' }),
    height: fields.integer({ label: 'Height' }),
  },
  { label: 'Imagen' },
);

// ============================================================
// Keystatic config
// ============================================================

export default config({
  storage: {
    kind: 'local',
  },

  ui: {
    brand: {
      name: 'Lucsan Design CMS',
    },
    navigation: {
      'Páginas singleton': ['home', 'sobre', 'contacto'],
      'Contenido dinámico': ['services', 'sectores', 'projects'],
    },
  },

  // ============================================================
  // SINGLETONS
  // ============================================================

  singletons: {
    home: singleton({
      label: 'Home',
      path: 'src/content/pages/home',
      format: { data: 'json' },
      schema: {
        tipo: fields.text({ label: 'Tipo', defaultValue: 'home' }),
        hero: fields.object(
          {
            headline: fields.text({ label: 'Headline', multiline: true }),
            subhead: fields.text({ label: 'Subhead', multiline: true }),
            ctaPrimario: fields.object({
              texto: fields.text({ label: 'Texto botón' }),
              href: fields.text({ label: 'Link' }),
            }),
            ctaSecundario: fields.object({
              texto: fields.text({ label: 'Texto botón' }),
              href: fields.text({ label: 'Link' }),
            }),
          },
          { label: 'Hero' },
        ),
        pruebaSocial: fields.object({
          titulo: fields.text({ label: 'Título sección' }),
          logos: fields.array(imageField, {
            label: 'Logos de clientes',
            itemLabel: (p) => p.fields.alt.value || 'logo',
          }),
        }),
        serviciosDestacados: fields.array(
          fields.relationship({ label: 'Servicio', collection: 'services' }),
          { label: 'Servicios destacados (max 3)', itemLabel: (p) => p.value ?? '' },
        ),
        metodoResumen: fields.object({
          titulo: fields.text({ label: 'Título sección' }),
          fases: fields.array(
            fields.object({
              numero: fields.text({ label: 'Número (ej. 01)' }),
              titulo: fields.text({ label: 'Título fase' }),
              descripcion: fields.text({ label: 'Descripción', multiline: true }),
            }),
            { label: 'Fases', itemLabel: (p) => p.fields.titulo.value },
          ),
        }),
        casosDestacados: fields.array(
          fields.relationship({ label: 'Proyecto', collection: 'projects' }),
          { label: 'Casos destacados (max 4)', itemLabel: (p) => p.value ?? '' },
        ),
        testimonios: fields.array(
          fields.object({
            cita: fields.text({ label: 'Cita', multiline: true }),
            autor: fields.text({ label: 'Autor' }),
            cargo: fields.text({ label: 'Cargo' }),
            empresa: fields.text({ label: 'Empresa' }),
          }),
          { label: 'Testimonios', itemLabel: (p) => p.fields.autor.value },
        ),
        ctaFinal: fields.object({
          headline: fields.text({ label: 'Headline CTA final' }),
          botonTexto: fields.text({ label: 'Texto botón' }),
        }),
        seo: seoFields,
      },
    }),

    sobre: singleton({
      label: 'Sobre nosotros',
      path: 'src/content/pages/sobre',
      format: { data: 'json' },
      schema: {
        tipo: fields.text({ label: 'Tipo', defaultValue: 'sobre' }),
        manifiesto: fields.text({ label: 'Manifiesto', multiline: true }),
        vision: fields.text({ label: 'Visión', multiline: true }),
        principios: fields.array(
          fields.object({
            titulo: fields.text({ label: 'Título' }),
            descripcion: fields.text({ label: 'Descripción', multiline: true }),
          }),
          { label: 'Principios', itemLabel: (p) => p.fields.titulo.value },
        ),
        metodo: fields.array(
          fields.object({
            fase: fields.text({ label: 'Fase' }),
            descripcion: fields.text({ label: 'Descripción', multiline: true }),
            entregables: fields.array(fields.text({ label: 'Entregable' }), {
              label: 'Entregables',
              itemLabel: (p) => p.value,
            }),
          }),
          { label: 'Método', itemLabel: (p) => p.fields.fase.value },
        ),
        equipo: fields.array(
          fields.object({
            nombre: fields.text({ label: 'Nombre' }),
            rol: fields.text({ label: 'Rol' }),
            bioCorta: fields.text({ label: 'Bio corta', multiline: true }),
          }),
          { label: 'Equipo', itemLabel: (p) => p.fields.nombre.value },
        ),
        valores: fields.array(
          fields.object({
            titulo: fields.text({ label: 'Título' }),
            descripcion: fields.text({ label: 'Descripción', multiline: true }),
          }),
          { label: 'Valores', itemLabel: (p) => p.fields.titulo.value },
        ),
        seo: seoFields,
      },
    }),

    contacto: singleton({
      label: 'Contacto',
      path: 'src/content/pages/contacto',
      format: { data: 'json' },
      schema: {
        tipo: fields.text({ label: 'Tipo', defaultValue: 'contacto' }),
        headline: fields.text({ label: 'Headline' }),
        subhead: fields.text({ label: 'Subhead', multiline: true }),
        tiempoRespuesta: fields.text({ label: 'Tiempo de respuesta' }),
        whatsapp: fields.object({
          numero: fields.text({ label: 'Número WhatsApp (ej. +56912345678)' }),
          mensajePreLlenado: fields.text({ label: 'Mensaje pre-llenado', multiline: true }),
        }),
        email: fields.text({ label: 'Email contacto' }),
        serviciosDisponibles: fields.array(
          fields.relationship({ label: 'Servicio', collection: 'services' }),
          { label: 'Servicios disponibles en el form', itemLabel: (p) => p.value ?? '' },
        ),
        rangosPresupuesto: fields.array(fields.text({ label: 'Rango' }), {
          label: 'Rangos de presupuesto',
          itemLabel: (p) => p.value,
        }),
        seo: seoFields,
      },
    }),
  },

  // ============================================================
  // COLLECTIONS
  // ============================================================

  collections: {
    services: collection({
      label: 'Servicios',
      slugField: 'slug',
      path: 'src/content/services/*',
      format: { data: 'json' },
      schema: {
        title: fields.text({ label: 'Título' }),
        slug: fields.slug({ name: { label: 'Slug', description: 'kebab-case (ej. branding, diseno-web)' } }),
        keyword: fields.text({ label: 'Keyword SEO principal' }),
        orden: fields.integer({ label: 'Orden en listado', defaultValue: 99 }),
        publicado: fields.checkbox({ label: 'Publicado', defaultValue: false }),

        hero: fields.object(
          {
            headline: fields.text({ label: 'Headline', multiline: true }),
            subhead: fields.text({ label: 'Subhead', multiline: true }),
            imagen: imageField,
          },
          { label: 'Hero' },
        ),

        incluye: fields.array(
          fields.object({
            titulo: fields.text({ label: 'Título' }),
            descripcion: fields.text({ label: 'Descripción', multiline: true }),
          }),
          { label: 'Qué incluye', itemLabel: (p) => p.fields.titulo.value },
        ),

        paraQuien: fields.array(
          fields.object({
            perfil: fields.text({ label: 'Perfil' }),
            descripcion: fields.text({ label: 'Descripción', multiline: true }),
          }),
          { label: 'Para quién', itemLabel: (p) => p.fields.perfil.value },
        ),

        problema: fields.object({
          titulo: fields.text({ label: 'Título' }),
          sintomas: fields.array(fields.text({ label: 'Síntoma' }), {
            label: 'Síntomas',
            itemLabel: (p) => p.value,
          }),
        }),

        metodo: fields.array(
          fields.object({
            fase: fields.text({ label: 'Fase' }),
            descripcion: fields.text({ label: 'Descripción', multiline: true }),
            entregables: fields.array(fields.text({ label: 'Entregable' }), {
              label: 'Entregables',
              itemLabel: (p) => p.value,
            }),
          }),
          { label: 'Método', itemLabel: (p) => p.fields.fase.value },
        ),

        entregables: fields.array(fields.text({ label: 'Entregable' }), {
          label: 'Entregables totales',
          itemLabel: (p) => p.value,
        }),

        casosRelacionados: fields.array(
          fields.relationship({ label: 'Proyecto', collection: 'projects' }),
          { label: 'Casos relacionados', itemLabel: (p) => p.value ?? '' },
        ),

        sectoresAplicables: fields.array(
          fields.relationship({ label: 'Sector', collection: 'sectores' }),
          { label: 'Sectores aplicables', itemLabel: (p) => p.value ?? '' },
        ),

        frameworks: fields.array(
          fields.object({
            titulo: fields.text({ label: 'Título' }),
            descripcion: fields.text({ label: 'Descripción', multiline: true }),
            autor: fields.text({ label: 'Autor (opcional)' }),
          }),
          { label: 'Frameworks y metodologías', itemLabel: (p) => p.fields.titulo.value },
        ),

        faq: fields.array(
          fields.object({
            pregunta: fields.text({ label: 'Pregunta' }),
            respuesta: fields.text({ label: 'Respuesta', multiline: true }),
          }),
          { label: 'FAQ', itemLabel: (p) => p.fields.pregunta.value },
        ),

        cta: fields.object({
          headline: fields.text({ label: 'Headline' }),
          botonTexto: fields.text({ label: 'Texto botón', defaultValue: 'Conversemos' }),
        }),

        seo: seoFields,
      },
    }),

    sectores: collection({
      label: 'Sectores',
      slugField: 'slug',
      path: 'src/content/sectores/*',
      format: { data: 'json' },
      schema: {
        nombre: fields.text({ label: 'Nombre del sector' }),
        slug: fields.slug({ name: { label: 'Slug', description: 'kebab-case (ej. ecommerce, saas-tecnologia)' } }),
        orden: fields.integer({ label: 'Orden en listado', defaultValue: 99 }),
        publicado: fields.checkbox({ label: 'Publicado', defaultValue: false }),

        hero: fields.object(
          {
            headline: fields.text({ label: 'Headline', multiline: true }),
            subhead: fields.text({ label: 'Subhead', multiline: true }),
          },
          { label: 'Hero' },
        ),

        contexto: fields.text({ label: 'Contexto del sector', multiline: true }),

        desafios: fields.array(fields.text({ label: 'Desafío', multiline: true }), {
          label: 'Desafíos típicos',
          itemLabel: (p) => p.value,
        }),

        serviciosAplicables: fields.array(
          fields.relationship({ label: 'Servicio', collection: 'services' }),
          { label: 'Servicios aplicables', itemLabel: (p) => p.value ?? '' },
        ),

        casosRelacionados: fields.array(
          fields.relationship({ label: 'Proyecto', collection: 'projects' }),
          { label: 'Casos del sector', itemLabel: (p) => p.value ?? '' },
        ),

        ejemplosTrabajo: fields.array(fields.text({ label: 'Ejemplo' }), {
          label: 'Ejemplos de trabajo típicos',
          itemLabel: (p) => p.value,
        }),

        cta: fields.object({
          headline: fields.text({ label: 'Headline CTA' }),
          botonTexto: fields.text({ label: 'Texto botón', defaultValue: 'Conversemos' }),
        }),

        seo: seoFields,
      },
    }),

    projects: collection({
      label: 'Proyectos',
      slugField: 'slug',
      path: 'src/content/projects/*',
      format: { data: 'json' },
      schema: {
        titulo: fields.text({ label: 'Título' }),
        slug: fields.slug({ name: { label: 'Slug' } }),
        cliente: fields.text({ label: 'Cliente' }),
        sector: fields.select({
          label: 'Sector',
          options: [
            { label: 'Tecnología', value: 'tecnologia' },
            { label: 'Retail', value: 'retail' },
            { label: 'Salud', value: 'salud' },
            { label: 'Educación', value: 'educacion' },
            { label: 'Gastronomía', value: 'gastronomia' },
            { label: 'Servicios', value: 'servicios' },
            { label: 'Inmobiliaria', value: 'inmobiliaria' },
            { label: 'Finanzas', value: 'finanzas' },
            { label: 'Otro', value: 'otro' },
          ],
          defaultValue: 'otro',
        }),
        serviciosAplicados: fields.array(
          fields.relationship({ label: 'Servicio', collection: 'services' }),
          { label: 'Servicios aplicados', itemLabel: (p) => p.value ?? '' },
        ),
        ano: fields.integer({ label: 'Año', defaultValue: new Date().getFullYear() }),
        destacado: fields.checkbox({ label: 'Destacado en home', defaultValue: false }),
        publicado: fields.checkbox({ label: 'Publicado', defaultValue: false }),

        cover: imageField,
        thumbnail: imageField,
        resumenCorto: fields.text({ label: 'Resumen corto', multiline: true }),

        caso: fields.object({
          contexto: fields.text({ label: 'Contexto', multiline: true }),
          desafio: fields.text({ label: 'Desafío', multiline: true }),
          enfoque: fields.text({ label: 'Enfoque', multiline: true }),
          solucion: fields.text({ label: 'Solución', multiline: true }),
          galeria: fields.array(imageField, {
            label: 'Galería',
            itemLabel: (p) => p.fields.alt.value || 'imagen',
          }),
          resultado: fields.object({
            narrativa: fields.text({ label: 'Narrativa', multiline: true }),
            metricas: fields.array(
              fields.object({
                valor: fields.text({ label: 'Valor (ej. +47%)' }),
                descripcion: fields.text({ label: 'Descripción' }),
              }),
              { label: 'Métricas', itemLabel: (p) => p.fields.valor.value },
            ),
          }),
          testimonio: fields.object({
            cita: fields.text({ label: 'Cita', multiline: true }),
            autor: fields.text({ label: 'Autor' }),
            cargo: fields.text({ label: 'Cargo' }),
          }),
        }),

        seo: seoFields,
      },
    }),
  },
});
