# THANZAN FIT

A mobile-first, standalone fitness and food journal that runs in a browser and can be installed as a PWA. This export is separate from the Wabi app.

## Privacy and scope

- Starts with a blank profile; enter only the personal data you choose.
- By default, records stay in this browser's `localStorage` on this device. They are not synced unless you configure Supabase and explicitly use the manual cloud-copy controls.
- Optional Supabase sign-in and manual backup/restore integration is scaffolded below. It is not active until you configure your own project and environment values. The Coach view summarizes locally entered records with simple rules; it is not an AI trainer or medical advice.
- The food library includes generic reference examples plus a sourced subset of Indian ingredients from ICMR–NIN’s IFCT 2017. Values are per 100 g edible portion in the listed form; recipes and portions vary, so use packaging labels or your own recipe estimates when available.
- Avoid sensitive entries on shared devices. Export a JSON backup and store it somewhere private if you need a backup.

## Included features

- Editable, optional profile and transparent BMI/BMR/TDEE estimates; calorie targets wait for required profile fields and use a moderate cap.
- Daily weight, food, water, recovery (sleep duration, subjective sleep-quality and energy/soreness ratings, plus an optional 1–5 readiness rating; the current day’s check-in can be updated) and manual activity logs (steps, walking distance and non-gym active minutes) saved in browser storage. Walking calories are a clearly labeled rough estimate using logged distance and profile weight; there is no step-counter or health-device integration.
- Starter Push/Pull/Legs week with editable default routines and user-created routines/exercise lists; routine edits and active-session exercise snapshots persist locally.
- Workout timer with pause/resume and active-time duration, set-by-set session log with previous performance and best-set references from completed workouts (without automatic load increases), editable or deletable weigh-ins and body measurements, rolling weight trends, and a transparent calorie-scenario comparison. Coach shows today’s scheduled routine and uses same-day sleep, sleep-quality, energy, soreness and optional readiness ratings for a cautious, optional “ease up” prompt; it never changes the plan automatically. The scenario view uses profile-estimated TDEE, shows logged-food averages only across days with entries, and labels its four-week energy-balance arithmetic as illustrative rather than predictive.
- Nutrition library with 49 sourced Indian ingredient references from ICMR–NIN IFCT 2017, alongside generic examples, custom foods, favorites, meal categories and macro totals. Sourced entries use per-100 g values for the listed form (including raw, dry, ripe and boiled foods), with published kJ converted to kcal; mixed-dish recipes need their own estimates. Edit or delete saved food entries, including their date, meal, portion and nutrient values. Save logged meal entries as reusable templates and add them to another selected day in one tap.
- Plain JSON backup/restore plus optional passphrase-encrypted JSON backup/restore (AES-GCM with PBKDF2), both including saved meal templates; a unified CSV export for weigh-ins, food, water, workouts, individual sets, body measurements, recovery check-ins (including reported sleep-quality and optional readiness ratings) and daily activity logs, plus locally generated weekly and month-to-date PDF progress reports.
- Responsive dark/light UI, installable manifest and offline app-shell caching.
- A 32-movement exercise guide. Thirty guides have in-app video examples; Dead bug and Light walking link to the original YouTube pages instead of embedding or copying them. Reuse rights for those two external videos were not independently verified.

This is a useful local-first starter, not the full production platform from the original brief. Cloud sign-in and manual sync remain inactive until you configure Supabase; it does not include secure private photo storage, cross-device persistence, a complete embedded video library, or personalized AI integration. Local reminder settings are optional; browser notifications work only while the app is open.

## Run locally

Requires Node.js 20+ and pnpm 11+.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

## Build and preview

```sh
pnpm build
pnpm preview
```

The production output is `dist/`. GitHub Actions builds and publishes it to GitHub Pages on pushes to `main`.

## GitHub Pages deployment

The repository workflow targets `https://thanzan123.github.io/thanzan-fit/`. GitHub Pages must use **Settings → Pages → Build and deployment → Source: GitHub Actions**. The workflow requires GitHub Actions to be enabled. The repository contents are public; user logs are not stored in the repository.

## Data

The app does not ship with user-specific data. Use **Progress → Download JSON backup** to export supported local records; use **Restore JSON** to restore them in this browser. For a protected export, use **Encrypted backup** with a passphrase of at least 12 characters; keep that passphrase separately, because it is never stored and cannot be recovered. Encrypted backups protect only the exported file—not data saved in this browser—and CSV exports remain unencrypted. CSV exports weigh-ins, food, water, workouts, individual sets, body measurements, recovery check-ins and daily activity logs. Daily steps, walking distance and non-gym active minutes are manual entries; rough walking-calorie estimates use 0.5 kcal × logged km × saved profile weight (kg), and are neither measured nor used to change food targets. JSON backup/restore and weekly/month-to-date PDFs include the activity records. Weekly and month-to-date PDF reports summarize only records saved in the selected period; averages use days with entries, not blank days. Deleting local records only affects this browser's THANZAN FIT key; clearing browser/site data may remove it too.


## Optional Supabase persistence

For the full project, authentication, GitHub Actions and troubleshooting walkthrough, see [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md).

The app can store one JSONB fitness record per authenticated user in your own Supabase project. Synchronization is manual: sign in with an emailed link, check the cloud record, then explicitly upload or load it. It never syncs on page load or silently merges copies. Replacing either copy is destructive to that copy, so export a JSON backup first.

1. Create a Supabase project that you control. In its SQL Editor, run [`supabase/schema.sql`](supabase/schema.sql). The table uses row-level security and permits each signed-in user to access only their own row.
2. In Supabase Authentication → URL Configuration, allow the exact local and production app URLs as redirect URLs, including `/thanzan-fit/` for GitHub Pages. Enable email sign-in.
3. Copy `.env.example` to `.env.local` for local development and fill in the Project URL and public anon/publishable key from Project Settings → API. For GitHub Pages, add `VITE_SUPABASE_URL` as an Actions variable and `VITE_SUPABASE_ANON_KEY` as an Actions secret in the repository settings. Pushes build with those values; without them, the app stays local-first and shows setup instructions.
4. Never put a Supabase service-role/secret key in frontend code, `.env` files committed to Git, or GitHub Pages. The anon/publishable key is designed for frontend use and relies on correct RLS policies.

The single-row JSONB design is a migration-friendly first persistence step, not a normalized relational data model. Supabase stores the profile and logs as ordinary project data; this app does not provide end-to-end encryption or a medical-record security certification. No project credentials or cloud deployment configuration are included in this repository.
