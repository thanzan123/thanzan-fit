# THANZAN FIT

A mobile-first, standalone fitness and food journal that runs in a browser and can be installed as a PWA. This export is separate from the Wabi app.

## Privacy and scope

- First-time setup pre-fills the editable starter values supplied in the original brief (name, age, height, starting/target weight, goal, experience, gym start date and planned frequency/duration). Current weight, gender, activity level and all other unknown details remain blank; no workout, food or health log is fabricated. These defaults are not verified and can be changed or cleared. Existing browser profiles and records are preserved.
- By default, records stay in this browser's `localStorage` on this device. They are not synced unless you configure Supabase and explicitly use the manual cloud-copy controls.
- Optional Supabase sign-in and manual backup/restore integration is scaffolded below. It is not active until you configure your own project and environment values. The Coach view summarizes locally entered records with simple rules, includes quick answers for logged calories, protein, water and profile weight change, and offers protein-focused dinner portions from the saved food library using today’s logged nutrition when available; it is not an AI trainer or medical advice.
- The food library includes generic reference examples plus a sourced subset of Indian ingredients from ICMR–NIN’s IFCT 2017. Values are per 100 g edible portion in the listed form; recipes and portions vary, so use packaging labels or your own recipe estimates when available.
- Avoid sensitive entries on shared devices. Export a JSON backup and store it somewhere private if you need a backup.

## Included features

- Editable starter profile with a gym start date and metric or imperial display units (kg/cm/km or lb/in/mi); existing records are converted for display and kept in canonical kg/cm/km internally and in CSV exports, while older backups without a unit preference open in metric mode. Transparent BMI/BMR/TDEE estimates with an in-app formula and assumption breakdown; calorie targets wait for required profile fields and use a moderate cap.
- Daily weight, food, water, recovery (sleep duration, subjective sleep-quality and energy/soreness ratings, plus optional 1–5 readiness and a ready/unsure/rest workout-readiness choice; an optional morning weigh-in can be saved in the same check-in, and the current day’s entry can be updated) and manual activity logs (steps, walking distance and non-gym active minutes) saved in browser storage. An optional personal daily step goal shows dashboard progress only alongside an actual manual step log; no target is assumed. Walking calories are a clearly labeled rough estimate using logged distance and profile weight; there is no step-counter or health-device integration.
- Starter Push/Pull/Legs week with editable default routines and user-created routines/exercise lists; custom exercise guides include setup, steps, breathing, cues, mistakes, safety notes and starter dose. Add/edit/delete custom guides, search or filter them, and include them in JSON backups and CSV export. Routine edits and active-session exercise snapshots persist locally.
- Progress includes a seven-calendar-day chart of completed workout sessions and the editable profile target; days without a saved session are not treated as missed workouts. Workout timer with pause/resume and active-time duration, set-by-set session log with previous performance and best-set references from completed workouts (without automatic load increases), editable or deletable weigh-ins and body measurements, rolling weight trends, and a transparent calorie-scenario comparison. Coach shows today’s scheduled routine and uses same-day sleep, sleep-quality, energy, soreness and optional readiness ratings for a cautious, optional “ease up” prompt; it never changes the plan automatically. The scenario view uses profile-estimated TDEE, shows logged-food averages only across days with entries, and labels its four-week energy-balance arithmetic as illustrative rather than predictive.
- Nutrition library with local, limited allergy-name warnings based on saved allergy notes; matched foods and recipe ingredients are highlighted and require a label check, while unmatched names are not cleared as safe. The library includes 49 sourced Indian ingredient references from ICMR–NIN IFCT 2017, alongside generic examples, white rice flour from USDA FoodData Central, custom foods, favorites, meal categories and macro totals. Sourced entries use per-100 g values for the listed form (including raw, dry, ripe and boiled foods), with published kJ converted to kcal; the recipe builder includes editable, source-linked Kerala appam, idiyappam and puttu starter estimates; other mixed dishes need their own estimates. Edit or delete saved food entries, including their date, meal, portion and nutrient values. Save logged meal entries as reusable templates and add them to another selected day in one tap.
- Plain JSON backup/restore plus optional passphrase-encrypted JSON backup/restore (AES-GCM with PBKDF2), both including saved meal templates; a unified CSV export for weigh-ins, food, water, workouts, individual sets, body measurements, recovery check-ins (including sleep-quality, optional readiness ratings and workout-readiness choice) and daily activity logs, plus locally generated weekly and selectable-calendar-month PDF progress reports.
- Responsive dark/light UI, installable manifest and offline app-shell caching.
- A 32-movement exercise guide with optional, explicitly non-equivalent supported swaps for selected movements; routine swaps affect only the chosen saved routine. Thirty guides have in-app video examples; Dead bug and Light walking link to the original YouTube pages instead of embedding or copying them. Reuse rights for those two external videos were not independently verified.

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

The app starts without workout, nutrition or health-log data. Use **Progress → Download JSON backup** to export supported local records; use **Restore JSON** to restore them in this browser. For a protected export, use **Encrypted backup** with a passphrase of at least 12 characters; keep that passphrase separately, because it is never stored and cannot be recovered. Encrypted backups protect only the exported file—not data saved in this browser—and CSV exports remain unencrypted. CSV exports weigh-ins, food, water, workouts, individual sets, body measurements, recovery check-ins and daily activity logs. Daily steps, walking distance and non-gym active minutes are manual entries; rough walking-calorie estimates use 0.5 kcal × logged km × saved profile weight (kg), and are neither measured nor used to change food targets. JSON backup/restore and weekly/monthly PDFs include the activity records. Choose a past calendar month for a complete monthly report; the current month runs only through today. Weekly and monthly PDF reports summarize only records saved in the selected period; averages use days with entries, not blank days. Deleting local records only affects this browser's THANZAN FIT key; clearing browser/site data may remove it too.


## Optional Supabase persistence

For the full project, authentication, GitHub Actions and troubleshooting walkthrough, see [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md).

When configured, the app can save a manual cloud copy in your own Supabase project. It writes supported records to the normalized tables and keeps a complete app snapshot for restore; a legacy JSONB copy is refreshed for older builds. Synchronization is manual: sign in with an emailed link, check the cloud copy, then explicitly upload or load it. It never syncs on page load or silently merges copies. Replacing either copy is destructive to that copy, so export a JSON backup first.

The PWA now reads and writes the relational tables in [`supabase/normalized_schema.sql`](supabase/normalized_schema.sql), in addition to the legacy `fitness_records` table from [`supabase/schema.sql`](supabase/schema.sql). The same normalized schema also prepares private photo storage and AI tables, which are not yet used by the PWA. See [`supabase/NORMALIZED_SCHEMA_NOTES.md`](supabase/NORMALIZED_SCHEMA_NOTES.md) for coverage and limitations.

1. Create a Supabase project that you control. In its SQL Editor, run [`supabase/schema.sql`](supabase/schema.sql), then [`supabase/normalized_schema.sql`](supabase/normalized_schema.sql). Both keep account-owned rows behind row-level security (RLS).
2. In Supabase Authentication → URL Configuration, allow the exact local and production app URLs as redirect URLs, including `/thanzan-fit/` for GitHub Pages. Enable email sign-in.
3. Copy `.env.example` to `.env.local` for local development and fill in the Project URL and public anon/publishable key from Project Settings → API. For GitHub Pages, add `VITE_SUPABASE_URL` as an Actions variable and `VITE_SUPABASE_ANON_KEY` as an Actions secret in the repository settings. Pushes build with those values; without them, the app stays local-first and shows setup instructions.
4. Never put a Supabase service-role/secret key in frontend code, `.env` files committed to Git, or GitHub Pages. The anon/publishable key is designed for frontend use and relies on correct RLS policies.

Cloud save/load is manual and does not merge automatically. Supabase stores records as ordinary project data; the app does not provide end-to-end encryption or a medical-record security certification. No project credentials or cloud deployment configuration are included in this repository.
