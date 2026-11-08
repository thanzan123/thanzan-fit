# Supabase setup for THANZAN FIT

This guide configures the optional manual cloud-copy feature in the hosted Progressive Web App (PWA). It does not turn the app into an automatically synchronized or multi-device database: records stay in each browser until you explicitly upload or load a copy.

## What you need

- A Supabase project you control.
- Access to that project's Supabase dashboard.
- Owner access to the `thanzan123/thanzan-fit` GitHub repository if configuring the public GitHub Pages build.

Do not send project keys or passwords in chat or commit them to the repository. The browser app uses only Supabase's public anon/publishable key; never use a `service_role` or secret key in Vite variables, frontend code, GitHub Pages, or a browser.

## 1. Create the tables and access policies

In your Supabase dashboard, open **SQL Editor** and run both [`supabase/schema.sql`](supabase/schema.sql) and [`supabase/normalized_schema.sql`](supabase/normalized_schema.sql). The first creates the backward-compatible JSON copy; the second creates the normalized tables and owner-only RLS policies used by the current PWA. Apply the normalized file after the legacy file. Re-running either file is supported.

The normalized schema creates account-owned profile, workout, nutrition, water, activity and recovery tables with row-level security (RLS). The signed-in user can read or change only rows whose `user_id` matches their Supabase auth ID. It also retains `public.fitness_records` as a backward-compatible copy for older app builds. Do not disable RLS or add broad `anon` access policies.

## 2. Enable email sign-in and set redirect URLs

In Supabase, open **Authentication → Providers → Email** and make sure email sign-in is enabled. This app requests a one-time email sign-in link; open it on the same device/browser where you want to continue.

Then open **Authentication → URL Configuration**:

- Set **Site URL** to `https://thanzan123.github.io/thanzan-fit/` for the hosted app.
- Add the exact permitted redirect URLs you will use. For GitHub Pages add `https://thanzan123.github.io/thanzan-fit/` (including the `/thanzan-fit/` path). For local Vite development add `http://localhost:5173/`.

The app returns the email link to the page URL it was opened from. If Supabase reports a redirect URL error, compare the displayed URL with the allowed redirect entries, including scheme, host, path, and trailing slash.

## 3. Configure the hosted build

In **Supabase → Project Settings → API**, copy the project URL and the public anon key (or publishable key) for the project.

In the GitHub repository, open **Settings → Secrets and variables → Actions** and configure:

- Repository variable `VITE_SUPABASE_URL` = your Supabase project URL.
- Repository secret `VITE_SUPABASE_ANON_KEY` = your public anon/publishable key.

The GitHub Pages workflow reads these exact names at build time. Updating the settings does not change an already-published site; push a commit to `main` or manually run **Actions → Build and deploy THANZAN FIT → Run workflow** to rebuild. Wait for the workflow and Pages deployment to succeed, then reopen or refresh the hosted app.

## 4. Configure local development (optional)

From the repository root, copy `.env.example` to `.env.local`, then set the same project URL and public anon/publishable key there. `.env.local` is ignored by Git. Start Vite with `pnpm dev`; add the exact local URL to Supabase's allowed redirect URLs as described above.

## 5. Verify the connection and copy your data

On the hosted app, open **Progress → Supabase cloud copy**. If configuration is missing, the setup-needed notice remains visible and records stay local.

1. Enter the email address for the Supabase account you want to use and request a sign-in link.
2. Open the link on that same device/browser. Confirm the app shows you as signed in.
3. Choose **Check cloud copy**. A first-time account should show that no cloud copy exists yet.
4. To upload, choose **Save this browser to cloud** and confirm the prompt. The app writes account-owned rows to the normalized tables, stores a compatibility snapshot in `user_preferences`, and refreshes the legacy JSON copy.
5. On another device/browser, sign into the same Supabase account, choose **Check cloud copy**, then **Load cloud copy here** and confirm to replace that browser's local record.

The two directions are explicit and do not merge records. Saving replaces stale rows for this account after writing the current snapshot; loading replaces the current browser's record. Download a JSON backup first if you may need either previous copy. If an upload reports an error, the local browser data is unchanged; check the table/policy setup and retry only after resolving the error. Sign-out does not remove local browser data or the cloud record.

## Troubleshooting

- **Setup needed still appears:** check the spelling of both variable names and that values are set in the build environment, then trigger a fresh successful deployment. Do not add a service-role key.
- **Email link says redirect URL is not allowed:** add the exact URL shown in the address bar to Supabase's allowed redirect URLs, including the GitHub Pages path; then request a fresh link.
- **Cloud check/save fails with a table or permission error:** confirm both `supabase/schema.sql` and `supabase/normalized_schema.sql` ran successfully in the same Supabase project whose URL/key the build uses, and confirm RLS remains enabled with the supplied authenticated-user policies.
- **No cloud copy yet:** this is expected before the first explicit save. Signing in alone does not upload anything.
- **Different data on two devices:** each has independent local data until you explicitly load the cloud copy. The app has no merge or automatic conflict resolution.

## What the current PWA syncs

The PWA uses the normalized profile and user-preference tables plus normalized tables for weigh-ins, body measurements, meal logs, custom foods, meal templates, workouts/sets, water, activity and sleep/recovery logs. It stores a compatibility snapshot in `user_preferences.preferences.app_snapshot` so all existing app settings and record details can be restored exactly, and mirrors the snapshot to `fitness_records` for older builds. Save and load remain manual; this is not continuous sync. RLS must remain enabled.

The schema also prepares private body-photo storage, AI conversation and report tables, but the PWA does not yet upload photos or provide personalized server-side AI. The broader platform is still unfinished.

## Data and security limits

The cloud copy stores supported records across normalized relational tables and keeps an app snapshot in `user_preferences.preferences.app_snapshot` for faithful restore; a compatibility JSONB row may also be refreshed for older builds. It is ordinary project data, not end-to-end encrypted, and this app has no medical-record security certification. Anyone with access to the Supabase project may be able to access project data according to that project's own administrative permissions. The public app's anon/publishable key is not an account password; RLS is essential to limiting user-row access. Cloud save/load is manual and does not merge automatically. The app is not end-to-end encrypted, and this manual flow does not implement private photo upload or personalized server-side AI.
