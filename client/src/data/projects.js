import {
  Binary,
  BrainCircuit,
  FolderCode,
  Layers,
  Monitor,
  PanelsTopLeft,
  ServerCog,
} from 'lucide-react';

/**
 * Project categories in filter order. Keys match the server's PROJECT_CATEGORIES.
 * `Icon` is used on the placeholder image when a project has no screenshot.
 */
export const projectCategories = [
  { key: 'full-stack', label: 'Full-Stack', Icon: Layers },
  { key: 'backend', label: 'Backend', Icon: ServerCog },
  { key: 'frontend', label: 'Frontend', Icon: PanelsTopLeft },
  { key: 'ai', label: 'AI', Icon: BrainCircuit },
  { key: 'desktop', label: 'Desktop', Icon: Monitor },
  { key: 'dsa', label: 'DSA', Icon: Binary },
];

const fallback = { key: 'other', label: 'Other', Icon: FolderCode };

/** Returns the label and icon for a category key. */
export function getProjectCategory(key) {
  return projectCategories.find((category) => category.key === key) ?? fallback;
}
