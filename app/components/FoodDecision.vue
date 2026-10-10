<script setup lang="ts">
import { evaluationSchema, stamp } from '~/features/storage/models'
import { getDatabase } from '~/features/storage/database'
const { store, say } = useFoodie()
const { t } = useI18n()
const answers = ref<boolean[]>(Array(7).fill(false))
const mealName = ref('')
const notes = ref('')
const saved = ref(false)
const prompts = computed(() => [
  say('Reasonably low in cooking oil', 'ใช้น้ำมันไม่มาก'),
  say(
    'No organ meats or large high-purine seafood portions',
    'ไม่มีเครื่องในหรืออาหารทะเลพิวรีนสูงปริมาณมาก',
  ),
  say('Includes a suitable protein source', 'มีแหล่งโปรตีนที่เหมาะสม'),
  say('Includes vegetables or fruit', 'มีผักหรือผลไม้'),
  say('A comfortable portion for me', 'ปริมาณพอดีสำหรับฉัน'),
  say(
    'Avoids my known reflux triggers',
    'หลีกเลี่ยงสิ่งที่ฉันรู้ว่ากระตุ้นอาการ',
  ),
  say(
    'Finished 3 hours before lying down',
    'กินเสร็จก่อนนอนอย่างน้อย 3 ชั่วโมง',
  ),
])
const total = computed(() => answers.value.filter(Boolean).length)
async function save() {
  saved.value = await store.mutate(() =>
    getDatabase().evaluations.add(
      evaluationSchema.parse({
        ...stamp(),
        date: store.today,
        mealName: mealName.value,
        answers: answers.value,
        notes: notes.value,
      }),
    ),
  )
}
watch([answers, mealName, notes], () => (saved.value = false), { deep: true })
</script>
<template>
  <section class="panel decision-panel">
    <div class="section-heading">
      <h2>
        <UIcon name="i-lucide-list-checks" />{{
          say('Does this meal work for me?', 'มื้อนี้เหมาะกับฉันไหม?')
        }}
      </h2>
      <span class="pill soft-green">{{
        say('Food decision checklist', 'เช็กลิสต์เลือกอาหาร')
      }}</span>
    </div>
    <p class="section-description">
      {{
        say(
          'Think through the meal, then choose what feels practical. Unchecked items are opportunities to adjust.',
          'ลองทบทวนมื้อนี้ แล้วเลือกสิ่งที่ทำได้ ข้อที่ยังไม่เช็กเป็นโอกาสในการปรับ',
        )
      }}
    </p>
    <p v-if="store.triggers.length" class="gentle-note">
      {{ say('Your known triggers: ', 'สิ่งกระตุ้นที่คุณรู้: ')
      }}{{ store.triggers.map((t) => t.name).join(', ') }}
    </p>
    <form class="form-stack" @submit.prevent="save">
      <label
        >{{ say('Meal name', 'ชื่อมื้ออาหาร')
        }}<UInput
          v-model="mealName"
          required
          maxlength="150"
          :placeholder="
            say('What are you thinking of eating?', 'กำลังคิดจะกินอะไร?')
          " /></label
      ><label v-for="(prompt, index) in prompts" :key="index" class="check-row"
        ><input v-model="answers[index]" type="checkbox" ><span>{{
          prompt
        }}</span></label
      >
      <div class="decision-result">
        <UIcon name="i-lucide-lightbulb" />
        <div>
          <strong>{{
            total >= 6
              ? say(
                  'This looks thoughtful and balanced.',
                  'ดูเป็นมื้อที่ใส่ใจและสมดุล',
                )
              : total >= 4
                ? say(
                    'A few small adjustments could help.',
                    'ปรับเล็กน้อยอาจช่วยได้',
                  )
                : say(
                    "Let's find a more comfortable balance.",
                    'ลองหาสมดุลที่สบายขึ้น',
                  )
          }}</strong>
          <p>
            {{
              say(
                'Consider less oil, a modest portion, egg or tofu, and some vegetables. This is a reflection, not a medical safety score.',
                'ลองลดน้ำมัน กินพอดี เพิ่มไข่หรือเต้าหู้และผัก นี่เป็นการทบทวน ไม่ใช่คะแนนความปลอดภัยทางการแพทย์',
              )
            }}
          </p>
        </div>
      </div>
      <label
        >{{ say('Personal notes', 'บันทึกส่วนตัว')
        }}<UTextarea v-model="notes" maxlength="2000" /></label
      ><UButton
        type="submit"
        icon="i-lucide-bookmark"
        :loading="store.busy"
        class="self-start"
        >{{
          saved
            ? say('Evaluation saved', 'บันทึกแล้ว')
            : say('Save my evaluation', 'บันทึกการประเมิน')
        }}</UButton
      >
      <p v-if="store.evaluations.length" class="muted">
        {{ store.evaluations.length }}
        {{ say('saved reflections', 'รายการที่บันทึก') }}
      </p>
    </form>
    <details v-if="store.evaluations.length" class="saved-reflections">
      <summary>
        {{ say('Previous evaluations', 'การประเมินที่ผ่านมา') }}
      </summary>
      <div
        v-for="item in [...store.evaluations].reverse().slice(0, 20)"
        :key="item.id"
        class="history-row"
      >
        <div>
          <strong>{{ item.mealName }}</strong
          ><small
            >{{ item.date }} | {{ item.answers.filter(Boolean).length }} /
            7</small
          >
          <p>{{ item.notes }}</p>
        </div>
        <button
          class="icon-button"
          :aria-label="t('common.delete')"
          @click="store.mutate(() => getDatabase().evaluations.delete(item.id))"
        >
          <UIcon name="i-lucide-trash-2" />
        </button>
      </div>
    </details>
  </section>
</template>
