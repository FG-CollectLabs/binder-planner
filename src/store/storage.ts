import localforage from 'localforage'
import type { BinderLayout, LibraryItem } from '../types/binder'

const bindersStore = localforage.createInstance({ name: 'fg-bp-binders' })
const libraryStore = localforage.createInstance({ name: 'fg-bp-library' })

export async function getBinders(): Promise<BinderLayout[]> {
  const list = await bindersStore.getItem<BinderLayout[]>('list')
  return list ?? []
}

export async function saveBinder(binder: BinderLayout): Promise<void> {
  const list = await getBinders()
  const idx = list.findIndex(b => b.id === binder.id)
  if (idx >= 0) list[idx] = binder
  else list.push(binder)
  await bindersStore.setItem('list', list)
}

export async function deleteBinder(id: string): Promise<void> {
  const list = await getBinders()
  await bindersStore.setItem('list', list.filter(b => b.id !== id))
}

export async function getLibraryItems(): Promise<LibraryItem[]> {
  const list = await libraryStore.getItem<LibraryItem[]>('items')
  return list ?? []
}

export async function saveLibraryItem(item: LibraryItem): Promise<void> {
  const items = await getLibraryItems()
  const idx = items.findIndex(i => i.id === item.id)
  if (idx >= 0) items[idx] = item
  else items.push(item)
  await libraryStore.setItem('items', items)
}

export async function deleteLibraryItem(id: string): Promise<void> {
  const items = await getLibraryItems()
  await libraryStore.setItem('items', items.filter(i => i.id !== id))
}
