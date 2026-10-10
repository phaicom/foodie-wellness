# Architecture

Nuxt 4 `app/` layout, Vue 3 Composition API SFCs, strict TypeScript. Nuxt UI 4 provides accessible inputs, dialogs, buttons, application provider and locally bundled Lucide icons. Tailwind 4 loads the design tokens alongside the responsive layout CSS. Pinia owns shared state; Dexie owns persistence. VueUse provides connectivity and date-refresh signals. Nuxt i18n loads English/Thai messages; longer feature copy uses locale-aware helpers. Chart.js/vue-chartjs render responsive, reduced-motion-aware trends.

## Boundaries

- `features/storage/models.ts`: Zod schemas, inferred types, UUID/timestamp helpers, defaults.
- `features/storage/database.ts`: client-only lazy database, versions, seed, atomic import/export.
- `features/foods/seed.ts`: editorial food catalog and broad suitability guidance.
- `features/nutrition/calculations.ts`: pure BMR, TDEE, calorie and moving-average functions.
- `stores/wellness.ts`: initialization, current collections, derived totals, persistence actions, surfaced errors.
- `components/`: reusable page header, log dialogs, meal editor, food checklist, ring and chart.
- `pages/`: dashboard, guide, meals, progress, settings, educational rulebook.

`ssr: false` is intentional for this private browser-local application. Database construction occurs only when IndexedDB is available. The manifest/worker cache only application assets. There are no trackers, authentication credentials, server health records or external icon requests.

## Models (schema version 2)

All persistent entities have a stable UUID `id` (the seeded catalog uses deterministic UUIDs and a separate lookup slug), `createdAt` and `updatedAt` in ISO UTC format. Dates use local calendar `YYYY-MM-DD`; occurrence times use local `HH:mm`.

| Model             | Purpose / notable fields                                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| UserProfile       | Age, height, current/start/target weight, required-for-formula sex input, activity, locale, theme                                                            |
| NutritionSettings | Manual target or estimated target, deficit, hydration goal                                                                                                   |
| Food              | Thai/English names, category, approximate calories/range, serving, suitability, filter tags, GERD/purine/weight/preparation guidance, notes, optional macros |
| FoodServing       | Embedded portion label, amount, unit                                                                                                                         |
| MealEntry         | Date, time, breakfast/lunch/dinner/snack, embedded foods, notes                                                                                              |
| MealFood          | Food ID, name snapshot, servings, total estimated calories/range snapshot                                                                                    |
| FavoriteFood      | Unique food ID                                                                                                                                               |
| FoodEvaluation    | Date, meal name, seven booleans, notes                                                                                                                       |
| DailyChecklist    | Unique date, completed item indexes                                                                                                                          |
| WeightEntry       | Unique date, kg                                                                                                                                              |
| WaterEntry        | Date, ml per event                                                                                                                                           |
| GerdSymptomEntry  | Date/time, symptom type, 0-10 severity, optional meal link, notes, possible triggers                                                                         |
| UserFoodTrigger   | Unique name                                                                                                                                                  |

v1 establishes tables and natural-key indexes. v2 adds multi-entry food tag and compound meal date/type indexes, backfills missing tags/timestamps and meal notes. Tests exercise opening an actual v1 database and upgrading it.

## Imports

A Zod-validated versioned envelope holds all tables. Invalid dates, enum values, negative quantities, oversized collections and missing fields reject the whole import before mutation. Transactions avoid partial restores. ID-based collections use updated timestamps; unique date/food/name collections also reconcile natural keys. Repeated imports are duplicate-safe. Profile/settings are singletons and restored from the imported file.

## Product limits

Calculations are estimates. Meal editor adds one food per entry; several entries can share a meal type. Food records support embedded arrays for future multi-food composition. Missing tracking days stay null in charts. Symptom links report co-occurrence, not causation. There are no push notifications, cloud sync or automatic diagnoses.
