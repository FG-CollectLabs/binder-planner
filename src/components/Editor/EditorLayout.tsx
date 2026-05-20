import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { useState } from 'react'
import type { BinderLayout, LibraryItem } from '../../types/binder'
import { useBinderStore } from '../../store/useBinderStore'
import { Library } from './Library'
import { PageSpread } from './PageSpread'

interface Props {
  binder: BinderLayout
  library: LibraryItem[]
  onNavigateHome: () => void
  onViewBinder: () => void
}

export function EditorLayout({ binder, library, onNavigateHome, onViewBinder }: Props) {
  const placeItem = useBinderStore(s => s.placeItem)
  const moveItem = useBinderStore(s => s.moveItem)
  const updateName = useBinderStore(s => s.updateName)
  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal] = useState(binder.name)
  const [draggedItem, setDraggedItem] = useState<LibraryItem | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  function handleDragStart(e: DragStartEvent) {
    const data = e.active.data.current
    if (!data) return
    if (data.type === 'library') {
      const item = library.find(i => i.id === data.itemId)
      setDraggedItem(item ?? null)
    } else if (data.type === 'slot') {
      const item = library.find(i => i.id === data.itemId)
      setDraggedItem(item ?? null)
    }
  }

  function handleDragEnd(e: DragEndEvent) {
    setDraggedItem(null)
    const { active, over } = e
    if (!over) return

    const activeData = active.data.current
    const overData = over.data.current
    if (!activeData || !overData || overData.type !== 'slot') return

    if (activeData.type === 'library') {
      placeItem(overData.pageId, overData.slotIndex, activeData.itemId)
    } else if (activeData.type === 'slot') {
      if (activeData.pageId === overData.pageId && activeData.slotIndex === overData.slotIndex) return
      moveItem(activeData.pageId, activeData.slotIndex, overData.pageId, overData.slotIndex)
    }
  }

  function commitName() {
    setEditingName(false)
    if (nameVal.trim()) updateName(nameVal.trim())
    else setNameVal(binder.name)
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-screen bg-gray-900">
        {/* Topbar */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-700 bg-gray-800 shrink-0">
          <button
            onClick={onNavigateHome}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            ← Home
          </button>
          <div className="w-px h-4 bg-gray-600" />
          {editingName ? (
            <input
              autoFocus
              value={nameVal}
              onChange={e => setNameVal(e.target.value)}
              onBlur={commitName}
              onKeyDown={e => e.key === 'Enter' && commitName()}
              className="bg-gray-700 text-white text-sm font-semibold px-2 py-1 rounded outline-none border border-purple-500 min-w-0"
            />
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="text-white font-semibold text-sm hover:text-purple-300 transition-colors"
              title="Click to rename"
            >
              {binder.name}
            </button>
          )}
          <div className="flex-1" />
          <span className="text-gray-500 text-xs">{binder.pocketLayout} · {binder.binderType}</span>
          <button
            onClick={onViewBinder}
            className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
          >
            View Binder →
          </button>
        </div>

        {/* Main */}
        <div className="flex flex-1 min-h-0">
          <Library />
          <div className="flex-1 min-w-0 flex flex-col">
            <PageSpread binder={binder} library={library} />
          </div>
        </div>
      </div>

      <DragOverlay>
        {draggedItem && (
          <div className="w-20 aspect-[2.5/3.5] drag-overlay rounded-lg overflow-hidden border-2 border-purple-400">
            <img src={draggedItem.imageDataUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
