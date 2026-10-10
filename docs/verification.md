# Verification

Verified on 2026-10-11 using Node 24.21.0, pnpm 12.4.1, and Chromium 148.

## Automated checks

- `pnpm peers check`: no peer dependency issues.
- `pnpm typecheck`: strict Vue/TypeScript check passes.
- `pnpm lint`: passes without warnings.
- `pnpm test`: 11 tests pass across nutrition and IndexedDB persistence suites.
- `pnpm build`: production client, Nitro server, prerendered shell and Workbox service worker generated successfully.
- `pnpm test:e2e`: 7 production Chromium tests pass.

The browser suite covers:

1. Hydration/checklist persistence after reload.
2. Meal create/edit/duplicate/delete and changing calorie totals.
3. Food filters, favorites and saved evaluations.
4. Weight/symptom logging, Thai language and persisted dark theme.
5. Network-disabled reload/navigation across dashboard, guide, meals, progress, rules and settings, with saved data retained and no uncaught page errors.
6. All primary pages at 390px without horizontal overflow.
7. Manifest installation eligibility in a normal browser profile: Chromium reports no installation errors.

## PWA details

The root shell is prerendered and included in Workbox's precache. Code, style, local Thai fonts and bundled food/navigation icons are available offline. IndexedDB health records are separate from service worker asset caches. The manifest has 192px, 512px and maskable PNG icons, standalone display and the correct root scope. The app updates through a waiting-worker notification.

Native OS installation prompts and iOS Add to Home Screen are not automated. They require a user device. Offline and manifest eligibility were tested against the production build, not the development server.

## Intentional MVP limits

- Data is local to the browser origin/profile. No cross-device sync or backend.
- One food per editor entry; several entries can belong to the same meal type.
- Sparse dates are gaps in charts, not fabricated zero intake or symptom-free days.
- Food calorie ranges are approximate editorial estimates; the app does not claim quantitative purine measurements.
- Guidance is educational. Symptom/meal relationships do not establish causation.
