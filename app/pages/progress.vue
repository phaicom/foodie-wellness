<script setup lang="ts">
import LogDialog from '~/components/LogDialog.vue'
import { dailyCalories, movingAverage } from '~/features/nutrition/calculations'
import { getDatabase } from '~/features/storage/database'
import { localDate } from '~/features/storage/models'
const { store, say, formatDate } = useFoodie()
const { t } = useI18n()
const log = ref<InstanceType<typeof LogDialog> | null>(null)
const period = ref(14)
const dates = computed(() =>
  Array.from({ length: period.value }, (_, i) => {
    const d = new Date(`${store.today}T12:00:00`)
    d.setDate(d.getDate() - period.value + 1 + i)
    return localDate(d)
  }),
)
const labels = computed(() =>
  dates.value.map((d) => formatDate(d, { month: 'short', day: 'numeric' })),
)
const weightValues = computed(() =>
  dates.value.map(
    (d) => store.weights.find((w) => w.date === d)?.weight ?? null,
  ),
)
const weightAverages = computed(() =>
  dates.value.map((d) => movingAverage(store.weights, d)),
)
const calories = computed(() =>
  dates.value.map((d) =>
    store.meals.some((m) => m.date === d)
      ? dailyCalories(store.meals, d)
      : null,
  ),
)
const waterValues = computed(() =>
  dates.value.map((d) =>
    store.waters.some((w) => w.date === d)
      ? store.waters
          .filter((w) => w.date === d)
          .reduce((s, w) => s + w.amount, 0)
      : null,
  ),
)
const symptomValues = computed(() =>
  dates.value.map((d) => {
    const entries = store.symptoms.filter((s) => s.date === d)
    return entries.length
      ? Math.round(
          (entries.reduce((s, e) => s + e.severity, 0) / entries.length) * 10,
        ) / 10
      : null
  }),
)
const weekChange = computed(() => {
  const latest = movingAverage(store.weights, store.today)
  const prior = new Date(`${store.today}T12:00:00`)
  prior.setDate(prior.getDate() - 7)
  const old = movingAverage(store.weights, localDate(prior))
  return latest !== null && old !== null
    ? Math.round((latest - old) * 10) / 10
    : null
})
const relations = computed(() => {
  const counts = new Map<string, { name: string; count: number }>()
  for (const symptom of store.symptoms) {
    const meal = store.meals.find((m) => m.id === symptom.mealId)
    for (const food of meal?.foods ?? []) {
      const existing = counts.get(food.foodId) ?? { name: food.name, count: 0 }
      existing.count++
      counts.set(food.foodId, existing)
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 5)
})
const symptomNames = computed(() => ({
  burping: say('Burping', 'เรอ'),
  bloating: say('Bloating', 'ท้องอืด'),
  throat: say('Throat pressure', 'แน่นคอ'),
  heartburn: say('Heartburn', 'แสบร้อนกลางอก'),
  regurgitation: say('Acid regurgitation', 'กรดไหลย้อน'),
  nausea: say('Nausea', 'คลื่นไส้'),
}))
</script>
<template>
  <div>
    <PageHeading
      :eyebrow="say('THE BIGGER PICTURE', 'มองภาพรวม')"
      :title="
        say('Slow progress is still progress.', 'ค่อยๆ ก้าว ก็คือความก้าวหน้า')
      "
      :subtitle="
        say(
          'Look for patterns, not perfection. Your journey is more than a number.',
          'มองหาแนวโน้ม ไม่ใช่ความสมบูรณ์แบบ คุณมีค่ามากกว่าตัวเลข',
        )
      "
      ><select
        v-model="period"
        :aria-label="say('Chart period', 'ช่วงเวลาของกราฟ')"
      >
        <option :value="7">{{ say('Last 7 days', '7 วันล่าสุด') }}</option>
        <option :value="14">{{ say('Last 14 days', '14 วันล่าสุด') }}</option>
        <option :value="30">
          {{ say('Last 30 days', '30 วันล่าสุด') }}
        </option></select
      ><button class="primary-button" @click="log?.show('weight')">
        <UIcon name="i-lucide-plus" />{{ say('Log weight', 'บันทึกน้ำหนัก') }}
      </button></PageHeading
    >
    <div class="stat-grid">
      <section class="panel stat-card">
        <span>{{ say('Current weight', 'น้ำหนักปัจจุบัน') }}</span
        ><strong>{{ store.profile?.weight }}<small>kg</small></strong>
        <p>
          {{ say('Starting at', 'เริ่มต้นที่') }}
          {{ store.profile?.startingWeight }} kg
        </p>
      </section>
      <section class="panel stat-card">
        <span>{{ say('7-day moving average', 'เฉลี่ยเคลื่อนที่ 7 วัน') }}</span
        ><strong
          >{{ movingAverage(store.weights, store.today) ?? '--'
          }}<small>kg</small></strong
        >
        <p>{{ say('Smooth out daily fluctuations', 'ลดความผันผวนรายวัน') }}</p>
      </section>
      <section class="panel stat-card">
        <span>{{
          say('Weekly average change', 'การเปลี่ยนแปลงเฉลี่ยรายสัปดาห์')
        }}</span
        ><strong
          >{{
            weekChange !== null
              ? `${weekChange > 0 ? '+' : ''}${weekChange}`
              : '--'
          }}<small>kg</small></strong
        >
        <p>
          {{
            weekChange !== null && weekChange < -1
              ? say(
                  'A fast change: review your plan gently.',
                  'ลดเร็ว ลองทบทวนแผนอย่างค่อยเป็นค่อยไป',
                )
              : say('Gentle, sustainable steps', 'ก้าวอย่างค่อยเป็นค่อยไป')
          }}
        </p>
      </section>
      <section class="panel stat-card">
        <span>{{ say('Your weight goal', 'เป้าหมายน้ำหนัก') }}</span
        ><strong>{{ store.profile?.targetWeight }}<small>kg</small></strong
        ><NuxtLink to="/settings" class="text-button"
          >{{ say('Adjust my goal', 'ปรับเป้าหมาย')
          }}<UIcon name="i-lucide-arrow-right"
        /></NuxtLink>
      </section>
    </div>
    <div class="chart-grid">
      <section class="panel">
        <div class="section-heading">
          <h2>
            <UIcon name="i-lucide-scale" />{{
              say('Weight, over time', 'น้ำหนักตามเวลา')
            }}
          </h2>
          <span class="pill">kg</span>
        </div>
        <TrendChart
          v-if="store.weights.length"
          :labels="labels"
          :values="weightValues"
          :average="weightAverages"
          :label="say('Weight', 'น้ำหนัก')"
          :average-label="say('7-day average', 'เฉลี่ย 7 วัน')"
        />
        <div v-else class="empty-state compact">
          <UIcon name="i-lucide-scale" />
          <p>
            {{
              say(
                'Your first check-in starts the story.',
                'บันทึกครั้งแรกเพื่อเริ่มดูแนวโน้ม',
              )
            }}
          </p>
          <button class="text-button" @click="log?.show('weight')">
            {{ say('Log your weight', 'บันทึกน้ำหนัก') }}
          </button>
        </div>
      </section>
      <section class="panel">
        <div class="section-heading">
          <h2>
            <UIcon name="i-lucide-flame" />{{
              say('Estimated calorie intake', 'พลังงานที่กินโดยประมาณ')
            }}
          </h2>
          <span class="pill">kcal</span>
        </div>
        <TrendChart
          :labels="labels"
          :values="calories"
          :label="say('Estimated calories', 'แคลอรีประมาณ')"
          color="#c29e6a"
        />
      </section>
      <section class="panel">
        <div class="section-heading">
          <h2>
            <UIcon name="i-lucide-droplets" />{{
              say('Hydration history', 'ประวัติน้ำดื่ม')
            }}
          </h2>
          <button class="text-button" @click="log?.show('water')">
            {{ say('Log water', 'บันทึกน้ำ') }}<UIcon name="i-lucide-plus" />
          </button>
        </div>
        <TrendChart
          :labels="labels"
          :values="waterValues"
          :label="say('Water (ml)', 'น้ำ (มล.)')"
          color="#7da2b4"
        />
      </section>
      <section class="panel">
        <div class="section-heading">
          <h2>
            <UIcon name="i-lucide-heart-pulse" />{{
              say('Reflux symptom trend', 'แนวโน้มอาการกรดไหลย้อน')
            }}
          </h2>
          <button class="text-button" @click="log?.show('symptom')">
            {{ say('Check in', 'บันทึกอาการ') }}<UIcon name="i-lucide-plus" />
          </button>
        </div>
        <TrendChart
          :labels="labels"
          :values="symptomValues"
          :label="say('Average severity (0-10)', 'ความรุนแรงเฉลี่ย (0-10)')"
          color="#ba9390"
        />
        <p class="panel-footnote">
          {{
            say(
              'An empty day means no record, not zero symptoms.',
              'วันที่ว่างคือไม่มีบันทึก ไม่ใช่ไม่มีอาการ',
            )
          }}
        </p>
      </section>
    </div>
    <div class="chart-grid history-grid">
      <section class="panel">
        <div class="section-heading">
          <h2>{{ say('Recent check-ins', 'บันทึกล่าสุด') }}</h2>
        </div>
        <div
          v-for="weight in [...store.weights]
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 10)"
          :key="weight.id"
          class="history-row"
        >
          <div>
            <strong>{{ weight.weight }} kg</strong
            ><small>{{
              formatDate(weight.date, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            }}</small>
          </div>
          <button
            class="icon-button"
            :aria-label="t('common.delete')"
            @click="store.mutate(() => getDatabase().weights.delete(weight.id))"
          >
            <UIcon name="i-lucide-trash-2" />
          </button>
        </div>
        <p v-if="!store.weights.length" class="muted">
          {{ say('Nothing logged yet.', 'ยังไม่มีบันทึก') }}
        </p>
        <details>
          <summary>{{ say('Water history', 'ประวัติน้ำดื่ม') }}</summary>
          <div
            v-for="water in [...store.waters].reverse().slice(0, 20)"
            :key="water.id"
            class="history-row"
          >
            <div>
              <strong>{{ water.amount }} ml</strong
              ><small>{{ water.date }}</small>
            </div>
            <button
              class="icon-button"
              :aria-label="t('common.delete')"
              @click="store.mutate(() => getDatabase().waters.delete(water.id))"
            >
              <UIcon name="i-lucide-trash-2" />
            </button>
          </div>
        </details>
      </section>
      <section class="panel">
        <div class="section-heading">
          <h2>{{ say('Listen to your body', 'ฟังร่างกายของคุณ') }}</h2>
        </div>
        <div
          v-for="symptom in [...store.symptoms]
            .sort((a, b) =>
              `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`),
            )
            .slice(0, 10)"
          :key="symptom.id"
          class="history-row"
        >
          <div>
            <strong
              >{{ symptomNames[symptom.type] }} |
              {{ symptom.severity }}/10</strong
            ><small
              >{{ symptom.date }} {{ symptom.time
              }}<template v-if="symptom.triggers.length">
                | {{ symptom.triggers.join(', ') }}</template
              ></small
            >
            <p v-if="symptom.notes">{{ symptom.notes }}</p>
          </div>
          <button
            class="icon-button"
            :aria-label="t('common.delete')"
            @click="
              store.mutate(() => getDatabase().symptoms.delete(symptom.id))
            "
          >
            <UIcon name="i-lucide-trash-2" />
          </button>
        </div>
        <p v-if="!store.symptoms.length" class="muted">
          {{
            say(
              'Record a symptom to start noticing patterns.',
              'บันทึกอาการเพื่อเริ่มสังเกตแนวโน้ม',
            )
          }}
        </p>
        <div v-if="relations.length" class="relation-note">
          <h3>
            {{
              say(
                'Meals linked in your records',
                'อาหารที่เชื่อมกับบันทึกอาการ',
              )
            }}
          </h3>
          <p v-for="r in relations" :key="r.name">
            {{ r.name }} | {{ r.count }}
            {{ say('linked records', 'บันทึกที่เชื่อมโยง') }}
          </p>
        </div>
        <p class="panel-footnote">
          {{
            say(
              'These are possible relationships. A linked meal does not prove a food caused reflux.',
              'นี่เป็นเพียงความสัมพันธ์ที่เป็นไปได้ ไม่ได้พิสูจน์ว่าอาหารเป็นสาเหตุ',
            )
          }}
        </p>
      </section>
    </div>
    <LogDialog ref="log" />
  </div>
</template>
