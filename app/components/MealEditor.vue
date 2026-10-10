<script setup lang="ts">
import {
  foodSchema,
  stamp,
  localTime,
  type Food,
  type MealEntry,
  type MealType,
} from '~/features/storage/models'
import { getDatabase } from '~/features/storage/database'
import { servingCalories } from '~/features/nutrition/calculations'
const { store, say, foodName, servingLabel } = useFoodie()
const { t } = useI18n()
const emit = defineEmits<{ saved: [] }>()
const open = ref(false)
const editing = ref<MealEntry | null>(null)
const search = ref('')
const selectedFood = ref('')
const servings = ref(1)
const type = ref<MealType>('lunch')
const date = ref(store.selectedDate)
const time = ref(localTime())
const notes = ref('')
const custom = ref(false)
const name = ref('')
const calories = ref(250)
const serving = ref('1 serving')
const protein = ref<number | undefined>()
const carbs = ref<number | undefined>()
const fat = ref<number | undefined>()
const validation = ref('')
const food = computed(() =>
  store.foods.find((f) => f.id === selectedFood.value),
)
const options = computed(() =>
  store.foods
    .filter((f) =>
      `${f.nameEn} ${f.nameTh}`
        .toLowerCase()
        .includes(search.value.toLowerCase()),
    )
    .map((f) => ({ label: foodName(f), value: f.id })),
)
const favoriteFoods = computed(() =>
  store.foods.filter((f) => store.favorites.some((v) => v.foodId === f.id)),
)
function show(foodId?: string, meal?: MealEntry, mealType?: MealType) {
  editing.value = meal ?? null
  selectedFood.value = foodId ?? meal?.foods[0]?.foodId ?? ''
  servings.value = meal?.foods[0]?.servings ?? 1
  type.value = meal?.type ?? mealType ?? 'lunch'
  date.value = meal?.date ?? store.selectedDate
  time.value = meal?.time ?? localTime()
  notes.value = meal?.notes ?? ''
  custom.value = false
  search.value = ''
  validation.value = ''
  open.value = true
}
defineExpose({ show })
async function save() {
  validation.value = ''
  try {
    let chosen: Food | undefined = food.value
    if (custom.value)
      chosen = foodSchema.parse({
        ...stamp(),
        nameEn: name.value,
        nameTh: name.value,
        category: 'My foods',
        calories: Number(calories.value),
        serving: { label: serving.value, amount: 1, unit: 'serving' },
        suitability: 'modify',
        tags: [],
        gerd: 'Personal tolerance varies. Record symptoms and preparation.',
        purine: 'Not classified. Check the main ingredients.',
        weightLoss: 'Use your own label or recipe estimate.',
        modifications: 'Adjust preparation and portions to suit your needs.',
        notes: notes.value,
        icon: 'i-lucide-utensils',
        custom: true,
        ...(protein.value !== undefined && protein.value !== null
          ? { protein: Number(protein.value) }
          : {}),
        ...(carbs.value !== undefined && carbs.value !== null
          ? { carbs: Number(carbs.value) }
          : {}),
        ...(fat.value !== undefined && fat.value !== null
          ? { fat: Number(fat.value) }
          : {}),
      })
    if (!chosen) {
      validation.value = say('Choose a food first.', 'เลือกอาหารก่อน')
      return
    }
    const count = Number(servings.value)
    if (!Number.isFinite(count) || count <= 0 || count > 20) {
      validation.value = say(
        'Choose between 0.1 and 20 servings.',
        'เลือกปริมาณ 0.1 ถึง 20 ส่วน',
      )
      return
    }
    const meal: MealEntry = {
      ...(editing.value ?? stamp()),
      updatedAt: new Date().toISOString(),
      date: date.value,
      time: time.value,
      type: type.value,
      notes: notes.value,
      foods: [
        {
          foodId: chosen.id,
          name: foodName(chosen),
          servings: count,
          calories: servingCalories(chosen.calories, count),
          ...(chosen.calorieRange
            ? {
                calorieRange: [
                  servingCalories(chosen.calorieRange[0], count),
                  servingCalories(chosen.calorieRange[1], count),
                ] as [number, number],
              }
            : {}),
        },
      ],
    }
    const { mealSchema } = await import('~/features/storage/models')
    mealSchema.parse(meal)
    const chosenFood = chosen
    const ok = await store.mutate(() =>
      getDatabase().transaction(
        'rw',
        [getDatabase().foods, getDatabase().meals],
        async () => {
          if (custom.value) await getDatabase().foods.put(chosenFood)
          await getDatabase().meals.put(meal)
        },
      ),
    )
    if (ok) {
      open.value = false
      emit('saved')
    }
  } catch (e) {
    validation.value =
      e instanceof Error
        ? e.message
        : say('Check your entries.', 'ตรวจสอบข้อมูล')
  }
}
</script>
<template>
  <UModal
    v-model:open="open"
    :title="
      editing
        ? say('Edit meal', 'แก้ไขมื้ออาหาร')
        : say('What\'s on your plate?', 'มื้อนี้กินอะไร?')
    "
    :description="
      say(
        'Simple logging. No weighing every bite.',
        'บันทึกง่ายๆ ไม่ต้องชั่งทุกคำ',
      )
    "
    ><template #body
      ><form id="meal-form" class="form-stack" @submit.prevent="save">
        <div class="segmented">
          <button
            type="button"
            :class="{ active: !custom }"
            @click="custom = false"
          >
            {{ say('Food guide', 'เลือกจากคู่มือ') }}</button
          ><button
            type="button"
            :class="{ active: custom }"
            @click="custom = true"
          >
            {{ say('Custom food', 'เพิ่มอาหารเอง') }}
          </button>
        </div>
        <template v-if="!custom"
          ><div v-if="favoriteFoods.length" class="favorite-quick">
            <span class="tiny-label">{{
              say('YOUR FAVORITES', 'อาหารโปรด')
            }}</span>
            <div class="filter-chips">
              <button
                v-for="f in favoriteFoods"
                :key="f.id"
                type="button"
                :class="{ selected: selectedFood === f.id }"
                @click="selectedFood = f.id"
              >
                {{ foodName(f) }}
              </button>
            </div>
          </div>
          <UInput
            v-model="search"
            icon="i-lucide-search"
            :placeholder="say('Find a food...', 'ค้นหาอาหาร...')"
            :aria-label="say('Search food', 'ค้นหาอาหาร')"
          /><label
            >{{ say('Food', 'อาหาร')
            }}<select v-model="selectedFood" required>
              <option value="">{{ say('Select a food', 'เลือกอาหาร') }}</option>
              <option v-for="f in options" :key="f.value" :value="f.value">
                {{ f.label }}
              </option>
            </select></label
          >
          <p v-if="food" class="muted">
            {{ servingLabel(food) }} | ~{{ food.calories }} kcal
          </p></template
        ><template v-else
          ><label
            >{{ say('Food name', 'ชื่ออาหาร')
            }}<UInput v-model="name" required maxlength="150"
          /></label>
          <div class="form-grid">
            <label
              >{{ say('Calories per serving', 'แคลอรีต่อส่วน')
              }}<UInput
                v-model="calories"
                type="number"
                min="0"
                max="5000"
                required /></label
            ><label
              >{{ say('Serving description', 'คำอธิบายปริมาณ')
              }}<UInput v-model="serving" required
            /></label>
          </div>
          <div class="form-grid three">
            <label
              >{{ say('Protein (g, optional)', 'โปรตีน (กรัม)')
              }}<UInput v-model="protein" type="number" min="0" /></label
            ><label
              >{{ say('Carbs (g, optional)', 'คาร์บ (กรัม)')
              }}<UInput v-model="carbs" type="number" min="0" /></label
            ><label
              >{{ say('Fat (g, optional)', 'ไขมัน (กรัม)')
              }}<UInput v-model="fat" type="number" min="0"
            /></label></div
        ></template>
        <div class="form-grid">
          <label
            >{{ say('Servings', 'จำนวนส่วน')
            }}<UInput
              v-model="servings"
              type="number"
              min="0.1"
              max="20"
              step="0.1"
              required /></label
          ><label
            >{{ say('Meal', 'มื้ออาหาร')
            }}<select v-model="type">
              <option
                v-for="v in ['breakfast', 'lunch', 'dinner', 'snack']"
                :key="v"
                :value="v"
              >
                {{ t(`meal.${v}`) }}
              </option>
            </select></label
          >
        </div>
        <div class="form-grid">
          <label
            >{{ say('Date', 'วันที่')
            }}<UInput v-model="date" type="date" required /></label
          ><label
            >{{ say('Time', 'เวลา')
            }}<UInput v-model="time" type="time" required
          /></label>
        </div>
        <label
          >{{ say('Notes (optional)', 'หมายเหตุ (ไม่จำเป็น)')
          }}<UTextarea v-model="notes" maxlength="2000"
        /></label>
        <div class="estimated-total">
          <span>{{ say('Estimated total', 'พลังงานประมาณ') }}</span
          ><strong
            >{{
              servingCalories(
                custom ? Number(calories) : (food?.calories ?? 0),
                Number(servings),
              )
            }}
            kcal</strong
          ><small v-if="!custom && food?.calorieRange"
            >{{ servingCalories(food.calorieRange[0], Number(servings)) }}-{{
              servingCalories(food.calorieRange[1], Number(servings))
            }}
            kcal |
            {{
              say('Restaurant portions vary', 'ปริมาณที่ร้านแตกต่างกัน')
            }}</small
          >
        </div>
        <p v-if="validation" class="form-error" role="alert">
          {{ validation }}
        </p>
      </form></template
    ><template #footer
      ><UButton color="neutral" variant="ghost" @click="open = false">{{
        t('common.cancel')
      }}</UButton
      ><UButton
        type="submit"
        form="meal-form"
        :loading="store.busy"
        icon="i-lucide-check"
        >{{ say('Save meal', 'บันทึกมื้ออาหาร') }}</UButton
      ></template
    ></UModal
  >
</template>
