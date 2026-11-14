import AboutSection from '@/components/sections/AboutSection';
import Seo from '@/components/seo/Seo';
import { SITE_URL } from '@/lib/siteUrl';
import { personSchema } from '@/config/seo';
import useSiteContent from '@/hooks/useSiteContent';

/** About page: the same content as the Home page section, as the page's main heading. */
export default function About() {
  const { linkedin } = useSiteContent();

  return (
    <>
      <Seo
        title="About"
        description="About Alok Paul: a CSE undergraduate in Bangladesh building full-stack applications with MongoDB, Express, React and Node.js, focused on secure backend design and authentication."
        path="/about"
        type="profile"
        jsonLd={personSchema(SITE_URL, { linkedin })}
      />
      <AboutSection headingLevel="h1" />
    </>
  );
}
