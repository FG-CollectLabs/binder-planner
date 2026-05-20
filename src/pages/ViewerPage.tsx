import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useBinderStore } from '../store/useBinderStore'
import { getBinders, getLibraryItems } from '../store/storage'
import { ViewerLayout } from '../components/Viewer/ViewerLayout'

export function ViewerPage() {
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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-500">
        Loading…
      </div>
    )
  }

  return (
    <ViewerLayout
      binder={binder}
      library={library}
      onEdit={() => navigate(`/binder/${binder.id}/edit`)}
      onHome={() => navigate('/')}
    />
  )
}
