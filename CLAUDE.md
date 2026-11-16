# CLAUDE.md

Guidance for Claude Code when working on this repository. Read this before making changes.
`README.md` is the human-facing guide (setup, API tables, deployment notes); keep both in sync
when behaviour changes.

## Project

Portfolio website and private admin dashboard for **Alok Paul**, a MERN full-stack developer and
Computer Science and Engineering undergraduate in Bangladesh (REST APIs, authentication, React
interfaces; learning C++/DSA, Next.js, TypeScript).

- `client/`: React 19 + Vite, Tailwind CSS v4, React Router, Framer Motion, Axios
- `server/`: Node.js + Express 5 (ES modules), MongoDB Atlas via Mongoose 9, JWT auth for a single
  admin, Cloudinary uploads, Nodemailer
- npm workspaces; Node 22.9 or later (the server uses `node --env-file-if-exists`)
- Developed on Windows. The folder is not a git repository yet.

## Commands (run from the repository root)

| Command                          | Purpose                                                                           |
| -------------------------------- | --------------------------------------------------------------------------------- |
| `npm install`                    | Install both workspaces                                                           |
| `npm run dev`                    | API on :5000 and client on :5173 together (Vite proxies `/api`)                   |
| `npm run lint`                   | ESLint for client and server; must pass with no errors or warnings                |
| `npm run build`                  | Production client build; also writes `sitemap.xml` and `robots.txt`               |
| `npm run format`                 | Prettier (with the Tailwind class-sorting plugin)                                 |
| `npm run check:models -w server` | Offline model validation checks                                                   |
| `npm test -w server`             | API tests (Vitest + Supertest) on an in-memory MongoDB; never touches Atlas       |
| `npm run sandbox -w server`      | API on an in-memory database with seeded content and a test admin (stop the normal API first) |
| Preview `sandbox-alt` + `client-sandbox` | The same sandbox on ports 5050 and 5174, alongside a normal `npm run dev`          |
| `npm run seed:content -w server` | Upserts skills, projects and education from `server/scripts/data/content.js`      |
| `npm run seed:admin -w server`   | Creates the admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (`-- --reset` to replace) |

The server reads `server/.env` only at start-up: restart `npm run dev` after editing it.
Templates: `server/.env.example`, `client/.env.example`. Never print or commit `.env` values.

## Rules that apply to every change

1. **No emojis anywhere**: UI text, buttons, headings, toasts, alerts, seed data, meta tags,
   code comments and commit messages. Use SVG icons (lucide-react; react-icons only for brand
   logos and skill icons) and only where an icon adds meaning.
2. **Professional, restrained design.** The owner rejected a flashy redesign (gradient text,
   animated aurora backgrounds, card tilt, cursor spotlights, marquees, count-up numbers) as
   "not professional". Do not reintroduce such effects. Motion is limited to short fades and
   small slides via `client/src/lib/motion.js`. Visual impact comes from the bold type scale
   and layout structure described under "Design system"; that does not relax this rule.
3. **Professional, understated copy.** No slang, gimmicks or exaggerated claims. Never invent
   personal facts (institutions, dates, employers, metrics); leave a clearly marked placeholder
   and ask.
4. **Accessibility**: every text color must meet WCAG AA (4.5:1) on both `--bg` and `--surface`
   in both themes; compute the contrast when changing colors. Keep alt text, labels,
   `aria-*`, visible focus, keyboard support (Escape closes menus and dialogs) and
   `prefers-reduced-motion` support.
5. **Modular, commented, production-ready code.** Each file starts with a short doc comment
   explaining its purpose; follow the existing patterns below rather than adding new ones.

## Design system

- Tokens live in `client/src/index.css` as CSS variables, exposed to Tailwind via `@theme inline`:
  `bg`, `surface`, `border`, `text`, `muted`, `primary`, `secondary`, `accent`, `danger`,
  `success`, `header`, plus `--code-*` for syntax highlighting.
- **Components never use hex colors**; use the token classes (`bg-surface`, `text-muted`,
  `border-border`, `text-primary`, `text-danger`, and so on).
- Palette: a blend of the owner's two references (a Swiss-style print portfolio and a
  "Folio" developer template): warm paper and ink with one restrained blue accent. Light is
  `#f6f5f1` paper, `#ffffff` surface, `#111216` ink, `#1d5ad8` accent; dark is `#0b0c0e`,
  `#131519`, `#f1efe9`, `#4d8dff`. Extra tokens: `border-strong` (button and table rules) and
  `grid` (the hero's background grid), `shadow` (light mode only). `.ink-panel` re-scopes the
  tokens to the dark theme's values, so the hero code card and the footer contact card stay dark
  focal points on the light page; `.elevated` gives key cards (code card, contact card, feature
  project, About portrait) a soft shadow in light mode. The GitHub graph uses blue ramps (`data/github.js`) and
  `theme-color` follows the page background.
- **Light mode is the default.** Dark mode is the `.dark` class on `<html>`. The choice is saved
  under the localStorage key `site-theme`, only when the visitor uses the toggle. The inline
  script in `client/index.html` and `ThemeProvider` must stay in sync.
- Fonts: Newsreader (serif, regular weight) for every heading; Inter for body text; JetBrains
  Mono for small labels (`.eyebrow`), the code card and real code. All three load from Google
  Fonts in `client/index.html`.
- Type scale (defined once in `index.css`; page and section titles always use these classes):
  `.text-hero` for the Home headline only (an `<em>` inside is italic accent), `.text-display`
  for page titles (`h1`), `.text-section` for `PageHeader` section headings (`h2`),
  `.text-heading` for long titles in narrow columns (blog posts, detail pages), `.text-closing`
  for the footer contact card headline, `.eyebrow` for small mono uppercase labels.
  `.container-page` is `max-w-6xl`.
- `PageHeader`: section headings (`h2`) use a label-left grid from `md` (3 of 12 columns for
  the mono label with the section number in accent, 9 for the serif title and description);
  page titles (`h1`) stack. Titles rise out of a mask (`riseIn` in `lib/motion.js`).
- `Section` (`components/ui/Section.jsx`) is a full-width band on the page background (no
  fills), separated from the next by space alone. Home numbers its sections from `01` through
  `PageHeader`'s `index`. `tone` still alternates and decides card backgrounds via
  `cardBg(tone)` / `insetBg(tone)` from `lib/tone.js`. Services, facts, skills and the
  education list are flat: hairline-divided rows and columns rather than boxed cards.
- Recurring layouts: the same 3/9 label-content split (About portrait and text, Skills groups,
  education rows).
- Shared UI: `Button` (variants `primary`, `outline`; sizes `md` default and `sm` for admin
  toolbars and forms; `to` renders a router link, `href` an anchor), `PageHeader` (`index`,
  `label`, `title`, `description`), `Section`, `LoadError`,
  `SearchInput`, `Pagination`, `ThemeToggle`, `SocialLinks`, `ProfilePhoto`, `FilterButton`; cards use
  `.card-hover` for a quiet hover state. `ProjectCard` has a `feature` layout, used on the Home
  page only: `FeaturedProjects` shows the first featured project as a feature card and the rest
  as numbered `ProjectRow`s in a table. `ProfilePhoto` takes `bare` inside a card.
- Home hero: a static masked grid behind it (`.hero-grid-bg`), an availability pill, the
  `h1` "Alok Paul, *role*" in `.text-hero`, the tagline and actions, beside a code card
  ("profile.js") whose values come from the site content plus fixed stack and focus lists; then
  a "Currently learning" row and the admin's key facts in a hairline strip (About shows the
  facts only on `/about`; on Home it shows the portrait beside the text). The header brand is an
  outlined mono initials tile with the name and role.
- The footer shows a contact card (serif headline, email with a copy button, GitHub, LinkedIn
  when set, and a "Send a message" link to `/contact`) on every public page except `/contact`,
  then three columns (summary, navigation, profiles) and a mono base line.

## Client architecture (`client/src`)

- Page transitions: `RootLayout` keys a `motion.div` by pathname with `pageEnter`, so each route
  change fades in (query-string changes do not); the first page loads without it. In-page links
  scroll smoothly and stop below the header (`scroll-padding-top` in `index.css`).
- `router.jsx`: every page except Home is `lazy()` loaded. Public routes sit under `RootLayout`;
  `/admin` is a separate tree (`AdminRoot`, then `ProtectedRoute`, then `AdminLayout`).
- `config/site.js`: personal details and links (name, role, tagline, photo paths, CV path,
  GitHub username, LinkedIn, email). Change content here, not in components.
- `data/*.js`: static display content (About text, category labels, Currently Learning).
- `lib/api.js`: the shared Axios instance. It sends `X-Requested-With: XMLHttpRequest` (required
  by the server's CSRF check) and fires `admin:session-expired` on any 401 other than login.
  Use `getErrorMessage(error)` for user-facing errors.
- `hooks/useApiQuery.js`: data fetching with `{ data, pagination, body, isLoading, error,
errorStatus, retry }`. Loading is derived, so effects never call setState synchronously.
- `hooks/useListParams.js`: filters, search and page stored in the URL query string.
- Forms: react-hook-form + zod. Client schemas (`lib/contactSchema.js`, `lib/adminSchemas.js`)
  mirror the server's zod schemas; the server remains the authority. Use `handleSaveError` to
  map server `details` onto form fields.
- Images: `components/admin/form/ImageUploader` with `hooks/useUploadSession`, which deletes
  uploads that are never saved. `lib/cloudinary.js` builds transformed delivery URLs.
- Skill icons are resolved by key through `lib/skillIcons.js`; add new icons there by named import.
- SEO: render `<Seo>` (`components/seo/Seo.jsx`) once per public page. Shared values and the
  Person schema live in `config/seo.js`; `build/seoPlugin.js` injects static tags into
  `index.html` and generates `sitemap.xml` and `robots.txt`. Admin, draft and 404 pages use
  `noindex`.
- Editable site content: `context/SiteContentProvider` loads `GET /api/settings` once;
  `useSiteContent()` returns role, tagline, location, availability, email, linkedin, About
  paragraphs, key facts, CV and photo merged over the code defaults (`lib/siteContent.js`), with
  the last response cached in localStorage under `site-content`. Components read these through
  the hook, not from `config/site.js`. The name, GitHub username and "What I Do" cards stay in code.
  The Person JSON-LD carries no email address, and takes the saved LinkedIn link at runtime
  (`personSchema(siteUrl, { linkedin })`).
- Optional sections: `useSiteContent().sections` drives what appears only when it has content.
  A nav link in `config/site.js` with `section: 'research'` or `section: 'blog'` is hidden until
  that flag is true;
  `pages/Home.jsx` builds its numbered, alternating sections from the ones actually shown;
  `CertificationsSection` on the Experience page renders nothing while empty. The Blog link
  (`section: 'blog'`) and the 404 page's Blog suggestion appear once a post is published. Never add sample
  entries to make these appear. Research display labels live in `data/research.js`; authors
  are shown exactly as entered.
- Blog posts: `lib/headings.js` builds the table of contents by running the same Markdown
  pipeline as `MarkdownContent` up to `rehype-slug`, so its ids always match the rendered
  headings; keep the two pipelines in step if plugins change. Posts with three or more `##`/`###`
  headings get `TableOfContents` (sticky column from `lg`, a `<details>` panel below).
  `RelatedPosts` and the RSS `<link rel="alternate">` (`feedUrl()` in `lib/api.js`) are on the
  post page; the Blog page links to the feed.
- Analytics on the client: `hooks/usePageViews` (in `RootLayout`) sends one view per public
  route change after 500 ms; never from `/admin`, with Do Not Track or Global Privacy Control, or
  in development unless `VITE_ANALYTICS_IN_DEV=true` (set only for the `client-sandbox` preview).
  A visit is the first page per tab (`sessionStorage` key `visit-counted`). `/privacy` describes
  all of this and the outside services the browser contacts (Google Fonts, Cloudinary, the GitHub
  contribution graph service); keep it accurate when any of these change.
- Admin area: `context/AuthProvider` (session via `GET /api/auth/me`), pages in `pages/admin`,
  shared pieces in `components/admin` (`AdminTable`, `RowActions`, `ConfirmDialog`,
  `RecordLoader`, `EmptyState`, form `fields`, `TagsInput`, `RepeatableRows`, `DocumentUploader`).
  Use `useDeleteConfirm` for deletes. `AdminTable` takes `fluid` for small tables that should
  fit a phone screen. `/admin/messages` has selection with bulk actions and CSV export;
  `/admin/analytics` shows visitor totals with a plain SVG `BarChart`. `/admin/content` edits the site content and CV;
  `/admin/account` changes the sign-in email and password and signs out other sessions.

## Server architecture (`server/src`)

- `config/env.js` is the only place that reads `process.env`; import `env` elsewhere.
  Production requires `MONGODB_URI`, `CLIENT_URL` and a `JWT_SECRET` of 32 or more characters.
- `app.js` middleware order: helmet, CORS (only `CLIENT_URL` origins, credentials allowed),
  rate limit, CSRF header check (`requireAppHeader` on non-GET requests), morgan (dev), body
  parsers, cookies, then routes under `/api`, then `notFound` and `errorHandler`.
- Responses: `{ success: true, data, pagination? }` or `{ success: false, message, details? }`.
  Throw `ApiError` (`utils/ApiError.js`); Express 5 forwards async errors automatically.
- Validation: zod schemas in `validators/`, applied with `validate({ body, query, params })`.
  Handlers read `req.validated.*` (Express 5 makes `req.query` read-only). Body schemas use
  `z.strictObject` and no `.default()`, so partial updates never reset fields.
- Content resources (projects, skills, experience, research, certifications, blog) use `controllers/crudFactory.js` and
  `routes/resourceRoutes.js`: public reads plus admin `GET /id/:id`, `POST`, partial `PUT /:id`
  and `DELETE /:id`. Updates load the document and call `save()` so model hooks run, and removed
  images are deleted from Cloudinary.
- Research (`/api/research`): entries with `visible: false` are drafts, returned only to the
  signed-in admin through `optionalAuth` (as blog drafts are). The list is unpaginated and
  sorted in the controller: ongoing first, newest date, `order`, newest created.
  Certifications (`/api/certifications`) enforce "expiry not before issue" in the model, so the
  rule also holds on partial updates. `GET /api/settings` includes
  `sections: { research, certifications, blog }`, true when a visible entry or published post
  exists.
- Blog extras: `GET /api/blog/:slug/related` (up to three other published posts by shared tags,
  then newest; never drafts, even for the admin) and `GET /api/blog/feed.xml` (RSS 2.0, 20
  newest published posts, excerpts only, links built from `SITE_URL`). Both are registered
  before or beside `/:slug`; keep `/feed.xml` above `/:slug`.
- Messages: `POST /api/messages/bulk` (`{ ids (1 to 100), action: read | unread | delete }`,
  missing ids skipped) and `GET /api/messages/export` (CSV, same `status`/`search` as the list,
  max 5,000 rows, UTF-8 BOM, every cell quoted, formula-like cells prefixed with `'`).
- Analytics (`services/analyticsService.js`, model `DailyStat`): daily totals only, keyed by
  `(date, kind: page | visit | source, key)`, removed after about 13 months by a TTL index. Days
  follow `ANALYTICS_TIMEZONE` (default `Asia/Dhaka`). `POST /api/analytics/view` is public,
  always answers an empty 204 (its rate limiter too), and counts only known public paths and
  existing public slugs; it ignores bots and the signed-in owner (`optionalAuth`). At most
  `MAX_DAILY_SOURCES` (100) source domains are stored per day; the rest count as `other`.
  A counting error is logged and still answered with 204. An invalid `ANALYTICS_TIMEZONE` stops
  the server at start-up. Never store
  IPs, user agents, full referrers or query strings. `GET /api/analytics/summary?days=7|30|90`
  is admin only; `GET /api/admin/stats` includes `viewsLast7Days`.
- Auth: httpOnly cookie `admin_token` (path `/api`) holding a JWT. `middleware/protect.js`
  provides `protect` (required) and `optionalAuth` (for example, drafts on blog routes). Changing
  the admin password invalidates existing sessions. Tokens also carry the admin's
  `sessionVersion`; raising it (password change, `POST /api/auth/sessions/revoke`) ends every
  other session. Account routes answer a wrong current password with 400 and a
  `currentPassword` field error, never 401, because the client treats 401 as signed out.
- Models share `models/helpers` (`schemaOptions`: timestamps and `id` instead of `_id`;
  `uniqueSlug`; `stringList`; `imageSchema` of `{ url, publicId, alt }`). `SiteSettings` is a
  single document holding the admin-managed profile photo, optional `content` overrides and the
  uploaded `cv`; an unset field means the client uses its code default. `PUT /api/settings` is
  partial: absent keys are untouched and `null` clears a value.
- Services: `imageService` (Cloudinary; folders `projects`, `blog`, `profile`, `certificates`,
  `general`; PDFs
  go to `documents` as raw files via `POST /api/uploads/document`; deletes are best effort), `mailService` (Gmail SMTP; logs instead of sending in development when
  unset), `githubService` (one-hour in-memory cache; strips emoji from GitHub text).
- Blog excerpts: `excerptAuto` marks a generated excerpt, which is regenerated whenever the
  content changes; an excerpt the admin types is kept until cleared.
- `app.set('trust proxy', env.trustProxy)` comes from `TRUST_PROXY` (default 1). The general
  API limit is 2,000 requests per 15 minutes per address, because many visitors can share one
  address; login, contact and page-view limits stay strict.
- Mongoose 9: use `returnDocument: 'after'`, not the deprecated `new: true`. Add `_id` as a
  tie-breaker when sorting by `createdAt`.

## Lint rules that commonly trip changes

- `react-refresh/only-export-components`: a `.jsx` file may export only components; put shared
  constants and helpers in `.js` files (for example `lib/siteUrl.js`).
- `react-hooks/set-state-in-effect`: do not call setState synchronously inside `useEffect`;
  derive state, use event handlers, or set state in async callbacks.
- `react-hooks/static-components`: do not assign a component from a function call during
  render; use `createElement(getIcon(key), props)` instead.
- `no-misleading-character-class`: write emoji-related regexes as alternations, not character
  classes.

## Testing and verification

- The server has an API test suite in `server/tests` (settings, uploads, account, research,
  certifications, blog, messages, analytics, contact, experience). The client
  has none yet. Before finishing a change, run `npm run lint`, `npm run build`,
  `npm run check:models -w server` and `npm test -w server`. Write the test first for new API
  behaviour.
- `config/env.js` exposes `isTest`: request logging and rate limits are off and bcrypt is
  cheaper under `NODE_ENV=test` only.
- Admin screens can be checked without the owner's password by running the sandbox API and
  signing in with the test account defined in `server/scripts/dev-sandbox.js`.
- For API changes, test against an in-memory MongoDB (`mongodb-memory-server`) in a temporary
  folder outside the project, never against the owner's Atlas database. Stub Cloudinary and SMTP.
- For UI changes, check the page in the browser in both themes, at desktop and phone (375 px)
  widths, with no console errors and no horizontal overflow.

## Known open items

- The LinkedIn link and the CV are set from Site content in the admin panel; until the owner
  adds them, the LinkedIn icon and the Download CV button are hidden.
- CV delivery needs "Allow delivery of PDF and ZIP files" enabled in the Cloudinary account's
  security settings on some plans.
- Education entries have no institution names (the field is optional for education).
- `VITE_SITE_URL` must be set for production builds; the host needs an SPA fallback to
  `index.html`.
- Hosting: one Vercel project serves the static build and the API as a serverless function
  (`api/index.js` wraps `createApp()` and connects to MongoDB once per instance; `vercel.json`
  routes `/api/*` to it and everything else to `index.html`). The root `package.json` is
  `"type": "module"` for that file. Uploads are capped at 4 MB to stay under Vercel's 4.5 MB
  request limit. `server/src/index.js` remains the entry point for local and always-on hosts.
- Gmail settings (`SMTP_USER`, `SMTP_PASS`) are not configured, so contact emails are only logged.
- The navigation is About, Skills, Projects, Research (only with visible research), Blog (only
  with a published post), Experience, Contact. Seven links fit on one line from 768 px.
- `SITE_URL` should be set on the server in production; the RSS feed and contact emails build
  their links from it.
- Research and certifications start empty; the owner adds real entries from the admin panel.
- The Privacy page wording is a draft awaiting the owner's approval.
