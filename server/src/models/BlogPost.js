import mongoose, { Schema } from 'mongoose';
import schemaOptions from './helpers/schemaOptions.js';
import imageSchema from './helpers/imageSchema.js';
import uniqueSlug from './helpers/uniqueSlug.js';
import { stringList } from './helpers/validators.js';

const EXCERPT_LENGTH = 200;
const WORDS_PER_MINUTE = 200;

/**
 * Reduces Markdown to plain text for excerpts and reading time: removes code
 * blocks, images, HTML tags, task-list markers and formatting symbols, and
 * keeps the text of inline code and links.
 */
export function markdownToPlainText(markdown) {
  return String(markdown ?? '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^\s*[-*+]\s+\[[ xX]\]\s+/gm, '')
    .replace(/^\s*\|?\s*:?-{3,}.*$/gm, ' ')
    .replace(/[#>*_~|]+/g, ' ')
    .replace(/(^|\s)-(?=\s)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Blog article. `content` is stored as Markdown. */
const blogPostSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      maxlength: [100000, 'Content cannot exceed 100,000 characters'],
    },
    // Short summary for listings. Generated from the content when left empty.
    excerpt: {
      type: String,
      trim: true,
      maxlength: [300, 'Excerpt cannot exceed 300 characters'],
    },
    // True while the excerpt is generated from the content, so it is regenerated when the content changes.
    excerptAuto: { type: Boolean, default: false },
    coverImage: { type: imageSchema, default: undefined },
    // Tags are stored lowercase so filtering is case-insensitive.
    tags: stringList({ label: 'Tags', maxItems: 10, maxItemLength: 30, lowercase: true }),
    published: { type: Boolean, default: false },
    // Set automatically the first time the post is published; used for public sorting.
    publishedAt: { type: Date, default: null },
    // Approximate reading time in minutes. Stored so listings can omit `content`.
    readingTime: { type: Number, default: 1 },
  },
  schemaOptions,
);

blogPostSchema.plugin(uniqueSlug, { sourceField: 'title' });

/** Derives the excerpt, reading time and first publication date. */
blogPostSchema.pre('validate', function deriveFields() {
  if (this.isModified('content') || this.isNew) {
    const text = markdownToPlainText(this.content);
    const words = text.split(' ').filter(Boolean).length;
    this.readingTime = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  }

  // An excerpt the admin typed is kept; an empty or generated one follows the content.
  if (this.isModified('excerpt') && this.excerpt) this.excerptAuto = false;
  if (!this.excerpt || (this.excerptAuto && this.isModified('content'))) {
    const text = markdownToPlainText(this.content);
    this.excerpt =
      text.length > EXCERPT_LENGTH
        ? `${text.slice(0, EXCERPT_LENGTH).replace(/\s+\S*$/, '')}...`
        : text;
    this.excerptAuto = true;
  }

  if (this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

blogPostSchema.index({ published: 1, publishedAt: -1 });
blogPostSchema.index({ tags: 1 });

const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', blogPostSchema);
export default BlogPost;
