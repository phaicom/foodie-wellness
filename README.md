# Foodie

A mobile-first Nuxt 4 personal nutrition PWA. Warm sage styling, Thai/English UI, a Thai-first food guide, thoughtful meal decisions, and gradual progress. All personal data stays in your browser.

## Run

Node 22.13+ (tested with Node 24), pnpm 12.

```sh
pnpm install
pnpm dev
```

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm preview
```

Open the printed local URL. `pnpm generate` produces a static export in `.output/public` suitable for static hosting with SPA fallback. The app deliberately uses client rendering: IndexedDB is the source of truth and there is no backend.

## What works

- Dashboard: calorie ring, per-meal totals, water quick-add, seven daily habits, and quick logging.
- Guide: 18 Thai/international foods, eight combinable filters, favorites, personal notes, preparation guidance, and restaurant calorie ranges.
- Decision checklist: seven questions, explanatory feedback, saved evaluations.
- Meals: food search, fractional servings, custom foods and optional macros, favorites, date history, edit/delete/duplicate, copy previous day.
- Progress: weights, seven-day averages, weekly average change, calorie/water/symptom charts, associated meals and possible relationships.
- Settings: formula inputs, moderate deficit, calorie override, weight/water goals, reflux triggers, Thai/English, light/dark/system, JSON backup merge, confirmed reset.
- PWA: bundled Lucide icons, manifest, normal/maskable icons, precached application assets, update prompt and installation affordance.

No fictional meal or weight history is inserted. Initial targets match the brief. The formula's sex input is intentionally unset. To calculate a target, select that input and disable the manual target. BMR/TDEE are estimates. Formula-derived targets apply conservative floors; the interface caps the deficit at 500 kcal. These guardrails are not personalized medical advice.

Food calories and restaurant ranges are approximate editorial estimates, not laboratory nutrition values. No numerical purine data is claimed. Guidance is informed by [NIDDK GERD diet guidance](https://www.niddk.nih.gov/health-information/digestive-diseases/acid-reflux-ger-gerd-adults/eating-diet-nutrition) and [NHS gout and diet guidance](https://www.wsh.nhs.uk/CMS-Documents/Patient-leaflets/NutritionandDieteticService/6753-1-Gout-and-diet.pdf).

## Browser tests

Build first, then install Chromium once and run the production checks:

```sh
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

If using an existing Chrome executable, set `FOODIE_CHROME=/absolute/path/to/chrome`. The suite covers logging, persistence, favorites, checklist evaluations, Thai/theme settings, mobile overflow and every primary route offline.

## Offline / installation

Service workers are disabled during `pnpm dev`. Test with `pnpm build && pnpm preview` on localhost (or HTTPS when hosted). Load once online, wait for the service worker to activate, then reload offline. Navigate to every route and confirm saved records still appear. On Chromium use the browser install option; on iOS Safari use Share > Add to Home Screen. Settings offers an install button when the platform provides its install event. When a new worker is waiting, an update notification offers a reload.

Personal records are in IndexedDB, never in the service worker cache. Browser storage is device/profile/origin specific and can be removed by the browser. Export a backup before clearing storage or moving devices. Backups contain personal health records and should be kept private. Imports validate the entire payload before a single transaction, merge records by stable ID and natural unique keys, and retain newer timestamps. The singleton profile/settings are restored from the backup.

See [architecture and models](docs/architecture.md) and [verification notes](docs/verification.md).
