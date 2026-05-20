import type { BinderPage, BinderLayout, LibraryItem } from '../../types/binder'
import { LAYOUT_COLS, isContent, isMerged } from '../../types/binder'

interface Props {
  leftPage: BinderPage | undefined
  rightPage: BinderPage | undefined
  binder: BinderLayout
  library: LibraryItem[]
  leftLabel: string
  rightLabel: string
}

function ViewGrid({
  page, binder, library, label,
}: { page: BinderPage; binder: BinderLayout; library: LibraryItem[]; label: string }) {
  const cols = LAYOUT_COLS[binder.pocketLayout]
  const isToploader = binder.binderType === 'toploader'

  return (
    <div className="flex flex-col gap-2 flex-1">
      <div className="text-gray-600 text-xs text-center font-medium tracking-widest uppercase">{label}</div>
      <div className={`flex-1 rounded-xl p-3 ${isToploader ? 'bg-gray-950 border-2 border-gray-700' : 'bg-gray-800 border border-gray-700'}`}>
        <div
          className="grid gap-2 h-full"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {page.slots.map((slot, idx) => {
            if (isMerged(slot)) return null
            const content = isContent(slot) ? slot : null
            const item = content ? library.find(i => i.id === content.itemId) : undefined

            return (
              <div
                key={idx}
                className={`rounded-sm overflow-hidden ${isToploader ? 'border-2 border-gray-700' : 'border border-gray-700/40'} ${!content ? 'bg-gray-700/20' : ''}`}
                style={{
                  gridColumn: content?.colSpan === 2 ? 'span 2' : undefined,
                  aspectRatio: content ? undefined : '2.5/3.5',
                }}
              >
                {item && (
                  <img
                    src={item.imageDataUrl}
                    alt={item.label}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function PageSpreadView({ leftPage, rightPage, binder, library, leftLabel, rightLabel }: Props) {
  return (
    <div className="flex gap-6 flex-1 min-h-0 px-4">
      {leftPage ? (
        <ViewGrid page={leftPage} binder={binder} library={library} label={leftLabel} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-700">Cover</div>
      )}
      <div className="w-4 shrink-0 flex items-stretch">
        <div className="w-0.5 mx-auto bg-gray-700 rounded-full" />
      </div>
      {rightPage ? (
        <ViewGrid page={rightPage} binder={binder} library={library} label={rightLabel} />
      ) : (
        <div className="flex-1 bg-gray-800/20 rounded-xl border border-dashed border-gray-700 flex items-center justify-center text-gray-700 text-sm">
          End of binder
        </div>
      )}
    </div>
  )
}
