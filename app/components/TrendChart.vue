<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from 'chart.js'
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
)
const props = defineProps<{
  labels: string[]
  values: (number | null)[]
  label: string
  color?: string
  average?: (number | null)[]
  averageLabel?: string
}>()
const data = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: props.label,
      data: props.values,
      borderColor: props.color ?? '#6c8c70',
      backgroundColor: props.color ? `${props.color}18` : '#6c8c7015',
      borderWidth: 2.5,
      pointRadius: 3,
      pointBackgroundColor: props.color ?? '#6c8c70',
      fill: true,
      tension: 0.3,
      spanGaps: true,
    },
    ...(props.average
      ? [
          {
            label: props.averageLabel ?? '7-day average',
            data: props.average,
            borderColor: '#b59d75',
            borderDash: [5, 4],
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.3,
            spanGaps: true,
            fill: false,
          },
        ]
      : []),
  ],
}))
const options: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: !!props.average,
      position: 'bottom',
      labels: { usePointStyle: true, boxWidth: 6, color: '#8a8c81' },
    },
    tooltip: { mode: 'index', intersect: false },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#8a8c81', maxTicksLimit: 7 },
      border: { display: false },
    },
    y: {
      grid: { color: '#8a8c8115' },
      ticks: { color: '#8a8c81', maxTicksLimit: 5 },
      border: { display: false },
    },
  },
  interaction: { intersect: false },
  animation: {
    duration:
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 0
        : 400,
  },
}
</script>
<template>
  <div class="chart-container">
    <Line :data="data" :options="options" :aria-label="label" role="img" />
  </div>
</template>
