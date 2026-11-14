import { ArrowRight } from 'lucide-react';
import ProjectGrid from '@/components/projects/ProjectGrid';
import Button from '@/components/ui/Button';
import LoadError from '@/components/ui/LoadError';
import PageHeader from '@/components/ui/PageHeader';
import Section from '@/components/ui/Section';
import useApiQuery from '@/hooks/useApiQuery';

const FEATURED_COUNT = 3;

/**
 * Home page section with the top featured projects (by the admin-defined order):
 * the first as a wide feature card, the rest in a two-column grid, with a link
 * to the full Projects page. Hidden entirely if none are featured.
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
        <Button variant="outline" to="/projects" className="shrink-0 self-start sm:self-auto">
          View all projects
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="mt-12">
        {error ? (
          <LoadError message={error} onRetry={retry} />
        ) : (
          <ProjectGrid
            projects={projects}
            isLoading={isLoading}
            skeletonCount={FEATURED_COUNT}
            featureFirst
          />
        )}
      </div>
    </Section>
  );
}
