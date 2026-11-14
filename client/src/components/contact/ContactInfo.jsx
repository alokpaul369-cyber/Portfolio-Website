import { createElement } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Mail, MapPin } from 'lucide-react';
import { TbBrandGithub, TbBrandLinkedin } from 'react-icons/tb';
import { githubUsername, socialLinks } from '@/config/site';
import useSiteContent from '@/hooks/useSiteContent';
import { fadeUp, stagger } from '@/lib/motion';

/**
 * Contact methods shown beside the form. Items with `href` are links.
 * LinkedIn is listed once a profile link has been saved in the admin panel.
 */
function contactItems({ email, location, linkedin }) {
  return [
    { Icon: Mail, label: 'Email', value: email, href: `mailto:${email}` },
    { Icon: MapPin, label: 'Location', value: location },
    {
      Icon: TbBrandGithub,
      label: 'GitHub',
      value: githubUsername,
      href: socialLinks.github,
      external: true,
    },
    linkedin && {
      Icon: TbBrandLinkedin,
      label: 'LinkedIn',
      value: 'Connect on LinkedIn',
      href: linkedin,
      external: true,
    },
  ].filter(Boolean);
}

/** Card body shared by linked and plain items. */
function CardContent({ Icon, label, value, href, external }) {
  return (
    <>
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-border text-primary">
        {createElement(Icon, { className: 'size-[18px]', strokeWidth: 1.5, 'aria-hidden': true })}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-xs text-muted">{label}</span>
        <span className="truncate text-sm font-medium">{value}</span>
      </span>
      {href && external && (
        <ArrowUpRight
          className="ml-auto size-4 shrink-0 text-muted transition-colors group-hover:text-primary"
          aria-hidden="true"
        />
      )}
    </>
  );
}

/** List of contact cards: email, location, GitHub and, when set, LinkedIn. */
export default function ContactInfo() {
  const items = contactItems(useSiteContent());
  const cardClass =
    'flex items-center gap-4 rounded-xl border border-border bg-surface px-4 py-3.5';

  return (
    <motion.ul
      variants={stagger(0.1, 0.06)}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-3"
    >
      {items.map((item) => (
        <motion.li key={item.label} variants={fadeUp}>
          {item.href ? (
            <a
              href={item.href}
              {...(item.external && { target: '_blank', rel: 'noopener noreferrer' })}
              className={`card-hover group ${cardClass}`}
            >
              <CardContent {...item} />
            </a>
          ) : (
            <div className={cardClass}>
              <CardContent {...item} />
            </div>
          )}
        </motion.li>
      ))}
    </motion.ul>
  );
}
