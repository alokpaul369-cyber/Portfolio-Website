import CertificationsSection from '@/components/sections/CertificationsSection';
import EducationTimeline from '@/components/sections/EducationTimeline';
import Seo from '@/components/seo/Seo';
import PageHeader from '@/components/ui/PageHeader';

/** Experience and education page. Work experience is added alongside the education list later. */
export default function Experience() {
  return (
    <>
      <Seo
        title="Experience and Education"
        description="Education and experience of Alok Paul, currently studying for a B.Sc. in Computer Science and Engineering."
        path="/experience"
      />
      <section className="container-page pt-20 sm:pt-28">
        <PageHeader
          label="Experience"
          title="Experience and education"
          description="Academic background, work experience and relevant training."
        />
      </section>
      <EducationTimeline />
      {/* Omitted until a certification has been added in the admin panel. */}
      <CertificationsSection />
    </>
  );
}
