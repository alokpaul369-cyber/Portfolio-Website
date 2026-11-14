import { motion } from 'framer-motion';
import { stagger } from '@/lib/motion';
import ProjectCard, { ProjectCardSkeleton } from './ProjectCard';

const gridClass = 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3';
/** With `featureFirst`: the first card spans the full width, the rest sit two per row. */
const featureGridClass = 'grid gap-6 md:grid-cols-2';

/**
 * Responsive grid of project cards, or skeleton cards while loading.
 *
 * @param {object} props
 * @param {object[]} [props.projects]
 * @param {boolean} props.isLoading
 * @param {number} [props.skeletonCount=6]
 * @param {boolean} [props.featureFirst=false] show the first project as a wide feature card
 * @param {'h2' | 'h3'} [props.headingLevel='h3'] tag for card titles; h2 directly under a page title
 */
export default function ProjectGrid({
  projects,
  isLoading,
  skeletonCount = 6,
  featureFirst = false,
  headingLevel = 'h3',
}) {
  const className = featureFirst ? featureGridClass : gridClass;
  const spanClass = 'md:col-span-2';

  if (isLoading) {
    return (
      <div className={className} aria-busy="true" aria-label="Loading projects">
        {Array.from({ length: skeletonCount }, (_, index) => (
          <div key={index} className={featureFirst && index === 0 ? spanClass : undefined}>
            <ProjectCardSkeleton layout={featureFirst && index === 0 ? 'feature' : 'card'} />
          </div>
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
      className={className}
    >
      {projects.map((project, index) => {
        // A lone trailing card also spans the row, so the grid never ends half empty.
        const isFeature = featureFirst && index === 0;
        const isLoneLast =
          featureFirst && index > 0 && index === projects.length - 1 && index % 2 === 1;
        return (
          <div key={project.id} className={isFeature || isLoneLast ? spanClass : undefined}>
            <ProjectCard
              project={project}
              layout={isFeature || isLoneLast ? 'feature' : 'card'}
              headingLevel={headingLevel}
            />
          </div>
        );
      })}
    </motion.div>
  );
}
