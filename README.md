# ADDED FORMS — catalogue website

Product catalogue for ADDED FORMS, a Tehran studio making interior accessories
in stainless steel, iron, aluminium and wood. A public showcase site plus an
admin panel for the studio to run the catalogue themselves.

Built from the design handoff in [`design/`](./design) — read
[`design/README.md`](./design/README.md) before changing the front end.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 ·
PostgreSQL via Drizzle ORM · shadcn/ui in the admin · GSAP for motion.

---

## Getting started

```bash
npm install
cp .env.example .env          # then edit it — see below
docker compose up -d          # PostgreSQL on :5432
npm run db:migrate            # create the schema
npm run db:seed               # load the catalogue and the first admin
npm run dev                   # http://localhost:3000
```

The admin panel is at `/admin`, using the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from
your `.env`. Change the password from **Account** once you are in.

### Environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string. |
| `AUTH_SECRET` | Signs the session cookie. `openssl rand -base64 32`. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Read once by `db:seed` to create the first admin. |
| `STORAGE_DRIVER` | `local` (default) or `s3`. |
| `UPLOAD_DIR` | Where the local driver writes. Defaults to `./uploads`. |
| `S3_*` | Bucket, region, endpoint and keys for the `s3` driver. |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin, used for metadata. |

---

## The site

| Route | What it is |
| --- | --- |
| `/` | Hero slideshow, manifesto, masonry of selected objects, marquee + category index, scrubbing lookbook strip. |
| `/collection` | Every published object. `?category=<slug>` filters, and the URL is shareable. |
| `/product/<slug>` | Scrolling image column against a sticky details panel, specs, enquiry link, related objects. Any image opens full screen. |
| `/search` | Searches the catalogue by object, material and category name. |

Three colours carry the whole thing — `#262626` ink, `#DAFF2B` acid, white —
with white on 80%+ of the surface and the acid yellow held under 10%.
Titillium Web sets large headings; Manrope does everything else.

### Search

`searchProducts` in `src/lib/queries.ts` is a case-insensitive `LIKE` across the
name, material, summary and description, plus the object's category name.
Deliberately plain: the catalogue is small, so this needs no extension, no index
to maintain and no ranking to tune. LIKE wildcards in the term are escaped, so
searching for `1/4` or `50%` behaves. Past a few hundred objects the next step
is a generated `tsvector` column with a GIN index rather than a cleverer LIKE.

Results are not cached — the term is unbounded, and caching per term would fill
the cache with single-use entries — and the page is `noindex`.

### Motion

GSAP and ScrollTrigger are loaded lazily by `MotionProvider`, which owns every
trigger on the site and kills them on navigation. Under
`prefers-reduced-motion: reduce` nothing is registered at all, the
`motion-ready` class never lands on `<html>`, and every reveal renders at its
natural opacity — so the site is fully readable with JavaScript disabled too.

---

## The admin panel

| Page | What it manages |
| --- | --- |
| Dashboard | Counts, and what was edited most recently. |
| Products | Full CRUD, with ordered images, repeatable specs, draft/live and featured flags. |
| Categories | Collection filters and the numbered homepage index. |
| Hero slides | The homepage slideshow: image, caption, optional product link, order. |
| Lookbook | The horizontal editorial strip, with per-frame heights. |
| Media | Upload library. Images are auto-rotated, capped at 2400px and re-encoded to WebP. |
| Subscribers | Newsletter sign-ups from the footer. |
| Settings | Manifesto copy, collaborations copy, marquee, hero autoplay, contact details. |
| Accounts | Add, edit and remove admin accounts. Admins only. |

**Auth** is email + password: scrypt hashes in the `users` table, a signed JWT
in an httpOnly cookie, and `middleware.ts` gating `/admin`. The middleware only
verifies the token (it runs on the edge); the user record is loaded in the
layout.

**Roles.** `editor` runs the catalogue; `admin` can additionally manage
accounts. The Accounts page is hidden from the nav for editors and redirects
them away, and every action behind it goes through `requireAdmin()`. Two things
are refused outright so the studio cannot lock itself out: deleting your own
account, and demoting or deleting the last remaining admin.

**Caching.** Public pages are dynamic — the database is not reachable at build
time — but every read is wrapped in `unstable_cache` under the `content` tag.
Admin writes call `revalidateTag`, so an edit is live on the next request
without the site hammering the connection pool.

---

## Media storage

`STORAGE_DRIVER=local` writes to `UPLOAD_DIR` and serves the files through
`app/uploads/[...path]/route.ts`.

> Uploads deliberately do **not** live in `public/`. Next.js maps that
> directory when the server boots, so a file written by the admin would 404
> until the next restart. Serving them from a route handler also makes
> `UPLOAD_DIR` easy to mount as a volume.

For a platform with an ephemeral filesystem (Vercel, most container hosts),
switch to object storage:

```bash
npm i @aws-sdk/client-s3
# then set STORAGE_DRIVER=s3 and the S3_* variables
```

`src/lib/storage.ts` is the only file that needs to know.

---

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | The usual Next.js three. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run lint` | ESLint 9 flat config with the Next.js rules. |
| `npm test` | Vitest unit tests. |
| `npm run test:e2e` | Playwright end-to-end tests (builds and starts the app itself). |
| `npm run test:e2e:ui` | The same suite in Playwright's UI mode. |
| `npm run db:generate` | Write a new SQL migration from `src/db/schema.ts`. |
| `npm run db:migrate` | Apply pending migrations. |
| `npm run db:push` | Push the schema straight to the database (development only). |
| `npm run db:studio` | Drizzle Studio. |
| `npm run db:seed` | Load the catalogue. Re-runnable — rows are matched on slug and updated. |
| `npm run images:build` | Re-derive `public/images` from the raw brand photography (`SOURCE_DIR=…`). |

---

## Tests

```bash
npm test          # unit — fast, no database
npm run test:e2e  # end-to-end — needs a seeded database
```

**Unit** (`tests/unit`) covers the pure logic: slug generation, password
hashing, session signing and tampering, the rate limiter's windows, the Zod
schemas, and the database error unwrapping.

**End-to-end** (`tests/e2e`) drives a production build in a real browser: the
public pages, the hero and its caption, category filtering, 404 status codes,
the SEO surface, reduced motion, mobile overflow, the whole admin — sign-in,
access control, catalogue CRUD, uploads, settings, and account management.

Several tests exist because the bug they describe actually happened; those
carry a `Regression:` comment saying what broke.

The suite shares one database and one in-process rate limiter, so it runs
serially. Tests that change data either create their own rows and delete them
or restore what they touched, so the suite can be re-run against the same
database.

> If your machine already has a Chromium that Playwright can use, point
> `PLAYWRIGHT_CHROMIUM_PATH` at it to skip the download.

---

## SEO

- `app/sitemap.ts` lists the homepage, the collection, every category filter and
  every published product, with `lastModified` from the database.
- `app/robots.ts` allows everything except `/admin` and `/uploads/`.
- Product pages emit `Product` and `BreadcrumbList` JSON-LD; the homepage emits
  `Organization`. No `offers` block — the studio publishes no prices, and a
  fabricated one would be worse than none.
- Unknown slugs and unknown `?category=` values return a real HTTP 404.

> There is deliberately **no** `app/(site)/loading.tsx`. A loading file creates a
> Suspense boundary that starts streaming the response before the page runs, so
> `notFound()` could no longer set the status and every missing product returned
> a soft 404 — HTTP 200 with a "not found" body. Correct status codes matter
> more here than a loading skeleton on pages that are already fast.

## Abuse protection

`src/lib/rate-limit.ts` is a fixed-window counter held in the process:

- **Login** — 10 attempts per 15 minutes, counted per IP *and* per account, so
  one host cannot walk the user list and a botnet cannot hammer one account. A
  successful sign-in clears both counters. The trade-off is real: ten bad
  guesses locks that account out for the rest of the window.
- **Newsletter** — 5 sign-ups per IP per hour, plus a hidden `company` field.
  A filled honeypot gets the success message and is dropped.

It is process-local on purpose: no infrastructure, enough for a single
instance. Behind more than one instance, move the counter to Redis — `check()`
is the only function that changes.

## Deployment

`Dockerfile` builds the Next.js standalone output and runs it as a non-root
user with `UPLOAD_DIR=/data/uploads` exposed as a volume. Migrations are **not**
run by the image — apply them against the target database as a separate step
before rolling out:

```bash
docker build -t added-website --build-arg NEXT_PUBLIC_SITE_URL=https://addedforms.com .
npm run db:migrate            # against the production DATABASE_URL
docker run -p 3000:3000 --env-file .env -v added-uploads:/data/uploads added-website
```

`.github/workflows/ci.yml` runs typecheck, lint, a migrate-and-seed against a
throwaway PostgreSQL service, and a build on every push and pull request.

---

## Layout

```
src/
├── app/
│   ├── (site)/            public site — home, collection, product
│   ├── admin/
│   │   ├── _actions/      server actions (auth, catalog, content, media)
│   │   ├── (panel)/       the panel itself, behind the sidebar layout
│   │   └── login/
│   ├── actions/           public server actions (newsletter)
│   └── uploads/           runtime file serving for the local driver
├── components/
│   ├── site/              header, hero, cards, footer, motion
│   ├── admin/             forms, media picker, dialogs
│   └── ui/                shadcn/ui primitives
├── db/                    Drizzle schema and client
└── lib/                   auth, session, storage, queries, validators
```

---

## Notes for whoever picks this up

- **Product photography.** Four originals exist at 3122×3467 (Donut, Wireframe,
  St Table, Modular Shelf) plus the Lior Comb at 1378×1822, and those are the
  only images used anywhere they run full-bleed — the hero and the lookbook.

  The four frames the design mocked up the hero with — the donut in hand, the
  jooje in sand, the UFO colander, the jooje sphere — exist **only** at roughly
  1000px. There is no larger copy in the handoff: the `uploads/` folder, the
  image streams embedded in both brand PDFs, and the asset bundle inside the
  standalone HTML export all carry the same ~1000px versions. They are still
  attached to their own objects, where a card-sized crop holds up, and the UFO
  and Jooje have no other photography at all. Send those originals and they can
  go back into the hero from **Hero slides** — no code change.

- **The Lior Comb source is a screenshot of an Instagram post** and had the
  carousel's next-arrow baked into its right edge. `scripts/optimize-images.ts`
  trims 80px off that edge; replace the file with a clean original and the trim
  can go.
- **Objects without photos** render a diagonal-striped placeholder rather than
  an empty box. Six of the fourteen seeded objects are in that state.
- **Specs are placeholders** for everything except the Donut. They are rows in
  `product_specs`, editable per object.
- **LOG IN in the header is still a `#` placeholder.** It came from the brand
  design, and the site has no customer accounts — there is no storefront, no
  prices, and every call to action is an enquiry email. Either wire it up or
  drop it; the anchor test names it explicitly, so a *second* dead anchor will
  fail the build while this one stays a deliberate choice.
