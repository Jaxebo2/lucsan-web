/**
 * SEO helpers — Schema.org JSON-LD generators.
 *
 * Each function returns a plain object ready to be JSON.stringify'd into
 * a <script type="application/ld+json"> tag.
 */

const SITE_URL = 'https://lucsandesign.com';
const ORG_NAME = 'Lucsan Design';
const ORG_LEGAL = 'Lucsan Design SpA';
const ORG_EMAIL = 'contacto@lucsandesign.com';
const ORG_LOCALITY = 'Santiago';
const ORG_REGION = 'RM';
const ORG_COUNTRY = 'CL';
const ORG_LOGO = `${SITE_URL}/brand/LucsanDesign-horizontal-coral.svg`;

const ORG_SAMEAS = [
  'https://instagram.com/lucsandesign',
  'https://linkedin.com/company/lucsandesign',
  'https://behance.net/lucsandesign',
];

/** Absolute URL from path. */
export const absoluteUrl = (path: string): string => {
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

export const organizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}#organization`,
  name: ORG_NAME,
  legalName: ORG_LEGAL,
  url: SITE_URL,
  logo: ORG_LOGO,
  email: ORG_EMAIL,
  address: {
    '@type': 'PostalAddress',
    addressLocality: ORG_LOCALITY,
    addressRegion: ORG_REGION,
    addressCountry: ORG_COUNTRY,
  },
  sameAs: ORG_SAMEAS,
  founder: {
    '@type': 'Person',
    name: 'Lucio Santana',
  },
});

export const websiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}#website`,
  url: SITE_URL,
  name: ORG_NAME,
  publisher: { '@id': `${SITE_URL}#organization` },
  inLanguage: 'es-CL',
});

interface BreadcrumbItem {
  name: string;
  url: string;
}

export const breadcrumbSchema = (items: BreadcrumbItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: absoluteUrl(item.url),
  })),
});

interface ServiceSchemaInput {
  name: string;
  description: string;
  slug: string;
}

export const serviceSchema = (input: ServiceSchemaInput) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: input.name,
  description: input.description,
  url: absoluteUrl(`/servicios/${input.slug}`),
  provider: { '@id': `${SITE_URL}#organization` },
  areaServed: {
    '@type': 'Country',
    name: 'Chile',
  },
});

interface CaseStudySchemaInput {
  titulo: string;
  resumenCorto: string;
  slug: string;
  cliente: string;
  ano: number;
  coverUrl: string;
  coverAlt: string;
}

export const caseStudySchema = (input: CaseStudySchemaInput) => ({
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: input.titulo,
  description: input.resumenCorto,
  url: absoluteUrl(`/proyectos/${input.slug}`),
  author: { '@id': `${SITE_URL}#organization` },
  creator: { '@id': `${SITE_URL}#organization` },
  dateCreated: `${input.ano}-01-01`,
  about: input.cliente,
  image: {
    '@type': 'ImageObject',
    url: absoluteUrl(input.coverUrl),
    description: input.coverAlt,
  },
});

interface ContactPageSchemaInput {
  email: string;
}

export const contactPageSchema = (input: ContactPageSchemaInput) => ({
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  url: absoluteUrl('/contacto'),
  mainEntity: {
    '@id': `${SITE_URL}#organization`,
    contactPoint: {
      '@type': 'ContactPoint',
      email: input.email,
      contactType: 'customer service',
      areaServed: 'CL',
      availableLanguage: ['es'],
    },
  },
});

export const aboutPageSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  url: absoluteUrl('/sobre-nosotros'),
  mainEntity: { '@id': `${SITE_URL}#organization` },
});

interface FAQItemInput {
  pregunta: string;
  respuesta: string;
}

export const faqSchema = (items: FAQItemInput[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((item) => ({
    '@type': 'Question',
    name: item.pregunta,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.respuesta,
    },
  })),
});
