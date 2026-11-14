import { Link } from 'react-router';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';

/**
 * Title row for an admin page, with an optional back link and actions.
 * Also sets the browser tab title to "<title> | Admin".
 */
export default function AdminPageHeader({ title, description, backTo, backLabel, actions }) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-border pb-6">
      <Helmet>
        <title>{`${title} | Admin`}</title>
      </Helmet>
      {backTo && (
        <Link
          to={backTo}
          className="inline-flex w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {backLabel}
        </Link>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-sm text-muted">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}
