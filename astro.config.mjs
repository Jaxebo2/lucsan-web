// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  site: 'https://lucsandesign.com',
  trailingSlash: 'never',
  build: {
    format: 'directory',
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  integrations: [
    icon({
      include: {
        ph: ['*'], // Phosphor: only icons referenced in templates are bundled
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
