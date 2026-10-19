import { defineMiddleware } from 'astro:middleware';

/**
 * Modo "web en construcción".
 *
 * Con UNDER_CONSTRUCTION=true en el build, todas las páginas públicas muestran
 * /en-construccion (Astro lo resuelve en build para las páginas estáticas).
 * Para lanzar el sitio completo: quitar la variable y volver a desplegar.
 *
 * Quedan fuera: la propia página de construcción, la API del formulario y el CMS.
 */
const UNDER_CONSTRUCTION = process.env.UNDER_CONSTRUCTION === 'true';
const ALLOWED_PREFIXES = ['/en-construccion', '/api', '/keystatic', '/_astro', '/_image'];

export const onRequest = defineMiddleware((context, next) => {
  if (!UNDER_CONSTRUCTION) return next();

  const path = context.url.pathname;
  const allowed = ALLOWED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
  if (allowed) return next();

  // rewrite (no redirect): cada URL muestra la página de construcción al instante.
  // En build estático, un redirect genera una página en blanco con espera de 2 s.
  return context.rewrite('/en-construccion');
});
