import { Link } from 'react-router';
import { ExternalLink, Pencil, Trash2 } from 'lucide-react';

const iconButton =
  'inline-flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-bg';

/**
 * Edit, view and delete buttons for a row in an admin list.
 * @param {{ editTo: string, viewHref?: string, onDelete: () => void, name: string }} props
 */
export default function RowActions({ editTo, viewHref, onDelete, name }) {
  return (
    <div className="flex items-center justify-end gap-1">
      {viewHref && (
        <a
          href={viewHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View ${name} on the site`}
          title="View on site"
          className={`${iconButton} hover:text-text`}
        >
          <ExternalLink className="size-4" aria-hidden="true" />
        </a>
      )}
      <Link
        to={editTo}
        aria-label={`Edit ${name}`}
        title="Edit"
        className={`${iconButton} hover:text-primary`}
      >
        <Pencil className="size-4" aria-hidden="true" />
      </Link>
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Delete ${name}`}
        title="Delete"
        className={`${iconButton} hover:text-danger`}
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
