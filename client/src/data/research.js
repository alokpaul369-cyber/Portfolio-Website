/**
 * Display labels for research types and statuses.
 * Keys mirror RESEARCH_TYPES and RESEARCH_STATUSES in server/src/models/Research.js.
 */

export const researchTypes = [
  { key: 'paper', label: 'Paper' },
  { key: 'thesis', label: 'Thesis' },
  { key: 'project', label: 'Research project' },
  { key: 'poster', label: 'Poster' },
  { key: 'preprint', label: 'Preprint' },
];

export const researchStatuses = [
  { key: 'ongoing', label: 'Ongoing' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'published', label: 'Published' },
];

const labelOf = (list, key) => list.find((item) => item.key === key)?.label ?? key;

/** Label for a type key; unknown keys are shown as they are. */
export const getResearchTypeLabel = (key) => labelOf(researchTypes, key);

/** Label for a status key; unknown keys are shown as they are. */
export const getResearchStatusLabel = (key) => labelOf(researchStatuses, key);
