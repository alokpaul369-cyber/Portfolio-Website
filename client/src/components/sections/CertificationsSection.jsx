import { motion } from 'framer-motion';
import { ArrowUpRight, Award } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import useApiQuery from '@/hooks/useApiQuery';
import { isExpired } from '@/lib/certifications';
import { formatMonthYear } from '@/lib/format';
import { fadeUp, inViewOnce, stagger } from '@/lib/motion';

/** One certificate: image or placeholder, title, issuer, dates and a verification link. */
function CertificationCard({ entry }) {
  const expired = isExpired(entry);

  return (
    <motion.li variants={fadeUp} className="h-full">
      <article className="card-hover flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface">
        <div className="flex aspect-[16/10] items-center justify-center border-b border-border bg-bg">
          {entry.image?.url ? (
            <img
              src={entry.image.url}
              alt={entry.image.alt || `${entry.title} certificate`}
              loading="lazy"
              decoding="async"
              className="size-full object-cover"
            />
          ) : (
            <span className="inline-flex size-12 items-center justify-center rounded-xl border border-border bg-surface text-muted">
              <Award className="size-5" strokeWidth={1.5} aria-hidden="true" />
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-5">
          <h3 className="text-lg leading-snug font-bold tracking-tight break-words">
            {entry.title}
          </h3>
          <p className="text-sm break-words text-muted">{entry.issuer}</p>

          <p className="flex flex-wrap items-center gap-2 text-sm text-muted tabular-nums">
            <span>
              Issued <time dateTime={entry.issueDate}>{formatMonthYear(entry.issueDate)}</time>
            </span>
            {entry.expiryDate && (
              <span>
                <span aria-hidden="true">· </span>
                {expired ? 'Expired' : 'Expires'}{' '}
                <time dateTime={entry.expiryDate}>{formatMonthYear(entry.expiryDate)}</time>
              </span>
            )}
          </p>

          {entry.credentialId && (
            <p className="text-xs break-all text-muted">Credential ID: {entry.credentialId}</p>
          )}

          {entry.credentialUrl && (
            <a
              href={entry.credentialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex w-fit items-center gap-1.5 pt-3 text-sm font-medium text-primary hover:underline"
            >
              Verify
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
              <span className="sr-only">{entry.title} (opens in a new tab)</span>
            </a>
          )}
        </div>
      </article>
    </motion.li>
  );
}

/**
 * Certifications on the Experience page, loaded from GET /api/certifications.
 * Renders nothing while loading, when there are no entries or if the request
 * fails, so the page never shows an empty or broken section.
 */
export default function CertificationsSection() {
  const { data: entries } = useApiQuery('/certifications');
  if (!entries || entries.length === 0) return null;

  return (
    <section
      id="certifications"
      aria-labelledby="certifications-heading"
      className="container-page pb-16 sm:pb-24"
    >
      <PageHeader
        id="certifications-heading"
        label="Certifications"
        title="Certifications"
        as="h2"
        inView
      />
      <motion.ul
        variants={stagger(0, 0.06)}
        {...inViewOnce}
        className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {entries.map((entry) => (
          <CertificationCard key={entry.id} entry={entry} />
        ))}
      </motion.ul>
    </section>
  );
}
