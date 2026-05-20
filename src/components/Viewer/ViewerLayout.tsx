import { useEffect, useState, useCallback } from 'react'
import type { BinderLayout, LibraryItem } from '../../types/binder'
import { PageSpreadView } from './PageSpreadView'

interface Props {
  binder: BinderLayout
  library: LibraryItem[]
  onEdit: () => void
  onHome: () => void
}

export function ViewerLayout({ binder, library, onEdit, onHome }: Props) {
  const [spreadIndex, setSpreadIndex] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')

  const pages = binder.pages
  const totalSpreads = Math.ceil(pages.length / 2)

  const navigate = useCallback((dir: 'forward' | 'back') => {
    const next = dir === 'forward' ? spreadIndex + 2 : spreadIndex - 2
    if (next < 0 || next >= pages.length) return
    setDirection(dir)
    setAnimating(true)
    setTimeout(() => {
      setSpreadIndex(next)
      setAnimating(false)
    }, 260)
  }, [spreadIndex, pages.length])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') navigate('forward')
      if (e.key === 'ArrowLeft') navigate('back')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  const leftPage = pages[spreadIndex]
  const rightPage = pages[spreadIndex + 1]

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Topbar */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-800 bg-gray-900 shrink-0">
        <button onClick={onHome} className="text-gray-500 hover:text-white text-sm transition-colors">← Home</button>
        <div className="w-px h-4 bg-gray-700" />
        <span className="text-white font-semibold text-sm">{binder.name}</span>
        <div className="flex-1" />
        <button
          onClick={onEdit}
          className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-1.5 rounded-lg transition-colors"
        >
          Edit
        </button>
      </div>

      {/* Spread */}
      <div
        className={`flex-1 flex flex-col min-h-0 py-6 transition-all ${
          animating
            ? direction === 'forward'
              ? 'page-flip-out'
              : 'page-flip-in'
            : ''
        }`}
      >
        <PageSpreadView
          leftPage={leftPage}
          rightPage={rightPage}
          binder={binder}
          library={library}
          leftLabel={`Page ${spreadIndex + 1}`}
          rightLabel={`Page ${spreadIndex + 2}`}
        />
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-800 bg-gray-900 shrink-0">
        <button
          disabled={spreadIndex === 0 || animating}
          onClick={() => navigate('back')}
          className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          ← Previous
        </button>
        <div className="flex gap-2 items-center">
          {Array.from({ length: totalSpreads }).map((_, i) => (
            <button
              key={i}
              onClick={() => setSpreadIndex(i * 2)}
              className={`w-2 h-2 rounded-full transition-colors ${
                Math.floor(spreadIndex / 2) === i ? 'bg-purple-500' : 'bg-gray-700 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
        <button
          disabled={spreadIndex + 2 >= pages.length || animating}
          onClick={() => navigate('forward')}
          className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
