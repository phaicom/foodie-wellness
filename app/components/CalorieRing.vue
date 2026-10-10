<script setup lang="ts">
const props = defineProps<{ consumed: number; target: number }>()
const percent = computed(() =>
  Math.min(100, (props.consumed / props.target) * 100),
)
const { say } = useFoodie()
</script>
<template>
  <div class="calorie-ring">
    <svg
      viewBox="0 0 220 220"
      role="img"
      :aria-label="`${consumed} of ${target} estimated calories`"
    >
      <circle class="ring-track" cx="110" cy="110" r="92" />
      <circle
        class="ring-fill"
        cx="110"
        cy="110"
        r="92"
        :stroke-dasharray="`${percent * 5.78} 578`"
      />
    </svg>
    <div class="ring-text">
      <span>{{ say('YOU HAVE', 'เหลืออีก') }}</span
      ><strong>{{ Math.abs(target - consumed).toLocaleString() }}</strong>
      <p>
        {{
          consumed > target
            ? say('kcal above target', 'กิโลแคลอรีเกินเป้าหมาย')
            : say('kcal remaining', 'กิโลแคลอรี')
        }}
      </p>
    </div>
  </div>
</template>
