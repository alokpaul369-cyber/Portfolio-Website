import { createElement } from 'react';

/** Placeholder shown when an admin list has no items yet. */
export default function EmptyState({ Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-14 text-center">
      {Icon &&
        createElement(Icon, {
          className: 'size-6 text-muted',
          strokeWidth: 1.5,
          'aria-hidden': true,
        })}
      <p className="font-medium">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
