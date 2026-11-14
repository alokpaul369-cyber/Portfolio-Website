import { motion } from 'framer-motion';
import ContactForm from '@/components/contact/ContactForm';
import ContactInfo from '@/components/contact/ContactInfo';
import PageHeader from '@/components/ui/PageHeader';
import Seo from '@/components/seo/Seo';
import { fadeUp } from '@/lib/motion';

/** Contact page: introduction, contact details and the message form. */
export default function Contact() {
  return (
    <section className="container-page py-20 sm:py-28">
      <Seo
        title="Contact"
        description="Contact Alok Paul about collaboration, internships and freelance web development. Based in Bangladesh, available for remote work."
      />
      <PageHeader
        label="Contact"
        title="Get in Touch"
        description="I am open to collaboration, internships and freelance opportunities. Feel free to reach out."
      />

      <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold tracking-tight">Contact details</h2>
          <ContactInfo />
          <p className="mt-2 text-sm leading-relaxed text-muted">
            I usually reply within two business days.
          </p>
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.15 }}
          className="flex flex-col gap-4"
        >
          <h2 className="text-xl font-bold tracking-tight">Send a message</h2>
          <ContactForm />
        </motion.div>
      </div>
    </section>
  );
}
