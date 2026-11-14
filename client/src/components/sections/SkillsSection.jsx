import { useMemo } from 'react';
import { motion } from 'framer-motion';
import CurrentlyLearning from '@/components/skills/CurrentlyLearning';
import SkillCard from '@/components/skills/SkillCard';
import LoadError from '@/components/ui/LoadError';
import PageHeader from '@/components/ui/PageHeader';
import Section from '@/components/ui/Section';
import { skillCategories } from '@/data/skills';
import useApiQuery from '@/hooks/useApiQuery';
import { fadeUp, inViewOnce, stagger } from '@/lib/motion';
import { cardBg } from '@/lib/tone';

/** One category row: label on the left, its skills on the right from the lg breakpoint. */
const groupClass = 'grid gap-4 border-t border-border py-8 lg:grid-cols-[14rem_1fr] lg:gap-10';
const skillGridClass = 'grid grid-cols-2 gap-3 sm:grid-cols-3';

/** Placeholder cards shown while skills load, matching the real layout. */
function SkillsSkeleton({ tone }) {
  return (
    <div aria-busy="true" aria-label="Loading skills">
      {[5, 6, 4].map((count, group) => (
        <div key={group} className={groupClass}>
          <div className={`h-4 w-28 animate-pulse rounded ${cardBg(tone)}`} />
          <div className={skillGridClass}>
            {Array.from({ length: count }, (_, i) => (
              <div key={i} className={`h-12 animate-pulse rounded-lg ${cardBg(tone)}`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skills grouped into one row per category, loaded from GET /api/skills,
 * followed by the "Currently Learning" strip. Used on the Home page and as
 * the /skills page.
 *
 * @param {object} props
 * @param {'h1' | 'h2'} [props.headingLevel='h2'] h1 when this is the page's main content
 * @param {'bg' | 'surface'} [props.tone='bg']    background band of the section
 * @param {string} [props.index]                  section number shown on the Home page
 */
export default function SkillsSection({ headingLevel = 'h2', tone = 'bg', index }) {
  const isPage = headingLevel === 'h1';
  // Sub-headings follow the section heading, so no level is skipped on /skills.
  const subLevel = isPage ? 'h2' : 'h3';
  const GroupHeading = isPage ? motion.h2 : motion.h3;
  const { data: skills, isLoading, error, retry } = useApiQuery('/skills');

  // Group skills into the configured category order, skipping empty categories.
  const groups = useMemo(() => {
    if (!skills) return [];
    return skillCategories
      .map((category) => ({
        ...category,
        items: skills.filter((skill) => skill.category === category.key),
      }))
      .filter((group) => group.items.length > 0);
  }, [skills]);

  return (
    <Section id="skills" labelledBy="skills-heading" tone={tone}>
      <PageHeader
        id="skills-heading"
        index={index}
        label="Skills"
        title="Skills and tools"
        description="The languages, frameworks and tools I use to design, build and ship full-stack applications."
        as={headingLevel}
        inView={!isPage}
      />

      <div className="mt-12 flex flex-col">
        {isLoading && <SkillsSkeleton tone={tone} />}

        {error && <LoadError message={error} onRetry={retry} tone={tone} />}

        {!isLoading && !error && groups.length === 0 && (
          <p className="text-sm text-muted">Skills will be listed here soon.</p>
        )}

        {groups.map((group) => (
          <div key={group.key} className={groupClass}>
            <GroupHeading
              variants={fadeUp}
              {...inViewOnce}
              className="text-base font-semibold text-text"
            >
              {group.label}
            </GroupHeading>
            <motion.ul variants={stagger(0, 0.04)} {...inViewOnce} className={skillGridClass}>
              {group.items.map((skill) => (
                <SkillCard key={skill.id} name={skill.name} icon={skill.icon} tone={tone} />
              ))}
            </motion.ul>
          </div>
        ))}

        <div className="border-t border-border pt-8">
          <CurrentlyLearning headingLevel={subLevel} tone={tone} />
        </div>
      </div>
    </Section>
  );
}
