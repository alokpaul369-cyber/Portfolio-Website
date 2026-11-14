import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { MotionConfig } from 'framer-motion';
import { HelmetProvider } from 'react-helmet-async';
import SiteContentProvider from '@/context/SiteContentProvider';
import ThemeProvider from '@/context/ThemeProvider';
import router from '@/router';
import '@/index.css';

// index.html contains default SEO tags for crawlers that do not run JavaScript
// (link previews). Once the app runs, <Seo> renders tags for each page, so the
// static copies are removed to avoid duplicate titles, descriptions and URLs.
document.head.querySelectorAll('[data-seo-static]').forEach((element) => element.remove());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Manages <title>, meta tags and JSON-LD per page. */}
    <HelmetProvider>
      <ThemeProvider>
        {/* Animations are disabled for visitors who prefer reduced motion. */}
        <MotionConfig reducedMotion="user">
          {/* Admin-managed text, links, CV and photo, shared by every page. */}
          <SiteContentProvider>
            <RouterProvider router={router} />
          </SiteContentProvider>
        </MotionConfig>
      </ThemeProvider>
    </HelmetProvider>
  </StrictMode>,
);
