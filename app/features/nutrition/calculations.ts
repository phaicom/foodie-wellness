import type {
  MealEntry,
  UserProfile,
  NutritionSettings,
  WeightEntry,
} from '../storage/models'
export const activityMultipliers = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
}
export function bmr(
  p: Pick<UserProfile, 'weight' | 'height' | 'age' | 'sex'>,
): number | null {
  if (!p.sex) return null
  return Math.round(
    10 * p.weight + 6.25 * p.height - 5 * p.age + (p.sex === 'male' ? 5 : -161),
  )
}
export function tdee(p: UserProfile) {
  const value = bmr(p)
  return value === null
    ? null
    : Math.round(value * activityMultipliers[p.activity])
}
export function calorieTarget(p: UserProfile, settings: NutritionSettings) {
  const estimate = tdee(p)
  return (
    settings.manualTarget ??
    (estimate === null
      ? null
      : Math.max(p.sex === 'male' ? 1500 : 1200, estimate - settings.deficit))
  )
}
export function servingCalories(calories: number, servings: number) {
  return Math.round(calories * servings)
}
export function mealCalories(meal: MealEntry) {
  return meal.foods.reduce((sum, food) => sum + food.calories, 0)
}
export function dailyCalories(meals: MealEntry[], date: string) {
  return meals
    .filter((m) => m.date === date)
    .reduce((sum, meal) => sum + mealCalories(meal), 0)
}
export function movingAverage(entries: WeightEntry[], date: string) {
  const end = new Date(`${date}T12:00:00`)
  const start = new Date(end)
  start.setDate(start.getDate() - 6)
  const values = entries.filter(
    (e) =>
      new Date(`${e.date}T12:00:00`) >= start &&
      new Date(`${e.date}T12:00:00`) <= end,
  )
  return values.length
    ? Math.round(
        (values.reduce((s, e) => s + e.weight, 0) / values.length) * 10,
      ) / 10
    : null
}
