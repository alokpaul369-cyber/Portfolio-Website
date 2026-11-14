import Hero from '@/components/sections/Hero';
import AboutSection from '@/components/sections/AboutSection';
import FeaturedProjects from '@/components/sections/FeaturedProjects';
import FeaturedResearch from '@/components/sections/FeaturedResearch';
import GitHubActivity from '@/components/sections/GitHubActivity';
import SkillsSection from '@/components/sections/SkillsSection';
import Seo from '@/components/seo/Seo';
import { SITE_URL } from '@/lib/siteUrl';
import { personSchema } from '@/config/seo';
import useApiQuery from '@/hooks/useApiQuery';
import useSiteContent from '@/hooks/useSiteContent';

/** Research entries shown on the Home page at most. */
const FEATURED_RESEARCH = 3;

/**
 * Home page: introduction, then numbered sections for About, featured
 * projects, featured research (when there is any), GitHub activity and Skills on
 * alternating background bands.
 */
export default function Home() {
  const { linkedin } = useSiteContent();
  // Featured, visible research only: the signed-in owner sees the same page as visitors.
  const { data: research } = useApiQuery('/research', { featured: true });
  const featuredResearch = (research ?? [])
    .filter((entry) => entry.visible)
    .slice(0, FEATURED_RESEARCH);

  // Sections after the hero, in order. Research is included only when there are
  // featured entries to show, so the numbering and alternating bands stay continuous.
  // Featured projects must sit on a "bg" band, which its position guarantees.
  const blocks = [
    { id: 'about', Block: AboutSection },
    { id: 'projects', Block: FeaturedProjects },
    featuredResearch.length > 0 && {
      id: 'research',
      Block: FeaturedResearch,
      props: { entries: featuredResearch },
    },
    { id: 'github', Block: GitHubActivity },
    { id: 'skills', Block: SkillsSection },
  ].filter(Boolean);

  return (
    <>
      {/* Default title and description; Person structured data for search engines. */}
      <Seo path="/" type="profile" jsonLd={personSchema(SITE_URL, { linkedin })} />
      <Hero />
      {blocks.map(({ id, Block, props }, position) => (
        <Block
          key={id}
          tone={position % 2 === 0 ? 'surface' : 'bg'}
          index={String(position + 1).padStart(2, '0')}
          {...props}
        />
      ))}
    </>
  );
}
