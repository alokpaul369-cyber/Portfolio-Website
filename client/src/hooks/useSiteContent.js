import { useContext } from 'react';
import { SiteContentContext } from '@/context/siteContentContext';

/**
 * Returns the site content (role, tagline, About text, links, CV, photo)
 * with the admin's changes applied over the defaults, plus `isLoading` and
 * `refresh()` to reload them after an admin change.
 * Must be used inside SiteContentProvider.
 */
export default function useSiteContent() {
  const context = useContext(SiteContentContext);
  if (!context) {
    throw new Error('useSiteContent must be used within a SiteContentProvider');
  }
  return { ...context.content, isLoading: context.isLoading, refresh: context.refresh };
}
