import 'fake-indexeddb/auto'
import { afterEach, describe, it, expect } from 'vitest'
import Dexie from 'dexie'
import { WellnessDatabase } from '../app/features/storage/database'
import {
  backupSchema,
  mealSchema,
  profileSchema,
  stamp,
  type MealEntry,
} from '../app/features/storage/models'
const databases: WellnessDatabase[] = []
async function database() {
  const db = new WellnessDatabase(`test-${crypto.randomUUID()}`)
  databases.push(db)
  await db.initialize()
  return db
}
afterEach(async () => {
  for (const db of databases.splice(0)) await db.delete()
})
const meal = (): MealEntry => ({
  ...stamp(),
  date: '2026-10-11',
  time: '12:00',
  type: 'lunch',
  notes: '',
  foods: [
    { foodId: 'tofu-soup', name: 'Tofu soup', servings: 1, calories: 180 },
  ],
})
describe('local persistence', () => {
  it('seeds once and retains profile data', async () => {
    const db = await database()
    await db.initialize()
    expect(await db.foods.count()).toBe(18)
    const p = (await db.profile.toArray())[0]!
    await db.profile.put({ ...p, name: 'My journey' })
    db.close()
    await db.open()
    expect((await db.profile.get(p.id))?.name).toBe('My journey')
  })
  it('persists checklist by date across reopen', async () => {
    const db = await database()
    await db.checklists.put({
      ...stamp(),
      date: '2026-10-11',
      completed: [0, 3, 6],
    })
    db.close()
    await db.open()
    expect(
      (await db.checklists.where('date').equals('2026-10-11').first())
        ?.completed,
    ).toEqual([0, 3, 6])
    expect(await db.checklists.where('date').equals('2026-10-10').count()).toBe(
      0,
    )
  })
  it('supports meal create, update and delete', async () => {
    const db = await database()
    const entry = meal()
    await db.meals.add(entry)
    expect(await db.meals.where('date').equals(entry.date).count()).toBe(1)
    await db.meals.put({ ...entry, notes: 'Less oil' })
    expect((await db.meals.get(entry.id))?.notes).toBe('Less oil')
    await db.meals.delete(entry.id)
    expect(await db.meals.count()).toBe(0)
  })
  it('validates imports atomically and rejects impossible dates', async () => {
    const db = await database()
    const data = await db.exportData()
    expect(
      backupSchema.safeParse({ ...data, schemaVersion: 999 }).success,
    ).toBe(false)
    expect(
      mealSchema.safeParse({ ...meal(), date: '2026-02-31' }).success,
    ).toBe(false)
    expect(
      profileSchema.safeParse({ ...data.profile, sex: 'assumed' }).success,
    ).toBe(false)
    await expect(
      db.importData({ ...data, meals: [{ bad: true }] }),
    ).rejects.toThrow()
    expect(await db.foods.count()).toBe(18)
  })
  it('merges stable IDs and natural unique keys without duplication', async () => {
    const db = await database()
    const entry = meal()
    await db.meals.add(entry)
    await db.weights.add({ ...stamp(), date: '2026-10-11', weight: 78 })
    const data = await db.exportData()
    await db.importData(data)
    await db.importData(data)
    expect(await db.meals.count()).toBe(1)
    expect(await db.weights.count()).toBe(1)
    await db.importData({
      ...data,
      weights: data.weights.map((w) => ({ ...w, ...stamp(), weight: 77 })),
    })
    expect(await db.weights.count()).toBe(1)
    expect((await db.weights.toArray())[0]?.weight).toBe(77)
  })
  it('migrates v1 records and adds indexed food tags', async () => {
    const name = `migration-${crypto.randomUUID()}`
    const old = new Dexie(name)
    old.version(1).stores({
      profile: 'id',
      nutrition: 'id',
      foods: 'id,category',
      meals: 'id,date,type',
      favorites: 'id,&foodId',
      evaluations: 'id,date',
      checklists: 'id,&date',
      weights: 'id,&date',
      waters: 'id,date',
      symptoms: 'id,date,mealId',
      triggers: 'id,&name',
    })
    await old.table('foods').add({ ...stamp(), id: 'legacy', category: 'Test' })
    const entry = meal()
    const { notes: _notes, ...legacy } = entry
    await old.table('meals').add(legacy)
    old.close()
    const db = new WellnessDatabase(name)
    databases.push(db)
    await db.open()
    expect((await db.foods.get('legacy'))?.tags).toEqual([])
    expect((await db.meals.get(entry.id))?.notes).toBe('')
    expect(db.verno).toBe(2)
  })
})
