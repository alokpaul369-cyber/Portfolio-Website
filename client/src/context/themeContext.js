import { createContext } from 'react';

/** Storage key shared with the inline script in index.html. */
export const THEME_STORAGE_KEY = 'site-theme';

/** Browser chrome color for each theme (matches --bg). */
export const THEME_COLORS = { dark: '#0f172a', light: '#f8fafc' };

/** @type {import('react').Context<{ theme: 'dark' | 'light', toggleTheme: () => void } | null>} */
export const ThemeContext = createContext(null);
