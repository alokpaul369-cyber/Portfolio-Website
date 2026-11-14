import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { FaGithub } from 'react-icons/fa6';
import { getProjectCategory } from '@/data/projects';
import { fadeUp } from '@/lib/motion';
import ProjectImage from './ProjectImage';
import { TechBadgeList } from './TechBadge';

/**
 * Project summary card: image, category, title, description, tech badges and links. The title links to the detail
 * page; GitHub and live links open in a new tab.
 *
 * `layout="feature"` places the image beside the text from the md breakpoint,
 * for cards that span a full row on the Home page; below md it matches the
 * default card. `headingLevel` is the title's tag: h3 under a section heading,
 * h2 when the cards sit directly under the page title.
 *
 * @param {{ project: object, layout?: 'card' | 'feature', headingLevel?: 'h2' | 'h3' }} props
 */
export default function ProjectCard({ project, layout = 'card', headingLevel: Heading = 'h3' }) {
  const { slug, title, description, category, techStack, images, githubUrl, liveUrl, featured } =
    project;
  const detailUrl = `/projects/${slug}`;
  const isFeature = layout === 'feature';

  return (
    <motion.div variants={fadeUp} className="h-full">
      <article
        className={`card-hover group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface ${
          isFeature ? 'md:grid md:grid-cols-2' : ''
        }`}
      >
        <Link
          to={detailUrl}
          tabIndex={-1}
          aria-hidden="true"
          className={`border-b border-border ${isFeature ? 'md:border-r md:border-b-0' : ''}`}
        >
          <ProjectImage
            image={images?.[0]}
            title={title}
            category={category}
            className={isFeature ? 'md:aspect-auto md:h-full md:min-h-80' : ''}
          />
        </Link>

        <div className={`flex flex-1 flex-col gap-3 p-5 ${isFeature ? 'md:gap-4 md:p-8' : ''}`}>
          <p className="flex items-center gap-2 text-[11px] font-semibold tracking-wider text-primary uppercase">
            {getProjectCategory(category).label}
            {featured && (
              <span className="rounded-full border border-primary/40 px-2 py-px text-[10px] text-primary normal-case">
                Featured
              </span>
            )}
          </p>

          <Heading
            className={`leading-snug font-bold tracking-tight ${
              isFeature ? 'text-xl md:text-3xl' : 'text-xl'
            }`}
          >
            <Link to={detailUrl} className="transition-colors hover:text-primary">
              {title}
            </Link>
          </Heading>

          <p
            className={`text-sm leading-relaxed text-muted ${
              isFeature ? 'line-clamp-3 md:line-clamp-4 md:text-base' : 'line-clamp-3'
            }`}
          >
            {description}
          </p>

          <TechBadgeList items={techStack} max={isFeature ? 8 : 4} className="mt-auto pt-2" />

          <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
            <Link
              to={detailUrl}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-text transition-colors hover:text-primary"
            >
              View details
              <ArrowRight
                className="size-3.5 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none"
                aria-hidden="true"
              />
              <span className="sr-only">for {title}</span>
            </Link>

            <div className="flex items-center gap-1">
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${title} source code on GitHub`}
                  title="Source code"
                  className="inline-flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-bg hover:text-primary"
                >
                  <FaGithub className="size-4" aria-hidden="true" />
                </a>
              )}
              {liveUrl && (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${title} live demo`}
                  title="Live demo"
                  className="inline-flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-bg hover:text-primary"
                >
                  <ExternalLink className="size-4" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        </div>
      </article>
    </motion.div>
  );
}

/** Loading placeholder with the same shape as ProjectCard, in either layout. */
export function ProjectCardSkeleton({ layout = 'card' }) {
  const isFeature = layout === 'feature';

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-xl border border-border bg-surface ${
        isFeature ? 'md:grid md:grid-cols-2' : ''
      }`}
    >
      <div
        className={`aspect-[16/10] animate-pulse bg-bg ${isFeature ? 'md:aspect-auto md:min-h-80' : ''}`}
      />
      <div className={`flex flex-col gap-3 p-5 ${isFeature ? 'md:p-8' : ''}`}>
        <div className="h-3 w-16 animate-pulse rounded bg-bg" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-bg" />
        <div className="h-4 w-full animate-pulse rounded bg-bg" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-bg" />
        <div className="mt-2 flex gap-1.5">
          {[56, 64, 48].map((width) => (
            <div key={width} className="h-5 animate-pulse rounded bg-bg" style={{ width }} />
          ))}
        </div>
      </div>
    </div>
  );
}
