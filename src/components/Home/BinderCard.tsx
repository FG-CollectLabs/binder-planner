import type { BinderLayout } from '../../types/binder'

interface Props {
  binder: BinderLayout
  onOpen: (id: string) => void
  onDelete: (id: string) => void
}

const LAYOUT_LABEL = {
  '4-pocket': '4 Pocket',
  '9-pocket': '9 Pocket',
  '12-pocket': '12 Pocket',
}

const TYPE_LABEL = {
  penny: 'Penny Sleeve',
  toploader: 'Top Loader',
}

export function BinderCard({ binder, onOpen, onDelete }: Props) {
  const updated = new Date(binder.updatedAt).toLocaleDateString()

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 flex flex-col gap-3 hover:border-purple-500 transition-colors group">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-white font-semibold text-lg leading-tight">{binder.name}</h3>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(binder.id) }}
          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all text-sm px-1"
          title="Delete binder"
        >
          ✕
        </button>
      </div>
      <div className="flex gap-2 flex-wrap">
        <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-md">
          {TYPE_LABEL[binder.binderType]}
        </span>
        <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-md">
          {LAYOUT_LABEL[binder.pocketLayout]}
        </span>
        <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-md">
          {binder.pages.length} pages
        </span>
      </div>
      <p className="text-gray-500 text-xs">Updated {updated}</p>
      <div className="flex gap-2 mt-auto">
        <button
          onClick={() => onOpen(binder.id)}
          className="flex-1 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium py-2 rounded-lg transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onOpen(binder.id + '/view')}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2 rounded-lg transition-colors"
        >
          View
        </button>
      </div>
    </div>
  )
}
