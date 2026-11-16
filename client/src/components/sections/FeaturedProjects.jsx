import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ProjectCard, { ProjectCardSkeleton } from '@/components/projects/ProjectCard';
import ProjectRow, { rowGridClass } from '@/components/projects/ProjectRow';
import Button from '@/components/ui/Button';
import LoadError from '@/components/ui/LoadError';
import PageHeader from '@/components/ui/PageHeader';
import Section from '@/components/ui/Section';
import useApiQuery from '@/hooks/useApiQuery';
import { inViewOnce, stagger } from '@/lib/motion';

const FEATURED_COUNT = 6;

/**
 * Home page section with the featured projects (by the admin-defined order):
 * the first as a wide feature card, the rest as numbered rows in a table,
 * with a link to the full Projects page. Hidden entirely if none are featured.
 *
 * Project cards are styled for the page background, so this section always
 * sits on a "bg" band.
 *
 * @param {object} props
 * @param {string} [props.index] section number
 */
export default function FeaturedProjects({ index }) {
  const {
    data: projects,
    isLoading,
    error,
    retry,
  } = useApiQuery('/projects', {
    featured: true,
    limit: FEATURED_COUNT,
  });

  if (!isLoading && !error && projects.length === 0) return null;

  const [first, ...rest] = projects ?? [];

  return (
    <Section id="featured-projects" labelledBy="featured-heading" tone="bg">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          id="featured-heading"
          index={index}
          label="Projects"
          title="Featured projects"
          description="A selection of recent work across backend systems, desktop software and AI."
          as="h2"
          inView
        />
        <Button
          variant="outline"
          to="/projects"
          className="shrink-0 self-start bg-surface sm:self-auto"
        >
          View all projects
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="mt-12">
        {error ? (
          <LoadError message={error} onRetry={retry} />
        ) : isLoading ? (
          <div aria-busy="true" aria-label="Loading projects">
            <ProjectCardSkeleton layout="feature" />
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            <motion.div variants={stagger()} {...inViewOnce}>
              <ProjectCard project={first} layout="feature" />
            </motion.div>

            {rest.length > 0 && (
              <div>
                {/* Column labels for sighted users; each row is a list item with its own heading. */}
                <div
                  className={`eyebrow hidden border-b border-border-strong pb-3 md:grid ${rowGridClass}`}
                  aria-hidden="true"
                >
                  <span className="pl-1">No.</span>
                  <span>Project</span>
                  <span>Category</span>
                  <span>Stack</span>
                  <span />
                </div>
                <motion.ul
                  variants={stagger(0, 0.05)}
                  {...inViewOnce}
                  aria-label="More featured projects"
                  className="border-t border-border-strong md:border-t-0"
                >
                  {rest.map((project, position) => (
                    <ProjectRow
                      key={project.id}
                      project={project}
                      number={String(position + 2).padStart(2, '0')}
                    />
                  ))}
                </motion.ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Section>
  );
}
