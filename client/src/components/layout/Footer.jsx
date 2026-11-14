import { Link, useLocation } from 'react-router';
import { ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import SocialLinks from '@/components/ui/SocialLinks';
import { site } from '@/config/site';
import useSiteContent from '@/hooks/useSiteContent';

/**
 * Site footer: a closing contact band (email and a link to the contact page),
 * followed by the copyright notice and social links. The band is hidden on
 * the Contact page, where it would repeat the page itself.
 */
export default function Footer() {
  const { pathname } = useLocation();
  const { email } = useSiteContent();
  const year = new Date().getFullYear();
  const showContactBand = pathname !== '/contact';

  return (
    <footer className="border-t border-border bg-surface">
      {showContactBand && (
        <div className="border-b border-border">
          <div className="container-page flex flex-col gap-8 py-16 sm:py-20 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-4">
              <p className="eyebrow">Contact</p>
              <h2 className="text-heading">Get in touch</h2>
              <a
                href={`mailto:${email}`}
                className="text-xl font-semibold break-all text-text underline-offset-4 transition-colors hover:text-primary hover:underline sm:text-2xl"
              >
                {email}
              </a>
            </div>
            <Button to="/contact" className="self-start lg:self-auto">
              Contact me
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}

      <div className="container-page flex flex-col-reverse items-center gap-4 py-8 sm:flex-row sm:justify-between">
        <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted">
          <span>
            &copy; {year} {site.name}. All rights reserved.
          </span>
          <Link
            to="/privacy"
            className="underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Privacy
          </Link>
        </p>
        <SocialLinks />
      </div>
    </footer>
  );
}
