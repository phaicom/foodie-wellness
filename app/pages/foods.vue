<script setup lang="ts">
import type { Food } from '~/features/storage/models'
import { getDatabase } from '~/features/storage/database'
const { store, say, foodName, foodCopy, servingLabel } = useFoodie()
const { t } = useI18n()
const route = useRoute()
const query = ref('')
const selectedFilters = ref<string[]>([])
const selected = ref<Food | null>(null)
const detail = ref(false)
const view = ref('guide')
const notes = ref('')
const filters = computed(() => [
  { id: 'gerd', label: say('GERD-friendly', 'เป็นมิตรกับกรดไหลย้อน') },
  { id: 'low-purine', label: say('Lower purine', 'พิวรีนต่ำกว่า') },
  { id: 'low-calorie', label: say('Lower calorie', 'แคลอรีน้อยกว่า') },
  { id: 'vegetarian', label: say('Vegetarian', 'มังสวิรัติ') },
  { id: 'low-fat', label: say('Low fat', 'ไขมันต่ำ') },
  { id: 'easy', label: say('Easy preparation', 'ทำง่าย') },
  { id: 'thai', label: say('Thai food', 'อาหารไทย') },
  { id: 'restaurant', label: say('Restaurant-friendly', 'สั่งที่ร้านได้') },
])
const filtered = computed(() =>
  store.foods.filter(
    (f) =>
      `${f.nameEn} ${f.nameTh} ${f.category}`
        .toLowerCase()
        .includes(query.value.toLowerCase()) &&
      selectedFilters.value.every((tag) => f.tags.includes(tag)),
  ),
)
const status = (f: Food) =>
  ({
    suitable: say('Generally suitable', 'โดยทั่วไปเหมาะสม'),
    modify: say('With small adjustments', 'เหมาะเมื่อปรับเล็กน้อย'),
    trigger: say('Potential reflux trigger', 'อาจกระตุ้นกรดไหลย้อน'),
    'higher-purine': say('Higher purine', 'พิวรีนสูงกว่า'),
  })[f.suitability]
function show(food: Food) {
  selected.value = food
  notes.value = food.notes ?? ''
  detail.value = true
}
function toggleFilter(id: string) {
  selectedFilters.value = selectedFilters.value.includes(id)
    ? selectedFilters.value.filter((f) => f !== id)
    : [...selectedFilters.value, id]
}
onMounted(() => {
  const food = store.foods.find((f) => f.id === route.query.food)
  if (food) show(food)
  if (route.query.checklist) view.value = 'decision'
})
async function saveNotes() {
  if (!selected.value) return
  const updated = {
    ...selected.value,
    notes: notes.value,
    updatedAt: new Date().toISOString(),
  }
  if (await store.mutate(() => getDatabase().foods.put(updated))) {
    selected.value = updated
    detail.value = false
  }
}
</script>
<template>
  <div>
    <PageHeading
      :eyebrow="say('THOUGHTFUL CHOICES', 'เลือกอย่างใส่ใจ')"
      :title="say('Find food that feels good.', 'เลือกอาหารที่เหมาะกับคุณ')"
      :subtitle="
        say(
          'Familiar favorites, a few thoughtful tweaks. No unnecessary restrictions.',
          'อาหารที่คุ้นเคย ปรับเล็กน้อย โดยไม่จำกัดเกินจำเป็น',
        )
      "
      ><NuxtLink to="/rules" class="secondary-button"
        ><UIcon name="i-lucide-book-open" />{{ t('nav.rules') }}</NuxtLink
      ></PageHeading
    >
    <div class="tab-bar">
      <button :class="{ active: view === 'guide' }" @click="view = 'guide'">
        {{ t('nav.foods') }}</button
      ><button
        :class="{ active: view === 'decision' }"
        @click="view = 'decision'"
      >
        {{ say('Meal decision checklist', 'เช็กลิสต์เลือกมื้ออาหาร') }}
      </button>
    </div>
    <template v-if="view === 'guide'"
      ><div class="food-toolbar">
        <UInput
          v-model="query"
          icon="i-lucide-search"
          size="xl"
          :placeholder="
            say(
              'Search Thai dishes, ingredients, or favorites...',
              'ค้นหาอาหารไทย วัตถุดิบ หรืออาหารที่ชอบ...',
            )
          "
          :aria-label="say('Search foods', 'ค้นหาอาหาร')"
          class="food-search"
        /><span class="muted"
          >{{ filtered.length }}
          {{ say('foods to explore', 'รายการอาหาร') }}</span
        >
      </div>
      <div class="filter-chips">
        <button
          v-for="filter in filters"
          :key="filter.id"
          :aria-pressed="selectedFilters.includes(filter.id)"
          :class="{ selected: selectedFilters.includes(filter.id) }"
          @click="toggleFilter(filter.id)"
        >
          <UIcon
            v-if="selectedFilters.includes(filter.id)"
            name="i-lucide-check"
          />{{ filter.label }}</button
        ><button
          v-if="selectedFilters.length"
          class="text-button"
          @click="selectedFilters = []"
        >
          {{ say('Clear filters', 'ล้างตัวกรอง') }}
        </button>
      </div>
      <p class="guide-note">
        <UIcon name="i-lucide-info" />{{
          say(
            'Suitability depends on preparation, portion size, and your personal triggers. Calories are estimates.',
            'ความเหมาะสมขึ้นอยู่กับการปรุง ปริมาณ และสิ่งกระตุ้นของแต่ละคน แคลอรีเป็นค่าประมาณ',
          )
        }}
      </p>
      <div class="food-grid">
        <article v-for="food in filtered" :key="food.id" class="food-card">
          <button
            class="favorite-button"
            :class="{
              favorited: store.favorites.some((f) => f.foodId === food.id),
            }"
            :aria-label="say('Toggle favorite', 'บันทึกหรือลบอาหารโปรด')"
            :aria-pressed="store.favorites.some((f) => f.foodId === food.id)"
            @click="store.toggleFavorite(food.id)"
          >
            <UIcon name="i-lucide-heart" /></button
          ><button class="food-card-main" @click="show(food)">
            <div
              class="food-art"
              :class="
                food.icon.includes('soup')
                  ? 'soup-art'
                  : food.icon.includes('egg')
                    ? 'egg-art'
                    : 'green-art'
              "
            >
              <UIcon :name="food.icon" /><span class="art-circle" />
            </div>
            <div class="food-card-body">
              <span class="tiny-label">{{
                food.category === 'Thai kitchen'
                  ? say('Thai kitchen', 'ครัวไทย')
                  : food.category === 'My foods'
                    ? say('My foods', 'อาหารของฉัน')
                    : say('Everyday favorites', 'อาหารประจำวัน')
              }}</span>
              <h2>{{ foodName(food) }}</h2>
              <p class="thai-name">
                {{ foodName(food) === food.nameEn ? food.nameTh : food.nameEn }}
              </p>
              <div class="food-meta">
                <strong>~{{ food.calories }} <small>kcal</small></strong
                ><span>{{ servingLabel(food) }}</span>
              </div>
              <span class="status-tag" :class="food.suitability"
                ><i />{{ status(food) }}</span
              >
            </div>
          </button>
          <div class="food-card-footer">
            <button class="text-button" @click="show(food)">
              {{ say('See considerations', 'ดูข้อควรพิจารณา')
              }}<UIcon name="i-lucide-arrow-right" /></button
            ><NuxtLink
              :to="`/meals?food=${food.id}`"
              class="icon-button"
              :aria-label="say('Log this food', 'บันทึกอาหารนี้')"
              ><UIcon name="i-lucide-plus"
            /></NuxtLink>
          </div>
        </article>
      </div>
      <div v-if="!filtered.length" class="empty-state">
        <UIcon name="i-lucide-search" />
        <h2>{{ say('No matching foods yet.', 'ยังไม่พบอาหารที่ตรงกัน') }}</h2>
        <p>
          {{
            say(
              'Try fewer filters, or add your own food in the meal tracker.',
              'ลองลดตัวกรอง หรือเพิ่มอาหารเองในหน้าบันทึกมื้ออาหาร',
            )
          }}
        </p>
      </div></template
    ><FoodDecision v-else />
    <UModal
      v-model:open="detail"
      :title="selected ? foodName(selected) : ''"
      :description="selected ? servingLabel(selected) : undefined"
      ><template #body
        ><div v-if="selected" class="food-detail">
          <span class="status-tag" :class="selected.suitability"
            ><i />{{ status(selected) }}</span
          >
          <p class="detail-calories">
            ~{{ selected.calories }} kcal
            <small v-if="selected.calorieRange"
              >({{ selected.calorieRange[0] }}-{{
                selected.calorieRange[1]
              }}
              kcal)</small
            >
          </p>
          <p v-if="selected.calorieRange" class="muted">
            {{
              say(
                'Restaurant portions vary. This range is approximate.',
                'ปริมาณที่ร้านแตกต่างกัน ช่วงนี้เป็นค่าประมาณ',
              )
            }}
          </p>
          <div
            v-for="item in [
              {
                title: say('GERD considerations', 'ข้อควรพิจารณากรดไหลย้อน'),
                text: foodCopy(selected, 'gerd'),
                icon: 'i-lucide-heart-pulse',
              },
              {
                title: say('Purine considerations', 'ข้อควรพิจารณาพิวรีน'),
                text: foodCopy(selected, 'purine'),
                icon: 'i-lucide-leaf',
              },
              {
                title: say('Weight & portions', 'น้ำหนักและปริมาณ'),
                text: foodCopy(selected, 'weightLoss'),
                icon: 'i-lucide-scale',
              },
              {
                title: say('Make it work for you', 'ปรับให้เหมาะกับคุณ'),
                text: foodCopy(selected, 'modifications'),
                icon: 'i-lucide-lightbulb',
              },
            ]"
            :key="item.title"
            class="consideration"
          >
            <UIcon :name="item.icon" />
            <div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.text }}</p>
            </div>
          </div>
          <label class="form-stack"
            >{{ say('My notes', 'บันทึกของฉัน')
            }}<UTextarea v-model="notes" maxlength="2000"
          /></label></div></template
      ><template #footer
        ><UButton color="neutral" variant="outline" @click="saveNotes">{{
          say('Save notes', 'บันทึกหมายเหตุ')
        }}</UButton
        ><UButton
          v-if="selected"
          :to="`/meals?food=${selected.id}`"
          icon="i-lucide-plus"
          >{{ say('Log this food', 'บันทึกอาหารนี้') }}</UButton
        ></template
      ></UModal
    >
  </div>
</template>
