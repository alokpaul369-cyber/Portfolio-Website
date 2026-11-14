import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { AdminTable, TableSkeleton, Td, Th } from '@/components/admin/AdminTable';
import BarChart from '@/components/admin/BarChart';
import EmptyState from '@/components/admin/EmptyState';
import { FormSection } from '@/components/admin/form/fields';
import LoadError from '@/components/ui/LoadError';
import useApiQuery from '@/hooks/useApiQuery';
import { formatCount } from '@/lib/format';

const RANGES = [7, 30, 90];

/** Names for the site's fixed pages; detail pages are shown by their path. */
const PAGE_NAMES = {
  '/': 'Home',
  '/about': 'About',
  '/skills': 'Skills',
  '/projects': 'Projects',
  '/research': 'Research',
  '/experience': 'Experience',
  '/blog': 'Blog',
  '/contact': 'Contact',
  '/privacy': 'Privacy',
};

/** "Nov 14" for a "YYYY-MM-DD" day, without shifting it to another time zone. */
const dayFormat = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});
const formatDay = (date) => dayFormat.format(new Date(`${date}T00:00:00Z`));

/** Describes the change from the previous period in words. */
function changeText(current, previous, days) {
  if (previous === 0) {
    return current === 0 ? 'No visits recorded yet.' : `No data for the ${days} days before.`;
  }
  const percent = Math.round(((current - previous) / previous) * 100);
  if (percent === 0) return `Same as the previous ${days} days.`;
  return `${percent > 0 ? 'Up' : 'Down'} ${Math.abs(percent)}% on the previous ${days} days.`;
}

/** One headline number with its comparison. */
function StatCard({ label, value, previous, days }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-6">
      <span className="eyebrow text-muted">{label}</span>
      <span className="text-4xl font-bold tracking-tight tabular-nums">{formatCount(value)}</span>
      <span className="text-sm text-muted">{changeText(value, previous, days)}</span>
    </div>
  );
}

/** A ranked list (top pages or sources) as a small table. */
function TopList({ caption, rows, nameHeading, valueHeading }) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted">Nothing recorded in this period.</p>;
  }
  return (
    <AdminTable caption={caption} fluid>
      <thead>
        <tr>
          <Th>{nameHeading}</Th>
          <Th className="text-right">{valueHeading}</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.name}>
            <Td>
              <span className="flex flex-col">
                <span className="font-medium break-all">{row.title ?? row.name}</span>
                {row.title && <span className="text-xs text-muted">{row.name}</span>}
              </span>
            </Td>
            <Td className="text-right tabular-nums">{formatCount(row.value)}</Td>
          </tr>
        ))}
      </tbody>
    </AdminTable>
  );
}

/**
 * Visitor analytics: page views and visits for the last 7, 30 or 90 days,
 * a daily chart, and the top pages and sources. Counted without cookies or
 * personal data (see services/analyticsService.js on the server).
 */
export default function AdminAnalytics() {
  const [days, setDays] = useState(30);
  const { data, isLoading, error, retry } = useApiQuery('/analytics/summary', { days });
  const hasData = data && (data.totals.views > 0 || data.previous.views > 0);

  return (
    <>
      <AdminPageHeader
        title="Analytics"
        description="Visits to the public site, counted without cookies or personal data."
        actions={
          <div role="group" aria-label="Period" className="flex gap-1">
            {RANGES.map((range) => (
              <button
                key={range}
                type="button"
                aria-pressed={days === range}
                onClick={() => setDays(range)}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                  days === range
                    ? 'border-primary bg-primary text-bg'
                    : 'border-border text-muted hover:text-text'
                }`}
              >
                {range} days
              </button>
            ))}
          </div>
        }
      />

      {error && <LoadError message={error} onRetry={retry} />}
      {isLoading && <TableSkeleton rows={4} />}

      {data && !hasData && (
        <EmptyState
          Icon={BarChart3}
          title="No visits recorded yet"
          description="Numbers appear here once people visit the public site. Your own visits while signed in are not counted."
        />
      )}

      {data && hasData && (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Page views"
              value={data.totals.views}
              previous={data.previous.views}
              days={days}
            />
            <StatCard
              label="Visits"
              value={data.totals.visits}
              previous={data.previous.visits}
              days={days}
            />
          </div>

          <FormSection title="Page views per day">
            <BarChart
              label="Page views"
              data={data.series.map((day) => ({ date: day.date, value: day.views }))}
              formatDate={formatDay}
            />
          </FormSection>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="flex min-w-0 flex-col gap-3">
              <h2 className="text-base font-bold tracking-tight">Top pages</h2>
              <TopList
                caption="Most viewed pages"
                nameHeading="Page"
                valueHeading="Views"
                rows={data.topPages.map((page) => ({
                  name: page.path,
                  title: PAGE_NAMES[page.path],
                  value: page.views,
                }))}
              />
            </section>
            <section className="flex min-w-0 flex-col gap-3">
              <h2 className="text-base font-bold tracking-tight">Top sources</h2>
              <TopList
                caption="Where visits came from"
                nameHeading="Source"
                valueHeading="Visits"
                rows={data.topSources.map((source) => ({
                  name: source.source,
                  title: source.source === 'direct' ? 'Direct or unknown' : undefined,
                  value: source.visits,
                }))}
              />
            </section>
          </div>
        </div>
      )}

      <p className="mt-8 max-w-2xl text-xs leading-relaxed text-muted">
        Only daily totals are stored: no cookies, IP addresses or visitor identifiers. Visits are
        counted per browser tab, not per person. Bots, your own visits while signed in, and browsers
        that ask not to be tracked are left out. Totals are deleted after about 13 months.
      </p>
    </>
  );
}
