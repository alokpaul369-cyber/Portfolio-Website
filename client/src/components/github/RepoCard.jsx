import { motion } from 'framer-motion';
import { BookMarked, Star } from 'lucide-react';
import { languageColors } from '@/data/github';
import { formatCount, formatRelative } from '@/lib/format';
import { fadeUp } from '@/lib/motion';
import { cardBg } from '@/lib/tone';

/**
 * Compact repository card: name, description, language, stars and last update.
 * `tone` is the background band the card sits on.
 */
export default function RepoCard({ repo, tone = 'bg' }) {
  return (
    <motion.li variants={fadeUp}>
      <a
        href={repo.htmlUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`card-hover flex h-full flex-col gap-3 rounded-lg border border-border p-4 ${cardBg(tone)}`}
      >
        <p className="flex items-center gap-2 text-sm font-semibold text-primary">
          <BookMarked
            className="size-4 shrink-0 text-muted"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <span className="truncate">{repo.name}</span>
        </p>

        <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-muted">
          {repo.description || 'No description provided.'}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted">
          {repo.language && (
            <span className="inline-flex items-center gap-1.5">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: languageColors[repo.language] ?? 'var(--muted)' }}
                aria-hidden="true"
              />
              {repo.language}
            </span>
          )}
          <span className="inline-flex items-center gap-1" title={`${repo.stars} stars`}>
            <Star className="size-3" aria-hidden="true" />
            <span className="sr-only">Stars: </span>
            {formatCount(repo.stars)}
          </span>
          <time dateTime={repo.updatedAt}>Updated {formatRelative(repo.updatedAt)}</time>
        </div>
      </a>
    </motion.li>
  );
}
