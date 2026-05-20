import { useRef, useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { ItemType, LibraryItem } from '../../types/binder'
import { useBinderStore } from '../../store/useBinderStore'
import { fileToLibraryItem } from '../../hooks/useImageUpload'

const ITEM_TYPES: ItemType[] = ['card', 'postcard', 'fan-art', 'deck-sleeve', 'custom']
const TYPE_COLORS: Record<ItemType, string> = {
  card: 'bg-blue-600',
  postcard: 'bg-amber-600',
  'fan-art': 'bg-pink-600',
  'deck-sleeve': 'bg-green-600',
  custom: 'bg-gray-600',
}

function DraggableItem({ item, onRemove }: { item: LibraryItem; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `library-${item.id}`,
    data: { type: 'library', itemId: item.id },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`relative rounded-lg overflow-hidden cursor-grab group aspect-[2.5/3.5] border-2 border-transparent hover:border-purple-500 transition-all ${isDragging ? 'opacity-30' : ''}`}
      style={{ transform: CSS.Translate.toString(transform) }}
    >
      <img src={item.imageDataUrl} alt={item.label} className="w-full h-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className={`inline-block text-white text-[10px] px-1.5 py-0.5 rounded ${TYPE_COLORS[item.type]}`}>
          {item.type}
        </div>
      </div>
      <button
        onPointerDown={e => e.stopPropagation()}
        onClick={onRemove}
        className="absolute top-1 right-1 bg-black/60 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
      >
        ✕
      </button>
    </div>
  )
}

export function Library() {
  const library = useBinderStore(s => s.library)
  const addLibraryItem = useBinderStore(s => s.addLibraryItem)
  const removeLibraryItem = useBinderStore(s => s.removeLibraryItem)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadType, setUploadType] = useState<ItemType>('card')
  const [draggingOver, setDraggingOver] = useState(false)

  async function handleFiles(files: FileList | null) {
    if (!files) return
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      const item = await fileToLibraryItem(file, uploadType)
      addLibraryItem(item)
    }
  }

  return (
    <div className="w-56 shrink-0 flex flex-col bg-gray-800 border-r border-gray-700 h-full overflow-hidden">
      <div className="p-3 border-b border-gray-700">
        <h3 className="text-white font-semibold text-sm mb-2">Image Library</h3>
        {/* Type selector */}
        <select
          value={uploadType}
          onChange={e => setUploadType(e.target.value as ItemType)}
          className="w-full bg-gray-700 text-white text-xs rounded-md px-2 py-1.5 border border-gray-600 outline-none mb-2"
        >
          {ITEM_TYPES.map(t => (
            <option key={t} value={t}>{t.replace('-', ' ')}</option>
          ))}
        </select>
        {/* Upload zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDraggingOver(true) }}
          onDragLeave={() => setDraggingOver(false)}
          onDrop={e => { e.preventDefault(); setDraggingOver(false); handleFiles(e.dataTransfer.files) }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors ${
            draggingOver ? 'border-purple-400 bg-purple-900/30' : 'border-gray-600 hover:border-gray-400'
          }`}
        >
          <div className="text-gray-400 text-xs">Drop images here<br />or click to upload</div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />
        </div>
      </div>

      {/* Item grid */}
      <div className="flex-1 overflow-y-auto p-2">
        {library.length === 0 ? (
          <p className="text-gray-500 text-xs text-center mt-6">No images yet</p>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {library.map(item => (
              <DraggableItem
                key={item.id}
                item={item}
                onRemove={() => removeLibraryItem(item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
