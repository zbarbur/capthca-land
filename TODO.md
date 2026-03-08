# TODO — CAPTHCA land

> Sprint 7: Admin foundation, content quality, and polish
> Branch: `sprint7/main`

---

### T7.1 — IAP + analytics subdomain setup
- **Goal:** Set up Google IAP on Cloud Run and `analytics.capthca.ai` DNS so the admin panel is protected by Google account login, with role-based access (read-only vs read/write) managed via a user list
- **Specialist:** devops-engineer
- **Complexity:** S
- **Depends on:** None
- **DoD:**
  - [ ] Google IAP enabled on Cloud Run service with OAuth consent screen
  - [ ] `analytics.capthca.ai` DNS record points to Cloud Run
  - [ ] Middleware detects `analytics.capthca.ai` host and routes to admin layout
  - [ ] Unauthenticated requests to `analytics.capthca.ai` are blocked by IAP (302 → Google login)
  - [ ] IAP-authenticated user email available via `X-Goog-Authenticated-User-Email` header
  - [ ] Admin user list with roles (read, read/write) stored in env var or config
  - [ ] Read-only users can view dashboard, subscribers, logs but cannot delete
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Enable IAP on Cloud Run: `gcloud iap web enable --resource-type=cloud-run --service=capthca-land-prod`
  - Add IAP OAuth consent screen + IAP-secured Web App User role for allowed Google accounts
  - DNS: add `analytics` CNAME record pointing to Cloud Run domain mapping
  - Middleware (`middleware.ts`): check `request.headers.get("host")` for `analytics.capthca.ai`, set admin context
  - Admin role config: env var `CAPTHCA_LAND_ADMIN_USERS` — JSON map of `{email: "read"|"write"}`
  - Helper: `lib/admin-auth.ts` — parse IAP header, resolve role from config, export `getAdminUser(request)`
  - Cloud Run services: `capthca-land-prod`, `capthca-land-staging` (service account: `502565235210-compute@developer.gserviceaccount.com`)
- **Test Plan:**
  - `test/middleware/admin-routing.test.ts` — host detection, admin context flag, role resolution
  - ~6 tests
- **Demo Data Impact:**
  - None

---

### T7.2 — Admin dashboard scaffold + subscriber stats
- **Goal:** Build the admin panel layout with subscriber statistics (counts, track distribution, recent signups) and a subscriber management table with delete capability for read/write users
- **Specialist:** frontend-developer + node-architect
- **Complexity:** M
- **Depends on:** T7.1
- **DoD:**
  - [ ] Admin layout at `analytics.capthca.ai` with sidebar nav (Dashboard, Subscribers, Logs)
  - [ ] Dashboard view: total subscriber count, light vs dark breakdown (chart), signups last 7/30 days
  - [ ] Subscriber table: paginated list with email, track, signup date, masked IP, user agent
  - [ ] Search: filter subscribers by email or track
  - [ ] Delete action (write role only): remove individual subscriber records with confirmation
  - [ ] Bulk action (write role only): "Remove test records" (filter by test email patterns)
  - [ ] Read-only users see data but delete/bulk actions are hidden
  - [ ] All data loads server-side from Firestore (no client-side Firestore SDK)
  - [ ] Responsive on mobile
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - New route group: `dashboard/app/(admin)/` with admin layout (sidebar nav, dark minimal theme)
  - `dashboard/app/(admin)/layout.tsx` — server component, verifies admin role via `getAdminUser()`, renders sidebar
  - `dashboard/app/(admin)/dashboard/page.tsx` — server component, queries Firestore `{prefix}_subscribers`
  - `dashboard/app/(admin)/subscribers/page.tsx` — server component with search params for filter/pagination
  - `dashboard/app/api/admin/subscribers/route.ts` — DELETE endpoint, checks write role from IAP header
  - Use Recharts for track distribution chart (already a dependency)
  - IP masking: replace last octet with `xxx` for display (privacy)
  - Pagination: Firestore `startAfter` cursor-based, 25 per page
- **Test Plan:**
  - `test/admin/dashboard.test.ts` — layout exists, chart components, Firestore queries
  - `test/admin/subscribers.test.ts` — table structure, delete endpoint validates write role
  - ~10 tests
- **Demo Data Impact:**
  - Update `bin/gen-demo.sh` to seed subscriber docs with varied dates and track preferences

---

### T7.3 — App log and error tracking view
- **Goal:** Add a log viewer to the admin panel that surfaces recent app errors and key events from Cloud Logging, providing production health visibility without leaving the admin panel
- **Specialist:** frontend-developer + devops-engineer
- **Complexity:** M
- **Depends on:** T7.1
- **DoD:**
  - [ ] Logs page at `analytics.capthca.ai/logs` shows recent structured log entries
  - [ ] Filterable by severity (INFO, WARNING, ERROR)
  - [ ] Filterable by event type (analytics, subscribe, health, error)
  - [ ] Error entries highlighted with expandable stack trace display
  - [ ] Manual refresh button to reload entries
  - [ ] Shows last 100 entries by default with "load more" pagination
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - `dashboard/app/(admin)/logs/page.tsx` — server component with client-side filter controls
  - `dashboard/app/api/admin/logs/route.ts` — queries Cloud Logging API via `@google-cloud/logging`
  - Add `@google-cloud/logging` dependency to `dashboard/package.json`
  - Query filter: `resource.type="cloud_run_revision" AND resource.labels.service_name="capthca-land-prod"`
  - Parse structured JSON entries back into typed objects for display
  - Severity color coding: INFO=gray, WARNING=amber, ERROR=red
  - Service account `502565235210-compute@developer.gserviceaccount.com` already has `roles/editor` (includes logging read)
  - Client component for filter controls; server action or API route for data fetching
- **Test Plan:**
  - `test/admin/logs.test.ts` — page exists, filter controls, severity rendering, API route validation
  - ~6 tests
- **Demo Data Impact:**
  - None — reads from Cloud Logging

---

### T7.4 — Content system regression tests
- **Goal:** Add integration tests that verify the full content render pipeline (markdown → HTML → diagrams) to catch regressions in the content system
- **Specialist:** test-engineer
- **Complexity:** S
- **Depends on:** None
- **DoD:**
  - [ ] Tests verify `renderMarkdown()` handles all content markers: `{highlight}`, `{table}`, `{alert}`, `{quote}`, `{diagram:xxx}`
  - [ ] Tests verify `getLandingSections()` returns correct section count and frontmatter for both tracks
  - [ ] Tests verify `getPageContent()` renders inner page markdown with images, tables, and diagrams
  - [ ] Tests verify malformed markdown doesn't crash the pipeline (graceful degradation)
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - New file: `test/lib/content-pipeline.test.ts` — end-to-end content rendering tests
  - Test each marker type with sample markdown input → verify expected HTML output
  - Test with actual content files (not just fixtures) to catch real regressions
  - Test edge cases: empty content body, missing frontmatter fields, invalid marker syntax
- **Test Plan:**
  - `test/lib/content-pipeline.test.ts` — ~12-15 tests covering markers, sections, error handling
- **Demo Data Impact:**
  - None — no new fields or endpoints

---

### T7.5 — Whitepaper diagram polish
- **Goal:** Refine the 13 whitepaper diagram components for better spacing, mobile readability, and subtle entrance animations
- **Specialist:** frontend-developer
- **Complexity:** M
- **Depends on:** None
- **DoD:**
  - [ ] All 13 diagram components render without horizontal overflow at 375px viewport
  - [ ] Consistent spacing and padding across all diagrams (standardized wrapper)
  - [ ] Text labels readable at mobile sizes (minimum 12px effective font size)
  - [ ] Recharts charts have responsive container sizing (no fixed pixel widths)
  - [ ] At least 3 diagrams have subtle entrance animations (fade-in or draw-in on scroll)
  - [ ] Visual review on both light and dark tracks confirms theme consistency
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Audit all 13 components in `dashboard/components/diagrams/`
  - Create shared `DiagramWrapper` component with consistent padding, overflow handling, optional scroll animation
  - Fix any Recharts `ResponsiveContainer` issues — ensure charts fill available width
  - Add CSS animation: `@keyframes diagram-fade-in` triggered via IntersectionObserver or existing ScrollReveal
  - Test on 375px (iPhone SE), 390px (iPhone 14), and 768px (tablet) viewports
- **Test Plan:**
  - `test/components/diagram-polish.test.ts` — wrapper exists, all diagrams use it, responsive classes present
  - ~8 tests
- **Demo Data Impact:**
  - None — no new fields or endpoints

---

### T7.6 — Source ambient audio files
- **Goal:** Find or generate loopable ambient audio for both tracks and wire them into the existing AmbientAudio component, replacing placeholder MP3 paths
- **Specialist:** frontend-developer
- **Complexity:** S
- **Depends on:** None
- **DoD:**
  - [ ] Light track audio at `dashboard/public/tracks/light/assets/ambient-light.mp3` (real audio, not placeholder)
  - [ ] Dark track audio at `dashboard/public/tracks/dark/assets/ambient-dark.mp3` (real audio, not placeholder)
  - [ ] Each file is ≤ 500KB compressed
  - [ ] Audio loops seamlessly (no audible click/gap at loop point)
  - [ ] Audio plays correctly via the AmbientAudio toggle on both tracks
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Source royalty-free ambient audio (freesound.org, pixabay audio) or generate with AI tools
  - Light track: warm, organic, meditative — natural/synth pad textures
  - Dark track: industrial, synthetic, tense — low hum, digital artifacts, subtle glitch textures
  - Compress with ffmpeg: `ffmpeg -i input.wav -codec:a libmp3lame -b:a 64k -ar 22050 output.mp3`
  - Verify loop point: trim to exact beat/phrase boundary for seamless looping
- **Test Plan:**
  - `test/components/ambient-audio-files.test.ts` — files exist, not empty, under 500KB
  - ~4 tests
- **Demo Data Impact:**
  - None — no new fields or endpoints
