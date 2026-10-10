import { z } from 'zod'
const base = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((v) => {
    const d = new Date(v)
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v
  }, 'Invalid date')
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)
const positive = z.number().positive().finite()
export const profileSchema = base.extend({
  name: z.string().min(1).max(80),
  age: z.number().int().min(18).max(100),
  height: positive.min(100).max(250),
  weight: positive.min(30).max(300),
  startingWeight: positive.min(30).max(300),
  targetWeight: positive.min(30).max(300),
  sex: z.enum(['female', 'male']).nullable(),
  activity: z.enum(['sedentary', 'light', 'moderate', 'active']),
  language: z.enum(['en', 'th']),
  theme: z.enum(['light', 'dark', 'system']),
})
export const nutritionSchema = base.extend({
  manualTarget: z.number().min(1200).max(5000).nullable(),
  deficit: z.number().min(0).max(500),
  waterTarget: z.number().min(500).max(4000),
})
export const servingSchema = z.object({
  label: z.string().min(1),
  amount: positive,
  unit: z.string().min(1),
})
export const foodSchema = base.extend({
  slug: z.string().optional(),
  nameEn: z.string().min(1).max(150),
  nameTh: z.string().min(1).max(150),
  category: z.string(),
  calories: z.number().min(0).max(5000),
  calorieRange: z.tuple([z.number().min(0), z.number().min(0)]).optional(),
  serving: servingSchema,
  suitability: z.enum(['suitable', 'modify', 'trigger', 'higher-purine']),
  tags: z.array(z.string()),
  gerd: z.string(),
  purine: z.string(),
  weightLoss: z.string(),
  modifications: z.string(),
  notes: z.string().max(2000).optional(),
  protein: z.number().min(0).optional(),
  carbs: z.number().min(0).optional(),
  fat: z.number().min(0).optional(),
  icon: z.string(),
  custom: z.boolean().optional(),
})
export const mealFoodSchema = z.object({
  foodId: z.string(),
  name: z.string().min(1),
  servings: positive.max(20),
  calories: z.number().min(0).max(100000),
  calorieRange: z.tuple([z.number(), z.number()]).optional(),
})
export const mealSchema = base.extend({
  date,
  time,
  type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  foods: z.array(mealFoodSchema).min(1),
  notes: z.string().max(2000),
})
export const favoriteSchema = base.extend({ foodId: z.string() })
export const evaluationSchema = base.extend({
  date,
  mealName: z.string().min(1),
  answers: z.array(z.boolean()).length(7),
  notes: z.string().max(2000),
})
export const checklistSchema = base.extend({
  date,
  completed: z.array(z.number().int().min(0).max(6)),
})
export const weightSchema = base.extend({
  date,
  weight: positive.min(30).max(300),
})
export const waterSchema = base.extend({ date, amount: positive.max(2000) })
export const symptomSchema = base.extend({
  date,
  time,
  type: z.enum([
    'burping',
    'bloating',
    'throat',
    'heartburn',
    'regurgitation',
    'nausea',
  ]),
  severity: z.number().int().min(0).max(10),
  mealId: z.string().nullable(),
  notes: z.string().max(2000),
  triggers: z.array(z.string()),
})
export const triggerSchema = base.extend({ name: z.string().min(1).max(100) })
export const backupSchema = z.object({
  schemaVersion: z.literal(2),
  exportedAt: z.string().datetime(),
  profile: profileSchema,
  nutrition: nutritionSchema,
  foods: z.array(foodSchema).max(10000),
  meals: z.array(mealSchema).max(50000),
  favorites: z.array(favoriteSchema).max(10000),
  evaluations: z.array(evaluationSchema).max(50000),
  checklists: z.array(checklistSchema).max(50000),
  weights: z.array(weightSchema).max(50000),
  waters: z.array(waterSchema).max(100000),
  symptoms: z.array(symptomSchema).max(50000),
  triggers: z.array(triggerSchema).max(1000),
})
export type UserProfile = z.infer<typeof profileSchema>
export type NutritionSettings = z.infer<typeof nutritionSchema>
export type Food = z.infer<typeof foodSchema>
export type FoodServing = z.infer<typeof servingSchema>
export type MealEntry = z.infer<typeof mealSchema>
export type MealFood = z.infer<typeof mealFoodSchema>
export type FavoriteFood = z.infer<typeof favoriteSchema>
export type FoodEvaluation = z.infer<typeof evaluationSchema>
export type DailyChecklist = z.infer<typeof checklistSchema>
export type WeightEntry = z.infer<typeof weightSchema>
export type WaterEntry = z.infer<typeof waterSchema>
export type GerdSymptomEntry = z.infer<typeof symptomSchema>
export type UserFoodTrigger = z.infer<typeof triggerSchema>
export type Backup = z.infer<typeof backupSchema>
export type MealType = MealEntry['type']
export const stamp = () => ({
  id: crypto.randomUUID(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})
export const localDate = (value = new Date()) =>
  `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
export const localTime = () => new Date().toTimeString().slice(0, 5)
export const defaultProfile = (): UserProfile => ({
  ...stamp(),
  name: 'My wellness journey',
  age: 31,
  height: 169,
  weight: 78.3,
  startingWeight: 78.3,
  targetWeight: 72,
  sex: null,
  activity: 'sedentary',
  language: 'en',
  theme: 'light',
})
export const defaultNutrition = (): NutritionSettings => ({
  ...stamp(),
  manualTarget: 1750,
  deficit: 300,
  waterTarget: 2000,
})
