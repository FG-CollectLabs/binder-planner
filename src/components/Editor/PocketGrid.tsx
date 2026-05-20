import type { BinderPage, BinderLayout, LibraryItem } from '../../types/binder'
import { LAYOUT_COLS, isContent, isMerged } from '../../types/binder'
import { useBinderStore } from '../../store/useBinderStore'
import { PocketSlot } from './PocketSlot'

interface Props {
  page: BinderPage
  binder: BinderLayout
  library: LibraryItem[]
  label: string
}

export function PocketGrid({ page, binder, library, label }: Props) {
  const removeItem = useBinderStore(s => s.removeItem)
  const toggleSpan = useBinderStore(s => s.toggleSpan)
  const cols = LAYOUT_COLS[binder.pocketLayout]

  return (
    <div className="flex flex-col gap-2 flex-1">
      <div className="text-gray-500 text-xs text-center font-medium tracking-wide uppercase">{label}</div>
      <div
        className={`
          bg-gray-800 border border-gray-700 rounded-xl p-3 flex-1
          ${binder.binderType === 'toploader' ? 'bg-gray-900 border-gray-600' : ''}
        `}
      >
        <div
          className="grid gap-2 h-full"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
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
                onRemove={() => removeItem(page.id, idx)}
                onToggleSpan={() => toggleSpan(page.id, idx)}
                isToploader={binder.binderType === 'toploader'}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
