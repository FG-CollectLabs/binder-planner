import { useEffect } from 'react'
import type { BinderLayout, LibraryItem } from '../../types/binder'
import { useBinderStore } from '../../store/useBinderStore'
import { PocketGrid } from './PocketGrid'

interface Props {
  binder: BinderLayout
  library: LibraryItem[]
}

export function PageSpread({ binder, library }: Props) {
  const spreadIndex = useBinderStore(s => s.spreadIndex)
  const setSpreadIndex = useBinderStore(s => s.setSpreadIndex)
  const addPage = useBinderStore(s => s.addPage)
  const movePage = useBinderStore(s => s.movePage)

  const pages = binder.pages

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowRight' && spreadIndex + 2 < pages.length) setSpreadIndex(spreadIndex + 2)
      if (e.key === 'ArrowLeft' && spreadIndex > 0) setSpreadIndex(spreadIndex - 2)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [spreadIndex, pages.length, setSpreadIndex])

  const leftPage = pages[spreadIndex]
  const rightPage = pages[spreadIndex + 1]
  const totalSpreads = Math.ceil(pages.length / 2)
  const currentSpread = spreadIndex / 2 + 1

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-3 p-4">
      {/* Pages */}
      <div className="flex gap-4 flex-1 min-h-0">
        {leftPage ? (
          <PocketGrid
            page={leftPage} binder={binder} library={library} label={`Page ${spreadIndex + 1}`}
            canMoveLeft={spreadIndex > 0}
            canMoveRight={spreadIndex + 1 < pages.length - 1}
            onMoveLeft={() => movePage(leftPage.id, 'left')}
            onMoveRight={() => movePage(leftPage.id, 'right')}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">No page</div>
        )}

        {/* Spine */}
        <div className="w-4 shrink-0 flex items-stretch">
          <div className="w-0.5 mx-auto bg-gray-700 rounded-full" />
        </div>

        {rightPage ? (
          <PocketGrid
            page={rightPage} binder={binder} library={library} label={`Page ${spreadIndex + 2}`}
            canMoveLeft={spreadIndex + 1 > 0}
            canMoveRight={spreadIndex + 2 < pages.length - 1}
            onMoveLeft={() => movePage(rightPage.id, 'left')}
            onMoveRight={() => movePage(rightPage.id, 'right')}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <button
              onClick={addPage}
              className="text-gray-500 hover:text-purple-400 text-sm border border-dashed border-gray-600 hover:border-purple-500 px-6 py-4 rounded-xl transition-colors"
            >
              + Add Page
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between bg-gray-800/50 rounded-xl px-4 py-2">
        <button
          disabled={spreadIndex === 0}
          onClick={() => setSpreadIndex(spreadIndex - 2)}
          className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors text-sm"
        >
          ← Prev
        </button>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">
            Spread {currentSpread} / {totalSpreads}
          </span>
          <button
            onClick={addPage}
            className="text-purple-400 hover:text-purple-300 text-sm px-2 py-1 rounded-lg hover:bg-gray-700 transition-colors"
          >
            + Page
          </button>
        </div>
        <button
          disabled={spreadIndex + 2 >= pages.length}
          onClick={() => setSpreadIndex(spreadIndex + 2)}
          className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors text-sm"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
