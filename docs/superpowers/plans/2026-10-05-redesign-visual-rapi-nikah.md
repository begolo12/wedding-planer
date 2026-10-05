# Redesign Visual Rapi Nikah Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade every product screen to a consistent warm editorial visual system while preserving behavior, routes, data, API, and offline support.

**Architecture:** Refine the existing global CSS and shared shell/components first, then update screen-specific markup only where the current structure prevents the visual hierarchy. Keep data-fetching and mutation logic unchanged. Remove old rules only after selector usage and screenshots prove they are safe to remove.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4, existing CSS tokens, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-05-redesign-visual-rapi-nikah.md`

## Global Constraints

- No new dependency, API, database table, product feature, or route.
- Mobile has no horizontal overflow at 320 px to 390 px.
- Interactive targets remain at least 44 x 44 px.
- Money remains integer rupiah and displays fully, for example `Rp 4.500.000`.
- All data screens retain content, empty, loading, error, and relevant offline states.
- Light and dark themes remain usable with text contrast at least 4.5:1.
- Do not alter uncommitted changes in `src/app/(app)/beranda/page.tsx` or `src/lib/ringkasan.ts`.
- Do not store or add the exposed Stitch API key to the repository.

## Review Focus

- **Legacy selector collision:** shared class changes must not alter unrelated screens. Test with typecheck/build and targeted page screenshots in Task 1.
- **Narrow mobile content:** long labels, rupiah, filters, and action groups must wrap without overflow. Test 390 px and 320 px layouts in each screen task.
- **Dark theme surfaces:** cards, inputs, muted text, and focus states must remain readable. Test both theme attributes in the shared shell task.
- **Offline/error state hierarchy:** state panels must remain actionable and honest. Test shared state rendering and existing offline E2E flow in Task 2.
- **Print/public surfaces:** app navigation and decorative effects must not leak into reports or public links. Test print CSS/build and public route screenshots in Task 7.

## Files and Responsibilities

- Modify `src/app/globals.css`: canonical tokens, base surfaces, controls, panels, responsive rules, and screen visual rules.
- Modify `src/components/nav.tsx`: shared app navigation markup only where needed for hierarchy and labels.
- Modify `src/components/states.tsx`: consistent loading, empty, and error presentation.
- Modify `src/components/theme-toggle.tsx`: accessible visual control without changing theme behavior.
- Modify `src/app/(app)/layout.tsx`: shared shell structure only if required by the visual design.
- Modify `src/app/(auth)/layout.tsx`: auth shell composition only if required.
- Modify `src/app/(app)/beranda/page.tsx`, `rencana/page.tsx`, `anggaran/page.tsx`, `tamu/page.tsx`, `hari-h/page.tsx`: presentation structure only; preserve data and event logic.
- Modify relevant vendor, plan, report, account, public, system, and auth pages only when their existing markup blocks the shared visual system.
- Modify `src/app/cetak.css`: print-only presentation when required.
- Modify `CHANGELOG.md`: release note and reason.
- Add or modify `tests/unit/tampilan.test.ts` only for pure presentation helpers or invariants that can be tested without a browser.
- Add or modify `e2e/tampilan.spec.ts`: screenshot and layout invariants for core screens, using the existing test setup.

### Task 1: Establish and verify the visual foundation

**Files:**
- Modify: `src/app/globals.css`
- Test: `tests/unit/tampilan.test.ts`
- Test: `e2e/tampilan.spec.ts`

**Interfaces:**
- Consumes: existing class names, design tokens, breakpoints, and theme attributes.
- Produces: stable base styles for `.tata-app`, `.bungkus`, `.kepala-halaman`, `.tombol`, `.isian`, panel/card classes, focus states, and responsive overflow rules.

- [ ] **Step 1: Add a unit assertion for the visual contract**
  Assert that the source contract keeps the required breakpoint names/values and token values used by the spec. Keep this test narrow; it must not test CSS rendering.
- [ ] **Step 2: Run `npm test -- tests/unit/tampilan.test.ts` and verify the new assertion fails**
- [ ] **Step 3: Refine `src/app/globals.css`**
  Consolidate base surfaces and control states around the existing tokens. Add only the minimum canonical rules: page atmosphere, readable panel elevation, 16/24/32 px geometry, 44 px controls, visible focus, reduced motion, and `min-width: 0` where grid/flex children can overflow. Keep old selectors temporarily if still referenced.
- [ ] **Step 4: Run `npm run lint`, `npm test`, and `npm run build`**
- [ ] **Step 5: Add core browser checks**
  In `e2e/tampilan.spec.ts`, verify a 390 px viewport has no horizontal overflow and the main navigation has a visible focus target. Use existing auth helpers only; do not create new account logic.
- [ ] **Step 6: Run the focused Playwright test and inspect 390 px/1440 px screenshots**
- [ ] **Step 7: Commit**
  `git add src/app/globals.css tests/unit/tampilan.test.ts e2e/tampilan.spec.ts && git commit -m "refactor: establish visual foundation"`

### Task 2: Refresh shared shell, navigation, states, and theme control

**Files:**
- Modify: `src/components/nav.tsx`
- Modify: `src/components/states.tsx`
- Modify: `src/components/theme-toggle.tsx`
- Modify: `src/app/(app)/layout.tsx`
- Modify: `src/app/(auth)/layout.tsx`
- Modify: `src/app/globals.css`
- Test: `e2e/tampilan.spec.ts`

**Interfaces:**
- Consumes: Task 1 base styles and existing pathname/theme behavior.
- Produces: consistent desktop sidebar, mobile bottom navigation, auth frame, focusable theme button, and state panels.

- [ ] **Step 1: Add browser assertions for shared shell behavior**
  Verify mobile bottom navigation, desktop sidebar, `aria-current`, theme button label, and empty/error panel action labels.
- [ ] **Step 2: Run the focused test and verify failures identify missing visual contract**
- [ ] **Step 3: Update shared markup only where needed**
  Preserve links and labels. Keep navigation count and destinations unchanged. Replace decorative text-only theme glyph presentation only if the control remains accessible and behavior-identical.
- [ ] **Step 4: Style the shell and states**
  Make the shell quieter, give content one clear reading column, align header/actions, and make loading/empty/error panels match final panel geometry. Keep offline banner behavior untouched.
- [ ] **Step 5: Run `npm run lint`, `npm test`, `npm run build`, and focused Playwright**
- [ ] **Step 6: Inspect light/dark screenshots at 390 px and 1440 px**
- [ ] **Step 7: Commit**
  `git add src/components src/app/(app)/layout.tsx src/app/(auth)/layout.tsx src/app/globals.css e2e/tampilan.spec.ts && git commit -m "refactor: refresh application shell and states"`

### Task 3: Refresh auth screens and Beranda

**Files:**
- Modify: `src/app/(auth)/masuk/page.tsx`
- Modify: `src/app/(auth)/daftar/page.tsx`
- Modify: `src/app/(app)/beranda/page.tsx`
- Modify: `src/app/globals.css`
- Test: `e2e/tampilan.spec.ts`

**Interfaces:**
- Consumes: Task 2 shell/state styles and existing auth/overview data contracts.
- Produces: clear auth form hierarchy and a Beranda hero/summary/task composition responsive to mobile and desktop.

- [ ] **Step 1: Add screenshot/layout checks for `/masuk`, `/daftar`, and `/beranda`**
  Cover form labels/actions, hero heading, primary action count, and no overflow at 390 px.
- [ ] **Step 2: Run focused checks and verify baseline screenshots**
- [ ] **Step 3: Simplify auth/Beranda presentation markup**
  Preserve all handlers, links, copy, loading, and error behavior. Remove only redundant visual wrappers that prevent hierarchy.
- [ ] **Step 4: Apply visual hierarchy**
  Auth: form first on mobile, hero/form split on desktop. Beranda: day-H hero first, useful metrics second, nearest tasks third, supporting data after. Avoid adding sample numbers or dead actions.
- [ ] **Step 5: Run existing auth/overview tests plus focused Playwright and build**
- [ ] **Step 6: Inspect light/dark screenshots at both target widths**
- [ ] **Step 7: Commit**
  `git add src/app/(auth) src/app/(app)/beranda/page.tsx src/app/globals.css e2e/tampilan.spec.ts && git commit -m "refactor: improve auth and home screens"`

### Task 4: Refresh planning, budget, vendor, and payment screens

**Files:**
- Modify: `src/app/(app)/rencana/page.tsx`
- Modify: `src/app/(app)/rencana/plan/page.tsx`
- Modify: `src/app/(app)/rencana/tanggal/page.tsx`
- Modify: `src/app/(app)/rencana/vendor/page.tsx`
- Modify: `src/app/(app)/rencana/vendor/[vendorId]/page.tsx`
- Modify: `src/app/(app)/anggaran/page.tsx`
- Modify: `src/components/tab-rencana.tsx`
- Modify: `src/components/task-item.tsx`
- Modify: `src/components/budget-bar.tsx`
- Modify: `src/app/globals.css`
- Test: `e2e/tampilan.spec.ts`

**Interfaces:**
- Consumes: shared shell, panel, control, and state styles.
- Produces: readable task timeline, date/vendor details, budget summary, progress bars, and payment rows without changing mutations.

- [ ] **Step 1: Add layout checks for task, budget, vendor, and detail routes**
  Assert primary heading/action presence, 44 px task controls, no mobile overflow, and visible rupiah values when fixture data exists.
- [ ] **Step 2: Run focused checks and capture baseline**
- [ ] **Step 3: Update task/planning markup only for hierarchy**
  Keep URL filters, API calls, dialogs, reorder behavior, and offline restrictions unchanged.
- [ ] **Step 4: Update budget/vendor presentation**
  Put total/paid/remaining before lists, use thin progress bars, and keep over-budget labels explicit. Do not add charts or invent data.
- [ ] **Step 5: Run unit, existing integration, build, and focused E2E tests**
- [ ] **Step 6: Inspect mobile/desktop and dark-theme screenshots**
- [ ] **Step 7: Commit**
  `git add src/app/(app)/rencana src/app/(app)/anggaran/page.tsx src/components src/app/globals.css e2e/tampilan.spec.ts && git commit -m "refactor: improve planning and budget screens"`

### Task 5: Refresh guest and import screens

**Files:**
- Modify: `src/app/(app)/tamu/page.tsx`
- Modify: `src/app/(app)/tamu/impor/page.tsx`
- Modify: `src/app/globals.css`
- Test: `e2e/tampilan.spec.ts`

**Interfaces:**
- Consumes: existing guest summary/filter/import behavior and shared controls.
- Produces: compact guest summary, reachable search/filter area, readable responsive rows, and clear import preview flow.

- [ ] **Step 1: Add layout checks for `/tamu` and `/tamu/impor`**
  Assert summary labels, search/filter controls, import preview action, 44 px row actions, and no overflow at 390 px.
- [ ] **Step 2: Run focused checks and verify baseline**
- [ ] **Step 3: Reorder presentation markup**
  Keep guest calculations, API requests, confirmation dialogs, and status semantics unchanged.
- [ ] **Step 4: Style summary, filters, rows, and preview**
  Use labels/icons alongside status color. Collapse row metadata vertically on narrow screens.
- [ ] **Step 5: Run existing guest/import tests, build, and focused E2E**
- [ ] **Step 6: Inspect screenshots in light/dark themes**
- [ ] **Step 7: Commit**
  `git add src/app/(app)/tamu src/app/globals.css e2e/tampilan.spec.ts && git commit -m "refactor: improve guest management screens"`

### Task 6: Refresh Hari-H, info, seragam, laporan, and sharing screens

**Files:**
- Modify: `src/app/(app)/hari-h/page.tsx`
- Modify: `src/app/(app)/rencana/info/page.tsx`
- Modify: `src/app/(app)/rencana/seragam/page.tsx`
- Modify: `src/app/(app)/laporan/page.tsx`
- Modify: `src/app/(app)/laporan/bagikan/page.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/app/cetak.css`
- Test: `e2e/tampilan.spec.ts`

**Interfaces:**
- Consumes: existing rundown offline behavior, report calculations, WhatsApp contract, and print CSS.
- Produces: readable itinerary, family briefing, attire, editorial report, share action, and clean print surface.

- [ ] **Step 1: Add layout checks for Hari-H, laporan, and bagikan**
  Assert time-first rundown, luring banner when applicable, report actions, and no app navigation in print mode.
- [ ] **Step 2: Run focused checks and existing report/offline tests**
- [ ] **Step 3: Update presentation structure**
  Preserve event editing, font-size controls, report source values, share options, and print action.
- [ ] **Step 4: Apply itinerary/editorial styling**
  Use the vertical itinerary cue, keep controls at 44 px, and prevent decorative app shell from leaking to print.
- [ ] **Step 5: Run `npm run test`, `npm run build`, report integration tests, and focused E2E**
- [ ] **Step 6: Inspect mobile, desktop, dark, offline, and print screenshots**
- [ ] **Step 7: Commit**
  `git add src/app/(app)/hari-h src/app/(app)/rencana/info src/app/(app)/rencana/seragam src/app/(app)/laporan src/app/globals.css src/app/cetak.css e2e/tampilan.spec.ts && git commit -m "refactor: improve day-of and report screens"`

### Task 7: Refresh account, public, system screens and remove verified CSS dead code

**Files:**
- Modify: `src/app/(app)/akun/page.tsx`
- Modify: `src/app/aplikasi/page.tsx`
- Modify: `src/app/kebijakan/page.tsx`
- Modify: `src/app/luring/page.tsx`
- Modify: `src/app/bagikan/[token]/page.tsx`
- Modify: `src/app/l/[token]/page.tsx`
- Modify: `src/app/error.tsx`
- Modify: `src/app/global-error.tsx`
- Modify: `src/app/not-found.tsx`
- Modify: `src/app/globals.css`
- Modify: `CHANGELOG.md`
- Test: `e2e/tampilan.spec.ts`

**Interfaces:**
- Consumes: all shared visual primitives and existing public/system behavior.
- Produces: coherent account, policy, offline, public-share, error, and not-found surfaces, plus documented release change.

- [ ] **Step 1: Add route checks for system/public screens**
  Verify each route has a readable heading, useful action where applicable, no dead button, and no mobile overflow.
- [ ] **Step 2: Run focused checks and inspect current selectors**
- [ ] **Step 3: Apply shared visual treatment**
  Keep account destructive actions explicit, public pages read-only, and offline copy honest.
- [ ] **Step 4: Search CSS selectors before deletion**
  Remove only rules with no JSX/TS references and no print dependency. Do not mass-delete the stylesheet.
- [ ] **Step 5: Add one `CHANGELOG.md` entry**
  Record the visual system refresh and reason: consistent hierarchy and improved mobile/desktop readability.
- [ ] **Step 6: Run full verification**
  `npm run lint`, `npm run test`, `npm run build`, and `npm run test:e2e` with the required test database/environment.
- [ ] **Step 7: Inspect final screenshot matrix**
  Core routes at 390 px and 1440 px in light/dark themes; inspect offline and print where applicable.
- [ ] **Step 8: Commit**
  `git add src/app src/components src/app/globals.css src/app/cetak.css CHANGELOG.md tests e2e && git commit -m "refactor: complete visual redesign"`

## Final Review

- [ ] Compare every task against `docs/superpowers/specs/2026-10-05-redesign-visual-rapi-nikah.md`.
- [ ] Confirm no API, database, offline queue, or uncommitted user changes were altered.
- [ ] Confirm no exposed Stitch key was added to the repo.
- [ ] Confirm build, unit, integration, and relevant E2E output before claiming completion.
