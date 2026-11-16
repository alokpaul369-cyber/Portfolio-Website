import { motion } from 'framer-motion';
import { ArrowRight, Download } from 'lucide-react';
import Button from '@/components/ui/Button';
import SocialLinks from '@/components/ui/SocialLinks';
import { site } from '@/config/site';
import { currentlyLearning } from '@/data/skills';
import useSiteContent from '@/hooks/useSiteContent';
import { fadeUp, riseIn, stagger } from '@/lib/motion';

/** Grid columns for the key facts strip, by how many there are (0 to 4). */
const FACT_COLUMNS = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
};

/** Fixed facts shown in the code card; the rest comes from the site content. */
const STACK = ['MongoDB', 'Express', 'React', 'Node.js'];
const FOCUS = ['REST APIs', 'authentication', 'clean UI'];

/** A JavaScript string literal in the code card. */
function Str({ children }) {
  return <span className="text-success">&apos;{children}&apos;</span>;
}

/** An array of string literals in the code card. */
function StrList({ items }) {
  return (
    <>
      [
      {items.map((item, i) => (
        <span key={item}>
          {i > 0 && ', '}
          <Str>{item}</Str>
        </span>
      ))}
      ]
    </>
  );
}

/**
 * Home page introduction: availability, the name and role as a serif headline,
 * the tagline, actions and social links, beside a short profile written as
 * code. Below: what I am currently learning, then the admin's key facts in a
 * strip divided by hairlines. A faint static grid sits behind the top.
 */
export default function Hero() {
  // Text and CV managed in the admin panel; built-in defaults are used for
  // anything not set or when settings cannot be loaded.
  const { role, tagline, location, availability, keyFacts, cv } = useSiteContent();

  return (
    <section aria-labelledby="hero-heading" className="relative isolate">
      <div className="hero-grid-bg pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />

      <motion.div
        variants={stagger(0.05, 0.08)}
        initial="hidden"
        animate="visible"
        className="container-page pt-12 pb-16 sm:pt-24"
      >
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <motion.p
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-bg py-1.5 pr-3 pl-2.5 font-mono text-xs font-medium tracking-[0.06em] text-success uppercase"
            >
              <span className="size-[7px] rounded-full bg-success" aria-hidden="true" />
              {availability}
            </motion.p>

            {/* Each line rises out of its own mask, one after the other. */}
            <motion.h1
              id="hero-heading"
              variants={stagger(0, 0.12)}
              className="text-hero mt-8 mb-6 text-text"
            >
              <span className="block overflow-hidden pb-[0.1em]">
                <motion.span variants={riseIn} className="block">
                  {site.name},
                </motion.span>
              </span>
              <span className="block overflow-hidden pb-[0.1em]">
                <motion.span variants={riseIn} className="block">
                  <em>{role}</em>
                </motion.span>
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mb-8 max-w-[46ch] text-lg leading-[1.85rem] text-muted sm:text-[1.1875rem]"
            >
              {tagline}
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
              <Button to="/projects">
                View selected work
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
              {/* Shown once a CV has been uploaded in the admin panel. */}
              {cv ? (
                <Button
                  variant="outline"
                  href={cv.url}
                  download={cv.filename}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="size-4" aria-hidden="true" />
                  Download CV
                </Button>
              ) : (
                <Button variant="outline" to="/contact">
                  Get in touch
                </Button>
              )}
              <SocialLinks className="ml-1" />
            </motion.div>
          </div>

          {/* A short profile written as code; the values are the site's own content. */}
          <motion.figure
            variants={fadeUp}
            aria-label="A short profile written as code"
            className="ink-panel elevated m-0 min-w-0 overflow-hidden rounded-[0.875rem] border border-border"
          >
            <figcaption className="flex items-center justify-between border-b border-border px-4 py-2.5 font-mono text-xs text-muted">
              <span className="flex items-center gap-3">
                <span className="flex gap-1.5" aria-hidden="true">
                  <span className="size-[9px] rounded-full bg-border" />
                  <span className="size-[9px] rounded-full bg-border" />
                  <span className="size-[9px] rounded-full bg-border" />
                </span>
                profile.js
              </span>
              <span>JavaScript</span>
            </figcaption>
            {/* Focusable so keyboard users can scroll it sideways on narrow screens. */}
            <pre
              tabIndex={0}
              className="overflow-x-auto p-6 font-mono text-[0.84rem] leading-[1.45rem] text-text"
            >
              <code>
                <span className="text-primary">export const</span> profile = {'{'}
                {'\n  '}role: <Str>{role}</Str>,{'\n  '}location: <Str>{location}</Str>,{'\n  '}
                stack: <StrList items={STACK} />,{'\n  '}focus: <StrList items={FOCUS} />,{'\n  '}
                learning: <StrList items={currentlyLearning} />,{'\n  '}status:{' '}
                <Str>{availability}</Str>,{'\n'}
                {'};'}
              </code>
            </pre>
            <div className="flex justify-between gap-4 border-t border-border px-4 py-2.5 font-mono text-xs text-muted">
              <span>0 problems</span>
              <span>Ln 8, Col 3</span>
            </div>
          </motion.figure>
        </div>

        {/* Currently learning, in the template's "previously at" row. */}
        <motion.div
          variants={fadeUp}
          className="mt-12 flex flex-wrap items-baseline gap-x-8 gap-y-2 border-t border-border pt-6"
        >
          <span className="eyebrow">Currently learning</span>
          <ul className="flex flex-wrap gap-x-8 gap-y-2 font-serif text-lg text-muted">
            {currentlyLearning.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </motion.div>
      </motion.div>

      {/* Key facts; the admin can save between zero and four. They appear one after another. */}
      {keyFacts.length > 0 && (
        <motion.dl
          variants={stagger(0.35, 0.1)}
          initial="hidden"
          animate="visible"
          className={`container-page grid grid-cols-2 ${FACT_COLUMNS[keyFacts.length] ?? FACT_COLUMNS[4]}`}
        >
          {keyFacts.map(({ value, label }, index) => (
            <motion.div
              key={`${index}-${label}`}
              variants={fadeUp}
              className="flex flex-col-reverse gap-3 border-y border-border py-8 pr-6 not-first:border-l not-first:pl-6"
            >
              {/* dt precedes dd in the markup; the reversed direction shows the value first. */}
              <dt className="text-sm leading-5 text-muted">{label}</dt>
              <dd className="font-serif text-4xl leading-none tracking-tight text-text tabular-nums sm:text-[2.75rem]">
                {value}
              </dd>
            </motion.div>
          ))}
        </motion.dl>
      )}
    </section>
  );
}
