<script setup lang="ts">
defineProps<{ eyebrow?: string; title: string; subtitle?: string }>()
</script>
<template>
  <div class="page-heading">
    <div>
      <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
      <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
    </div>
    <div class="heading-actions"><slot /></div>
  </div>
</template>
