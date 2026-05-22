import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { BinderPage, BinderLayout, LibraryItem } from '../../types/binder'
import { LAYOUT_COLS, LAYOUT_SLOT_COUNT, isContent, isMerged } from '../../types/binder'

interface PageThumbProps {
  page: BinderPage
  binder: BinderLayout
  library: LibraryItem[]
  index: number
}

function PageThumb({ page, binder, library, index }: PageThumbProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: page.id })
  const cols = LAYOUT_COLS[binder.pocketLayout]
  const total = LAYOUT_SLOT_COUNT[binder.pocketLayout]

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-800 border select-none
        ${isDragging ? 'border-purple-500 shadow-lg shadow-purple-900/30 z-50 opacity-90' : 'border-gray-700'}
      `}
    >
      {/* drag handle */}
      <div
        {...listeners}
        {...attributes}
        className="text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing px-1 shrink-0"
        title="Drag to reorder"
      >
        ⠿
      </div>

      {/* mini grid thumbnail */}
      <div
        className="shrink-0 rounded overflow-hidden bg-gray-900 border border-gray-700"
        style={{ width: 48, height: 64 }}
      >
        <div
          className="grid gap-0.5 p-0.5 h-full"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${total / cols}, 1fr)` }}
        >
          {page.slots.map((slot, i) => {
            if (isMerged(slot)) return null
            const content = isContent(slot) ? slot : null
            const item = content ? library.find(lib => lib.id === content.itemId) : undefined
            return (
              <div
                key={i}
                className="rounded-sm overflow-hidden"
                style={{
                  gridColumn: content?.colSpan === 2 ? 'span 2' : undefined,
                  gridRow: content?.rowSpan === 2 ? 'span 2' : undefined,
                  background: item ? undefined : '#374151',
                }}
              >
                {item && (
                  <img src={item.imageDataUrl} alt="" className="w-full h-full object-cover" draggable={false} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <span className="text-gray-300 text-sm font-medium">Page {index + 1}</span>
    </div>
  )
}

interface Props {
  binder: BinderLayout
  library: LibraryItem[]
  onReorder: (orderedIds: string[]) => void
  onClose: () => void
}

export function PageManagerModal({ binder, library, onReorder, onClose }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const ids = binder.pages.map(p => p.id)
    const from = ids.indexOf(active.id as string)
    const to = ids.indexOf(over.id as string)
    onReorder(arrayMove(ids, from, to))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-80 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 shrink-0">
          <span className="text-white font-semibold text-sm">Reorder Pages</span>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-lg leading-none transition-colors">✕</button>
        </div>

        <div className="overflow-y-auto p-3 flex flex-col gap-2">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={binder.pages.map(p => p.id)} strategy={verticalListSortingStrategy}>
              {binder.pages.map((page, i) => (
                <PageThumb key={page.id} page={page} binder={binder} library={library} index={i} />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <div className="px-4 py-3 border-t border-gray-700 shrink-0">
          <p className="text-gray-500 text-xs text-center">Drag pages to reorder · changes save instantly</p>
        </div>
      </div>
    </div>
  )
}
