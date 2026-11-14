# Alok Paul — Portfolio

Personal portfolio website and private admin dashboard for Alok Paul, a MERN full-stack
developer and Computer Science and Engineering undergraduate in Bangladesh.

The public site presents projects, research, experience, skills and writing. A single admin
manages all of that content, reads contact messages and sees visitor statistics from a
dashboard, without editing code.

## Features

**Public website**

- Home, About, Skills, Projects, Research, Experience, Blog and Contact pages
- Project pages with screenshots, technologies and source links
- Research showcase (papers, theses, posters, ongoing work) and certifications
- Blog with Markdown, syntax highlighting, a table of contents, related posts and an RSS feed
- Contact form with spam protection and email notifications
- GitHub activity: profile statistics, recent repositories and the contribution graph
- Light and dark themes, responsive layouts, WCAG AA colour contrast and keyboard support
- SEO: page metadata, structured data, `sitemap.xml` and `robots.txt`
- Privacy-friendly visitor statistics: no cookies, no tracking scripts, daily totals only

**Admin dashboard** (`/admin`)

- Create, edit and delete projects, skills, experience, research, certifications and posts
- Image uploads to Cloudinary, with unused uploads cleaned up automatically
- Edit the site text, links and profile photo, and upload a CV
- Inbox with search, filters, bulk actions and CSV export
- Analytics: page views, visits, top pages and sources for 7, 30 or 90 days
- Account security: change email and password, sign out of other sessions

Sections with no content yet (research, certifications, blog) stay hidden on the public site
until the first entry is published.

## Tech stack

| Area     | Technology                                                                    |
| -------- | ----------------------------------------------------------------------------- |
| Frontend | React 19, Vite, Tailwind CSS v4, React Router, Framer Motion, Axios           |
| Forms    | react-hook-form with zod validation                                           |
| Backend  | Node.js, Express 5 (ES modules), zod                                          |
| Database | MongoDB Atlas with Mongoose 9                                                 |
| Auth     | JWT in an httpOnly cookie, bcrypt, CSRF header check, rate limiting           |
| Services | Cloudinary (images and CV), Nodemailer with Gmail SMTP, GitHub REST API       |
| Tooling  | npm workspaces, ESLint, Prettier, Vitest, Supertest, mongodb-memory-server    |

## Project structure

```
.
├── client/                 React app (Vite)
│   ├── build/              Vite plugin that writes SEO tags, sitemap.xml and robots.txt
│   ├── public/             Static files (favicon, default profile and social images)
│   └── src/
│       ├── components/     UI by area (admin, blog, layout, projects, research, sections, ui, ...)
│       ├── config/         Site details and SEO defaults
│       ├── context/        Theme, admin session and site content providers
│       ├── data/           Static display content and labels
│       ├── hooks/          Data fetching, list filters, uploads, page views
│       ├── lib/            API client, form schemas, formatting and helpers
│       ├── pages/          Public pages, and admin pages in pages/admin
│       └── router.jsx      Routes (pages are loaded on demand)
├── server/                 Express API
│   ├── scripts/            Seed scripts, model checks and the local sandbox
│   ├── src/
│   │   ├── config/         Environment, database and Cloudinary setup
│   │   ├── controllers/    Route handlers
│   │   ├── middleware/     Auth, validation, uploads, rate limits, errors
│   │   ├── models/         Mongoose schemas
│   │   ├── routes/         Routers mounted under /api
│   │   ├── services/       Images, email, GitHub and analytics
│   │   └── validators/     zod request schemas
│   └── tests/              API tests on an in-memory database
└── package.json            Workspace root and shared scripts
```

## Getting started

**Requirements:** Node.js 22.9 or later, and a MongoDB Atlas cluster (free tier is enough).

```bash
npm install
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Fill in `server/.env` (see [Configuration](#configuration)), then create the admin account and
start both apps:

```bash
npm run seed:admin -w server
npm run dev
```

- Website: http://localhost:5173
- Admin: http://localhost:5173/admin
- API: http://localhost:5000/api (health check at `/api/health`)

In development the website forwards `/api` to the server, so no CORS setup is needed. The
server also starts without a database if `MONGODB_URI` is empty, which is enough to work on the
layout.

To load the initial skills, projects and education entries:

```bash
npm run seed:content -w server
```

### Admin account

There is one admin and no public sign-up. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` (at least 12
characters) in `server/.env`, run `npm run seed:admin -w server`, then remove `ADMIN_PASSWORD`
from the file. After that, change the email or password from **Account** in the dashboard, or
re-run the script with `-- --reset`.

### Trying the dashboard safely

`npm run sandbox -w server` starts the API on a temporary in-memory database with sample
content and a test admin (credentials in `server/scripts/dev-sandbox.js`). Nothing reaches the
real database, Cloudinary or email, and everything is discarded when it stops. Stop the normal
API first, since both use port 5000.

## Configuration

Every setting is described in `server/.env.example` and `client/.env.example`. The important ones:

| Variable                    | Where  | Purpose                                                        |
| --------------------------- | ------ | -------------------------------------------------------------- |
| `MONGODB_URI`               | server | MongoDB Atlas connection string (required in production)       |
| `JWT_SECRET`                | server | Session signing secret, 32 or more characters (required in production) |
| `CLIENT_URL`                | server | Website origin(s) allowed to call the API (required in production) |
| `SITE_URL`                  | server | Public site address used in emails and the RSS feed            |
| `COOKIE_SAME_SITE`          | server | `lax` when the site and API share a site, otherwise `none`     |
| `TRUST_PROXY`               | server | Number of proxies in front of the API (see Deployment)         |
| `CLOUDINARY_*`              | server | Image and CV uploads                                           |
| `SMTP_USER`, `SMTP_PASS`    | server | Gmail address and app password for contact emails              |
| `ANALYTICS_TIMEZONE`        | server | Time zone for daily visitor totals (default `Asia/Dhaka`)      |
| `GITHUB_USERNAME`, `GITHUB_TOKEN` | server | GitHub activity section (token optional)                 |
| `VITE_SITE_URL`             | client | Public site address for canonical URLs, sitemap and previews (required for production builds) |
| `VITE_API_URL`              | client | API address; `/api` in development                             |

Never commit `.env` files; they are ignored by git.

**Gmail:** turn on 2-Step Verification for the sending account, create an app password, and use
it as `SMTP_PASS`. Without SMTP settings, emails are logged in development instead of sent.

## Scripts

Run from the repository root.

| Command                           | Description                                              |
| --------------------------------- | -------------------------------------------------------- |
| `npm run dev`                     | Start the website and the API together                   |
| `npm run dev:client`              | Start only the website                                   |
| `npm run dev:server`              | Start only the API (restarts on change)                  |
| `npm run build`                   | Production build of the website, with sitemap and robots.txt |
| `npm start`                       | Start the API in production mode                         |
| `npm run lint`                    | Lint both workspaces                                     |
| `npm run format`                  | Format the code with Prettier                            |
| `npm test -w server`              | API tests on an in-memory database                       |
| `npm run check:models -w server`  | Offline checks of the database models                    |
| `npm run seed:admin -w server`    | Create the admin account (`-- --reset` to replace it)    |
| `npm run seed:content -w server`  | Add or update the initial skills, projects and education |
| `npm run sandbox -w server`       | Run the API on a temporary database with a test admin    |

## Testing

```bash
npm test -w server
```

The API tests use Vitest and Supertest against an in-memory MongoDB, so they never touch Atlas.
Cloudinary and email are replaced with stand-ins. The first run downloads a MongoDB binary.
Before pushing a change, run `npm run lint`, `npm run build` and the tests.

## Deployment

The website is a static build (`client/dist`) and the API is a Node.js server.

1. **Same site for the website and the API.** Use one domain, for example `alokpaul.dev` for
   the website and `api.alokpaul.dev` for the API, or let the website's host forward `/api` to
   the API. If they live on unrelated domains (such as `vercel.app` and `onrender.com`), the
   admin cookie needs `COOKIE_SAME_SITE=none`, and Safari and private windows block it, so
   admin sign-in fails there.
2. **API environment:** set `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`
   and `SITE_URL`. Set `TRUST_PROXY` to `1` for a single host, or `2` if the website's host
   forwards `/api`, so rate limits see each visitor's own address.
3. **Website build:** set `VITE_SITE_URL` and `VITE_API_URL` (an absolute API address lets the
   build list projects, posts and research in `sitemap.xml`), then run `npm run build`.
4. **SPA fallback:** serve `index.html` for unknown paths so deep links and the 404 page work
   (a rewrite to `/index.html` on Vercel, or `/* /index.html 200` in `_redirects` on Netlify).
5. **Cloudinary:** on some plans, enable "Allow delivery of PDF and ZIP files" in the security
   settings so the uploaded CV can be downloaded.
6. **After deploying:** sign in to `/admin` and fill in **Site content** (LinkedIn link, CV,
   public email), then submit `https://<your-domain>/sitemap.xml` to Google Search Console.

For best performance, cache `/assets/*` for a year (file names are content-hashed), serve
`index.html` with `no-cache`, and keep the API and Atlas cluster in the same region.

## Security and privacy

- Single admin; the session is a JWT in an httpOnly cookie scoped to `/api`.
- Every state-changing request must carry `X-Requested-With: XMLHttpRequest`, which, together
  with a strict CORS policy, blocks cross-site request forgery.
- Rate limits on login (5 failed attempts per 15 minutes), the contact form (5 per hour) and
  page views; zod validation on every request body.
- Changing the password or using "sign out everywhere else" ends all other sessions.
- The contact form has a honeypot field; the automatic reply never repeats the visitor's text
  and is sent at most once per address per day.
- Visitor statistics store daily totals only: no cookies, IP addresses or user agents, and
  nothing is counted for browsers that send Do Not Track or Global Privacy Control. The
  `/privacy` page describes this for visitors.

## API reference

Responses are JSON: `{ success, data }`, with `pagination` on paginated lists and
`message` / `details` on errors. Admin routes require the session cookie.

<details>
<summary>Public and admin content routes</summary>

| Resource       | Public                                                                    | Admin                                |
| -------------- | ------------------------------------------------------------------------- | ------------------------------------ |
| Projects       | `GET /api/projects`, `GET /api/projects/:slug`                            | `POST /`, `PUT /:id`, `DELETE /:id`  |
| Skills         | `GET /api/skills`                                                         | `POST /`, `PUT /:id`, `DELETE /:id`  |
| Experience     | `GET /api/experience`                                                     | `POST /`, `PUT /:id`, `DELETE /:id`  |
| Research       | `GET /api/research`, `GET /api/research/:slug`                            | `POST /`, `PUT /:id`, `DELETE /:id`  |
| Certifications | `GET /api/certifications`                                                 | `POST /`, `PUT /:id`, `DELETE /:id`  |
| Blog           | `GET /api/blog`, `GET /api/blog/:slug`, `GET /api/blog/:slug/related`, `GET /api/blog/feed.xml` | `POST /`, `PUT /:id`, `DELETE /:id`  |
| Settings       | `GET /api/settings`                                                       | `PUT /api/settings`                  |
| GitHub         | `GET /api/github`                                                         |                                      |
| Contact        | `POST /api/contact`                                                       |                                      |
| Analytics      | `POST /api/analytics/view`                                                | `GET /api/analytics/summary?days=7\|30\|90` |

`PUT` updates only the fields sent; unknown fields are rejected. Every resource also has an
admin `GET /api/<resource>/id/:id` that returns drafts and hidden entries.

</details>

<details>
<summary>Query parameters</summary>

| Endpoint              | Parameters                                                                                   |
| --------------------- | -------------------------------------------------------------------------------------------- |
| `GET /api/projects`   | `page`, `limit` (max 50), `category`, `featured`, `tech`, `search`, `sort` (order, newest, oldest) |
| `GET /api/blog`       | `page`, `limit` (max 50), `tag`, `search`, `status` (admin only)                              |
| `GET /api/skills`     | `category`                                                                                   |
| `GET /api/experience` | `type` (work, education)                                                                     |
| `GET /api/research`   | `type`, `status`, `tag`, `featured`, `limit` (max 100)                                       |

Pagination object: `{ page, limit, total, totalPages, hasNextPage, hasPrevPage }`.

</details>

<details>
<summary>Admin-only routes</summary>

| Endpoint                          | Description                                                     |
| --------------------------------- | --------------------------------------------------------------- |
| `POST /api/auth/login`            | Sign in with `{ email, password }` (public, rate limited)       |
| `POST /api/auth/logout`           | Sign out                                                        |
| `GET /api/auth/me`                | The signed-in admin                                             |
| `PUT /api/auth/password`          | `{ currentPassword, newPassword }`; ends other sessions         |
| `PUT /api/auth/email`             | `{ currentPassword, email }`                                    |
| `POST /api/auth/sessions/revoke`  | Sign out every other session                                    |
| `GET /api/admin/stats`            | Dashboard counts and recent messages                            |
| `GET /api/messages`               | Inbox: `page`, `limit`, `status` (all, unread, read), `search`  |
| `PATCH /api/messages/:id`         | `{ read }`                                                      |
| `DELETE /api/messages/:id`        | Delete one message                                              |
| `POST /api/messages/bulk`         | `{ ids, action }` with `read`, `unread` or `delete` (1 to 100)   |
| `GET /api/messages/export`        | CSV of the messages matching `status` and `search`              |
| `POST /api/uploads?folder=`       | One image (`image` field): JPEG, PNG, WebP or AVIF, up to 5 MB   |
| `POST /api/uploads/document`      | One PDF (`file` field), up to 5 MB, for the CV                  |
| `DELETE /api/uploads`             | `{ publicId }`; removes an upload that was never saved          |

</details>
