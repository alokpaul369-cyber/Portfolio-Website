import Seo from '@/components/seo/Seo';
import PageHeader from '@/components/ui/PageHeader';
import { site } from '@/config/site';

/** One titled part of the policy. */
function Part({ title, children }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <div className="flex flex-col gap-3 leading-relaxed text-muted">{children}</div>
    </section>
  );
}

/**
 * Privacy page at /privacy: what the site collects, what it does not, and
 * which outside services a visitor's browser contacts. Linked from the footer.
 * Keep it accurate when tracking, storage or third-party requests change.
 */
export default function Privacy() {
  return (
    <section className="container-page py-20 sm:py-28">
      <Seo
        title="Privacy"
        description={`How ${site.name}'s website handles visitor statistics and contact messages.`}
        path="/privacy"
      />
      <div className="mx-auto flex max-w-3xl flex-col gap-12">
        <PageHeader
          label="Privacy"
          title="Privacy"
          description="This site collects as little as possible. This page explains what is collected and why."
        />

        <Part title="Visitor statistics">
          <p>
            To understand which pages are read, the site counts page views and visits. Only daily
            totals are stored, for example the number of views of a page on a given day, along with
            the website a visit came from (only its domain, such as google.com).
          </p>
          <p>
            No cookies are used for this, and no IP address, browser details or other identifier is
            stored. A visit is counted once per browser tab using a temporary flag that stays in
            your browser and is removed when the tab is closed. Totals are deleted automatically
            after about 13 months.
          </p>
          <p>
            Nothing is counted if your browser sends a Do Not Track or Global Privacy Control
            signal.
          </p>
        </Part>

        <Part title="Contact form">
          <p>
            When you send a message, your name, email address, subject and message are stored, and
            may also be forwarded to my own email inbox, so that I can read and reply to it. They
            are not shared with anyone else or used for any other purpose. They are kept until I
            delete them, and you can ask me to delete yours at any time using the address on the
            Contact page.
          </p>
        </Part>

        <Part title="Stored in your browser">
          <p>
            Your theme choice (light or dark) is saved in your browser if you use the theme switch,
            and a copy of the site&apos;s text is kept there so pages load quickly. Neither is sent
            anywhere.
          </p>
        </Part>

        <Part title="Outside services">
          <p>
            Like most websites, loading these pages makes your browser contact a few other services,
            which receive your IP address as part of any web request: Google Fonts for the typeface,
            Cloudinary for images, and a public service that provides the GitHub contribution graph.
            Links to GitHub and LinkedIn open those sites only when you follow them. No advertising
            or tracking services are used.
          </p>
        </Part>
      </div>
    </section>
  );
}
