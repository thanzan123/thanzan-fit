# Normalized Supabase schema and PWA integration

`normalized_schema.sql` is an additive relational schema for THANZAN FIT. The hosted PWA now writes account-owned profile, workout, food, weigh-in, measurement, water, activity, sleep/recovery, nutrition-target and preference data into these tables when the person explicitly saves a cloud copy. It also keeps a complete app-state snapshot in `user_preferences.preferences.app_snapshot` so supported settings and records can be restored without loss, plus the legacy `fitness_records` JSONB row for older builds.

## What this integration does—and does not do

- Sign-in and cloud save/load remain optional and manual. Local browser records are not uploaded automatically, and separate devices do not merge.
- Each explicit save mirrors the current browser state into normalized rows, removes stale rows belonging to that signed-in account, and updates the restore snapshot. Loading replaces the current browser's app state after confirmation.
- The PWA supports Auth and database tables but does not yet use the private body-photo bucket, AI conversation/report tables, or an AI service. Cross-device use requires configuring a Supabase project and rebuilding the hosted app with its URL and public anon/publishable key.
- The app uses only the public anon/publishable key. Never put a service-role/secret key in frontend code or the build environment.

Run `schema.sql` first and `normalized_schema.sql` second in the same Supabase project's SQL Editor. Rerunning both is supported. Keep row-level security enabled. If a save fails after some table writes, the local browser data remains untouched; the app reports the failure, and another explicit save reconciles the account's normalized rows. Because multi-table writes are not transactional through the browser client, use the latest complete snapshot when recovering from a failed save.

## Validation boundary

The schema foundation was syntax- and rerun-tested on local PostgreSQL 15 with minimal Supabase stand-ins, and ownership policies were checked with two test users. The PWA integration is covered by local tests and a production build. It has not been exercised against the owner's live Supabase project, because that project has not been configured here. Before calling this a production-ready backend, verify Auth, RLS, database writes, deletion, restore, cross-device behavior and private Storage permissions against a real project. The current client does not implement private photo uploads, account deletion, automatic sync, server-side AI, or end-to-end encryption.
