import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import { toString } from 'hast-util-to-string';

/**
 * Table of contents for a blog post.
 *
 * Runs the same Markdown pipeline as components/blog/MarkdownContent.jsx up to
 * rehype-slug (remark-gfm, then remark-rehype with raw HTML kept as react-markdown
 * does), so every id here is exactly the id of the rendered heading, including
 * repeated headings ("setup", "setup-1") and headings with code or links.
 */
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeSlug);

/** Heading levels listed in the table of contents. */
const LEVELS = new Set(['h2', 'h3']);

/**
 * Returns the level-2 and level-3 headings of a Markdown document, in order.
 * Headings inside code blocks are not headings and are never returned, nor is
 * the visually hidden "Footnotes" heading that GFM adds for footnotes.
 *
 * @param {string} markdown
 * @returns {Array<{ id: string, text: string, level: 2 | 3 }>}
 */
export function extractHeadings(markdown) {
  const tree = processor.runSync(processor.parse(String(markdown ?? '')));
  const headings = [];

  const walk = (node) => {
    const hidden = [].concat(node.properties?.className ?? []).includes('sr-only');
    if (node.type === 'element' && LEVELS.has(node.tagName) && node.properties?.id && !hidden) {
      // Footnote reference numbers (<sup>) are not part of the heading's title.
      const text = toString({
        ...node,
        children: node.children.filter((child) => child.tagName !== 'sup'),
      }).trim();
      if (text) {
        headings.push({ id: String(node.properties.id), text, level: Number(node.tagName[1]) });
      }
      return;
    }
    node.children?.forEach(walk);
  };
  walk(tree);

  return headings;
}

/** Minimum number of headings before a post gets a table of contents. */
export const MIN_TOC_HEADINGS = 3;
