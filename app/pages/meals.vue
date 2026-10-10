<script setup lang="ts">
import MealEditor from '~/components/MealEditor.vue'
import { dailyCalories, mealCalories } from '~/features/nutrition/calculations'
import { stamp, localDate, type MealEntry } from '~/features/storage/models'
import { getDatabase } from '~/features/storage/database'
const { store, say, foodName } = useFoodie()
const { t } = useI18n()
const route = useRoute()
const editor = ref<InstanceType<typeof MealEditor> | null>(null)
const types = ['breakfast', 'lunch', 'dinner', 'snack'] as const
const icons = [
  'i-lucide-sunrise',
  'i-lucide-sun',
  'i-lucide-moon',
  'i-lucide-apple',
]
const entries = computed(() =>
  store.meals
    .filter((m) => m.date === store.selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time)),
)
const consumed = computed(() => dailyCalories(store.meals, store.selectedDate))
const favoriteFoods = computed(() =>
  store.foods.filter((f) => store.favorites.some((v) => v.foodId === f.id)),
)
const message = ref('')
const deleteId = ref('')
const deleteOpen = ref(false)
onMounted(() => {
  if (route.query.food || route.query.add)
    editor.value?.show(
      typeof route.query.food === 'string' ? route.query.food : undefined,
    )
})
function shiftDate(offset: number) {
  const date = new Date(`${store.selectedDate}T12:00:00`)
  date.setDate(date.getDate() + offset)
  store.selectedDate = localDate(date)
}
async function duplicate(meal: MealEntry) {
  await store.saveMeal({ ...meal, ...stamp(), date: store.selectedDate })
}
async function copyYesterday() {
  const d = new Date(`${store.selectedDate}T12:00:00`)
  d.setDate(d.getDate() - 1)
  const previous = store.meals.filter((m) => m.date === localDate(d))
  if (!previous.length) {
    message.value = say(
      'No meals logged on the previous day.',
      'วันก่อนหน้ายังไม่มีมื้ออาหาร',
    )
    return
  }
  const ok = await store.mutate(() =>
    getDatabase().meals.bulkAdd(
      previous.map((m) => ({ ...m, ...stamp(), date: store.selectedDate })),
    ),
  )
  if (ok)
    message.value = say(
      "Previous day's meals copied.",
      'คัดลอกมื้ออาหารวันก่อนแล้ว',
    )
}
function requestDelete(id: string) {
  deleteId.value = id
  deleteOpen.value = true
}
async function remove() {
  if (await store.deleteMeal(deleteId.value)) deleteOpen.value = false
}
</script>
<template>
  <div>
    <PageHeading
      :eyebrow="say('ONE MEAL AT A TIME', 'ทีละมื้อ')"
      :title="say('Your plate, your pace.', 'มื้ออาหาร ในจังหวะของคุณ')"
      :subtitle="
        say(
          'A simple record of what nourishes you. Estimates are enough.',
          'บันทึกง่ายๆ ว่าคุณกินอะไร ใช้ค่าประมาณก็เพียงพอ',
        )
      "
      ><button class="primary-button" @click="editor?.show()">
        <UIcon name="i-lucide-plus" />{{ say('Log a meal', 'บันทึกมื้ออาหาร') }}
      </button></PageHeading
    >
    <div class="tracker-toolbar">
      <div class="date-selector">
        <button
          class="icon-button"
          :aria-label="say('Previous day', 'วันก่อนหน้า')"
          @click="shiftDate(-1)"
        >
          <UIcon name="i-lucide-chevron-left" /></button
        ><UInput
          v-model="store.selectedDate"
          type="date"
          :aria-label="say('Meal date', 'วันที่มื้ออาหาร')"
        /><button
          class="icon-button"
          :aria-label="say('Next day', 'วันถัดไป')"
          @click="shiftDate(1)"
        >
          <UIcon name="i-lucide-chevron-right" />
        </button>
      </div>
      <button class="secondary-button" @click="copyYesterday">
        <UIcon name="i-lucide-copy" />{{
          say('Copy previous day', 'คัดลอกวันก่อนหน้า')
        }}
      </button>
    </div>
    <p v-if="message" role="status" class="notice-banner">{{ message }}</p>
    <div class="intake-banner">
      <UIcon name="i-lucide-flame" /><span>{{
        say('Daily estimated intake', 'พลังงานที่กินโดยประมาณ')
      }}</span
      ><strong
        >{{ consumed.toLocaleString() }}
        <small>/ {{ store.target ?? 1750 }} kcal</small></strong
      >
      <div class="mini-progress">
        <span
          :style="{
            width: `${Math.min(100, (consumed / (store.target ?? 1750)) * 100)}%`,
          }"
        />
      </div>
    </div>
    <section v-if="favoriteFoods.length" class="panel favorites-section">
      <div class="section-heading">
        <h2>
          <UIcon name="i-lucide-heart" />{{
            say('Your go-to favorites', 'อาหารโปรดของคุณ')
          }}
        </h2>
        <span class="muted">{{
          say('Tap, then save.', 'แตะ แล้วบันทึก')
        }}</span>
      </div>
      <div class="filter-chips">
        <button
          v-for="food in favoriteFoods"
          :key="food.id"
          @click="editor?.show(food.id)"
        >
          <UIcon :name="food.icon" />{{ foodName(food)
          }}<UIcon name="i-lucide-plus" />
        </button>
      </div>
    </section>
    <div class="meal-groups">
      <section
        v-for="(type, index) in types"
        :key="type"
        class="panel meal-group"
      >
        <div class="section-heading">
          <h2>
            <span
              class="action-icon"
              :class="['sand', 'sage', 'lavender', 'rose'][index]"
              ><UIcon :name="icons[index]" /></span
            >{{ t(`meal.${type}`) }}
          </h2>
          <strong class="muted"
            >{{
              entries
                .filter((m) => m.type === type)
                .reduce((s, m) => s + mealCalories(m), 0)
            }}
            kcal</strong
          ><button
            class="icon-button"
            :aria-label="say('Add meal', 'เพิ่มมื้ออาหาร')"
            @click="editor?.show(undefined, undefined, type)"
          >
            <UIcon name="i-lucide-plus" />
          </button>
        </div>
        <div v-if="!entries.some((m) => m.type === type)" class="meal-empty">
          <p>
            {{
              say(
                'A little room for something nourishing.',
                'มีพื้นที่สำหรับอาหารดีๆ อีกนิด',
              )
            }}
          </p>
          <button
            class="text-button"
            @click="editor?.show(undefined, undefined, type)"
          >
            {{ say('Add a meal', 'เพิ่มมื้ออาหาร')
            }}<UIcon name="i-lucide-plus" />
          </button>
        </div>
        <div
          v-for="meal in entries.filter((m) => m.type === type)"
          :key="meal.id"
          class="meal-entry"
        >
          <span class="food-illustration"
            ><UIcon
              :name="
                store.foods.find((f) => f.id === meal.foods[0]?.foodId)?.icon ??
                'i-lucide-utensils'
              "
          /></span>
          <div class="entry-info">
            <h3>
              {{
                meal.foods
                  .map((f) => store.foods.find((item) => item.id === f.foodId))
                  .map((f, i) => (f ? foodName(f) : meal.foods[i]?.name))
                  .join(', ')
              }}
            </h3>
            <p>
              {{ meal.time }} | {{ meal.foods[0]?.servings }}
              {{ say('serving(s)', 'ส่วน') }}
            </p>
            <p v-if="meal.notes">{{ meal.notes }}</p>
            <small v-if="meal.foods[0]?.calorieRange"
              >{{ meal.foods[0].calorieRange[0] }}-{{
                meal.foods[0].calorieRange[1]
              }}
              kcal {{ say('estimated range', 'ช่วงประมาณการ') }}</small
            >
          </div>
          <strong class="entry-calories"
            >~{{ mealCalories(meal) }}<small>kcal</small></strong
          >
          <div class="entry-actions">
            <button
              class="icon-button"
              :aria-label="t('common.edit')"
              @click="editor?.show(undefined, meal)"
            >
              <UIcon name="i-lucide-pencil" /></button
            ><button
              class="icon-button"
              :aria-label="say('Duplicate meal', 'ทำสำเนามื้ออาหาร')"
              @click="duplicate(meal)"
            >
              <UIcon name="i-lucide-copy" /></button
            ><button
              class="icon-button"
              :aria-label="t('common.delete')"
              @click="requestDelete(meal.id)"
            >
              <UIcon name="i-lucide-trash-2" />
            </button>
          </div>
        </div>
      </section>
    </div>
    <MealEditor ref="editor" /><UModal
      v-model:open="deleteOpen"
      :title="say('Delete this meal?', 'ลบมื้ออาหารนี้?')"
      :description="
        say(
          'This removes the entry from your device.',
          'รายการนี้จะถูกลบจากอุปกรณ์ของคุณ',
        )
      "
      ><template #footer
        ><UButton
          color="neutral"
          variant="outline"
          @click="deleteOpen = false"
          >{{ t('common.cancel') }}</UButton
        ><UButton color="error" @click="remove">{{
          t('common.delete')
        }}</UButton></template
      ></UModal
    >
  </div>
</template>
