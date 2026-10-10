import { test, expect, chromium } from '@playwright/test'
const tofuId = '00000000-0000-4000-8000-000000000006'
test('saves hydration and daily checklist across reload', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'A little better, every day.' }),
  ).toBeVisible()
  await page.locator('.water-buttons button').nth(1).click()
  await expect(page.locator('.water-visual strong')).toHaveText('250ml')
  await page.locator('.check-row input').first().check()
  await expect(page.locator('.completion-label')).toHaveText('1 / 7')
  await page.reload()
  await expect(page.locator('.check-row input').first()).toBeChecked()
  await expect(page.locator('.water-visual strong')).toHaveText('250ml')
})
test('meal create, edit, duplicate and delete update calorie totals', async ({
  page,
}) => {
  await page.goto(`/meals?food=${tofuId}`)
  await page.getByRole('button', { name: 'Save meal', exact: true }).click()
  await expect(page.locator('.meal-entry')).toHaveCount(1)
  await expect(page.locator('.intake-banner strong')).toContainText('180')
  await page.getByRole('button', { name: 'Edit', exact: true }).click()
  await page.getByLabel('Servings', { exact: true }).fill('1.5')
  await page.getByRole('button', { name: 'Save meal', exact: true }).click()
  await expect(page.locator('.intake-banner strong')).toContainText('270')
  await page
    .getByRole('button', { name: 'Duplicate meal', exact: true })
    .click()
  await expect(page.locator('.meal-entry')).toHaveCount(2)
  await expect(page.locator('.intake-banner strong')).toContainText('540')
  await page
    .getByRole('button', { name: 'Delete', exact: true })
    .first()
    .click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Delete', exact: true })
    .click()
  await expect(page.locator('.meal-entry')).toHaveCount(1)
})
test('food filters, favorites and decision checklist persist', async ({
  page,
}) => {
  await page.goto('/foods')
  await expect(page.locator('.food-card')).toHaveCount(18)
  await page.getByRole('button', { name: 'Vegetarian', exact: true }).click()
  await expect(page.locator('.food-card')).toHaveCount(9)
  await page.locator('.favorite-button').first().click()
  await expect(page.locator('.favorite-button').first()).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page
    .getByRole('button', { name: 'Meal decision checklist', exact: true })
    .click()
  await page
    .getByPlaceholder('What are you thinking of eating?')
    .fill('A balanced lunch')
  await page.locator('.decision-panel .check-row input').first().check()
  await page
    .getByRole('button', { name: 'Save my evaluation', exact: true })
    .click()
  await expect(
    page.getByRole('button', { name: 'Evaluation saved', exact: true }),
  ).toBeVisible()
  await page.reload()
  await page
    .getByRole('button', { name: 'Meal decision checklist', exact: true })
    .click()
  await page.getByText('Previous evaluations', { exact: true }).click()
  await expect(
    page.getByText('A balanced lunch', { exact: true }),
  ).toBeVisible()
})
test('Thai locale, dark theme, weight and symptom logging work', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Log weight', exact: false }).click()
  await page.getByLabel('Weight (kg)', { exact: true }).fill('77.8')
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await page
    .getByRole('button', { name: 'Track a symptom', exact: false })
    .click()
  await page.getByLabel('Notes', { exact: true }).fill('After a spicy meal')
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await page.goto('/progress')
  await expect(
    page.getByText('After a spicy meal', { exact: true }),
  ).toBeVisible()
  await expect(page.locator('.stat-card').first()).toContainText('77.8')
  await page.goto('/settings')
  await page
    .getByRole('combobox', { name: 'Language', exact: true })
    .selectOption('th')
  await page
    .getByRole('combobox', { name: 'Appearance', exact: true })
    .selectOption('dark')
  await page
    .getByRole('button', { name: 'Save my preferences', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'พื้นที่ของคุณ ในแบบที่คุณชอบ' }),
  ).toBeVisible()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'พื้นที่ของคุณ ในแบบที่คุณชอบ' }),
  ).toBeVisible()
})
test('production PWA reloads and serves every primary route offline', async ({
  page,
  context,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto(`/meals?food=${tofuId}`)
  await page.getByRole('button', { name: 'Save meal', exact: true }).click()
  await expect(page.locator('.meal-entry')).toHaveCount(1)
  const manifest = await page.evaluate(async () =>
    (await fetch('/manifest.webmanifest')).json(),
  )
  expect(manifest.display).toBe('standalone')
  expect(manifest.icons).toHaveLength(3)
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  await page.reload()
  await expect(page.locator('.meal-entry')).toHaveCount(1)
  expect(await page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(
    true,
  )
  await context.setOffline(true)
  for (const [url, title] of [
    ['/', 'A little better, every day.'],
    ['/foods', 'Find food that feels good.'],
    ['/meals', 'Your plate, your pace.'],
    ['/progress', 'Slow progress is still progress.'],
    ['/rules', 'Good food, fewer rules.'],
    ['/settings', 'Your space. Your preferences.'],
  ]) {
    await page.goto(url!)
    await expect(
      page.getByRole('heading', { name: title!, exact: true }),
    ).toBeVisible()
  }
  await page.goto('/meals')
  await expect(page.locator('.meal-entry')).toHaveCount(1)
  expect(errors).toEqual([])
})
test('mobile primary pages have no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  for (const path of [
    '/',
    '/foods',
    '/meals',
    '/progress',
    '/settings',
    '/rules',
  ]) {
    await page.goto(path)
    await expect(page.locator('h1')).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
  }
  await expect(page.locator('.mobile-nav')).toBeVisible()
})

test('manifest is eligible for installation in a normal browser profile', async ({ browserName }, testInfo) => {
  expect(browserName).toBe('chromium')
  const context = await chromium.launchPersistentContext(
    testInfo.outputPath('chrome-profile'),
    {
      headless: true,
      ...(process.env.FOODIE_CHROME
        ? { executablePath: process.env.FOODIE_CHROME }
        : {}),
      args: ['--no-sandbox'],
    },
  )
  try {
    const page = await context.newPage()
    await page.goto('http://127.0.0.1:3000')
    await expect(page.locator('h1')).toBeVisible()
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready
    })
    const cdp = await context.newCDPSession(page)
    const manifest = await cdp.send('Page.getAppManifest')
    expect(manifest.data).toContain('Foodie')
    const result = await cdp.send('Page.getInstallabilityErrors')
    expect(result.installabilityErrors).toEqual([])
  } finally {
    await context.close()
  }
})
