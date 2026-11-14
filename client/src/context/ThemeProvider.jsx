import { useCallback, useEffect, useMemo, useState } from 'react';
import { THEME_COLORS, THEME_STORAGE_KEY, ThemeContext } from './themeContext';

/** Reads the saved theme. Light is the default; storage may be unavailable. */
function getInitialTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

/**
 * Provides the current theme and a toggle.
 * The theme is applied as a "dark" class on <html>. Only an explicit choice is
 * saved, so visitors who never use the toggle always get the site default.
 * index.html applies the saved theme before React loads to avoid a flash.
 */
export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', THEME_COLORS[theme]);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage blocked (private mode); the theme still applies for this visit.
    }
  }, [theme]);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
