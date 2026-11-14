import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import seoPlugin from './build/seoPlugin.js';

// Vite configuration.
// In development, requests to /api are proxied to the Express server so the
// client can use relative URLs and avoid CORS configuration locally.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_DEV_API_TARGET || 'http://localhost:5000';

  // Public site origin for canonical URLs, social previews and the sitemap.
  const siteUrl = (env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/+$/, '');
  // Absolute API base the sitemap generator can reach at build time.
  const sitemapApiUrl =
    env.SITEMAP_API_URL ||
    (/^https?:\/\//.test(env.VITE_API_URL ?? '') ? env.VITE_API_URL : '') ||
    (mode === 'development' ? `${apiTarget}/api` : '');

  return {
    plugins: [react(), tailwindcss(), seoPlugin({ siteUrl, apiUrl: sitemapApiUrl })],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true },
      },
    },
  };
});
