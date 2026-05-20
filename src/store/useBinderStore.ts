import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import type {
  BinderLayout, BinderPage, LibraryItem, SlotValue,
  PocketLayout, BinderType,
} from '../types/binder'
import { LAYOUT_SLOT_COUNT, isMerged, isContent } from '../types/binder'
import { saveBinder, saveLibraryItem, deleteLibraryItem } from './storage'

interface BinderStore {
  binder: BinderLayout | null
  library: LibraryItem[]
  spreadIndex: number  // index of left page in the current spread (0, 2, 4 ...)

  loadBinder: (binder: BinderLayout) => void
  loadLibrary: (items: LibraryItem[]) => void
  updateName: (name: string) => void

  // page navigation
  setSpreadIndex: (idx: number) => void
  addPage: () => void

  // slot editing
  placeItem: (pageId: string, slotIndex: number, itemId: string) => void
  removeItem: (pageId: string, slotIndex: number) => void
  toggleSpan: (pageId: string, slotIndex: number) => void
  moveItem: (fromPageId: string, fromSlot: number, toPageId: string, toSlot: number) => void

  // library
  addLibraryItem: (item: LibraryItem) => void
  removeLibraryItem: (id: string) => void
}

function emptyPage(layout: PocketLayout): BinderPage {
  return {
    id: uuid(),
    slots: Array(LAYOUT_SLOT_COUNT[layout]).fill(null),
  }
}

function persist(binder: BinderLayout) {
  const updated = { ...binder, updatedAt: new Date().toISOString() }
  saveBinder(updated)
  return updated
}

export const useBinderStore = create<BinderStore>((set, _get) => ({
  binder: null,
  library: [],
  spreadIndex: 0,

  loadBinder: (binder) => set({ binder, spreadIndex: 0 }),
  loadLibrary: (items) => set({ library: items }),
  updateName: (name) => set(s => {
    if (!s.binder) return s
    const binder = persist({ ...s.binder, name })
    return { binder }
  }),

  setSpreadIndex: (idx) => set({ spreadIndex: idx }),

  addPage: () => set(s => {
    if (!s.binder) return s
    const page = emptyPage(s.binder.pocketLayout)
    const pages = [...s.binder.pages, page]
    const binder = persist({ ...s.binder, pages })
    return { binder }
  }),

  placeItem: (pageId, slotIndex, itemId) => set(s => {
    if (!s.binder) return s
    const pages = s.binder.pages.map(p => {
      if (p.id !== pageId) return p
      const slots = [...p.slots]
      slots[slotIndex] = { itemId, colSpan: 1 }
      return { ...p, slots }
    })
    const binder = persist({ ...s.binder, pages })
    return { binder }
  }),

  removeItem: (pageId, slotIndex) => set(s => {
    if (!s.binder) return s
    const cols = LAYOUT_SLOT_COUNT[s.binder.pocketLayout]
    const pages = s.binder.pages.map(p => {
      if (p.id !== pageId) return p
      const slots = [...p.slots]
      const slot = slots[slotIndex]
      if (isContent(slot) && slot.colSpan === 2 && slotIndex + 1 < cols) {
        slots[slotIndex + 1] = null
      }
      slots[slotIndex] = null
      return { ...p, slots }
    })
    const binder = persist({ ...s.binder, pages })
    return { binder }
  }),

  toggleSpan: (pageId, slotIndex) => set(s => {
    if (!s.binder) return s
    const colCount = parseInt(s.binder.pocketLayout.split('-')[0]) // unused, use LAYOUT_COLS
    void colCount
    const pages = s.binder.pages.map(p => {
      if (p.id !== pageId) return p
      const slots = [...p.slots]
      const slot = slots[slotIndex]
      if (!isContent(slot)) return p

      const layout = s.binder!.pocketLayout
      const cols = LAYOUT_SLOT_COUNT[layout] === 4 ? 2 : layout === '9-pocket' ? 3 : 4
      const col = slotIndex % cols
      const nextIdx = slotIndex + 1

      if (slot.colSpan === 1) {
        // expand to 2 if next slot in same row is free
        if (col < cols - 1 && (slots[nextIdx] === null || isMerged(slots[nextIdx]))) {
          slots[slotIndex] = { ...slot, colSpan: 2 }
          slots[nextIdx] = { mergedFrom: slotIndex }
        }
      } else {
        // collapse back to 1
        slots[slotIndex] = { ...slot, colSpan: 1 }
        if (nextIdx < slots.length && isMerged(slots[nextIdx])) {
          slots[nextIdx] = null
        }
      }
      return { ...p, slots }
    })
    const binder = persist({ ...s.binder, pages })
    return { binder }
  }),

  moveItem: (fromPageId, fromSlot, toPageId, toSlot) => set(s => {
    if (!s.binder) return s
    let draggedContent: SlotValue = null
    // grab from source
    let pages = s.binder.pages.map(p => {
      if (p.id !== fromPageId) return p
      const slots = [...p.slots]
      const slot = slots[fromSlot]
      if (!isContent(slot)) return p
      draggedContent = { ...slot, colSpan: 1 } // reset span on move
      // clear merged next slot if was spanning
      if (slot.colSpan === 2 && isMerged(slots[fromSlot + 1])) {
        slots[fromSlot + 1] = null
      }
      slots[fromSlot] = null
      return { ...p, slots }
    })
    if (!draggedContent) return s
    // place in dest
    pages = pages.map(p => {
      if (p.id !== toPageId) return p
      const slots = [...p.slots]
      // if dest occupied, swap
      const dest = slots[toSlot]
      if (isContent(dest)) {
        // put dest item back to source
        pages = pages.map(pp => {
          if (pp.id !== fromPageId) return pp
          const ss = [...pp.slots]
          ss[fromSlot] = dest
          return { ...pp, slots: ss }
        })
      }
      slots[toSlot] = draggedContent
      return { ...p, slots }
    })
    const binder = persist({ ...s.binder, pages })
    return { binder }
  }),

  addLibraryItem: (item) => {
    saveLibraryItem(item)
    set(s => ({ library: [...s.library, item] }))
  },

  removeLibraryItem: (id) => {
    deleteLibraryItem(id)
    set(s => ({ library: s.library.filter(i => i.id !== id) }))
  },
}))

export function createBinder(
  name: string,
  binderType: BinderType,
  pocketLayout: PocketLayout,
): BinderLayout {
  const now = new Date().toISOString()
  return {
    id: uuid(),
    name,
    binderType,
    pocketLayout,
    pages: [emptyPage(pocketLayout), emptyPage(pocketLayout)],
    createdAt: now,
    updatedAt: now,
  }
}
