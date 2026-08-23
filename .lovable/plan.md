# Multi-Year Excellentia Fest System (2026 Current + 2025 Archive)

Turn the site from a single-year 2025 app into a year-based festival platform, with 2026 as the live festival and 2025 preserved as a browsable archive. Nothing gets deleted.

## 1. Festival years in the database

New `festivals` table: year, title, tagline, status (current / archived / upcoming), `is_current` flag.
Seed with **2025 (archived)** and **2026 (current)**.

Year-specific tables get a `festival_id` column: results, gallery, news (announcements), videos, teams, students, reports, result_requests, settings.

Backfill: every existing row is stamped **2025**, so all current results, photos, videos, winners, points and announcements become the 2025 archive rather than being removed.

Reusable structures:
- `programs` (competitions/categories) stay shared across years — one list, editable, no re-creation needed. Each program also records which years it ran in, so "100m Boys" is reused for 2026 by editing, not recreating.
- Teams/Houses and Students get a per-year row so points reset cleanly for 2026, created by a one-click **"Carry over from 2025"** action in admin (names and teams copied, points zeroed). Admin can then edit any of them.

## 2. What users see

- Every public page (Home, Results, Gallery, News, Videos) reads only the **current festival (2026)** and starts empty until 2026 data is added.
- New nav item **"Past Excellentia Fests"** → list of archived years → **Excellentia Fest 2025** with its own Results, Gallery, Videos, News and final team standings, read-only, exactly as they are today.
- Archive routes: `/past-fests`, `/fest/2025`, `/fest/2025/results`, `/fest/2025/gallery`, `/fest/2025/videos`, `/fest/2025/news`.
- Site title, footer and hero switch to "Excellentia Arts Fiesta 2026".

## 3. Admin panel

New **Festivals** tab:
- Create a festival year, set title/tagline, mark one as current, archive a year.
- A festival switcher in the dashboard header: everything the admin adds or edits applies to the selected year (defaults to the current festival).
- "Carry over teams & students from previous year" button.

All existing admin sections (Results, Programs, News, Gallery, Videos, Students, Settings, Notifications, AI Verify) become festival-scoped through that switcher, so admins can add 2026 data or correct 2025 archive data without any code change. Students management gains full add/edit/delete with team and grade fields; Programs keeps shared editing.

Everything already manageable stays manageable — competitions, students, results, winners, photos, videos, announcements, rankings, houses, categories, archiving — all from the panel.

## 4. Technical notes

- One migration: `festivals` table with GRANTs and RLS (public read, admin write), `festival_id` columns with FKs and indexes, backfill to 2025, `NOT NULL` + default to the current festival afterwards.
- RLS on new/changed tables mirrors current rules (public SELECT, admin ALL via `has_role`).
- A `useFestival` hook + context provides the active public festival; admin uses a separate selected-festival state.
- Point-sync triggers on results are scoped to the same festival so 2026 results never touch 2025 team points.
- Existing storage buckets are reused; no images are moved or deleted.
