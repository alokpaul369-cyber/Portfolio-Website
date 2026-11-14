import { useId } from 'react';

const HEIGHT = 160;

/**
 * Simple bar chart of daily values, drawn as SVG with the theme's colours.
 * Screen readers get a one-line summary and a table of every value; the bars
 * themselves are decorative.
 *
 * @param {object} props
 * @param {Array<{ date: string, value: number }>} props.data  one entry per day, oldest first
 * @param {string} props.label        what is counted, e.g. "Page views"
 * @param {(date: string) => string} props.formatDate
 */
export default function BarChart({ data, label, formatDate }) {
  const tableId = useId();
  const max = Math.max(1, ...data.map((point) => point.value));
  const total = data.reduce((sum, point) => sum + point.value, 0);
  const peak = data.reduce((best, point) => (point.value > best.value ? point : best), data[0]);
  const width = data.length * 10;
  const barWidth = data.length > 31 ? 6 : 8;

  const summary =
    total === 0
      ? `${label}: none in this period.`
      : `${label}: ${total} in total, highest on ${formatDate(peak.date)} with ${peak.value}.`;

  return (
    <figure className="flex flex-col gap-3">
      <div className="flex items-end gap-3">
        <span
          className="w-8 shrink-0 text-right text-xs text-muted tabular-nums"
          aria-hidden="true"
        >
          {total > 0 ? max : null}
        </span>
        <svg
          viewBox={`0 0 ${width} ${HEIGHT}`}
          preserveAspectRatio="none"
          className="h-40 w-full border-b border-l border-border"
          aria-hidden="true"
          focusable="false"
        >
          {data.map((point, index) => {
            const barHeight = (point.value / max) * (HEIGHT - 4);
            return (
              <rect
                key={point.date}
                x={index * 10 + (10 - barWidth) / 2}
                y={HEIGHT - barHeight}
                width={barWidth}
                height={barHeight}
                rx="1"
                className="fill-primary"
              >
                <title>{`${formatDate(point.date)}: ${point.value}`}</title>
              </rect>
            );
          })}
        </svg>
      </div>
      <div className="flex justify-between pl-11 text-xs text-muted" aria-hidden="true">
        <span>{formatDate(data[0].date)}</span>
        <span>{formatDate(data[data.length - 1].date)}</span>
      </div>
      <figcaption className="text-sm text-muted">{summary}</figcaption>

      <table id={tableId} className="sr-only">
        <caption>{label} per day</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">{label}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.date}>
              <td>{formatDate(point.date)}</td>
              <td>{point.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
