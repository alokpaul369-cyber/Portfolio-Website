import { motion } from 'framer-motion';
import PageHeader from '@/components/ui/PageHeader';
import Section from '@/components/ui/Section';
import { services } from '@/data/about';
import useSiteContent from '@/hooks/useSiteContent';
import { fadeUp, inViewOnce, stagger } from '@/lib/motion';
import { cardBg, insetBg } from '@/lib/tone';

/** Grid columns for the key facts, by how many there are. */
const FACT_COLUMNS = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
};

/**
 * About content: heading in a narrow left column, introduction and key facts
 * on the right, then the "What I Do" cards across the full width.
 * Used as a section on the Home page and as the main content of /about.
 *
 * @param {object} props
 * @param {'h1' | 'h2'} [props.headingLevel='h2'] h1 when this is the page's main content
 * @param {'bg' | 'surface'} [props.tone='bg']    background band of the section
 * @param {string} [props.index]                  section number shown on the Home page
 */
export default function AboutSection({ headingLevel = 'h2', tone = 'bg', index }) {
  const isPage = headingLevel === 'h1';
  const { aboutParagraphs, keyFacts } = useSiteContent();
  // Sub-headings follow the section heading, so no level is skipped on /about.
  const SubHeading = isPage ? 'h2' : 'h3';
  const CardHeading = isPage ? 'h3' : 'h4';

  return (
    <Section id="about" labelledBy="about-heading" tone={tone}>
      <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
        {/* The heading stays in view beside the text on large screens. */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <PageHeader
            id="about-heading"
            index={index}
            label="About"
            title="About me"
            as={headingLevel}
            inView={!isPage}
          />
        </div>

        <div className="flex flex-col gap-10">
          <motion.div variants={stagger()} {...inViewOnce} className="flex flex-col gap-5">
            {aboutParagraphs.map((text, index) => (
              <motion.p
                key={`${index}-${text.slice(0, 24)}`}
                variants={fadeUp}
                className="text-lg leading-relaxed text-muted"
              >
                {text}
              </motion.p>
            ))}
          </motion.div>

          {/* The admin can save between zero and four key facts. */}
          {keyFacts.length > 0 && (
            <motion.dl
              variants={stagger(0.1)}
              {...inViewOnce}
              className={`grid gap-px overflow-hidden rounded-xl border border-border bg-border ${FACT_COLUMNS[keyFacts.length] ?? FACT_COLUMNS[4]}`}
            >
              {keyFacts.map(({ value, label }, index) => (
                <motion.div
                  key={`${index}-${label}`}
                  variants={fadeUp}
                  className={`flex flex-col-reverse gap-1 px-4 py-6 sm:px-6 ${cardBg(tone)}`}
                >
                  {/* dt precedes dd in the markup; the reversed flex direction shows the value first. */}
                  <dt className="text-xs text-muted sm:text-sm">{label}</dt>
                  <dd className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
                    {value}
                  </dd>
                </motion.div>
              ))}
            </motion.dl>
          )}
        </div>
      </div>

      {/* What I Do */}
      <div className="mt-20">
        <SubHeading className="eyebrow">What I Do</SubHeading>
        <motion.ul
          variants={stagger(0.05, 0.08)}
          {...inViewOnce}
          className="mt-6 grid gap-5 md:grid-cols-3"
        >
          {services.map(({ Icon, title, description }) => (
            <motion.li key={title} variants={fadeUp}>
              <div
                className={`card-hover flex h-full flex-col gap-4 rounded-xl border border-border p-6 ${cardBg(tone)}`}
              >
                <span
                  className={`inline-flex size-10 items-center justify-center rounded-lg border border-border text-primary ${insetBg(tone)}`}
                >
                  <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />
                </span>
                <CardHeading className="text-lg font-semibold">{title}</CardHeading>
                <p className="text-sm leading-relaxed text-muted">{description}</p>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </Section>
  );
}
