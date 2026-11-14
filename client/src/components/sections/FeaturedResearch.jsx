import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ResearchRow from '@/components/research/ResearchRow';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import Section from '@/components/ui/Section';
import { inViewOnce, stagger } from '@/lib/motion';

/**
 * Home page section with the featured research entries. Home loads the
 * entries and renders this section only when there is at least one, so it is
 * never shown empty.
 *
 * @param {object} props
 * @param {object[]} props.entries             featured, visible entries to show
 * @param {'bg' | 'surface'} [props.tone='bg'] background band of the section
 * @param {string} [props.index]               section number
 */
export default function FeaturedResearch({ entries, tone = 'bg', index }) {
  return (
    <Section id="research" labelledBy="research-heading" tone={tone}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          id="research-heading"
          index={index}
          label="Research"
          title="Research"
          description="Papers, theses and ongoing research work."
          as="h2"
          inView
        />
        <Button variant="outline" to="/research" className="shrink-0 self-start sm:self-auto">
          View all research
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <motion.ul
        variants={stagger(0, 0.08)}
        {...inViewOnce}
        className="mt-12 border-b border-border"
      >
        {entries.map((entry) => (
          <ResearchRow key={entry.id} entry={entry} headingLevel="h3" />
        ))}
      </motion.ul>
    </Section>
  );
}
