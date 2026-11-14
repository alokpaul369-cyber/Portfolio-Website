import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { FaGithub } from 'react-icons/fa6';
import RepoCard from '@/components/github/RepoCard';
import Button from '@/components/ui/Button';
import LoadError from '@/components/ui/LoadError';
import PageHeader from '@/components/ui/PageHeader';
import Section from '@/components/ui/Section';
import { githubUsername } from '@/config/site';
import useApiQuery from '@/hooks/useApiQuery';
import { formatCount } from '@/lib/format';
import { fadeUp, inViewOnce, stagger } from '@/lib/motion';
import { cardBg } from '@/lib/tone';

// The calendar library is loaded only when this section renders.
const ContributionGraph = lazy(() => import('@/components/github/ContributionGraph'));

/** Shared frame for the stats row; the background follows the section tone. */
const panelClass = 'rounded-xl border border-border';

function StatsSkeleton({ tone }) {
  return (
    <div className="grid grid-cols-2 gap-4" aria-hidden="true">
      {[0, 1].map((i) => (
        <div key={i} className={`${panelClass} ${cardBg(tone)} h-[84px] animate-pulse`} />
      ))}
    </div>
  );
}

function ReposSkeleton({ tone }) {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-busy="true"
      aria-label="Loading repositories"
    >
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className={`h-[132px] animate-pulse rounded-lg border border-border ${cardBg(tone)}`}
        />
      ))}
    </div>
  );
}

/** The graph panel uses the page background, so its placeholder uses the surface colour. */
function GraphFallback() {
  return (
    <div className="h-[130px] w-full animate-pulse rounded-md bg-surface" aria-hidden="true" />
  );
}

/**
 * GitHub profile stats, latest repositories and contribution graph.
 * Stats and repositories come from GET /api/github (cached on the server for
 * one hour); the graph is rendered by react-github-calendar.
 *
 * @param {object} props
 * @param {'bg' | 'surface'} [props.tone='bg'] background band of the section
 * @param {string} [props.index]               section number
 */
export default function GitHubActivity({ tone = 'bg', index }) {
  const { data, isLoading, error, retry } = useApiQuery('/github');
  const profile = data?.profile;
  const repos = data?.repos ?? [];

  const stats = profile
    ? [
        { label: 'Public repositories', value: profile.publicRepos },
        { label: 'Followers', value: profile.followers },
      ]
    : [];

  return (
    <Section id="github" labelledBy="github-heading" tone={tone}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          id="github-heading"
          index={index}
          label="Open source"
          title="GitHub Activity"
          description="Recent work and contributions from my public GitHub profile."
          as="h2"
          inView
        />
        {profile && (
          <Button
            variant="outline"
            href={profile.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 self-start sm:self-auto"
          >
            <FaGithub className="size-4" aria-hidden="true" />
            View profile
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Button>
        )}
      </div>

      {error ? (
        <div className="mt-10">
          <LoadError message={error} onRetry={retry} tone={tone} />
        </div>
      ) : (
        <div className="mt-12 flex flex-col gap-8">
          {/* Profile stats */}
          {isLoading ? (
            <StatsSkeleton tone={tone} />
          ) : (
            <motion.dl
              variants={stagger(0, 0.08)}
              {...inViewOnce}
              className="grid grid-cols-2 gap-4"
            >
              {stats.map(({ label, value }) => (
                <motion.div
                  key={label}
                  variants={fadeUp}
                  className={`${panelClass} ${cardBg(tone)} flex flex-col-reverse gap-1 px-6 py-5`}
                >
                  <dt className="text-sm text-muted">{label}</dt>
                  <dd className="text-3xl font-bold tracking-tight sm:text-4xl">
                    {formatCount(value)}
                  </dd>
                </motion.div>
              ))}
            </motion.dl>
          )}

          {/* Contribution graph: shown immediately, independent of the stats request */}
          {/* Page background (not surface) so the empty-day color stays visible. */}
          <motion.div
            variants={fadeUp}
            {...inViewOnce}
            className="rounded-xl border border-border bg-bg p-5"
          >
            <h3 className="mb-4 text-xs font-semibold tracking-wider text-muted uppercase">
              Contributions
            </h3>
            <div className="overflow-x-auto pb-1">
              <Suspense fallback={<GraphFallback />}>
                <ContributionGraph username={githubUsername} />
              </Suspense>
            </div>
          </motion.div>

          {/* Latest repositories */}
          <div>
            <h3 className="mb-4 text-xs font-semibold tracking-wider text-muted uppercase">
              Recently updated repositories
            </h3>
            {isLoading ? (
              <ReposSkeleton tone={tone} />
            ) : (
              <motion.ul
                variants={stagger(0, 0.06)}
                {...inViewOnce}
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {repos.map((repo) => (
                  <RepoCard key={repo.id} repo={repo} tone={tone} />
                ))}
              </motion.ul>
            )}
          </div>
        </div>
      )}
    </Section>
  );
}
