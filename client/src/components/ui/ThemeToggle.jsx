import { Moon, Sun } from 'lucide-react';
import useTheme from '@/hooks/useTheme';

/**
 * Switches between dark and light themes.
 * Shows the icon of the theme it will switch to.
 */
export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  const Icon = theme === 'dark' ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
      className={`inline-flex size-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-text ${className}`}
    >
      <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
    </button>
  );
}
