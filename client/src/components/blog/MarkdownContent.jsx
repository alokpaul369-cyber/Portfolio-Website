import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import bash from 'highlight.js/lib/languages/bash';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import css from 'highlight.js/lib/languages/css';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import plaintext from 'highlight.js/lib/languages/plaintext';
import shell from 'highlight.js/lib/languages/shell';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';

/**
 * Languages available for syntax highlighting. Registering only these keeps
 * the bundle small. Each grammar also provides its usual aliases
 * (js, ts, jsx, sh, html, yml, txt and so on).
 */
const languages = {
  bash,
  c,
  cpp,
  css,
  java,
  javascript,
  json,
  markdown,
  plaintext,
  shell,
  sql,
  typescript,
  xml,
  yaml,
};

/** Opens links to other sites in a new tab; keeps in-page and same-site links as they are. */
function MarkdownLink({ href = '', children, ...props }) {
  const isExternal = /^https?:\/\//i.test(href) && !href.startsWith(window.location.origin);
  return (
    <a href={href} {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })} {...props}>
      {children}
    </a>
  );
}

/** Lazy-loaded images that keep their alt text. */
function MarkdownImage({ alt = '', ...props }) {
  return <img alt={alt} loading="lazy" decoding="async" {...props} />;
}

/** Wraps wide tables so they scroll horizontally instead of breaking the layout. */
function MarkdownTable(props) {
  return (
    <div className="overflow-x-auto">
      <table {...props} />
    </div>
  );
}

const components = { a: MarkdownLink, img: MarkdownImage, table: MarkdownTable };

/**
 * Renders article Markdown (GitHub Flavored: tables, task lists, strikethrough).
 * Raw HTML in the Markdown is skipped and unsafe link protocols (such as
 * javascript:) are removed by react-markdown, so post content cannot inject
 * scripts. Headings get ids so sections can be linked to.
 */
export default function MarkdownContent({ children }) {
  return (
    <div className="article-prose">
      <Markdown
        skipHtml
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, [rehypeHighlight, { languages, detect: false }]]}
        components={components}
      >
        {children}
      </Markdown>
    </div>
  );
}
