import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import { mergeContent, readCachedSettings, writeCachedSettings } from '@/lib/siteContent';
import { SiteContentContext } from './siteContentContext';

/**
 * Loads the admin-managed site content once and shares it with every page.
 *
 * The first paint uses the last response cached in localStorage (or the
 * built-in defaults on a first visit); the fresh response replaces it when it
 * arrives. A failed request is silent: visitors simply see the cached or
 * default content.
 */
export default function SiteContentProvider({ children }) {
  // `settings` is the raw API data; `loaded` turns true once the request settles.
  const [state, setState] = useState(() => ({ settings: readCachedSettings(), loaded: false }));

  useEffect(() => {
    const controller = new AbortController();
    api
      .get('/settings', { signal: controller.signal })
      .then(({ data: body }) => {
        writeCachedSettings(body.data);
        setState({ settings: body.data, loaded: true });
      })
      .catch(() => {
        if (!controller.signal.aborted) setState((current) => ({ ...current, loaded: true }));
      });
    return () => controller.abort();
  }, []);

  /** Reloads the settings, for example after research or certifications change. */
  const refresh = useCallback(() => {
    api
      .get('/settings')
      .then(({ data: body }) => {
        writeCachedSettings(body.data);
        setState({ settings: body.data, loaded: true });
      })
      .catch(() => {});
  }, []);

  /** Lets the admin panel show a save immediately, without a reload. */
  const applySettings = useCallback((settings) => {
    writeCachedSettings(settings);
    setState({ settings, loaded: true });
  }, []);

  const value = useMemo(
    () => ({
      content: mergeContent(state.settings),
      settings: state.settings,
      // With a cached copy there is something real to show straight away.
      isLoading: !state.loaded && state.settings === null,
      applySettings,
      refresh,
    }),
    [state, applySettings, refresh],
  );

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}
