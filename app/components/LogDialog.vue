<script setup lang="ts">
import { getDatabase } from '~/features/storage/database'
import { stamp, localTime, symptomSchema } from '~/features/storage/models'
const { store, say } = useFoodie()
const { t } = useI18n()
const kind = ref<'weight' | 'water' | 'symptom'>('weight')
const open = ref(false)
const date = ref(store.today)
const amount = ref(250)
const weight = ref(store.profile?.weight ?? 78.3)
const symptom = ref('heartburn')
const severity = ref(3)
const time = ref(localTime())
const mealId = ref('')
const notes = ref('')
const possibleTriggers = ref('')
const error = ref('')
function show(value: typeof kind.value) {
  kind.value = value
  date.value = store.today
  time.value = localTime()
  error.value = ''
  open.value = true
}
defineExpose({ show })
async function save() {
  error.value = ''
  if (!date.value) {
    error.value = say('Choose a date.', 'เลือกวันที่')
    return
  }
  let ok = false
  if (kind.value === 'weight')
    ok = await store.saveWeight(Number(weight.value), date.value)
  else if (kind.value === 'water')
    ok = await store.addWater(Number(amount.value), date.value)
  else
    ok = await store.mutate(() =>
      getDatabase().symptoms.add(
        symptomSchema.parse({
          ...stamp(),
          date: date.value,
          time: time.value,
          type: symptom.value,
          severity: Number(severity.value),
          mealId: mealId.value || null,
          notes: notes.value,
          triggers: possibleTriggers.value
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      ),
    )
  if (ok) open.value = false
  else error.value = store.error
}
</script>
<template>
  <UModal
    v-model:open="open"
    :title="
      kind === 'weight'
        ? say('Log your weight', 'บันทึกน้ำหนัก')
        : kind === 'water'
          ? say('A little hydration', 'บันทึกน้ำดื่ม')
          : say('How are you feeling?', 'วันนี้รู้สึกอย่างไร?')
    "
    :description="
      say(
        'A small check-in for your personal journey.',
        'บันทึกเล็กๆ สำหรับการดูแลตัวเอง',
      )
    "
  >
    <template #body
      ><form id="log-form" class="form-stack" @submit.prevent="save">
        <label
          >{{ say('Date', 'วันที่')
          }}<UInput v-model="date" type="date" required /></label
        ><label v-if="kind === 'weight'"
          >{{ say('Weight (kg)', 'น้ำหนัก (กก.)')
          }}<UInput
            v-model="weight"
            type="number"
            min="30"
            max="300"
            step="0.1"
            required /></label
        ><label v-if="kind === 'water'"
          >{{ say('Water (ml)', 'น้ำ (มล.)')
          }}<UInput
            v-model="amount"
            type="number"
            min="1"
            max="2000"
            required /></label
        ><template v-if="kind === 'symptom'"
          ><label
            >{{ say('Symptom', 'อาการ')
            }}<select v-model="symptom">
              <option
                v-for="s in [
                  'burping',
                  'bloating',
                  'throat',
                  'heartburn',
                  'regurgitation',
                  'nausea',
                ]"
                :key="s"
                :value="s"
              >
                {{
                  say(
                    {
                      burping: 'Burping',
                      bloating: 'Bloating',
                      throat: 'Throat pressure',
                      heartburn: 'Heartburn',
                      regurgitation: 'Acid regurgitation',
                      nausea: 'Nausea',
                    }[s] ?? s,
                    {
                      burping: 'เรอ',
                      bloating: 'ท้องอืด',
                      throat: 'แน่นคอ',
                      heartburn: 'แสบร้อนกลางอก',
                      regurgitation: 'กรดไหลย้อน',
                      nausea: 'คลื่นไส้',
                    }[s] ?? s,
                  )
                }}
              </option>
            </select></label
          ><label
            >{{ say('Severity', 'ความรุนแรง') }}: {{ severity }} / 10<input
              v-model="severity"
              type="range"
              min="0"
              max="10" ></label
          ><label
            >{{ say('Time', 'เวลา')
            }}<UInput v-model="time" type="time" required /></label
          ><label
            >{{
              say(
                'Associated meal (optional)',
                'มื้ออาหารที่เกี่ยวข้อง (ถ้าทราบ)',
              )
            }}<select v-model="mealId">
              <option value="">{{ say('Not sure', 'ไม่แน่ใจ') }}</option>
              <option
                v-for="m in store.meals.filter((m) => m.date === date)"
                :key="m.id"
                :value="m.id"
              >
                {{ t(`meal.${m.type}`) }} -
                {{ m.foods.map((f) => f.name).join(', ') }}
              </option>
            </select></label
          ><label
            >{{
              say(
                'Possible triggers, separated by commas',
                'สิ่งที่อาจกระตุ้น คั่นด้วยเครื่องหมายจุลภาค',
              )
            }}<UInput v-model="possibleTriggers" /></label
          ><label
            >{{ say('Notes', 'หมายเหตุ')
            }}<UTextarea v-model="notes" maxlength="2000" /></label
        ></template>
        <p v-if="error" class="form-error" role="alert">{{ error }}</p>
      </form></template
    ><template #footer
      ><UButton color="neutral" variant="ghost" @click="open = false">{{
        t('common.cancel')
      }}</UButton
      ><UButton type="submit" form="log-form" :loading="store.busy">{{
        t('common.save')
      }}</UButton></template
    >
  </UModal>
</template>
