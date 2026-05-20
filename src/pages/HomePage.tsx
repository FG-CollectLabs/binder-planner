import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { BinderLayout } from '../types/binder'
import { getBinders, deleteBinder } from '../store/storage'
import { importBinder } from '../store/exportImport'
import { BinderCard } from '../components/Home/BinderCard'
import { useExtensionBridge } from '../hooks/useExtensionBridge'

export function HomePage() {
  const navigate = useNavigate()
  useExtensionBridge()
  const [binders, setBinders] = useState<BinderLayout[]>([])
  const [importError, setImportError] = useState<string | null>(null)
  const importRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getBinders().then(setBinders)
  }, [])

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    try {
      const binder = await importBinder(file)
      navigate(`/binder/${binder.id}/edit`)
    } catch {
      setImportError('Could not import — make sure it\'s a valid binder JSON file.')
      setTimeout(() => setImportError(null), 4000)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this binder?')) return
    await deleteBinder(id)
    setBinders(prev => prev.filter(b => b.id !== id))
  }

  function handleOpen(idOrPath: string) {
    if (idOrPath.endsWith('/view')) {
      navigate(`/binder/${idOrPath.replace('/view', '')}/view`)
    } else {
      navigate(`/binder/${idOrPath}/edit`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Binder Planner</h1>
            <p className="text-gray-400 mt-1 text-sm">Design michi-style binder displays for your collection</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => importRef.current?.click()}
              className="bg-gray-700 hover:bg-gray-600 text-white font-medium px-4 py-2.5 rounded-xl transition-colors text-sm"
              title="Import a binder from a JSON file"
            >
              Import
            </button>
            <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            <button
              onClick={() => navigate('/new')}
              className="bg-purple-600 hover:bg-purple-500 text-white font-medium px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2"
            >
              <span className="text-lg leading-none">+</span> New Binder
            </button>
          </div>
        </div>

        {importError && (
          <div className="mb-4 bg-red-900/50 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-xl">
            {importError}
          </div>
        )}

        {binders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="text-6xl">📂</div>
            <h2 className="text-xl font-semibold text-white">No binders yet</h2>
            <p className="text-gray-400 max-w-sm">
              Create your first binder to start planning a michi-style display layout for your collection.
            </p>
            <button
              onClick={() => navigate('/new')}
              className="mt-2 bg-purple-600 hover:bg-purple-500 text-white font-medium px-6 py-3 rounded-xl transition-colors"
            >
              Create First Binder
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {binders.map(b => (
              <BinderCard
                key={b.id}
                binder={b}
                onOpen={handleOpen}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
