import { Link } from 'react-router';

const base =
  'inline-flex items-center justify-center gap-2 rounded-md text-sm transition-[color,background-color,border-color,box-shadow] duration-200 disabled:pointer-events-none disabled:opacity-60 [&_.lucide-arrow-right]:transition-transform [&_.lucide-arrow-right]:duration-200 hover:[&_.lucide-arrow-right]:translate-x-1 motion-reduce:[&_.lucide-arrow-right]:transform-none';

// Both variants carry a 1px border so they are the same height side by side.
const variants = {
  primary: 'border border-transparent bg-primary text-bg hover:bg-primary/90',
  outline: 'border border-border text-text hover:border-primary hover:text-primary',
};

/** `md` is the default; `sm` keeps dense toolbars, tables and dialogs compact. */
const sizes = {
  md: 'px-6 py-3 font-semibold',
  sm: 'px-4 py-2 font-medium',
};

/**
 * Button that renders the right element for its purpose:
 * - `to`   internal route, rendered as a router <Link>
 * - `href` external link or file, rendered as <a>
 * - otherwise a <button>
 *
 * @param {{ variant?: 'primary' | 'outline', size?: 'md' | 'sm', to?: string, href?: string, className?: string }} props
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  to,
  href,
  className = '',
  children,
  ...props
}) {
  const classes = `${base} ${sizes[size]} ${variants[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
