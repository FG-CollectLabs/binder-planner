import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { SetupPage } from './pages/SetupPage'
import { EditorPage } from './pages/EditorPage'
import { ViewerPage } from './pages/ViewerPage'

export default function App() {
  return (
    <BrowserRouter basename="/binder-planner">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/new" element={<SetupPage />} />
        <Route path="/binder/:id/edit" element={<EditorPage />} />
        <Route path="/binder/:id/view" element={<ViewerPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
