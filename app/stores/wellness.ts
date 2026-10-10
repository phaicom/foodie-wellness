import { defineStore } from 'pinia'
import { getDatabase } from '~/features/storage/database'
import { calorieTarget, dailyCalories } from '~/features/nutrition/calculations'
import {
  localDate,
  stamp,
  type UserProfile,
  type NutritionSettings,
  type Food,
  type MealEntry,
  type FavoriteFood,
  type DailyChecklist,
  type WeightEntry,
  type WaterEntry,
  type GerdSymptomEntry,
  type FoodEvaluation,
  type UserFoodTrigger,
} from '~/features/storage/models'
export const useWellnessStore = defineStore('wellness', () => {
  const ready = ref(false)
  const error = ref('')
  const busy = ref(false)
  const profile = ref<UserProfile | null>(null)
  const nutrition = ref<NutritionSettings | null>(null)
  const foods = ref<Food[]>([])
  const meals = ref<MealEntry[]>([])
  const favorites = ref<FavoriteFood[]>([])
  const checklists = ref<DailyChecklist[]>([])
  const weights = ref<WeightEntry[]>([])
  const waters = ref<WaterEntry[]>([])
  const symptoms = ref<GerdSymptomEntry[]>([])
  const evaluations = ref<FoodEvaluation[]>([])
  const triggers = ref<UserFoodTrigger[]>([])
  const today = ref(localDate())
  const selectedDate = ref(localDate())
  const target = computed(() =>
    profile.value && nutrition.value
      ? calorieTarget(profile.value, nutrition.value)
      : 1750,
  )
  const consumed = computed(() => dailyCalories(meals.value, today.value))
  const waterToday = computed(() =>
    waters.value
      .filter((w) => w.date === today.value)
      .reduce((s, w) => s + w.amount, 0),
  )
  async function load() {
    const db = getDatabase()
    const data = await db.exportData()
    profile.value = data.profile
    nutrition.value = data.nutrition
    foods.value = data.foods
    meals.value = data.meals
    favorites.value = data.favorites
    checklists.value = data.checklists
    weights.value = data.weights
    waters.value = data.waters
    symptoms.value = data.symptoms
    evaluations.value = data.evaluations
    triggers.value = data.triggers
  }
  async function initialize() {
    try {
      await getDatabase().initialize()
      await load()
      ready.value = true
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : 'Unable to open local storage.'
    }
  }
  async function mutate(action: () => Promise<unknown>) {
    busy.value = true
    error.value = ''
    try {
      await action()
      await load()
      return true
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : 'Unable to save. Please try again.'
      return false
    } finally {
      busy.value = false
    }
  }
  async function toggleChecklist(index: number, date = today.value) {
    return mutate(async () => {
      const db = getDatabase()
      await db.transaction('rw', db.checklists, async () => {
        const row = (await db.checklists
          .where('date')
          .equals(date)
          .first()) ?? { ...stamp(), date, completed: [] }
        row.completed = row.completed.includes(index)
          ? row.completed.filter((i) => i !== index)
          : [...row.completed, index]
        row.updatedAt = new Date().toISOString()
        await db.checklists.put(row)
      })
    })
  }
  async function toggleFavorite(foodId: string) {
    return mutate(async () => {
      const db = getDatabase()
      const row = await db.favorites.where('foodId').equals(foodId).first()
      if (row) await db.favorites.delete(row.id)
      else await db.favorites.add({ ...stamp(), foodId })
    })
  }
  async function addWater(amount: number, date = today.value) {
    const { waterSchema } = await import('~/features/storage/models')
    return mutate(() =>
      getDatabase().waters.add(waterSchema.parse({ ...stamp(), date, amount })),
    )
  }
  async function saveWeight(weight: number, date: string) {
    const { weightSchema } = await import('~/features/storage/models')
    return mutate(async () => {
      const db = getDatabase()
      const old = await db.weights.where('date').equals(date).first()
      const row = weightSchema.parse({
        ...(old ?? stamp()),
        date,
        weight,
        updatedAt: new Date().toISOString(),
      })
      await db.transaction('rw', [db.weights, db.profile], async () => {
        await db.weights.put(row)
        const latest = await db.weights.orderBy('date').last()
        if (profile.value && latest)
          await db.profile.put({
            ...profile.value,
            weight: latest.weight,
            updatedAt: new Date().toISOString(),
          })
      })
    })
  }
  async function saveMeal(meal: MealEntry) {
    const { mealSchema } = await import('~/features/storage/models')
    return mutate(() => getDatabase().meals.put(mealSchema.parse(meal)))
  }
  async function deleteMeal(id: string) {
    return mutate(() => getDatabase().meals.delete(id))
  }
  return {
    ready,
    error,
    busy,
    profile,
    nutrition,
    foods,
    meals,
    favorites,
    checklists,
    weights,
    waters,
    symptoms,
    evaluations,
    triggers,
    today,
    selectedDate,
    target,
    consumed,
    waterToday,
    initialize,
    load,
    mutate,
    toggleChecklist,
    toggleFavorite,
    addWater,
    saveWeight,
    saveMeal,
    deleteMeal,
  }
})
