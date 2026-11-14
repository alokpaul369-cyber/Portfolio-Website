/**
 * Offline sanity check for the Mongoose models (no database required).
 * Run with: node server/scripts/check-models.js
 * Database lookups used by the slug plugin are stubbed with an in-memory set.
 */
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import {
  Project,
  Skill,
  Experience,
  BlogPost,
  Message,
  Admin,
  SiteSettings,
  Research,
  Certification,
  DailyStat,
} from '../src/models/index.js';

/** Returns the validation error paths for a document, or [] when valid. */
async function errorPaths(doc) {
  try {
    await doc.validate();
    return [];
  } catch (error) {
    return Object.keys(error.errors).sort();
  }
}

// Stub slug lookups: pretend these slugs already exist.
const takenSlugs = new Set(['task-manager-api', 'task-manager-api-2']);
for (const Model of [Project, BlogPost]) {
  Model.exists = async ({ slug }) => (takenSlugs.has(slug) ? { _id: 'x' } : null);
}

// Project
const project = new Project({
  title: 'Task Manager API',
  description: 'REST API with JWT authentication.',
  techStack: [' Node.js ', 'Express', 'express', ''],
  githubUrl: 'https://github.com/example/repo',
});
assert.deepEqual(await errorPaths(project), []);
assert.equal(project.slug, 'task-manager-api-3', 'slug gets a suffix on collision');
assert.deepEqual(
  [...project.techStack],
  ['Node.js', 'Express'],
  'tech stack trimmed and de-duplicated',
);
assert.deepEqual(
  await errorPaths(
    new Project({ title: '', liveUrl: 'javascript:alert(1)', category: 'game', order: -1 }),
  ),
  ['category', 'description', 'liveUrl', 'order', 'title'],
);
const custom = new Project({ title: 'X', description: 'Y', slug: 'My Custom Slug!' });
await custom.validate();
assert.equal(custom.slug, 'my-custom-slug', 'custom slug normalised');
assert.ok(!('_id' in project.toJSON()) && 'id' in project.toJSON(), 'JSON uses id');

// Skill
assert.deepEqual(
  await errorPaths(new Skill({ name: 'React', category: 'frontend', icon: 'SiReact' })),
  [],
);
assert.deepEqual(
  await errorPaths(new Skill({ name: '', category: 'cooking', level: 'guru', icon: '<svg>' })),
  ['category', 'icon', 'level', 'name'],
);

// Experience
const base = { type: 'work', role: 'Intern', company: 'Acme', startDate: '2025-01-01' };
assert.deepEqual(await errorPaths(new Experience({ ...base, endDate: '2025-06-01' })), []);
assert.deepEqual(
  await errorPaths(new Experience(base)),
  ['endDate'],
  'end date required when not current',
);
assert.deepEqual(await errorPaths(new Experience({ ...base, endDate: '2024-01-01' })), ['endDate']);
const current = new Experience({ ...base, current: true, endDate: '2026-01-01' });
assert.deepEqual(await errorPaths(current), []);
assert.equal(current.endDate, null, 'current entry clears end date');
assert.deepEqual(
  await errorPaths(new Experience({ ...base, type: 'hobby', endDate: '2025-06-01' })),
  ['type'],
);
assert.deepEqual(
  await errorPaths(
    new Experience({
      type: 'education',
      role: 'HSC',
      startDate: '2023-01-01',
      endDate: '2024-12-31',
    }),
  ),
  [],
  'institution optional for education',
);
assert.deepEqual(
  await errorPaths(new Experience({ ...base, company: '', endDate: '2025-06-01' })),
  ['company'],
  'company required for work',
);

// BlogPost
const post = new BlogPost({
  title: 'Securing Express APIs',
  content: 'word '.repeat(450),
  tags: ['Node', 'node', 'JWT'],
});
assert.deepEqual(await errorPaths(post), []);
assert.equal(post.slug, 'securing-express-apis');
assert.deepEqual([...post.tags], ['node', 'jwt'], 'tags lowercased and de-duplicated');
assert.equal(post.readingTime, 2);
assert.equal(post.published, false);

// Message
assert.deepEqual(
  await errorPaths(
    new Message({
      name: 'Jane Doe',
      email: 'JANE@Example.com',
      subject: 'Hello',
      message: 'I would like to discuss a project.',
    }),
  ),
  [],
);
assert.deepEqual(
  await errorPaths(
    new Message({ name: 'J', email: 'not-an-email', subject: '', message: 'short' }),
  ),
  ['email', 'message', 'name', 'subject'],
);

// Admin
assert.deepEqual(await errorPaths(new Admin({ email: 'admin@example.com', password: 'short' })), [
  'password',
]);
assert.deepEqual(
  await errorPaths(new Admin({ email: 'bad', password: 'a-long-enough-password' })),
  ['email'],
);
const admin = new Admin({
  email: 'Admin@Example.com',
  password: await bcrypt.hash('correct horse battery', 4),
});
admin.isNew = false; // Treat as loaded from the database (hash already stored).
assert.equal(await admin.comparePassword('correct horse battery'), true);
assert.equal(await admin.comparePassword('wrong password'), false);
assert.ok(!('password' in admin.toJSON()), 'password never serialised');
assert.equal(admin.email, 'admin@example.com');

// SiteSettings
assert.deepEqual(await errorPaths(new SiteSettings({})), [], 'settings need no content');
assert.deepEqual(
  await errorPaths(
    new SiteSettings({
      content: {
        role: 'Developer',
        aboutParagraphs: ['One paragraph.'],
        keyFacts: [{ value: '5+', label: 'Projects' }],
        linkedin: 'https://www.linkedin.com/in/example',
      },
    }),
  ),
  [],
);
assert.deepEqual(
  await errorPaths(
    new SiteSettings({
      content: {
        role: 'x'.repeat(61),
        aboutParagraphs: [],
        linkedin: 'https://example.com/in/example',
      },
    }),
  ),
  ['content.aboutParagraphs', 'content.linkedin', 'content.role'],
);

// Research
Research.exists = async () => null;
const research = new Research({
  title: 'A Study of Something',
  type: 'paper',
  status: 'ongoing',
  summary: 'One sentence.',
  authors: ['A. Author', 'a. author', ' B. Author '],
  tags: ['Security', 'security'],
});
assert.deepEqual(await errorPaths(research), []);
assert.equal(research.slug, 'a-study-of-something');
assert.deepEqual(
  [...research.authors],
  ['A. Author', 'a. author', 'B. Author'],
  'authors trimmed and kept in order, duplicates included',
);
assert.deepEqual([...research.tags], ['security'], 'tags lower-cased');
assert.deepEqual(
  await errorPaths(
    new Research({ title: 'X', type: 'book', status: 'done', paperUrl: 'javascript:alert(1)' }),
  ),
  ['paperUrl', 'status', 'summary', 'type'],
);

// Certification
assert.deepEqual(
  await errorPaths(
    new Certification({ title: 'Course', issuer: 'Academy', issueDate: '2025-01-01' }),
  ),
  [],
);
assert.deepEqual(
  await errorPaths(
    new Certification({
      title: 'Course',
      issuer: 'Academy',
      issueDate: '2025-01-01',
      expiryDate: '2024-01-01',
    }),
  ),
  ['expiryDate'],
);
assert.deepEqual(await errorPaths(new Certification({})), ['issueDate', 'issuer', 'title']);

// DailyStat
assert.deepEqual(
  await errorPaths(new DailyStat({ date: new Date(), kind: 'page', key: '/', count: 1 })),
  [],
);
assert.deepEqual(await errorPaths(new DailyStat({ kind: 'person', key: '' })), [
  'date',
  'key',
  'kind',
]);

console.log('All model checks passed.');
