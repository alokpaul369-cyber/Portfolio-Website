import { motion } from 'framer-motion';
import PageHeader from '@/components/ui/PageHeader';
import ProfilePhoto from '@/components/ui/ProfilePhoto';
import Section from '@/components/ui/Section';
import { site } from '@/config/site';
import { services } from '@/data/about';
import useSiteContent from '@/hooks/useSiteContent';
import { portraitUrl } from '@/lib/cloudinary';
import { fadeUp, inViewOnce, stagger } from '@/lib/motion';

/** Grid columns for the key facts, by how many there are. */
const FACT_COLUMNS = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
};

/**
 * About content: the section heading, then the portrait in the narrow label
 * column beside the introduction (and, on /about, the key facts), then the
 * "What I Do" services in three columns divided by hairlines.
 * Used as a section on the Home page (where the hero shows the key facts) and
 * as the main content of /about.
 *
 * @param {object} props
 * @param {'h1' | 'h2'} [props.headingLevel='h2'] h1 when this is the page's main content
 * @param {'bg' | 'surface'} [props.tone='bg']    background band of the section
 * @param {string} [props.index]                  section number shown on the Home page
 */
export default function AboutSection({ headingLevel = 'h2', tone = 'bg', index }) {
  const isPage = headingLevel === 'h1';
  const { aboutParagraphs, keyFacts, profileImage: uploaded, isLoading } = useSiteContent();
  const photoSrc = uploaded?.url ? portraitUrl(uploaded.url) : site.profileImage;
  // Sub-headings follow the section heading, so no level is skipped on /about.
  const SubHeading = isPage ? 'h2' : 'h3';
  const CardHeading = isPage ? 'h3' : 'h4';

  return (
    <Section id="about" labelledBy="about-heading" tone={tone}>
      <PageHeader
        id="about-heading"
        index={index}
        label="About"
        title="About me"
        as={headingLevel}
        inView={!isPage}
      />

      <div className="mt-12 grid gap-10 md:grid-cols-[minmax(0,3fr)_minmax(0,9fr)] md:gap-8">
        <motion.div
          variants={fadeUp}
          {...inViewOnce}
          className="elevated w-full max-w-60 self-start overflow-hidden rounded-[0.875rem] border border-border bg-surface"
        >
          <ProfilePhoto
            key={isLoading ? 'loading' : photoSrc}
            src={photoSrc}
            fallbackSrc={site.profileImage}
            alt={uploaded?.alt}
            name={site.name}
            loading={isLoading}
            bare
          />
        </motion.div>

        <div className="flex flex-col gap-10">
          <motion.div variants={stagger()} {...inViewOnce} className="flex flex-col gap-5">
            {aboutParagraphs.map((text, index) => (
              <motion.p
                key={`${index}-${text.slice(0, 24)}`}
                variants={fadeUp}
                className="max-w-[64ch] text-lg leading-relaxed text-muted"
              >
                {text}
              </motion.p>
            ))}
          </motion.div>

          {/* The admin can save between zero and four key facts; Home shows them in the hero. */}
          {isPage && keyFacts.length > 0 && (
            <motion.dl
              variants={stagger(0.1)}
              {...inViewOnce}
              className={`grid gap-6 ${FACT_COLUMNS[keyFacts.length] ?? FACT_COLUMNS[4]}`}
            >
              {keyFacts.map(({ value, label }, index) => (
                <motion.div
                  key={`${index}-${label}`}
                  variants={fadeUp}
                  className="flex flex-col-reverse gap-2 border-t border-border pt-4"
                >
                  {/* dt precedes dd in the markup; the reversed flex direction shows the value first. */}
                  <dt className="text-sm text-muted">{label}</dt>
                  <dd className="font-serif text-4xl tracking-tight text-text tabular-nums">
                    {value}
                  </dd>
                </motion.div>
              ))}
            </motion.dl>
          )}
        </div>
      </div>

      {/* What I Do: three columns divided by hairlines, stacked below md. */}
      <div className="mt-20">
        <SubHeading className="eyebrow">What I Do</SubHeading>
        <motion.ul
          variants={stagger(0.05, 0.08)}
          {...inViewOnce}
          className="mt-6 grid border-t border-border md:grid-cols-3"
        >
          {services.map(({ Icon, title, description }) => (
            <motion.li
              key={title}
              variants={fadeUp}
              className="flex flex-col gap-3 border-border py-8 not-first:border-t md:not-first:border-t-0 md:not-first:border-l md:not-first:pl-8 md:not-last:pr-8"
            >
              <Icon className="mb-3 size-5 text-primary" strokeWidth={1.5} aria-hidden="true" />
              <CardHeading className="font-serif text-2xl">{title}</CardHeading>
              <p className="text-[0.9375rem] leading-6 text-muted">{description}</p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </Section>
  );
}
