<script setup lang="ts">
import { localDate } from '~/features/storage/models'
import { getDatabase } from '~/features/storage/database'
const { store, say } = useFoodie()
const { t, setLocale } = useI18n()
const colorMode = useColorMode()
const online = useOnline()
async function toggleTheme() {
  const theme = colorMode.value === 'dark' ? 'light' : 'dark'
  colorMode.preference = theme
  if (store.profile) {
    const updated: NonNullable<typeof store.profile> = {
      ...store.profile,
      theme,
      updatedAt: new Date().toISOString(),
    }
    await store.mutate(() => getDatabase().profile.put(updated))
  }
}
const route = useRoute()
const navigation = [
  { to: '/', key: 'dashboard', icon: 'i-lucide-layout-dashboard' },
  { to: '/foods', key: 'foods', icon: 'i-lucide-leaf' },
  { to: '/meals', key: 'meals', icon: 'i-lucide-utensils' },
  { to: '/progress', key: 'progress', icon: 'i-lucide-chart-no-axes-combined' },
  { to: '/settings', key: 'settings', icon: 'i-lucide-settings-2' },
]
onMounted(async () => {
  await store.initialize()
  if (store.profile) {
    await setLocale(store.profile.language)
    colorMode.preference = store.profile.theme
  }
})
watch(
  () => store.profile?.theme,
  (value) => {
    if (value) colorMode.preference = value
  },
)
useIntervalFn(() => {
  store.today = localDate()
}, 60000)
</script>
<template>
  <UApp>
    <div class="app-shell">
      <aside class="sidebar">
        <NuxtLink to="/" class="brand"
          ><span class="brand-symbol"><UIcon name="i-lucide-sprout" /></span
          >foodie<span class="brand-dot">.</span></NuxtLink
        >
        <p class="sidebar-label">
          {{ say('YOUR DAILY COMPANION', 'เพื่อนดูแลสุขภาพทุกวัน') }}
        </p>
        <nav aria-label="Main navigation">
          <NuxtLink
            v-for="item in navigation"
            :key="item.to"
            :to="item.to"
            class="nav-link"
            :class="{ active: route.path === item.to }"
            ><UIcon :name="item.icon" /><span>{{ t(`nav.${item.key}`) }}</span
            ><span v-if="route.path === item.to" class="active-dot"
          /></NuxtLink>
        </nav>
        <div class="sidebar-note">
          <div class="note-icon"><UIcon name="i-lucide-heart-handshake" /></div>
          <h3>
            {{ say('Small steps. Lasting change.', 'ก้าวเล็กๆ ที่ยั่งยืน') }}
          </h3>
          <p>
            {{
              say(
                'A little more balance, a little less pressure. You are doing this for you.',
                'เพิ่มสมดุล ลดความกดดัน ดูแลตัวเองไปทีละนิด',
              )
            }}
          </p>
          <NuxtLink to="/rules"
            >{{ say('Explore your food rulebook', 'อ่านแนวทางการกิน') }}
            <UIcon name="i-lucide-arrow-up-right"
          /></NuxtLink>
        </div>
        <div class="sidebar-bottom">
          <span class="avatar">Y</span>
          <div>
            <strong>{{
              say('Your wellness space', 'พื้นที่สุขภาพของคุณ')
            }}</strong
            ><span
              ><i />{{
                say('Private & on your device', 'เก็บไว้ในอุปกรณ์ของคุณ')
              }}</span
            >
          </div>
        </div>
      </aside>
      <div class="main-shell">
        <header class="topbar">
          <div class="breadcrumb">
            {{ say('My workspace', 'พื้นที่ของฉัน') }}<span>/</span
            ><strong>{{
              route.path === '/rules'
                ? t('nav.rules')
                : t(
                    `nav.${navigation.find((n) => n.to === route.path)?.key ?? 'dashboard'}`,
                  )
            }}</strong>
          </div>
          <div class="topbar-right">
            <span class="local-badge"
              ><i :class="{ offline: !online }" />{{
                online
                  ? say('Saved locally', 'เก็บในอุปกรณ์')
                  : say('Offline & available', 'ใช้งานออฟไลน์')
              }}</span
            ><button
              class="icon-button"
              :aria-label="say('Toggle theme', 'เปลี่ยนธีม')"
              @click="toggleTheme"
            >
              <UIcon
                :name="
                  colorMode.value === 'dark' ? 'i-lucide-moon' : 'i-lucide-sun'
                "
              /></button
            ><span class="avatar small">Y</span>
          </div>
        </header>
        <main id="main-content" class="page-content">
          <div v-if="store.error" role="alert" class="error-banner">
            {{ store.error }}
            <UButton
              v-if="!store.ready"
              size="sm"
              @click="store.initialize()"
              >{{ say('Retry', 'ลองอีกครั้ง') }}</UButton
            ><button
              v-else
              class="icon-button"
              aria-label="Dismiss error"
              @click="store.error = ''"
            >
              <UIcon name="i-lucide-x" />
            </button>
          </div>
          <div v-if="!store.ready && !store.error" class="loading-state">
            <UIcon name="i-lucide-loader-circle" class="spin" />{{
              t('common.loading')
            }}
          </div>
          <NuxtPage v-if="store.ready" />
          <footer class="page-footer">
            <span
              ><UIcon name="i-lucide-sprout" />{{
                say('Progress, at your own pace.', 'ก้าวหน้าในจังหวะของคุณ')
              }}</span
            ><span>{{
              say(
                'A personal tracking & educational tool',
                'เครื่องมือบันทึกและเรียนรู้ส่วนบุคคล',
              )
            }}</span>
          </footer>
        </main>
      </div>
      <nav class="mobile-nav" aria-label="Mobile navigation">
        <NuxtLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          :class="{ active: route.path === item.to }"
          ><UIcon :name="item.icon" /><span>{{
            t(`nav.${item.key}`)
          }}</span></NuxtLink
        >
      </nav>
      <div v-if="$pwa?.needRefresh" class="update-notice">
        <span>{{
          say('A fresh version is ready.', 'มีเวอร์ชันใหม่พร้อมแล้ว')
        }}</span
        ><UButton @click="$pwa?.updateServiceWorker()">{{
          say('Update', 'อัปเดต')
        }}</UButton>
      </div>
    </div>
  </UApp>
</template>
