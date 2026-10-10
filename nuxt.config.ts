export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  ssr: false,
  debug: false,
  devtools: { enabled: false },
  telemetry: false,
  nitro: { prerender: { routes: ['/'] } },
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
    '@vite-pwa/nuxt',
    '@nuxt/eslint',
  ],
  css: ['~/assets/css/main.css'],
  typescript: { strict: true },
  app: {
    head: {
      title: 'Foodie - A little better, every day',
      meta: [
        {
          name: 'description',
          content:
            'Your personal food and wellness companion. Thoughtful meals, gentle progress, all stored on your device.',
        },
        { name: 'theme-color', content: '#45634d' },
      ],
      link: [
        { rel: 'icon', href: '/favicon.svg' },
        { rel: 'manifest', href: '/manifest.webmanifest' },
        { rel: 'apple-touch-icon', href: '/icon-192.png' },
      ],
    },
  },
  ui: { fonts: false },
  icon: {
    clientBundle: {
      scan: true,
      icons: [
        'lucide:egg',
        'lucide:sprout',
        'lucide:soup',
        'lucide:utensils',
        'lucide:fish',
        'lucide:flame',
        'lucide:wheat',
        'lucide:milk',
        'lucide:banana',
        'lucide:leaf',
      ],
    },
    provider: 'none',
  },
  i18n: {
    defaultLocale: 'en',
    strategy: 'no_prefix',
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'th', name: 'ไทย', file: 'th.json' },
    ],
  },
  pwa: {
    registerType: 'prompt',
    manifest: {
      name: 'Foodie - Personal Wellness',
      short_name: 'Foodie',
      description: 'Thoughtful food decisions and gentle daily progress.',
      theme_color: '#45634d',
      background_color: '#f7f8f2',
      display: 'standalone',
      start_url: '/',
      scope: '/',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        {
          src: '/icon-maskable.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,json,woff2}'],
      cleanupOutdatedCaches: true,
    },
    client: { installPrompt: true },
    devOptions: { enabled: false },
  },
})
