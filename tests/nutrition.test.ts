import { describe, it, expect } from 'vitest'
import {
  bmr,
  tdee,
  calorieTarget,
  dailyCalories,
  servingCalories,
  movingAverage,
} from '../app/features/nutrition/calculations'
import {
  defaultProfile,
  defaultNutrition,
  stamp,
  type MealEntry,
} from '../app/features/storage/models'
describe('nutrition estimates', () => {
  it('requires a formula input', () => {
    const p = defaultProfile()
    expect(bmr(p)).toBeNull()
    expect(tdee(p)).toBeNull()
    expect(
      calorieTarget(p, { ...defaultNutrition(), manualTarget: null }),
    ).toBeNull()
  })
  it('uses both Mifflin-St Jeor constants and activity factors', () => {
    const p = { ...defaultProfile(), sex: 'male' as const }
    expect(bmr(p)).toBe(1689)
    expect(bmr({ ...p, sex: 'female' })).toBe(1523)
    expect(tdee(p)).toBe(2027)
    expect(
      calorieTarget(p, { ...defaultNutrition(), manualTarget: null }),
    ).toBe(1727)
  })
  it('respects manual target and conservative floors', () => {
    const p = { ...defaultProfile(), sex: 'male' as const, weight: 40 }
    expect(calorieTarget(p, defaultNutrition())).toBe(1750)
    expect(
      calorieTarget(p, {
        ...defaultNutrition(),
        manualTarget: null,
        deficit: 500,
      }),
    ).toBe(1500)
  })
  it('calculates fractional servings and date-specific totals', () => {
    expect(servingCalories(320, 1.5)).toBe(480)
    const meal: MealEntry = {
      ...stamp(),
      date: '2026-10-11',
      time: '12:00',
      type: 'lunch',
      notes: '',
      foods: [
        { foodId: 'a', name: 'Rice', servings: 1.5, calories: 480 },
        { foodId: 'b', name: 'Fruit', servings: 1, calories: 65 },
      ],
    }
    expect(dailyCalories([meal], '2026-10-11')).toBe(545)
    expect(dailyCalories([meal], '2026-10-10')).toBe(0)
  })
  it('averages only measured weights within seven calendar days', () => {
    const entries = [
      { ...stamp(), date: '2026-10-01', weight: 90 },
      { ...stamp(), date: '2026-10-05', weight: 78 },
      { ...stamp(), date: '2026-10-11', weight: 77 },
    ]
    expect(movingAverage(entries, '2026-10-11')).toBe(77.5)
    expect(movingAverage(entries, '2026-09-01')).toBeNull()
  })
})
