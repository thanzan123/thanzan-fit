# Normalized Supabase schema foundation

`normalized_schema.sql` is an additive database design for the future full-platform backend. It leaves the current `fitness_records` table untouched and adds relational tables for editable profiles, weights and measurements, workout plans/sessions/exercises/sets, foods and meal logs, nutrition targets, water, activity, sleep/recovery, AI conversation messages, reports and preferences. User-owned rows have authenticated-user RLS policies; cross-user child references use composite ownership foreign keys. It also creates a private body-photo bucket with per-user folder policies.

## Important: not connected to the current app

The published PWA still uses local browser storage and, when configured, the separate manual whole-record copy in `fitness_records`. It does not read or write the tables or storage bucket in this script. Running this schema alone does not enable cloud sync, sign-in in the app, photo uploads, or AI. Do not treat it as a completed backend or upload real data to it until the application has been migrated and tested against it.

The SQL is additive and can be run after the existing `schema.sql` in a Supabase project's SQL Editor when preparing that backend. It uses Supabase's `auth.users`, `auth.uid()`, and Storage schema, so a stock PostgreSQL database without those Supabase objects is not its deployment target. It was syntax- and rerun-tested on local PostgreSQL 15 using minimal stand-ins for those Supabase objects; ownership policies were checked with two test users. This does not replace a live Supabase deployment/security review.

## Next integration work

1. Connect the PWA's data layer to these tables and define a tested migration from local exports/`fitness_records`; retain explicit export and recovery paths.
2. Configure a user-owned Supabase project and test Auth, RLS, database writes, and private Storage permissions there. Never put service-role credentials in the browser.
3. Add a server-side AI endpoint only after selecting/configuring a secure provider; keep API secrets off the static GitHub Pages frontend and ground responses in retrieved user records.
4. Verify account deletion covers database rows and stored photos, plus restore, access controls, and cross-device flows before calling the platform production-ready.
