import { createContext } from 'react';

/**
 * Editable site content merged over the built-in defaults.
 *
 * @type {import('react').Context<{
 *   content: ReturnType<typeof import('@/lib/siteContent').mergeContent>,
 *   settings: object | null,
 *   isLoading: boolean,
 *   applySettings: (settings: object) => void,
 *   refresh: () => void,
 * } | null>}
 */
export const SiteContentContext = createContext(null);
