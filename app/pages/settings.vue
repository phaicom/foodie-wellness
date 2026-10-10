<script setup lang="ts">
import { bmr, tdee, calorieTarget } from '~/features/nutrition/calculations'
import { getDatabase } from '~/features/storage/database'
import {
  profileSchema,
  nutritionSchema,
  triggerSchema,
  stamp,
} from '~/features/storage/models'
const { store, say } = useFoodie()
const { t, setLocale } = useI18n()
const profile = reactive({ ...store.profile! })
const nutrition = reactive({ ...store.nutrition! })
const manual = ref(nutrition.manualTarget !== null)
const trigger = ref('')
const message = ref('')
const error = ref('')
const deleteOpen = ref(false)
const confirmation = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const calculated = computed(() =>
  calorieTarget(profile, { ...nutrition, manualTarget: null }),
)
async function save() {
  error.value = ''
  message.value = ''
  try {
    const p = profileSchema.parse({
      ...profile,
      updatedAt: new Date().toISOString(),
    })
    const n = nutritionSchema.parse({
      ...nutrition,
      manualTarget: manual.value ? Number(nutrition.manualTarget) : null,
      updatedAt: new Date().toISOString(),
    })
    if (!manual.value && !p.sex) {
      error.value = say(
        'Select the formula input before using a calculated target.',
        'เลือกข้อมูลสำหรับสูตรก่อนใช้เป้าหมายคำนวณ',
      )
      return
    }
    const ok = await store.mutate(() =>
      getDatabase().transaction(
        'rw',
        [getDatabase().profile, getDatabase().nutrition],
        async () => {
          await getDatabase().profile.put(p)
          await getDatabase().nutrition.put(n)
        },
      ),
    )
    if (ok) {
      await setLocale(p.language)
      message.value = say('Your preferences are saved.', 'บันทึกการตั้งค่าแล้ว')
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Check your settings.'
  }
}
async function addTrigger() {
  if (!trigger.value.trim()) return
  const name = trigger.value.trim()
  if (store.triggers.some((t) => t.name.toLowerCase() === name.toLowerCase()))
    return
  if (
    await store.mutate(() =>
      getDatabase().triggers.add(triggerSchema.parse({ ...stamp(), name })),
    )
  )
    trigger.value = ''
}
async function exportData() {
  const data = await getDatabase().exportData()
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `foodie-backup-${store.today}.json`
  a.click()
  URL.revokeObjectURL(url)
  message.value = say(
    'Backup downloaded. Keep it somewhere private.',
    'ดาวน์โหลดสำรองแล้ว เก็บไว้ในที่ส่วนตัว',
  )
}
async function importData(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  error.value = ''
  try {
    if (file.size > 20 * 1024 * 1024)
      throw new Error(
        say('Please use a backup smaller than 20 MB.', 'ใช้ไฟล์เล็กกว่า 20 MB'),
      )
    const data: unknown = JSON.parse(await file.text())
    if (await store.mutate(() => getDatabase().importData(data))) {
      Object.assign(profile, store.profile)
      Object.assign(nutrition, store.nutrition)
      manual.value = nutrition.manualTarget !== null
      await setLocale(profile.language)
      message.value = say(
        'Backup merged. Existing IDs are not duplicated.',
        'รวมข้อมูลสำรองแล้ว ไม่สร้างรายการซ้ำจากรหัสเดิม',
      )
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Invalid backup.'
  } finally {
    input.value = ''
  }
}
function requestReset() {
  deleteOpen.value = true
  confirmation.value = ''
}
async function clearData() {
  if (confirmation.value !== 'DELETE') return
  const ok = await store.mutate(async () => {
    const db = getDatabase()
    await db.transaction('rw', db.tables, async () => {
      for (const table of db.tables) await table.clear()
    })
    await db.initialize()
  })
  if (ok) {
    Object.assign(profile, store.profile)
    Object.assign(nutrition, store.nutrition)
    manual.value = true
    await setLocale(profile.language)
    deleteOpen.value = false
    message.value = say('Your space has been reset.', 'ล้างข้อมูลแล้ว')
  }
}
</script>
<template>
  <div>
    <PageHeading
      :eyebrow="say('MAKE IT YOURS', 'ปรับให้เป็นคุณ')"
      :title="
        say('Your space. Your preferences.', 'พื้นที่ของคุณ ในแบบที่คุณชอบ')
      "
      :subtitle="
        say(
          'A plan that fits your body, your routine, and your life.',
          'แผนที่เข้ากับร่างกาย กิจวัตร และชีวิตของคุณ',
        )
      "
    />
    <p v-if="message" class="notice-banner" role="status">{{ message }}</p>
    <p v-if="error" class="error-banner" role="alert">{{ error }}</p>
    <form class="settings-grid" @submit.prevent="save">
      <section class="panel">
        <div class="section-heading">
          <h2>
            <UIcon name="i-lucide-user-round" />{{
              say('About you', 'เกี่ยวกับคุณ')
            }}
          </h2>
        </div>
        <div class="form-stack">
          <label
            >{{ say('Journey name', 'ชื่อการดูแลสุขภาพ')
            }}<UInput v-model="profile.name" maxlength="80" required
          /></label>
          <div class="form-grid">
            <label
              >{{ say('Age', 'อายุ')
              }}<UInput
                v-model.number="profile.age"
                type="number"
                min="18"
                max="100"
                required /></label
            ><label
              >{{ say('Height (cm)', 'ส่วนสูง (ซม.)')
              }}<UInput
                v-model.number="profile.height"
                type="number"
                min="100"
                max="250"
                required
            /></label>
          </div>
          <div class="form-grid">
            <label
              >{{ say('Current weight (kg)', 'น้ำหนักปัจจุบัน (กก.)')
              }}<UInput
                v-model.number="profile.weight"
                type="number"
                min="30"
                max="300"
                step="0.1"
                required /></label
            ><label
              >{{ say('Target weight (kg)', 'น้ำหนักเป้าหมาย (กก.)')
              }}<UInput
                v-model.number="profile.targetWeight"
                type="number"
                min="30"
                max="300"
                step="0.1"
                required
            /></label>
          </div>
          <label
            >{{
              say(
                'Mifflin-St Jeor formula input',
                'ข้อมูลสำหรับสูตร Mifflin-St Jeor',
              )
            }}<select v-model="profile.sex">
              <option :value="null">
                {{
                  say(
                    'Choose to calculate estimates',
                    'เลือกเพื่อคำนวณประมาณการ',
                  )
                }}
              </option>
              <option value="female">
                {{ say('Female formula', 'สูตรเพศหญิง') }}
              </option>
              <option value="male">
                {{ say('Male formula', 'สูตรเพศชาย') }}
              </option></select
            ><small>{{
              say(
                'The equation requires this input. We do not assume it.',
                'สูตรต้องใช้ข้อมูลนี้ เราจะไม่สมมติให้คุณ',
              )
            }}</small></label
          ><label
            >{{ say('Activity level', 'ระดับกิจกรรม')
            }}<select v-model="profile.activity">
              <option value="sedentary">
                {{ say('Sedentary - mostly sitting', 'นั่งเป็นส่วนใหญ่') }}
              </option>
              <option value="light">
                {{ say('Light - some movement', 'กิจกรรมเบา') }}
              </option>
              <option value="moderate">
                {{ say('Moderate - regular activity', 'กิจกรรมปานกลาง') }}
              </option>
              <option value="active">
                {{ say('Active - frequent exercise', 'ออกกำลังบ่อย') }}
              </option>
            </select></label
          >
          <div class="goal-tags">
            <span class="pill soft-green">{{
              say('Gradual weight loss', 'ลดน้ำหนักค่อยๆ')
            }}</span
            ><span class="pill soft-green">{{
              say('GERD-aware', 'ใส่ใจกรดไหลย้อน')
            }}</span
            ><span class="pill soft-green">{{
              say('Lower purine', 'พิวรีนต่ำ')
            }}</span>
          </div>
        </div>
      </section>
      <section class="panel">
        <div class="section-heading">
          <h2>
            <UIcon name="i-lucide-sliders-horizontal" />{{
              say('Your daily targets', 'เป้าหมายรายวัน')
            }}
          </h2>
        </div>
        <div class="form-stack">
          <div class="estimate-grid">
            <div>
              <span>{{ say('Estimated BMR', 'BMR ประมาณ') }}</span
              ><strong>{{ bmr(profile) ?? '--' }}<small>kcal</small></strong>
            </div>
            <div>
              <span>{{ say('Estimated TDEE', 'TDEE ประมาณ') }}</span
              ><strong>{{ tdee(profile) ?? '--' }}<small>kcal</small></strong>
            </div>
          </div>
          <label
            >{{ say('Moderate calorie deficit', 'พลังงานที่ลดอย่างพอดี')
            }}<UInput
              v-model.number="nutrition.deficit"
              type="number"
              min="0"
              max="500"
              required
            /><small>{{
              say(
                '0-500 kcal. Start gently; adjust to your needs.',
                '0-500 กิโลแคลอรี เริ่มเบาๆ และปรับตามความต้องการ',
              )
            }}</small></label
          ><label class="check-row"
            ><input v-model="manual" type="checkbox" ><span>{{
              say('Set my own calorie target', 'กำหนดแคลอรีเอง')
            }}</span></label
          ><label v-if="manual"
            >{{ say('Daily calorie target (kcal)', 'แคลอรีเป้าหมายรายวัน')
            }}<UInput
              v-model.number="nutrition.manualTarget"
              type="number"
              min="1200"
              max="5000"
              required
          /></label>
          <div v-else class="estimated-total">
            <span>{{
              say('Estimated daily target', 'เป้าหมายรายวันประมาณ')
            }}</span
            ><strong>{{ calculated ?? '--' }} kcal</strong>
          </div>
          <label
            >{{ say('Daily water goal (ml)', 'เป้าหมายน้ำรายวัน (มล.)')
            }}<UInput
              v-model.number="nutrition.waterTarget"
              type="number"
              min="500"
              max="4000"
              required
            /><small>{{
              say(
                'Adjust for your needs. There is no need to force extra water.',
                'ปรับตามความต้องการ ไม่ต้องฝืนดื่มน้ำเพิ่ม',
              )
            }}</small></label
          >
          <p class="gentle-note">
            {{
              say(
                'Aim for gradual change. Formula estimates are a starting point, not a prescription. No target date or rapid-loss reward.',
                'เปลี่ยนอย่างค่อยเป็นค่อยไป สูตรเป็นจุดเริ่มต้น ไม่ใช่คำสั่ง ไม่มีเส้นตายหรือรางวัลลดเร็ว',
              )
            }}
          </p>
        </div>
      </section>
      <section class="panel">
        <div class="section-heading">
          <h2>
            <UIcon name="i-lucide-palette" />{{
              say('Feel at home', 'ปรับหน้าตา')
            }}
          </h2>
        </div>
        <div class="form-stack">
          <label
            >{{ say('Language', 'ภาษา')
            }}<select v-model="profile.language">
              <option value="en">English</option>
              <option value="th">ไทย</option>
            </select></label
          ><label
            >{{ say('Appearance', 'ธีม')
            }}<select v-model="profile.theme">
              <option value="light">{{ say('Light', 'สว่าง') }}</option>
              <option value="dark">{{ say('Dark', 'มืด') }}</option>
              <option value="system">
                {{ say('Follow my device', 'ตามอุปกรณ์') }}
              </option>
            </select></label
          >
        </div>
      </section>
      <section class="panel">
        <div class="section-heading">
          <h2>
            <UIcon name="i-lucide-heart-pulse" />{{
              say('My known reflux triggers', 'สิ่งที่ฉันรู้ว่ากระตุ้นอาการ')
            }}
          </h2>
        </div>
        <p class="section-description">
          {{
            say(
              'Only add what you have noticed. No need to ban every possible trigger.',
              'เพิ่มเฉพาะสิ่งที่คุณสังเกต ไม่ต้องห้ามทุกสิ่งที่อาจกระตุ้น',
            )
          }}
        </p>
        <div class="trigger-input">
          <UInput
            v-model="trigger"
            maxlength="100"
            :placeholder="say('e.g. spicy sauce', 'เช่น ซอสเผ็ด')"
            :aria-label="say('New trigger', 'สิ่งกระตุ้นใหม่')"
            @keydown.enter.prevent="addTrigger"
          /><UButton type="button" @click="addTrigger">{{
            t('common.add')
          }}</UButton>
        </div>
        <div class="filter-chips">
          <button
            v-for="item in store.triggers"
            :key="item.id"
            type="button"
            @click="store.mutate(() => getDatabase().triggers.delete(item.id))"
          >
            {{ item.name }}<UIcon name="i-lucide-x" />
          </button>
        </div>
      </section>
      <div class="settings-save">
        <UButton
          type="submit"
          size="lg"
          icon="i-lucide-check"
          :loading="store.busy"
          >{{ say('Save my preferences', 'บันทึกการตั้งค่า') }}</UButton
        >
      </div>
    </form>
    <section class="panel data-panel">
      <div class="section-heading">
        <h2>
          <UIcon name="i-lucide-shield-check" />{{
            say('Your data belongs to you.', 'ข้อมูลนี้เป็นของคุณ')
          }}
        </h2>
        <span class="pill">v1.0.0</span>
      </div>
      <p>
        {{
          say(
            "Everything stays in this browser's IndexedDB. No account, no analytics, no health-data uploads. Back up before changing devices or clearing browser storage.",
            'ทุกอย่างอยู่ใน IndexedDB ของเบราว์เซอร์นี้ ไม่มีบัญชี ไม่มีวิเคราะห์หรืออัปโหลดข้อมูลสุขภาพ สำรองก่อนย้ายอุปกรณ์หรือล้างเบราว์เซอร์',
          )
        }}
      </p>
      <div class="data-actions">
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-download"
          @click="exportData"
          >{{ say('Export JSON backup', 'ส่งออก JSON') }}</UButton
        ><UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-upload"
          @click="fileInput?.click()"
          >{{ say('Import JSON backup', 'นำเข้า JSON') }}</UButton
        ><input
          ref="fileInput"
          type="file"
          accept="application/json,.json"
          hidden
          @change="importData"
        ><UButton
          color="error"
          variant="ghost"
          icon="i-lucide-trash-2"
          @click="requestReset"
          >{{ say('Delete all local data', 'ลบข้อมูลทั้งหมด') }}</UButton
        ><UButton
          v-if="$pwa?.showInstallPrompt"
          color="neutral"
          variant="outline"
          icon="i-lucide-smartphone"
          @click="$pwa?.install()"
          >{{ say('Install Foodie', 'ติดตั้ง Foodie') }}</UButton
        >
      </div>
      <p class="panel-footnote">
        {{
          say(
            'On iPhone/iPad, open in Safari and choose Share > Add to Home Screen.',
            'บน iPhone/iPad เปิดใน Safari แล้วเลือกแชร์ > เพิ่มไปยังหน้าจอโฮม',
          )
        }}
      </p>
    </section>
    <UModal
      v-model:open="deleteOpen"
      :title="say('Reset your wellness space?', 'ล้างข้อมูลสุขภาพของคุณ?')"
      :description="
        say(
          'This permanently removes meals, symptoms, weights, water, favorites and settings from this device. Export a backup first if you want to keep them.',
          'ลบมื้ออาหาร อาการ น้ำหนัก น้ำ อาหารโปรด และการตั้งค่าอย่างถาวร สำรองก่อนหากต้องการเก็บ',
        )
      "
      ><template #body
        ><label class="form-stack"
          >{{ say('Type DELETE to confirm', 'พิมพ์ DELETE เพื่อยืนยัน')
          }}<UInput
            v-model="confirmation"
            autocomplete="off" /></label></template
      ><template #footer
        ><UButton
          color="neutral"
          variant="outline"
          @click="deleteOpen = false"
          >{{ t('common.cancel') }}</UButton
        ><UButton
          color="error"
          :disabled="confirmation !== 'DELETE'"
          @click="clearData"
          >{{ say('Delete & reset', 'ลบและเริ่มใหม่') }}</UButton
        ></template
      ></UModal
    >
  </div>
</template>
