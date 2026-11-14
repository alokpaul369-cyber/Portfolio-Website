/**
 * Pill-style toggle button for a list filter (project category, research type
 * or status). `aria-pressed` tells assistive technology which one is active.
 *
 * @param {{ active: boolean, onClick: () => void }} props
 */
export default function FilterButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-200 ${
        active
          ? 'border-primary bg-primary text-bg'
          : 'border-border text-muted hover:border-primary/50 hover:text-text'
      }`}
    >
      {children}
    </button>
  );
}
