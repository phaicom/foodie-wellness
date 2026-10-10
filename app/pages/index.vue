<script setup lang="ts">
import LogDialog from '~/components/LogDialog.vue'
import { mealCalories } from '~/features/nutrition/calculations'
const { store, say, formatDate, foodName } = useFoodie()
const { t } = useI18n()
const log = ref<InstanceType<typeof LogDialog> | null>(null)
const todayMeals = computed(() =>
  store.meals.filter((m) => m.date === store.today),
)
const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const
const mealIcons = [
  'i-lucide-sunrise',
  'i-lucide-sun',
  'i-lucide-moon',
  'i-lucide-apple',
]
const checks = computed(() => [
  say('Stay close to my calorie target', 'กินใกล้เคียงเป้าหมายแคลอรี'),
  say('Enjoy varied protein sources', 'กินโปรตีนหลากหลาย'),
  say('Make room for vegetables & fruit', 'เพิ่มผักและผลไม้'),
  say('Meet my hydration goal', 'ดื่มน้ำตามเป้าหมาย'),
  say('Be mindful of my reflux triggers', 'สังเกตสิ่งที่กระตุ้นกรดไหลย้อน'),
  say(
    'Finish dinner 3 hours before lying down',
    'กินมื้อเย็นก่อนนอนอย่างน้อย 3 ชั่วโมง',
  ),
  say('Keep portions comfortable & not too fatty', 'กินพอดีและไม่มันเกินไป'),
])
const completed = computed(
  () => store.checklists.find((c) => c.date === store.today)?.completed ?? [],
)
const suggestions = computed(() =>
  ['tofu-soup', 'chicken-congee', 'oatmeal']
    .map((id) => store.foods.find((f) => f.slug === id))
    .filter((f) => !!f),
)
</script>
<template>
  <div>
    <PageHeading
      :eyebrow="formatDate(store.today).toUpperCase()"
      :title="say('A little better, every day.', 'ดูแลตัวเองทีละนิด ทุกวัน')"
      :subtitle="
        say(
          'Good food. Gentle progress. A healthier you.',
          'อาหารที่ดี ก้าวอย่างค่อยเป็นค่อยไป เพื่อสุขภาพของคุณ',
        )
      "
      ><NuxtLink to="/meals?add=1" class="primary-button"
        ><UIcon name="i-lucide-plus" />{{
          say('Log a meal', 'บันทึกมื้ออาหาร')
        }}</NuxtLink
      ></PageHeading
    >
    <div class="welcome-strip">
      <span class="welcome-icon"><UIcon name="i-lucide-sprout" /></span>
      <div>
        <strong>{{
          say('Balance over perfection.', 'สมดุลสำคัญกว่าความสมบูรณ์แบบ')
        }}</strong
        ><span>{{
          say(
            "Every thoughtful choice counts. Let's make today feel good.",
            'ทุกทางเลือกที่ใส่ใจมีความหมาย มาเริ่มวันนี้ให้ดี',
          )
        }}</span>
      </div>
      <span class="pill soft-green"
        ><UIcon name="i-lucide-heart" />{{
          say('Your pace, your progress', 'ก้าวในจังหวะของคุณ')
        }}</span
      >
    </div>
    <div class="dashboard-top">
      <section class="panel calorie-panel">
        <div class="section-heading">
          <h2>
            <UIcon name="i-lucide-flame" />{{
              say("Today's nourishment", 'พลังงานวันนี้')
            }}
          </h2>
          <span class="pill">{{ say('Daily overview', 'ภาพรวมรายวัน') }}</span>
        </div>
        <div class="calorie-content">
          <CalorieRing
            :consumed="store.consumed"
            :target="store.target ?? 1750"
          />
          <div class="calorie-details">
            <div class="calorie-numbers">
              <div>
                <span>{{ say('Consumed', 'กินแล้ว') }}</span
                ><strong
                  >{{ store.consumed.toLocaleString() }}
                  <small>kcal</small></strong
                >
              </div>
              <div>
                <span>{{ say('Daily target', 'เป้าหมายรายวัน') }}</span
                ><strong
                  >{{ (store.target ?? 1750).toLocaleString() }}
                  <small>kcal</small></strong
                >
              </div>
            </div>
            <div class="meal-summary">
              <div v-for="(type, index) in mealTypes" :key="type">
                <span
                  ><UIcon :name="mealIcons[index]" />{{
                    t(`meal.${type}`)
                  }}</span
                ><strong
                  >{{
                    todayMeals
                      .filter((m) => m.type === type)
                      .reduce((s, m) => s + mealCalories(m), 0)
                  }}
                  <small>kcal</small></strong
                >
              </div>
            </div>
          </div>
        </div>
        <p class="panel-footnote">
          <UIcon name="i-lucide-info" />{{
            say(
              'A helpful estimate, not a number to be perfect about.',
              'ตัวเลขประมาณการ ไม่จำเป็นต้องตรงเป๊ะ',
            )
          }}
        </p>
      </section>
      <section class="panel water-panel">
        <div class="section-heading">
          <h2>
            <UIcon name="i-lucide-droplets" />{{
              say('Stay hydrated', 'เติมน้ำให้ร่างกาย')
            }}
          </h2>
          <span class="tiny-label">{{ say('TODAY', 'วันนี้') }}</span>
        </div>
        <div class="water-visual">
          <div class="water-glass">
            <div
              class="water-fill"
              :style="{
                height: `${Math.min(100, (store.waterToday / (store.nutrition?.waterTarget ?? 2000)) * 100)}%`,
              }"
            />
            <UIcon name="i-lucide-droplet" />
          </div>
          <div>
            <strong
              >{{ store.waterToday.toLocaleString() }}<small>ml</small></strong
            >
            <p>
              {{ say('of', 'จาก') }}
              {{ store.nutrition?.waterTarget.toLocaleString() }} ml
            </p>
            <span class="pill blue"
              >{{
                Math.round(
                  (store.waterToday / (store.nutrition?.waterTarget ?? 2000)) *
                    100,
                )
              }}% {{ say('of your goal', 'ของเป้าหมาย') }}</span
            >
          </div>
        </div>
        <div class="water-buttons">
          <button
            v-for="amount in [150, 250, 500]"
            :key="amount"
            :disabled="store.busy"
            @click="store.addWater(amount)"
          >
            <UIcon name="i-lucide-plus" />{{ amount }} ml
          </button>
        </div>
        <button class="text-button water-custom" @click="log?.show('water')">
          {{ say('Add a custom amount', 'เพิ่มปริมาณเอง')
          }}<UIcon name="i-lucide-arrow-right" />
        </button>
      </section>
    </div>
    <section class="quick-actions">
      <button @click="navigateTo('/foods')">
        <span class="action-icon sage"><UIcon name="i-lucide-search" /></span
        ><span
          >{{ say('Check a food', 'เช็กอาหาร')
          }}<small>{{
            say('Find your balance', 'เลือกให้เหมาะกับคุณ')
          }}</small></span
        ><UIcon name="i-lucide-chevron-right" /></button
      ><button @click="log?.show('weight')">
        <span class="action-icon sand"><UIcon name="i-lucide-scale" /></span
        ><span
          >{{ say('Log weight', 'บันทึกน้ำหนัก')
          }}<small>{{
            say('See the bigger picture', 'มองภาพรวมระยะยาว')
          }}</small></span
        ><UIcon name="i-lucide-chevron-right" /></button
      ><button @click="log?.show('symptom')">
        <span class="action-icon rose"
          ><UIcon name="i-lucide-heart-pulse" /></span
        ><span
          >{{ say('Track a symptom', 'บันทึกอาการ')
          }}<small>{{
            say('Listen to your body', 'ฟังร่างกายของคุณ')
          }}</small></span
        ><UIcon name="i-lucide-chevron-right" /></button
      ><NuxtLink to="/rules"
        ><span class="action-icon lavender"
          ><UIcon name="i-lucide-book-open" /></span
        ><span
          >{{ say('Food rulebook', 'แนวทางการกิน')
          }}<small>{{
            say('A little guidance', 'คำแนะนำเล็กน้อย')
          }}</small></span
        ><UIcon name="i-lucide-chevron-right"
      /></NuxtLink>
    </section>
    <div class="dashboard-bottom">
      <section class="panel checklist-panel">
        <div class="section-heading">
          <h2>
            <UIcon name="i-lucide-circle-check" />{{
              say('Little wins for today', 'สิ่งดีๆ ในวันนี้')
            }}
          </h2>
          <span class="completion-label">{{ completed.length }} / 7</span>
        </div>
        <p class="section-description">
          {{
            say(
              'Simple habits that add up. Check in, without the pressure.',
              'นิสัยเล็กๆ ที่สะสมเป็นผลดี เช็กตัวเองโดยไม่กดดัน',
            )
          }}
        </p>
        <div class="checklist-progress">
          <span :style="{ width: `${(completed.length / 7) * 100}%` }" />
        </div>
        <label
          v-for="(text, index) in checks"
          :key="index"
          class="check-row"
          :class="{ checked: completed.includes(index) }"
          ><input
            type="checkbox"
            :checked="completed.includes(index)"
            :disabled="store.busy"
            @change="store.toggleChecklist(index)" ><span>{{ text }}</span
          ><UIcon v-if="completed.includes(index)" name="i-lucide-check"
        /></label>
        <p class="gentle-note">
          <UIcon name="i-lucide-heart" />{{
            say(
              'Some is better than none. Tomorrow is a fresh start.',
              'ทำได้บางข้อก็ดีแล้ว พรุ่งนี้เริ่มใหม่ได้เสมอ',
            )
          }}
        </p>
      </section>
      <section class="panel suggestions-panel">
        <div class="section-heading">
          <h2>
            <UIcon name="i-lucide-utensils" />{{
              say('A little meal inspiration', 'ไอเดียมื้ออาหาร')
            }}
          </h2>
          <NuxtLink to="/foods" class="text-button"
            >{{ say('Explore all', 'ดูทั้งหมด')
            }}<UIcon name="i-lucide-arrow-right"
          /></NuxtLink>
        </div>
        <p class="section-description">
          {{
            say(
              'Comforting choices, with your goals in mind.',
              'อาหารสบายๆ ที่เข้ากับเป้าหมายของคุณ',
            )
          }}
        </p>
        <NuxtLink
          v-for="food in suggestions"
          :key="food.id"
          :to="`/foods?food=${food.id}`"
          class="suggestion-row"
          ><span class="food-illustration" :class="food.slug"
            ><UIcon :name="food.icon"
          /></span>
          <div>
            <h3>{{ foodName(food) }}</h3>
            <p>{{ food.nameTh }}</p>
            <span class="mini-tag"
              ><i />{{ say('Generally suitable', 'โดยทั่วไปเหมาะสม') }}</span
            >
          </div>
          <div class="suggestion-calories">
            <strong>~{{ food.calories }}</strong
            ><span>kcal</span><UIcon name="i-lucide-arrow-up-right" /></div
        ></NuxtLink>
        <div class="food-tip">
          <UIcon name="i-lucide-lightbulb" />
          <p>
            {{
              say(
                'Make it yours. Less oil, a comfortable portion, and your favorite vegetables go a long way.',
                'ปรับให้เหมาะกับคุณ ลดน้ำมัน กินพอดี และเพิ่มผักที่ชอบ',
              )
            }}
          </p>
        </div>
      </section>
    </div>
    <LogDialog ref="log" />
  </div>
</template>
