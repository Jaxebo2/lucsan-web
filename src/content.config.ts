import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

// ============================================================
// SHARED SCHEMAS
// ============================================================

const seoSchema = z.object({
  title: z.string().min(10).max(70),
  description: z.string().min(50).max(180),
  ogImage: z.string().optional(),
});

const imageSchema = z.object({
  src: z.string().url().or(z.string().startsWith('/')),
  alt: z.string().min(3),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

// ============================================================
// SERVICES — /servicios/[slug]
// ============================================================

const services = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx,json}', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    slug: z.string().regex(/^[a-z0-9-]+$/, 'kebab-case only'),
    keyword: z.string(),
    orden: z.number().int().nonnegative().default(99),
    publicado: z.boolean().default(false),

    hero: z.object({
      headline: z.string().min(10),
      subhead: z.string().min(20),
      imagen: imageSchema.optional(),
    }),

    paraQuien: z
      .array(
        z.object({
          perfil: z.string(),
          descripcion: z.string(),
        }),
      )
      .min(2)
      .max(6),

    problema: z.object({
      titulo: z.string(),
      sintomas: z.array(z.string()).min(2).max(8),
    }),

    metodo: z
      .array(
        z.object({
          fase: z.string(),
          descripcion: z.string(),
          entregables: z.array(z.string()).min(1),
        }),
      )
      .min(3)
      .max(6),

    entregables: z.array(z.string()).min(3),

    casosRelacionados: z.array(reference('projects')).default([]),

    faq: z
      .array(
        z.object({
          pregunta: z.string(),
          respuesta: z.string(),
        }),
      )
      .min(3)
      .max(10),

    cta: z.object({
      headline: z.string(),
      botonTexto: z.string().default('Conversemos'),
    }),

    seo: seoSchema,
  }),
});

// ============================================================
// PROJECTS — /proyectos/[slug]
// ============================================================

const SECTORES = [
  'tecnologia',
  'retail',
  'salud',
  'educacion',
  'gastronomia',
  'servicios',
  'inmobiliaria',
  'finanzas',
  'otro',
] as const;

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx,json}', base: './src/content/projects' }),
  schema: z.object({
    titulo: z.string(),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    cliente: z.string(),
    sector: z.enum(SECTORES),
    serviciosAplicados: z.array(reference('services')).min(1),
    ano: z.number().int().min(2018).max(2030),
    destacado: z.boolean().default(false),
    publicado: z.boolean().default(false),

    cover: imageSchema,
    thumbnail: imageSchema,
    resumenCorto: z.string().min(20).max(200),

    caso: z.object({
      contexto: z.string(),
      desafio: z.string(),
      enfoque: z.string(),
      solucion: z.string(),
      galeria: z.array(imageSchema).default([]),
      resultado: z.object({
        narrativa: z.string(),
        metricas: z
          .array(
            z.object({
              valor: z.string(),
              descripcion: z.string(),
            }),
          )
          .default([]),
      }),
      testimonio: z
        .object({
          cita: z.string(),
          autor: z.string(),
          cargo: z.string(),
          avatar: imageSchema.optional(),
        })
        .optional(),
    }),

    seo: seoSchema,
  }),
});

// ============================================================
// PAGES — singletons (home, sobre, contacto)
// ============================================================

// Pages = 3 singletons (home, sobre, contacto), one JSON file each.
// Discriminated union: each entry's `tipo` determines its schema shape.

const homeSchema = z.object({
  tipo: z.literal('home'),
  hero: z.object({
    headline: z.string(),
    subhead: z.string(),
    ctaPrimario: z.object({ texto: z.string(), href: z.string() }),
    ctaSecundario: z.object({ texto: z.string(), href: z.string() }).optional(),
    imagenOVideo: imageSchema.optional(),
  }),
  pruebaSocial: z.object({
    titulo: z.string(),
    logos: z.array(imageSchema).default([]),
  }),
  serviciosDestacados: z.array(reference('services')).max(3),
  metodoResumen: z.object({
    titulo: z.string(),
    fases: z
      .array(
        z.object({
          numero: z.string(),
          titulo: z.string(),
          descripcion: z.string(),
        }),
      )
      .min(3)
      .max(6),
  }),
  casosDestacados: z.array(reference('projects')).max(4),
  testimonios: z
    .array(
      z.object({
        cita: z.string(),
        autor: z.string(),
        cargo: z.string(),
        empresa: z.string(),
      }),
    )
    .default([]),
  ctaFinal: z.object({ headline: z.string(), botonTexto: z.string() }),
  seo: seoSchema,
});

const sobreSchema = z.object({
  tipo: z.literal('sobre'),
  manifiesto: z.string(),
  metodo: z.array(
    z.object({
      fase: z.string(),
      descripcion: z.string(),
      entregables: z.array(z.string()),
    }),
  ),
  equipo: z.array(
    z.object({
      nombre: z.string(),
      rol: z.string(),
      foto: imageSchema.optional(),
      bioCorta: z.string(),
    }),
  ),
  valores: z.array(
    z.object({
      titulo: z.string(),
      descripcion: z.string(),
    }),
  ),
  seo: seoSchema,
});

const contactoSchema = z.object({
  tipo: z.literal('contacto'),
  headline: z.string(),
  subhead: z.string(),
  tiempoRespuesta: z.string(),
  whatsapp: z.object({
    numero: z.string(),
    mensajePreLlenado: z.string(),
  }),
  email: z.string().email(),
  serviciosDisponibles: z.array(reference('services')).default([]),
  rangosPresupuesto: z.array(z.string()).default([]),
  seo: seoSchema,
});

const pages = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/pages' }),
  schema: z.discriminatedUnion('tipo', [homeSchema, sobreSchema, contactoSchema]),
});

// ============================================================
// EXPORT
// ============================================================

export const collections = { services, projects, pages };
