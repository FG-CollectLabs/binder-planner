export type PocketLayout = '4-pocket' | '9-pocket' | '12-pocket'
export type BinderType = 'penny' | 'toploader'
export type ItemType = 'card' | 'postcard' | 'fan-art' | 'deck-sleeve' | 'custom'

export interface LibraryItem {
  id: string
  type: ItemType
  imageDataUrl: string
  label: string
  createdAt: string
}

export interface SlotContent {
  itemId: string
  colSpan: 1 | 2
}

export type MergedSentinel = { mergedFrom: number }

export type SlotValue = SlotContent | MergedSentinel | null

export interface BinderPage {
  id: string
  slots: SlotValue[]
}

export interface BinderLayout {
  id: string
  name: string
  binderType: BinderType
  pocketLayout: PocketLayout
  pages: BinderPage[]
  createdAt: string
  updatedAt: string
}

export function isMerged(slot: SlotValue): slot is MergedSentinel {
  return slot !== null && 'mergedFrom' in slot
}

export function isContent(slot: SlotValue): slot is SlotContent {
  return slot !== null && 'itemId' in slot
}

export const LAYOUT_COLS: Record<PocketLayout, number> = {
  '4-pocket': 2,
  '9-pocket': 3,
  '12-pocket': 4,
}

export const LAYOUT_ROWS: Record<PocketLayout, number> = {
  '4-pocket': 2,
  '9-pocket': 3,
  '12-pocket': 3,
}

export const LAYOUT_SLOT_COUNT: Record<PocketLayout, number> = {
  '4-pocket': 4,
  '9-pocket': 9,
  '12-pocket': 12,
}
