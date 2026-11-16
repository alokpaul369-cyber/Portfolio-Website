/**
 * Full-width page band holding a centred content block with consistent
 * vertical spacing. Bands share the page background and are separated by
 * generous space alone; each opens with a `PageHeader` whose label carries
 * the section number on the Home page.
 *
 * `tone` still decides how cards inside contrast with the page: cards in a
 * "surface" band use `bg-bg`, cards in a "bg" band `bg-surface` (`lib/tone.js`).
 *
 * @param {object} props
 * @param {string} [props.id]
 * @param {string} [props.labelledBy]      id of the heading that names the section
 * @param {'bg' | 'surface'} [props.tone='bg']
 * @param {string} [props.className]       extra classes for the inner content block
 */
export default function Section({ id, labelledBy, className = '', children }) {
  return (
    <section id={id} aria-labelledby={labelledBy}>
      <div className={`container-page py-20 sm:py-28 ${className}`}>{children}</div>
    </section>
  );
}
