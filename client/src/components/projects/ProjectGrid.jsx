import { motion } from 'framer-motion';
import { stagger } from '@/lib/motion';
import ProjectCard, { ProjectCardSkeleton } from './ProjectCard';

const gridClass = 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3';

/**
 * Responsive grid of project cards, or skeleton cards while loading.
 *
 * @param {object} props
 * @param {object[]} [props.projects]
 * @param {boolean} props.isLoading
 * @param {number} [props.skeletonCount=6]
 * @param {'h2' | 'h3'} [props.headingLevel='h3'] tag for card titles; h2 directly under a page title
 */
export default function ProjectGrid({
  projects,
  isLoading,
  skeletonCount = 6,
  headingLevel = 'h3',
}) {
  if (isLoading) {
    return (
      <div className={gridClass} aria-busy="true" aria-label="Loading projects">
        {Array.from({ length: skeletonCount }, (_, index) => (
          <ProjectCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      // Re-run the entrance animation when the result set changes (filter or search).
      key={projects.map((project) => project.id).join(',')}
      variants={stagger(0, 0.06)}
      initial="hidden"
      animate="visible"
      className={gridClass}
    >
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} headingLevel={headingLevel} />
      ))}
    </motion.div>
  );
}
