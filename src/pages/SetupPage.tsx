import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { BinderType, PocketLayout } from '../types/binder'
import { TypePicker } from '../components/Setup/TypePicker'
import { LayoutPicker } from '../components/Setup/LayoutPicker'
import { createBinder } from '../store/useBinderStore'
import { saveBinder } from '../store/storage'

type Step = 'type' | 'layout' | 'name'

export function SetupPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('type')
  const [binderType, setBinderType] = useState<BinderType | null>(null)
  const [pocketLayout, setPocketLayout] = useState<PocketLayout | null>(null)
  const [name, setName] = useState('')

  const STEPS: Step[] = ['type', 'layout', 'name']
  const stepIndex = STEPS.indexOf(step)

  async function handleCreate() {
    if (!binderType || !pocketLayout || !name.trim()) return
    const binder = createBinder(name.trim(), binderType, pocketLayout)
    await saveBinder(binder)
    navigate(`/binder/${binder.id}/edit`)
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        {/* Back */}
        <button
          onClick={() => stepIndex === 0 ? navigate('/') : setStep(STEPS[stepIndex - 1])}
          className="text-gray-400 hover:text-white text-sm mb-8 flex items-center gap-1 transition-colors"
        >
          ← {stepIndex === 0 ? 'Back to Home' : 'Back'}
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i < stepIndex ? 'bg-purple-600 text-white' :
                i === stepIndex ? 'bg-purple-500 text-white' :
                'bg-gray-700 text-gray-500'
              }`}>
                {i < stepIndex ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 transition-colors ${i < stepIndex ? 'bg-purple-600' : 'bg-gray-700'}`} />
              )}
            </div>
          ))}
        </div>

        {step === 'type' && (
          <>
            <h2 className="text-2xl font-bold text-white mb-2">Choose binder type</h2>
            <p className="text-gray-400 mb-6 text-sm">This affects how pockets are styled visually.</p>
            <TypePicker value={binderType} onChange={setBinderType} />
            <button
              disabled={!binderType}
              onClick={() => setStep('layout')}
              className="mt-6 w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors"
            >
              Continue
            </button>
          </>
        )}

        {step === 'layout' && (
          <>
            <h2 className="text-2xl font-bold text-white mb-2">Choose pocket layout</h2>
            <p className="text-gray-400 mb-6 text-sm">How many pockets per page?</p>
            <LayoutPicker value={pocketLayout} onChange={setPocketLayout} />
            <button
              disabled={!pocketLayout}
              onClick={() => setStep('name')}
              className="mt-6 w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors"
            >
              Continue
            </button>
          </>
        )}

        {step === 'name' && (
          <>
            <h2 className="text-2xl font-bold text-white mb-2">Name your binder</h2>
            <p className="text-gray-400 mb-6 text-sm">Give it a name that describes your collection theme.</p>
            <input
              type="text"
              autoFocus
              placeholder="e.g. Charizard Collection, Holo Era Showcase…"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && name.trim() && handleCreate()}
              className="w-full bg-gray-800 border border-gray-600 text-white placeholder-gray-500 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-colors text-lg"
            />
            <button
              disabled={!name.trim()}
              onClick={handleCreate}
              className="mt-6 w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors"
            >
              Create Binder →
            </button>
          </>
        )}
      </div>
    </div>
  )
}
