// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://lucsandesign.com',
  trailingSlash: 'never',
  output: 'static', // Most pages prerender. Keystatic admin + API routes opt-in to SSR.
  adapter: vercel({
    webAnalytics: { enabled: false }, // We use GA4 via GTM, not Vercel Web Analytics
    imageService: false, // We use astro:assets default + R2 for heavy media
  }),
  build: {
    format: 'directory',
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  integrations: [
    react(), // Required by Keystatic and used for interactive form islands later
    keystatic(),
    icon({
      include: {
        ph: ['*'], // Phosphor: only icons referenced in templates are bundled
      },
    }),
  ],
  vite: {
    // @ts-expect-error — Vite plugin type mismatch between Astro's vendored Vite
    // and Tailwind v4's expected Vite. Runtime is fine.
    plugins: [tailwindcss()],
  },
});
