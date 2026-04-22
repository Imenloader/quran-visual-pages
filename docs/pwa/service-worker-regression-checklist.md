# Service Worker Regression Checklist (Updates & Migrations)

Use this checklist whenever service worker logic, caching routes, or cache naming conventions change.

## 1) Version-to-version migration safety

- [ ] Confirm cache names are intentionally stable (or intentionally migrated) using `npm run sw:validate`.
- [ ] If cache names changed, include a migration note in the PR describing the old and new keys.
- [ ] Verify `cleanupOutdatedCaches()` remains enabled.
- [ ] Verify cache-expiration limits still match bundle expectations (Quran pages, audio, API, fonts).

## 2) Route registration integrity

- [ ] Confirm every `registerRoute(...)` has an explicit `cacheName`.
- [ ] Confirm every `registerRoute(...)` includes `metricsPlugin(bundle, endpoint, cacheName)`.
- [ ] Confirm route count matches the expected baseline snapshot (`scripts/sw-cache-keys.snapshot.json`).
- [ ] Validate no unintended wildcard route overrides critical endpoints.

## 3) Offline behavior regression checks

- [ ] Cold-start offline load on `/` succeeds.
- [ ] `/juz/:id` opens and in-view page navigation works while offline.
- [ ] `/tafsir` renders previously cached content while offline.
- [ ] Bottom global navigation works between cached routes while offline.
- [ ] Cached recitation audio remains playable when network is offline.

## 4) Observability and telemetry checks

- [ ] Confirm structured logs emit `cache_hit`, `cache_miss`, `network_success`, `network_failure`, and `handler_failure` events.
- [ ] Confirm logs include `bundle`, `endpoint`, `cacheName`, and computed success-rate metrics.
- [ ] Confirm metrics snapshot message contract still works (`GET_SW_METRICS` → `SW_METRICS_SNAPSHOT`).

## 5) Release checklist

- [ ] Run unit tests and SW validation in CI.
- [ ] Run the Playwright offline suite locally or in CI (`npx playwright test e2e/playwright/offline.spec.ts`).
- [ ] Include checklist completion status in the PR description.
