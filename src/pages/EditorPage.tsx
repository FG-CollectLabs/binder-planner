import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useBinderStore } from '../store/useBinderStore'
import { getBinders, getLibraryItems } from '../store/storage'
import { EditorLayout } from '../components/Editor/EditorLayout'

export function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const binder = useBinderStore(s => s.binder)
  const library = useBinderStore(s => s.library)
  const loadBinder = useBinderStore(s => s.loadBinder)
  const loadLibrary = useBinderStore(s => s.loadLibrary)

  useEffect(() => {
    async function load() {
      const [binders, items] = await Promise.all([getBinders(), getLibraryItems()])
      const found = binders.find(b => b.id === id)
      if (!found) { navigate('/'); return }
      loadBinder(found)
      loadLibrary(items)
    }
    load()
  }, [id])

  if (!binder) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-400">
        Loading…
      </div>
    )
  }

  return (
    <EditorLayout
      binder={binder}
      library={library}
      onNavigateHome={() => navigate('/')}
      onViewBinder={() => navigate(`/binder/${binder.id}/view`)}
    />
  )
}
