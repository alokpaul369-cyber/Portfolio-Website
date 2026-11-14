import { Link, useParams } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { FaGithub } from 'react-icons/fa6';
import ProjectImage from '@/components/projects/ProjectImage';
import { TechBadgeList } from '@/components/projects/TechBadge';
import Button from '@/components/ui/Button';
import LoadError from '@/components/ui/LoadError';
import { getProjectCategory } from '@/data/projects';
import useApiQuery from '@/hooks/useApiQuery';
import Seo from '@/components/seo/Seo';
import { SITE_URL } from '@/lib/siteUrl';
import { fadeUp, stagger } from '@/lib/motion';

/** Link back to the projects list. */
function BackLink() {
  return (
    <Link
      to="/projects"
      className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-primary"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      All projects
    </Link>
  );
}

/** Loading placeholder matching the detail layout. */
function DetailSkeleton() {
  return (
    <div className="mt-10 flex flex-col gap-4" aria-busy="true" aria-label="Loading project">
      <div className="h-3 w-20 animate-pulse rounded bg-surface" />
      <div className="h-14 w-2/3 animate-pulse rounded bg-surface" />
      <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-surface" />
      <div className="h-4 w-5/6 max-w-2xl animate-pulse rounded bg-surface" />
      <div className="mt-6 aspect-[16/10] w-full animate-pulse rounded-xl bg-surface" />
    </div>
  );
}

/**
 * Project detail page at /projects/:slug: display title and description, then
 * screenshots beside a details panel (category, technologies, links) that
 * stays in view on large screens.
 */
export default function ProjectDetail() {
  const { slug } = useParams();
  const { data: project, isLoading, error, errorStatus, retry } = useApiQuery(`/projects/${slug}`);

  const path = `/projects/${slug}`;

  if (errorStatus === 404) {
    return (
      <section className="container-page py-20 sm:py-28">
        <Seo title="Project not found" noindex />
        <BackLink />
        <h1 className="text-heading mt-10">Project not found</h1>
        <p className="mt-3 text-muted">This project does not exist or has been removed.</p>
      </section>
    );
  }

  return (
    <article className="container-page py-20 sm:py-28">
      {project ? (
        <Seo
          title={project.title}
          // Search snippets show roughly 155 characters.
          description={
            project.description.length > 155
              ? `${project.description.slice(0, 152).trimEnd()}...`
              : project.description
          }
          path={path}
          image={project.images?.[0]?.url}
          imageAlt={project.images?.[0]?.alt || `Screenshot of ${project.title}`}
          jsonLd={{
            '@context': 'https://schema.org',
            '@type': 'SoftwareSourceCode',
            name: project.title,
            description: project.description,
            url: `${SITE_URL}${path}`,
            ...(project.githubUrl && { codeRepository: project.githubUrl }),
            programmingLanguage: project.techStack,
            author: { '@type': 'Person', name: 'Alok Paul', url: SITE_URL },
          }}
        />
      ) : (
        <Seo title="Project" path={path} />
      )}
      <BackLink />

      {isLoading && <DetailSkeleton />}
      {error && (
        <div className="mt-10">
          <LoadError message={error} onRetry={retry} />
        </div>
      )}

      {project && (
        <motion.div
          variants={stagger(0, 0.08)}
          initial="hidden"
          animate="visible"
          className="mt-10"
        >
          <motion.header variants={fadeUp} className="flex flex-col gap-4">
            <p className="eyebrow flex items-center gap-2">
              {getProjectCategory(project.category).label}
              {project.featured && (
                <span className="rounded-full border border-border px-2 py-px text-[11px] tracking-normal text-muted normal-case">
                  Featured
                </span>
              )}
            </p>
            <h1 className="text-display">{project.title}</h1>
            <span className="mt-2 h-1 w-16 bg-primary" aria-hidden="true" />
            <p className="max-w-3xl text-lg leading-relaxed whitespace-pre-line text-muted">
              {project.description}
            </p>
          </motion.header>

          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_18rem] lg:gap-12">
            <motion.aside
              variants={fadeUp}
              aria-label="Project details"
              className="flex flex-col gap-6 rounded-xl border border-border bg-surface p-6 lg:sticky lg:top-24 lg:order-last lg:self-start"
            >
              <div className="flex flex-col gap-2">
                <h2 className="eyebrow text-muted">Category</h2>
                <p className="font-semibold">{getProjectCategory(project.category).label}</p>
              </div>
              <div className="flex flex-col gap-3">
                <h2 className="eyebrow text-muted">Technologies</h2>
                <TechBadgeList items={project.techStack} />
              </div>

              {(project.githubUrl || project.liveUrl) && (
                <div className="flex flex-col gap-3 border-t border-border pt-6">
                  {project.githubUrl && (
                    <Button
                      variant={project.liveUrl ? 'outline' : 'primary'}
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaGithub className="size-4" aria-hidden="true" />
                      View source on GitHub
                    </Button>
                  )}
                  {project.liveUrl && (
                    <Button
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="order-first"
                    >
                      <ExternalLink className="size-4" aria-hidden="true" />
                      Live demo
                    </Button>
                  )}
                </div>
              )}
            </motion.aside>

            <motion.div variants={fadeUp} className="flex min-w-0 flex-col gap-6">
              <ProjectImage
                image={project.images?.[0]}
                title={project.title}
                category={project.category}
                eager
                className="rounded-xl border border-border"
              />

              {project.images?.length > 1 && (
                <ul className="grid gap-6 sm:grid-cols-2" aria-label="More screenshots">
                  {project.images.slice(1).map((image) => (
                    <li key={image.url}>
                      <ProjectImage
                        image={image}
                        title={project.title}
                        category={project.category}
                        className="rounded-xl border border-border"
                      />
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </article>
  );
}
