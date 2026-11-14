import { motion } from 'framer-motion';
import { ArrowRight, Download, MapPin } from 'lucide-react';
import Button from '@/components/ui/Button';
import ProfilePhoto from '@/components/ui/ProfilePhoto';
import SocialLinks from '@/components/ui/SocialLinks';
import { site } from '@/config/site';
import useSiteContent from '@/hooks/useSiteContent';
import { portraitUrl } from '@/lib/cloudinary';
import { fadeUp, stagger } from '@/lib/motion';

/**
 * Home page introduction: role, name at display size, summary, calls to
 * action, social links and portrait, with a facts strip (location and
 * availability) beneath.
 */
export default function Hero() {
  // Text, CV and photo managed in the admin panel; built-in defaults (and the
  // bundled photo) are used for anything not set or when settings cannot be loaded.
  const {
    role,
    tagline,
    location,
    availability,
    cv,
    profileImage: uploaded,
    isLoading,
  } = useSiteContent();
  const photoSrc = uploaded?.url ? portraitUrl(uploaded.url) : site.profileImage;

  return (
    <section aria-labelledby="hero-heading" className="container-page py-16 sm:py-24 lg:py-28">
      <div className="grid items-center gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
        <motion.div
          variants={stagger(0.05)}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6"
        >
          <motion.p variants={fadeUp} className="eyebrow">
            {role}
          </motion.p>

          <motion.h1 id="hero-heading" variants={fadeUp} className="text-display text-text">
            {site.name}
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="max-w-xl text-lg leading-relaxed text-muted sm:text-xl"
          >
            {tagline}
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3 pt-2">
            <Button to="/projects">
              View Projects
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            {/* Shown once a CV has been uploaded in the admin panel. */}
            {cv && (
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
            )}
          </motion.div>

          <motion.div variants={fadeUp}>
            <SocialLinks className="-ml-2" />
          </motion.div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="order-first w-48 pr-3 pb-3 sm:w-56 lg:order-none lg:ml-auto lg:w-full lg:max-w-sm"
        >
          <ProfilePhoto
            key={isLoading ? 'loading' : photoSrc}
            src={photoSrc}
            fallbackSrc={site.profileImage}
            alt={uploaded?.alt}
            name={site.name}
            loading={isLoading}
          />
        </motion.div>
      </div>

      {/* Facts strip */}
      <motion.ul
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mt-14 grid divide-y divide-border rounded-lg border border-border bg-surface text-sm sm:grid-cols-2 sm:divide-x sm:divide-y-0"
      >
        <li className="flex items-center gap-3 px-6 py-4">
          <MapPin className="size-4 shrink-0 text-muted" strokeWidth={1.75} aria-hidden="true" />
          <span className="text-muted">Location</span>
          <span className="ml-auto font-semibold text-text">{location}</span>
        </li>
        <li className="flex items-center gap-3 px-6 py-4">
          <span className="size-2 shrink-0 rounded-full bg-success" aria-hidden="true" />
          <span className="text-muted">Status</span>
          <span className="ml-auto text-right font-semibold text-text">{availability}</span>
        </li>
      </motion.ul>
    </section>
  );
}
