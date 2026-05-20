import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import type {
  BinderLayout, BinderPage, LibraryItem, SlotValue,
  PocketLayout, BinderType,
} from '../types/binder'
import { LAYOUT_COLS, LAYOUT_SLOT_COUNT, isMerged, isContent } from '../types/binder'
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
  cycleSpan: (pageId: string, slotIndex: number) => void
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
      slots[slotIndex] = { itemId, colSpan: 1, rowSpan: 1 }
      return { ...p, slots }
    })
    const binder = persist({ ...s.binder, pages })
    return { binder }
  }),

  removeItem: (pageId, slotIndex) => set(s => {
    if (!s.binder) return s
    const cols = LAYOUT_COLS[s.binder.pocketLayout]
    const total = LAYOUT_SLOT_COUNT[s.binder.pocketLayout]
    const pages = s.binder.pages.map(p => {
      if (p.id !== pageId) return p
      const slots = [...p.slots]
      const slot = slots[slotIndex]
      if (isContent(slot)) {
        if (slot.colSpan === 2 && slotIndex + 1 < total) slots[slotIndex + 1] = null
        if (slot.rowSpan === 2 && slotIndex + cols < total) slots[slotIndex + cols] = null
      }
      slots[slotIndex] = null
      return { ...p, slots }
    })
    const binder = persist({ ...s.binder, pages })
    return { binder }
  }),

  // Cycles through 3 span states: single (1×1) → wide (2×1) → tall (1×2) → single
  cycleSpan: (pageId, slotIndex) => set(s => {
    if (!s.binder) return s
    const cols = LAYOUT_COLS[s.binder.pocketLayout]
    const total = LAYOUT_SLOT_COUNT[s.binder.pocketLayout]
    const rows = total / cols

    const pages = s.binder.pages.map(p => {
      if (p.id !== pageId) return p
      const slots = [...p.slots]
      const slot = slots[slotIndex]
      if (!isContent(slot)) return p

      const col = slotIndex % cols
      const row = Math.floor(slotIndex / cols)

      if (slot.colSpan === 1 && slot.rowSpan === 1) {
        // single → wide: expand right if next slot in same row is free
        const nextIdx = slotIndex + 1
        if (col < cols - 1 && (slots[nextIdx] === null || isMerged(slots[nextIdx]))) {
          slots[slotIndex] = { ...slot, colSpan: 2, rowSpan: 1 }
          slots[nextIdx] = { mergedFrom: slotIndex }
        }
        // if can't go wide, try tall instead
        else {
          const belowIdx = slotIndex + cols
          if (row < rows - 1 && (slots[belowIdx] === null || isMerged(slots[belowIdx]))) {
            slots[slotIndex] = { ...slot, colSpan: 1, rowSpan: 2 }
            slots[belowIdx] = { mergedFrom: slotIndex }
          }
        }
      } else if (slot.colSpan === 2) {
        // wide → tall: clear col merge, try row merge
        const nextIdx = slotIndex + 1
        if (nextIdx < total && isMerged(slots[nextIdx])) slots[nextIdx] = null
        const belowIdx = slotIndex + cols
        if (row < rows - 1 && (slots[belowIdx] === null || isMerged(slots[belowIdx]))) {
          slots[slotIndex] = { ...slot, colSpan: 1, rowSpan: 2 }
          slots[belowIdx] = { mergedFrom: slotIndex }
        } else {
          // can't go tall — collapse to single
          slots[slotIndex] = { ...slot, colSpan: 1, rowSpan: 1 }
        }
      } else {
        // tall → single: clear row merge
        const belowIdx = slotIndex + cols
        if (belowIdx < total && isMerged(slots[belowIdx])) slots[belowIdx] = null
        slots[slotIndex] = { ...slot, colSpan: 1, rowSpan: 1 }
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
      draggedContent = { ...slot, colSpan: 1, rowSpan: 1 } // reset span on move
      const cols = LAYOUT_COLS[s.binder!.pocketLayout]
      const total = LAYOUT_SLOT_COUNT[s.binder!.pocketLayout]
      if (slot.colSpan === 2 && fromSlot + 1 < total && isMerged(slots[fromSlot + 1])) {
        slots[fromSlot + 1] = null
      }
      if (slot.rowSpan === 2 && fromSlot + cols < total && isMerged(slots[fromSlot + cols])) {
        slots[fromSlot + cols] = null
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
