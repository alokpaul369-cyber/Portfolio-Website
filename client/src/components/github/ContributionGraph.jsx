import { GitHubCalendar } from 'react-github-calendar';
import useTheme from '@/hooks/useTheme';
import { calendarTheme } from '@/data/github';

const dateFormat = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

/**
 * GitHub contribution graph for the last year, colored to match the site theme.
 * Loaded lazily by GitHubActivity so the calendar library is not in the main bundle.
 * Contribution data is fetched by the library from github-contributions-api.jogruber.de.
 */
export default function ContributionGraph({ username }) {
  const { theme } = useTheme();

  return (
    <GitHubCalendar
      username={username}
      colorScheme={theme}
      theme={calendarTheme}
      blockSize={11}
      blockMargin={3}
      fontSize={12}
      errorMessage="The contribution graph could not be loaded right now."
      labels={{
        totalCount: '{{count}} contributions in the last year',
      }}
      tooltips={{
        activity: {
          text: ({ count, date }) =>
            `${count === 0 ? 'No' : count} contribution${count === 1 ? '' : 's'} on ${dateFormat.format(new Date(date))}`,
        },
      }}
      style={{ color: 'var(--muted)' }}
    />
  );
}
