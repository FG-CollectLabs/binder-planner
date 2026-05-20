import { useDroppable } from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { SlotContent, LibraryItem } from '../../types/binder'

interface Props {
  pageId: string
  slotIndex: number
  content: SlotContent | null
  item: LibraryItem | undefined
  colSpan: 1 | 2
  onRemove: () => void
  onToggleSpan: () => void
  isToploader: boolean
}

function OccupiedSlot({
  pageId, slotIndex, content, item, colSpan, onRemove, onToggleSpan, isToploader,
}: Props & { content: SlotContent }) {
  const { attributes, listeners, setNodeRef: setDrag, transform, isDragging } = useDraggable({
    id: `slot-${pageId}-${slotIndex}`,
    data: { type: 'slot', pageId, slotIndex, itemId: content.itemId },
  })

  return (
    <div
      ref={setDrag}
      {...listeners}
      {...attributes}
      className={`relative w-full h-full cursor-grab group ${isDragging ? 'opacity-30' : ''}`}
      style={{
        transform: CSS.Translate.toString(transform),
        gridColumn: colSpan === 2 ? 'span 2' : undefined,
      }}
    >
      {item && (
        <img
          src={item.imageDataUrl}
          alt={item.label}
          className={`w-full h-full object-cover ${isToploader ? 'rounded-sm' : 'rounded-sm'}`}
          draggable={false}
        />
      )}
      {/* Hover controls */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm flex items-center justify-center gap-1.5">
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={onToggleSpan}
          title={colSpan === 1 ? 'Expand to 2 slots' : 'Shrink to 1 slot'}
          className="bg-white/20 hover:bg-white/40 text-white text-xs px-1.5 py-1 rounded transition-colors"
        >
          {colSpan === 1 ? '⟷' : '→|'}
        </button>
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={onRemove}
          className="bg-red-600/70 hover:bg-red-600 text-white text-xs px-1.5 py-1 rounded transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export function PocketSlot({ pageId, slotIndex, content, item, colSpan, onRemove, onToggleSpan, isToploader }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: `drop-${pageId}-${slotIndex}`,
    data: { type: 'slot', pageId, slotIndex },
  })

  const baseClass = `
    relative rounded-sm transition-all
    ${isToploader ? 'border-2 border-gray-600' : 'border border-gray-600/50'}
    ${isOver && !content ? 'border-purple-400 bg-purple-900/30 scale-[1.02]' : ''}
    ${!content ? 'bg-gray-700/40 hover:bg-gray-700/60' : ''}
  `

  if (content) {
    return (
      <div
        ref={setNodeRef}
        className={baseClass}
        style={{ gridColumn: colSpan === 2 ? 'span 2' : undefined }}
      >
        <OccupiedSlot
          pageId={pageId}
          slotIndex={slotIndex}
          content={content}
          item={item}
          colSpan={colSpan}
          onRemove={onRemove}
          onToggleSpan={onToggleSpan}
          isToploader={isToploader}
        />
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      className={baseClass}
      style={{ aspectRatio: '2.5/3.5' }}
    >
      {isOver && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-purple-400 text-2xl">+</div>
        </div>
      )}
    </div>
  )
}
