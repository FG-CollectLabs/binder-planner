import type { BinderLayout, LibraryItem } from '../types/binder'
import { getBinders, getLibraryItems, saveBinder, saveLibraryItem } from './storage'
import { isContent } from '../types/binder'

interface BinderExport {
  version: 1
  binder: BinderLayout
  libraryItems: LibraryItem[]
}

export async function exportBinder(binderId: string): Promise<void> {
  const [binders, allItems] = await Promise.all([getBinders(), getLibraryItems()])
  const binder = binders.find(b => b.id === binderId)
  if (!binder) throw new Error('Binder not found')

  // collect only the item IDs actually referenced by this binder
  const usedIds = new Set<string>()
  for (const page of binder.pages) {
    for (const slot of page.slots) {
      if (isContent(slot)) usedIds.add(slot.itemId)
    }
  }

  const libraryItems = allItems.filter(i => usedIds.has(i.id))
  const payload: BinderExport = { version: 1, binder, libraryItems }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${binder.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-binder.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importBinder(file: File): Promise<BinderLayout> {
  const text = await file.text()
  const payload = JSON.parse(text) as BinderExport

  if (payload.version !== 1 || !payload.binder || !Array.isArray(payload.libraryItems)) {
    throw new Error('Invalid binder file format')
  }

  // save library items (skip duplicates by id)
  const existing = await getLibraryItems()
  const existingIds = new Set(existing.map(i => i.id))
  for (const item of payload.libraryItems) {
    if (!existingIds.has(item.id)) await saveLibraryItem(item)
  }

  await saveBinder(payload.binder)
  return payload.binder
}
