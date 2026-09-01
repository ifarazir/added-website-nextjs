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
| `/product/<slug>` | Scrolling image column against a sticky details panel, specs, enquiry link, related objects. |

Three colours carry the whole thing — `#262626` ink, `#DAFF2B` acid, white —
with white on 80%+ of the surface and the acid yellow held under 10%.
Titillium Web sets large headings; Manrope does everything else.

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
| Settings | Manifesto copy, marquee, hero autoplay, contact details. |

**Auth** is email + password: scrypt hashes in the `users` table, a signed JWT
in an httpOnly cookie, and `middleware.ts` gating `/admin`. The middleware only
verifies the token (it runs on the edge); the user record is loaded in the
layout.

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
| `npm run db:generate` | Write a new SQL migration from `src/db/schema.ts`. |
| `npm run db:migrate` | Apply pending migrations. |
| `npm run db:push` | Push the schema straight to the database (development only). |
| `npm run db:studio` | Drizzle Studio. |
| `npm run db:seed` | Load the catalogue. Re-runnable — rows are matched on slug and updated. |
| `npm run images:build` | Re-derive `public/images` from the raw brand photography (`SOURCE_DIR=…`). |

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

- **Product photography.** The four hero frames were extracted from a brand PDF
  at about 1000px and are soft on large screens. Upload the originals through
  **Media** and repoint the hero slides — no code change.
- **Objects without photos** render a diagonal-striped placeholder rather than
  an empty box. Six of the fourteen seeded objects are in that state.
- **Specs are placeholders** for everything except the Donut. They are rows in
  `product_specs`, editable per object.
- **Search and Log In** in the header are `#` anchors, matching the design.
  There is no storefront: the site shows no prices and every call to action is
  an enquiry email.
