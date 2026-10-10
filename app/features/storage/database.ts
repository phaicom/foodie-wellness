import Dexie, { type Table } from 'dexie'
import {
  backupSchema,
  defaultNutrition,
  defaultProfile,
  type Backup,
  type DailyChecklist,
  type FavoriteFood,
  type Food,
  type FoodEvaluation,
  type GerdSymptomEntry,
  type MealEntry,
  type NutritionSettings,
  type UserFoodTrigger,
  type UserProfile,
  type WaterEntry,
  type WeightEntry,
} from './models'
import { seedFoods } from '../foods/seed'
export class WellnessDatabase extends Dexie {
  profile!: Table<UserProfile>
  nutrition!: Table<NutritionSettings>
  foods!: Table<Food>
  meals!: Table<MealEntry>
  favorites!: Table<FavoriteFood>
  evaluations!: Table<FoodEvaluation>
  checklists!: Table<DailyChecklist>
  weights!: Table<WeightEntry>
  waters!: Table<WaterEntry>
  symptoms!: Table<GerdSymptomEntry>
  triggers!: Table<UserFoodTrigger>
  constructor(name = 'foodie-wellness') {
    super(name)
    this.version(1).stores({
      profile: 'id',
      nutrition: 'id',
      foods: 'id,category',
      meals: 'id,date,type',
      favorites: 'id,&foodId',
      evaluations: 'id,date',
      checklists: 'id,&date',
      weights: 'id,&date',
      waters: 'id,date',
      symptoms: 'id,date,mealId',
      triggers: 'id,&name',
    })
    this.version(2)
      .stores({ foods: 'id,category,*tags', meals: 'id,date,type,[date+type]' })
      .upgrade(async (tx) => {
        await tx
          .table('foods')
          .toCollection()
          .modify((food) => {
            food.tags ??= []
            food.updatedAt ??= food.createdAt
          })
        await tx
          .table('meals')
          .toCollection()
          .modify((meal) => {
            meal.notes ??= ''
          })
      })
  }
  async initialize() {
    await this.transaction(
      'rw',
      [this.profile, this.nutrition, this.foods],
      async () => {
        if (!(await this.profile.count()))
          await this.profile.add(defaultProfile())
        if (!(await this.nutrition.count()))
          await this.nutrition.add(defaultNutrition())
        const existing = new Set(await this.foods.toCollection().primaryKeys())
        await this.foods.bulkPut(seedFoods.filter((f) => !existing.has(f.id)))
      },
    )
  }
  async exportData(): Promise<Backup> {
    const data = await this.transaction('r', this.tables, async () => ({
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
      profile: await this.profile.toCollection().first(),
      nutrition: await this.nutrition.toCollection().first(),
      foods: await this.foods.toArray(),
      meals: await this.meals.toArray(),
      favorites: await this.favorites.toArray(),
      evaluations: await this.evaluations.toArray(),
      checklists: await this.checklists.toArray(),
      weights: await this.weights.toArray(),
      waters: await this.waters.toArray(),
      symptoms: await this.symptoms.toArray(),
      triggers: await this.triggers.toArray(),
    }))
    return backupSchema.parse(data)
  }
  async importData(input: unknown) {
    const data = backupSchema.parse(input)
    await this.transaction('rw', this.tables, async () => {
      await this.profile.clear()
      await this.nutrition.clear()
      await this.profile.put(data.profile)
      await this.nutrition.put(data.nutrition)
      for (const key of [
        'foods',
        'meals',
        'evaluations',
        'waters',
        'symptoms',
      ] as const) {
        const table = this.table(key)
        for (const row of data[key]) {
          const existing = await table.get(row.id)
          if (!existing || row.updatedAt >= existing.updatedAt)
            await table.put(row)
        }
      }
      for (const key of [
        'favorites',
        'checklists',
        'weights',
        'triggers',
      ] as const) {
        const uniqueField = {
          favorites: 'foodId',
          checklists: 'date',
          weights: 'date',
          triggers: 'name',
        }[key]
        const table = this.table(key)
        for (const row of data[key]) {
          const value = (row as unknown as Record<string, unknown>)[uniqueField]
          const existing = await table
            .where(uniqueField)
            .equals(String(value))
            .first()
          if (!existing || row.updatedAt >= existing.updatedAt) {
            if (existing && existing.id !== row.id)
              await table.delete(existing.id)
            await table.put(row)
          }
        }
      }
    })
  }
}
let instance: WellnessDatabase | undefined
export function getDatabase() {
  if (typeof indexedDB === 'undefined')
    throw new Error('Storage is only available in the browser.')
  return (instance ??= new WellnessDatabase())
}
