/**
 * Display settings for the GitHub Activity section.
 */

/** GitHub's own colors for common languages, used for the small language dot. */
export const languageColors = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  HTML: '#e34c26',
  CSS: '#663399',
  Python: '#3572a5',
  Shell: '#89e051',
};

/**
 * Contribution graph colors, from no activity (index 0) to the most activity (index 4).
 * Blue ramps matching the site accent.
 */
export const calendarTheme = {
  dark: ['#1e293b', '#1e3a8a', '#2563eb', '#60a5fa', '#bfdbfe'],
  light: ['#e2e8f0', '#bfdbfe', '#60a5fa', '#2563eb', '#1e3a8a'],
};
