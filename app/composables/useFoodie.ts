import { foodTranslations } from '~/features/foods/translations'
import type { Food } from '~/features/storage/models'
export function useFoodie() {
  const store = useWellnessStore()
  const { locale } = useI18n()
  const isThai = computed(() => locale.value === 'th')
  const say = (en: string, th: string) => (isThai.value ? th : en)
  const foodName = (food: { nameEn: string; nameTh: string }) =>
    isThai.value ? food.nameTh : food.nameEn
  const foodCopy = (
    food: Food,
    field: 'gerd' | 'purine' | 'modifications' | 'weightLoss',
  ) =>
    isThai.value
      ? field === 'weightLoss'
        ? 'แคลอรีเป็นค่าประมาณ น้ำมัน เครื่อง และปริมาณเปลี่ยนพลังงานรวมได้'
        : (foodTranslations[food.slug ?? food.id]?.[field] ?? food[field])
      : food[field]
  const servingLabel = (food: Food) =>
    isThai.value && !food.custom
      ? food.slug === 'banana'
        ? 'กล้วยขนาดกลาง 1 ผล'
        : food.slug === 'papaya'
          ? 'ชามเล็ก 150 กรัม'
          : food.slug === 'yogurt'
            ? '1 ถ้วย 170 กรัม'
            : '1 ส่วนมาตรฐาน'
      : food.serving.label
  const formatDate = (
    date: string,
    options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    },
  ) =>
    new Intl.DateTimeFormat(isThai.value ? 'th-TH' : 'en-US', options).format(
      new Date(`${date}T12:00:00`),
    )
  return { store, isThai, say, foodName, foodCopy, servingLabel, formatDate }
}
