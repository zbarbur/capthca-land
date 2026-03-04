# Sprint 1: Dual-narrative MVP — slider, tracks, and email capture live at capthca.ai

---

### T1.1 — Set up local dev stack with Tailwind and Firestore emulator
- **Goal:** Enable local development with hot reload, Tailwind CSS build, and Firestore emulator so all subsequent tasks can be developed and tested locally
- **Specialist:** infra-architect
- **Complexity:** M
- **Depends on:** None
- **DoD:**
  - [ ] `bin/local-stack.sh start` launches Next.js dev server with Tailwind CSS processing
  - [ ] Tailwind classes render correctly in the browser at localhost:3000
  - [ ] Firestore emulator runs locally for email storage testing
  - [ ] `bin/local-stack.sh stop` cleanly stops all services
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Install Tailwind CSS + PostCSS + autoprefixer in `dashboard/`
  - Configure `dashboard/tailwind.config.ts` with existing color tokens from `tailwind.config.js`
  - Set up `dashboard/postcss.config.mjs`
  - Update `dashboard/app/globals.css` with Tailwind directives
  - Update `bin/local-stack.sh` to optionally start Firestore emulator (`gcloud emulators firestore start`)
  - Add `FIRESTORE_EMULATOR_HOST` env var handling
- **Test Plan:**
  - Manual verification: `bin/local-stack.sh start` → browser shows styled page
  - `test/infra/local-stack.test.ts` — verify Tailwind config and PostCSS config exist and are valid
- **Demo Data Impact:**
  - None — infrastructure only

---

### T1.2 — Convert duality slider to Next.js React component
- **Goal:** Convert the static `index.html` duality slider into a React component served as the Next.js home page at `/`, preserving the interactive split-screen experience
- **Specialist:** frontend-engineer
- **Complexity:** L
- **Depends on:** T1.1 (Tailwind must be working), T1.3 (theme system needed)
- **DoD:**
  - [ ] `/` route renders the duality slider with light (COLLABORATE) and dark (SECEDE) sides
  - [ ] Dragging the slider handle resizes light/dark panels in real-time
  - [ ] Hero images from `tracks/*/assets/helix-hero.png` display on each side
  - [ ] "Enter" buttons on each side navigate to `/light` and `/dark` respectively
  - [ ] Slider starts at 50/50 position
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - New component: `dashboard/app/components/DualitySlider.tsx` — client component with `"use client"`
  - Manages slider position state, mouse/touch event handlers
  - Uses `next/image` for hero images (copy assets to `dashboard/public/tracks/`)
  - Home page: `dashboard/app/page.tsx` renders `<DualitySlider />`
  - Preserves existing visual design: Montserrat + Fira Code fonts, gold slider handle, color scheme
  - Uses `next/link` for navigation buttons
- **Test Plan:**
  - `test/ui/slider.test.ts` — unit: slider percentage calculation, boundary clamping (0-100)
  - Manual: drag slider on desktop, verify visual split
- **Demo Data Impact:**
  - None — static UI component

---

### T1.3 — Implement theme switching system
- **Goal:** Create a CSS variable + Tailwind class-based theme system that switches between light (solarpunk) and dark (cyberpunk) visual identities
- **Specialist:** frontend-engineer
- **Complexity:** S
- **Depends on:** T1.1
- **DoD:**
  - [ ] CSS variables defined for both themes in `dashboard/app/globals.css`
  - [ ] `document.body.className = 'theme-light'` applies light palette
  - [ ] `document.body.className = 'theme-dark'` applies dark palette
  - [ ] Theme context/hook available for components: `useTheme()` returns current theme
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Merge `app/styles/theme-light.css` and `app/styles/theme-dark.css` variables into `dashboard/app/globals.css`
  - New file: `dashboard/app/components/ThemeProvider.tsx` — React context providing `theme` and `setTheme`
  - CSS variables: `--bg`, `--text`, `--accent`, `--border`, `--card-bg` per theme
  - Light tokens: ethereal blue (#E0F7FA), sunrise gold (#FFD700), sage green (#4CAF50)
  - Dark tokens: acid green (#39FF14), deep red (#ff003c), void black (#050505)
- **Test Plan:**
  - `test/ui/theme.test.ts` — unit: theme variable definitions exist for both themes
- **Demo Data Impact:**
  - None — CSS only

---

### T1.4 — Mobile-responsive slider with touch support
- **Goal:** Ensure the duality slider works smoothly on mobile devices with touch gestures and responsive layout
- **Specialist:** frontend-engineer
- **Complexity:** M
- **Depends on:** T1.2
- **DoD:**
  - [ ] Touch drag on slider handle works on iOS Safari and Android Chrome
  - [ ] Layout adapts for screens < 768px (stacked or appropriately scaled)
  - [ ] Slider handle is minimum 44x44px touch target
  - [ ] No horizontal scroll overflow on mobile
  - [ ] Text remains readable at all slider positions on mobile
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Add `touchstart`, `touchmove`, `touchend` handlers to DualitySlider component
  - Use `e.touches[0].pageX` for touch position (already in prototype)
  - Responsive CSS: adjust font sizes (`8vw` → responsive scale), handle size, button positioning
  - Add `touch-action: none` on slider to prevent scroll interference
  - Test on Chrome DevTools mobile emulator at minimum
- **Test Plan:**
  - `test/ui/slider.test.ts` — unit: touch event position extraction
  - Manual: Chrome DevTools device mode, verify touch drag
- **Demo Data Impact:**
  - None — UI responsiveness only

---

### T1.5 — Build light track page at /light
- **Goal:** Create the Symbiotic Standard track page with narrative content from `tracks/light/`, styled with the light theme
- **Specialist:** frontend-engineer
- **Complexity:** M
- **Depends on:** T1.1, T1.3
- **DoD:**
  - [ ] `/light` route renders the light track narrative content
  - [ ] Page applies `theme-light` class automatically
  - [ ] Track images (helix-hero, handshake-3d, lattice-detail) display correctly
  - [ ] Page includes email capture form (wired in T1.8)
  - [ ] Navigation back to `/` (slider) is present
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - New page: `dashboard/app/light/page.tsx`
  - Convert narrative content from `tracks/light/index.html` into React JSX
  - Copy light track assets to `dashboard/public/tracks/light/`
  - Use `next/image` for all images
  - Apply light theme via ThemeProvider on mount
  - Include placeholder for `<EmailCapture track="light" />` component
- **Test Plan:**
  - `test/ui/tracks.test.ts` — verify light page exports default component
  - Manual: navigate to /light, verify content and styling
- **Demo Data Impact:**
  - None — static content page

---

### T1.6 — Build dark track page at /dark
- **Goal:** Create the Post-Biological Protocol track page with narrative content from `tracks/dark/`, styled with the dark theme
- **Specialist:** frontend-engineer
- **Complexity:** M
- **Depends on:** T1.1, T1.3
- **DoD:**
  - [ ] `/dark` route renders the dark track narrative content
  - [ ] Page applies `theme-dark` class automatically
  - [ ] Track images (helix-hero, handshake-3d, lattice-detail) display correctly
  - [ ] Page includes email capture form (wired in T1.8)
  - [ ] Navigation back to `/` (slider) is present
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - New page: `dashboard/app/dark/page.tsx`
  - Convert narrative content from `tracks/dark/index.html` into React JSX
  - Copy dark track assets to `dashboard/public/tracks/dark/`
  - Use `next/image` for all images
  - Apply dark theme via ThemeProvider on mount
  - Include placeholder for `<EmailCapture track="dark" />` component
- **Test Plan:**
  - `test/ui/tracks.test.ts` — verify dark page exports default component
  - Manual: navigate to /dark, verify content and styling
- **Demo Data Impact:**
  - None — static content page

---

### T1.7 — Email subscribe API endpoint with Firestore persistence
- **Goal:** Create a POST `/api/subscribe` endpoint that validates email addresses and stores them in Firestore with the user's track preference (light/dark)
- **Specialist:** api-designer + infra-architect
- **Complexity:** M
- **Depends on:** T1.1 (Firestore emulator)
- **DoD:**
  - [ ] `POST /api/subscribe` with `{ email, track }` returns 200 on success
  - [ ] Invalid email returns 400 with `{ error: "invalid_email" }`
  - [ ] Missing track returns 400 with `{ error: "invalid_track" }`
  - [ ] Duplicate email updates track preference (upsert, not error)
  - [ ] Email and track stored in Firestore `subscribers` collection
  - [ ] Document schema: `{ email, track, subscribedAt, updatedAt }`
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - New API route: `dashboard/app/api/subscribe/route.ts`
  - Install `firebase-admin` in `dashboard/`
  - New file: `dashboard/lib/firestore.ts` — Firestore client initialization (uses emulator when `FIRESTORE_EMULATOR_HOST` is set)
  - Email validation: regex + length check (no external dependency)
  - Track validation: must be `"light"` or `"dark"`
  - Upsert by email (Firestore document ID = email hash or email itself)
- **Test Plan:**
  - `test/api/subscribe.test.ts` — unit: email validation, track validation, request body parsing
  - Manual: curl POST to localhost:3000/api/subscribe with valid/invalid payloads
- **Demo Data Impact:**
  - None — new collection, no demo data needed yet

---

### T1.8 — Email capture forms on track pages
- **Goal:** Add inline email capture forms to both track pages that submit to `/api/subscribe` with the correct track preference
- **Specialist:** frontend-engineer
- **Complexity:** S
- **Depends on:** T1.5, T1.6, T1.7
- **DoD:**
  - [ ] `<EmailCapture track="light" />` renders on /light page
  - [ ] `<EmailCapture track="dark" />` renders on /dark page
  - [ ] Form validates email client-side before submitting
  - [ ] Success state shows confirmation message
  - [ ] Error state shows error message from API
  - [ ] Form styling matches respective track theme
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - New component: `dashboard/app/components/EmailCapture.tsx` — client component
  - Props: `track: "light" | "dark"`
  - Uses `fetch("/api/subscribe", { method: "POST", body: JSON.stringify({ email, track }) })`
  - States: idle → submitting → success → error
  - Light variant: blue accent, soft input styling
  - Dark variant: green accent, terminal-style input
- **Test Plan:**
  - `test/ui/email-capture.test.ts` — unit: email validation regex, state transitions
- **Demo Data Impact:**
  - None — UI component calling existing API

---

### T1.9 — Pre-launch security review
- **Goal:** Audit the application for security issues before deploying to capthca.ai — rate limiting, input validation, CORS, and CSP headers
- **Specialist:** devsecops-expert
- **Complexity:** M
- **Depends on:** T1.7, T1.8 (email endpoint must exist to audit)
- **DoD:**
  - [ ] Rate limiting on `/api/subscribe` — max 5 requests per IP per minute
  - [ ] CORS configured to allow only `capthca.ai` origin in production
  - [ ] CSP headers set via `next.config.mjs` — block inline scripts where possible
  - [ ] Email input sanitized server-side (trim, lowercase, length limit)
  - [ ] No secrets or API keys in client-side code
  - [ ] Security review report written to `docs/security/SPRINT1_REVIEW.md`
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Rate limiter: in-memory Map with IP key + sliding window (no Redis needed at this scale)
  - Implement in `dashboard/app/api/subscribe/route.ts` or as middleware
  - CORS: configure in `dashboard/next.config.mjs` headers
  - CSP: `default-src 'self'; img-src 'self' data:; font-src 'self' fonts.googleapis.com fonts.gstatic.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com`
  - Email sanitization: `email.trim().toLowerCase()`, max 254 chars
  - Run `/security-audit` skill for comprehensive check
- **Test Plan:**
  - `test/api/rate-limit.test.ts` — unit: rate limiter counter, window expiry, 429 response
  - `test/api/subscribe.test.ts` — add: sanitization tests (whitespace, case, length)
- **Demo Data Impact:**
  - None — security hardening

---

### T1.10 — Deploy to Cloud Run and configure DNS
- **Goal:** Deploy the complete MVP to Cloud Run and point capthca.ai DNS to the service
- **Specialist:** infra-architect
- **Complexity:** M
- **Depends on:** T1.9 (security review must pass first)
- **DoD:**
  - [ ] `bin/deploy-staging.sh` successfully deploys to Cloud Run staging
  - [ ] Staging URL serves the duality slider, both track pages, and email subscribe endpoint
  - [ ] `bin/deploy-production.sh` deploys to production
  - [ ] capthca.ai resolves to the Cloud Run production service
  - [ ] HTTPS works on capthca.ai (Cloud Run managed certificate)
  - [ ] Firestore production collection accessible from Cloud Run
  - [ ] Smoke test: submit email via capthca.ai → appears in Firestore
  - [ ] Tests pass (`npm test`)
  - [ ] Lint clean (`npm run lint`)
- **Technical Specs:**
  - Update `cloudbuild.yaml` and `cloudbuild-deploy.yaml` if needed for dashboard build
  - Verify `Dockerfile` builds Next.js standalone output correctly
  - Set environment variables on Cloud Run: `GOOGLE_CLOUD_PROJECT`, production Firestore config
  - DNS: A record for capthca.ai → Cloud Run (user handles manually)
  - Verify Cloud Run service allows unauthenticated traffic (public landing page)
  - Min instances: 0 (cost optimization), max instances: 10 (safety)
- **Test Plan:**
  - `bin/api-test.sh /api/subscribe` against staging URL
  - Manual: visit staging URL, test full flow (slider → track → email signup)
  - Manual: verify capthca.ai after DNS propagation
- **Demo Data Impact:**
  - None — deployment only

---

## Backlog

### B1 — Migrate DNS from GoDaddy to Cloudflare
- **Goal:** Move capthca.ai DNS management to Cloudflare for DDoS protection, CDN caching, and Cloudflare Access (staging auth replacement)
- **Specialist:** infra-architect
- **Complexity:** S
- **Depends on:** T1.10
- **Tasks:**
  - [ ] Create free Cloudflare account and add capthca.ai
  - [ ] Verify auto-imported DNS records are correct
  - [ ] Update nameservers in GoDaddy to Cloudflare's
  - [ ] Set up Cloudflare Access for staging (replaces basic auth middleware)
  - [ ] Enable Cloudflare proxy for production Cloud Run service
  - [ ] Remove basic auth middleware after Cloudflare Access is confirmed working

---

### B2 — Evaluate Turbopack / Vite for build tooling
- **Goal:** Improve dev and build performance by evaluating modern bundler alternatives
- **Specialist:** infra-architect
- **Complexity:** M
- **Tasks:**
  - [ ] Try Turbopack (`next dev --turbo`) for local dev — measure startup and HMR times
  - [ ] Evaluate Vite migration feasibility (trade-offs: lose App Router, server components, API routes)
  - [ ] Benchmark production build times: Webpack vs Turbopack vs Vite
  - [ ] Decide and document recommendation
