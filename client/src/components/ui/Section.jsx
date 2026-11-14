/**
 * Full-width page band holding a centred content block with consistent
 * vertical spacing. Alternating tones separate neighbouring sections.
 *
 * Cards inside a "surface" band should use `bg-bg`, and cards inside a "bg"
 * band `bg-surface`, so they stay distinct from the band behind them.
 *
 * @param {object} props
 * @param {string} [props.id]
 * @param {string} [props.labelledBy]      id of the heading that names the section
 * @param {'bg' | 'surface'} [props.tone='bg']
 * @param {string} [props.className]       extra classes for the inner content block
 */
export default function Section({ id, labelledBy, tone = 'bg', className = '', children }) {
  const band = tone === 'surface' ? 'border-y border-border bg-surface' : '';

  return (
    <section id={id} aria-labelledby={labelledBy} className={band}>
      <div className={`container-page py-20 sm:py-28 ${className}`}>{children}</div>
    </section>
  );
}
