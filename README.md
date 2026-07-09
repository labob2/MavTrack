# MavTrack

A GPA, credit, and scholarship tracker with real accounts — built to answer one question a normal degree-audit tool doesn't: *am I currently safe, across my GPA, my graduation requirements, and my scholarship's conditions, all at once.*

**[Live site](https://mavtrack.com)** · **[User Guide](./USER_GUIDE.md)** — a full walkthrough of every feature, written for people using the app, not developers.

---

## What it does

Most students juggle three disconnected sources to know where they stand: a grade portal (current grades, no projection), a degree-audit tool (requirement completion, no what-if scenarios), and a scholarship award letter (read once, never checked again). MavTrack pulls all three into one place, backed by a real account so the data follows you across devices instead of living in one browser's local storage.

**Core features:**
- **GPA tracking** — cumulative and per-semester, calculated live from every course you enter
- **Graduation progress** — credit-hour tracking against flexible, user-defined requirement categories (major, minor, gen-ed, elective), built so double majors and additional minors are a data addition, not a redesign
- **Scholarship compliance** — enter a scholarship's actual GPA and credit-hour minimums, and get an ongoing **On track / Watch / At risk** status, judged with a buffer above the minimum rather than a flat pass/fail
- **What-if projection** — build a hypothetical future semester and see the effect on your GPA and scholarship standing before it happens, without touching your real record
- **Real accounts** — sign up, log in from any device, same data every time

Full details on how to use each of these are in the **[User Guide](./USER_GUIDE.md)**.

---

## How it's built

**Frontend:** React, built with Vite. No CSS framework — a hand-built design system (custom CSS variables, dark theme) rather than Tailwind or a component library, so every visual choice is deliberate rather than a default.

**Backend:** [Supabase](https://supabase.com) — hosted Postgres plus built-in authentication. There's no separate backend server; the React app talks to Supabase directly using its JavaScript client. Every table is protected with **Row Level Security** policies keyed to `auth.uid()`, which means the database itself enforces that a signed-in user can only ever read or write their own rows — that protection exists independent of anything the frontend code does.

**Data model:**
| Table | Purpose |
|---|---|
| `requirement_groups` | User-defined categories (major, minor, gen-ed, elective) with a credit-hour target each |
| `semesters` | One row per semester a student adds |
| `courses` | Belongs to a semester, references a requirement group, holds name/credits/grade |
| `scholarships` | A scholarship's name and its GPA / credit-hour minimums |
| `whatif_state` | A single scratch row per user holding their current hypothetical semester — intentionally not modeled as full relational data, since it's disposable by design |

GPA, graduation progress, and scholarship status are never stored directly — they're calculated fresh from the raw course data every time, so there's no risk of a cached number drifting out of sync with reality.

**Hosting & deployment:** the frontend is deployed on [Vercel](https://vercel.com), connected directly to this repository — every push to `main` triggers an automatic rebuild and redeploy. The custom domain is configured through DNS records at the registrar, pointing at Vercel's edge network, with SSL provisioned automatically.

**Version control:** this repo. Commit history is meant to read as an actual changelog of the project's evolution, not a single dump.

---

## Project structure

```
├── src/
│   ├── App.jsx              the main application (dashboard, courses, requirements, scholarships, what-if)
│   ├── Auth.jsx              sign-in / sign-up screen
│   ├── main.jsx               React entry point
│   └── lib/
│       └── supabaseClient.js  Supabase connection, reads from environment variables
├── public/                    static assets (logo, favicon)
├── supabase-schema.sql        full database schema + Row Level Security policies
├── USER_GUIDE.md               feature walkthrough for end users
└── .env.example                template for the two required environment variables
```

---

## Running it locally

You'll need a free [Supabase](https://supabase.com) project of your own — this app doesn't share a database with the live site.

1. Create a Supabase project, then run the entire contents of `supabase-schema.sql` in its SQL Editor (this creates every table and locks each one down with Row Level Security).
2. Copy `.env.example` to `.env`, and fill in your project's URL and public API key (found in Supabase under **Settings → API Keys**, or via the **Connect** button on your project dashboard):
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-key-here
   ```
3. Install and run:
   ```
   npm install
   npm run dev
   ```
4. Open the local address it prints, sign up for an account, and you're in.

By default, Supabase requires email confirmation before a new account can sign in. For local testing, this can be turned off under **Authentication → Providers → Email**.

---

## Deploying

If deploying your own copy (e.g. via Vercel), add the same two environment variables in your hosting provider's dashboard — `.env` is gitignored on purpose and never gets uploaded, so a fresh deployment needs them configured separately from wherever you're hosting.

---

MavTrack · created by Md Labib Al Karim · All rights reserved · Not affiliated with the University of Texas at Arlington
