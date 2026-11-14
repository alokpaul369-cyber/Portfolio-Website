/**
 * Background helpers for content placed inside a `Section` band.
 * A card must contrast with the band behind it: page background on a
 * "surface" band, surface on a "bg" band.
 */

/** Background class for a card inside a band of the given tone. */
export const cardBg = (tone = 'bg') => (tone === 'surface' ? 'bg-bg' : 'bg-surface');

/** Background class for a small inset (icon chip, pill) inside such a card. */
export const insetBg = (tone = 'bg') => (tone === 'surface' ? 'bg-surface' : 'bg-bg');
