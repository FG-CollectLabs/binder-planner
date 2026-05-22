import type { BinderPage, BinderLayout, LibraryItem } from '../../types/binder'
import { LAYOUT_COLS, LAYOUT_SLOT_COUNT, isContent, isMerged } from '../../types/binder'
import { useBinderStore } from '../../store/useBinderStore'
import { PocketSlot } from './PocketSlot'

interface Props {
  page: BinderPage
  binder: BinderLayout
  library: LibraryItem[]
  label: string
  canMoveLeft?: boolean
  canMoveRight?: boolean
  onMoveLeft?: () => void
  onMoveRight?: () => void
}

export function PocketGrid({ page, binder, library, label, canMoveLeft, canMoveRight, onMoveLeft, onMoveRight }: Props) {
  const removeItem = useBinderStore(s => s.removeItem)
  const cycleSpan = useBinderStore(s => s.cycleSpan)
  const cols = LAYOUT_COLS[binder.pocketLayout]
  const rows = LAYOUT_SLOT_COUNT[binder.pocketLayout] / cols

  return (
    <div className="flex flex-col gap-2 flex-1 min-h-0">
      <div className="flex items-center justify-center gap-1">
        <button
          onClick={onMoveLeft}
          disabled={!canMoveLeft}
          title="Move page left"
          className="text-gray-600 hover:text-gray-300 disabled:opacity-0 disabled:pointer-events-none text-xs px-1 transition-colors"
        >
          ‹
        </button>
        <span className="text-gray-500 text-xs font-medium tracking-wide uppercase">{label}</span>
        <button
          onClick={onMoveRight}
          disabled={!canMoveRight}
          title="Move page right"
          className="text-gray-600 hover:text-gray-300 disabled:opacity-0 disabled:pointer-events-none text-xs px-1 transition-colors"
        >
          ›
        </button>
      </div>
      <div
        className={`
          bg-gray-800 border border-gray-700 rounded-xl p-3 flex-1 min-h-0 overflow-hidden
          ${binder.binderType === 'toploader' ? 'bg-gray-900 border-gray-600' : ''}
        `}
      >
        <div
          className="grid gap-2 h-full overflow-hidden"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
        >
          {page.slots.map((slot, idx) => {
            if (isMerged(slot)) return null

            const content = isContent(slot) ? slot : null
            const item = content ? library.find(i => i.id === content.itemId) : undefined

            return (
              <PocketSlot
                key={idx}
                pageId={page.id}
                slotIndex={idx}
                content={content}
                item={item}
                colSpan={content?.colSpan ?? 1}
                rowSpan={content?.rowSpan ?? 1}
                onRemove={() => removeItem(page.id, idx)}
                onCycleSpan={() => cycleSpan(page.id, idx)}
                isToploader={binder.binderType === 'toploader'}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
