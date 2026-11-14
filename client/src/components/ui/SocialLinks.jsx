import { Mail } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa6';
import { socialLinks } from '@/config/site';
import useSiteContent from '@/hooks/useSiteContent';

/**
 * Icon links to GitHub, LinkedIn and email. Used in the hero and footer; the
 * tinted hover background shows on both the page and surface colours.
 * LinkedIn appears once a profile link has been saved in the admin panel.
 */
export default function SocialLinks({ className = '' }) {
  const { email, linkedin } = useSiteContent();
  const links = [
    { label: 'GitHub', href: socialLinks.github, Icon: FaGithub, external: true },
    linkedin && { label: 'LinkedIn', href: linkedin, Icon: FaLinkedin, external: true },
    { label: 'Email', href: `mailto:${email}`, Icon: Mail, external: false },
  ].filter(Boolean);

  return (
    <ul className={`flex items-center gap-2 ${className}`}>
      {links.map(({ label, href, Icon, external }) => (
        <li key={label}>
          <a
            href={href}
            aria-label={label}
            title={label}
            {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
            className="inline-flex size-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <Icon className="size-[18px]" aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  );
}
