/**
 * Shared Framer Motion variants, so every entrance on the site is the same:
 * a short fade with a small upward slide, and nothing larger.
 */

const ease = [0.25, 0.1, 0.25, 1];

/** Single element: fade in and move up slightly. */
export const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease } },
};

/** Whole page on a route change: the same fade, slightly shorter so navigation feels quick. */
export const pageEnter = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease } },
};

/**
 * Large type that rises out of a mask: put it in a block with `overflow-hidden`
 * (plus a little bottom padding so descenders are not clipped).
 */
export const riseIn = {
  hidden: { y: '110%' },
  visible: { y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

/** Parent that reveals its `fadeUp` children one after another. */
export const stagger = (delayChildren = 0, staggerChildren = 0.06) => ({
  hidden: {},
  visible: { transition: { delayChildren, staggerChildren } },
});

/** Settings for sections that animate once when scrolled into view. */
export const inViewOnce = {
  initial: 'hidden',
  whileInView: 'visible',
  viewport: { once: true, margin: '-80px' },
};
