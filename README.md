# THANZAN FIT

A mobile-first, standalone fitness and food journal that runs in a browser and can be installed as a PWA. This export is separate from the Wabi app.

## Privacy and scope

- Starts with a blank profile; enter only the personal data you choose.
- Records stay in this browser's `localStorage` on this device. They are not synced, backed up to a server, encrypted by this app, or shared between browsers/devices.
- No account, Supabase, cloud backup, AI service, food-photo recognition, or remote personal-data API is included. The Coach view summarizes locally entered records with simple rules; it is not an AI trainer or medical advice.
- The starter food list has approximate generic reference values. Actual foods and recipes vary; verify packaging and portions.
- Avoid sensitive entries on shared devices. Export a JSON backup and store it somewhere private if you need a backup.

## Included features

- Editable, optional profile and transparent BMI/BMR/TDEE estimates; calorie targets wait for required profile fields and use a moderate cap.
- Daily weight, food, water and recovery logs saved in browser storage.
- Starter Push/Pull/Legs week with editable default routines and user-created routines/exercise lists; routine edits and active-session exercise snapshots persist locally.
- Workout timer, set-by-set session log, dated body measurements and progress summaries.
- Generic nutrition starter list, custom foods, favorites, meal categories and macro totals.
- JSON backup/restore, a unified CSV export for weigh-ins, food, water, workouts, individual sets, body measurements and recovery check-ins, plus locally generated weekly and month-to-date PDF progress reports.
- Responsive dark/light UI, installable manifest and offline app-shell caching.

This is a useful local-first starter, not the full production platform from the original brief. It does not include secure private photo storage, account authentication, cross-device persistence, automated reminders, full exercise videos, or personalized AI integration.

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

The app does not ship with user-specific data. Use **Progress → Download JSON backup** to export supported local records; use **Restore JSON** to restore them in this browser. CSV exports weigh-ins, food, water, workouts, individual sets, body measurements and recovery check-ins. Weekly and month-to-date PDF reports summarize only records saved in the selected period; averages use days with entries, not blank days. Deleting local records only affects this browser's THANZAN FIT key; clearing browser/site data may remove it too.
