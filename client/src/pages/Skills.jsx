import SkillsSection from '@/components/sections/SkillsSection';
import Seo from '@/components/seo/Seo';

/** Skills page: the Skills section as the page's main content. */
export default function Skills() {
  return (
    <>
      <Seo
        title="Skills"
        description="Alok Paul's technical skills: C++, Java, JavaScript and TypeScript; React, Next.js and Tailwind CSS; Node.js, Express, REST APIs and JWT; MongoDB and SQLite."
        path="/skills"
      />
      <SkillsSection headingLevel="h1" />
    </>
  );
}
