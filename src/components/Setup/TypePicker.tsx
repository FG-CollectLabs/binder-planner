import type { BinderType } from '../../types/binder'

interface Props {
  value: BinderType | null
  onChange: (v: BinderType) => void
}

const OPTIONS: { value: BinderType; label: string; desc: string; icon: string }[] = [
  {
    value: 'penny',
    label: 'Penny Sleeve Binder',
    desc: 'Standard soft binder with penny sleeve pages. Great for bulk display.',
    icon: '📗',
  },
  {
    value: 'toploader',
    label: 'Top Loader Binder',
    desc: 'Rigid top-loader style pages. Best for premium display pieces.',
    icon: '📘',
  },
]

export function TypePicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`
            text-left p-5 rounded-xl border-2 transition-all
            ${value === opt.value
              ? 'border-purple-500 bg-purple-900/30'
              : 'border-gray-700 bg-gray-800 hover:border-gray-500'
            }
          `}
        >
          <div className="text-4xl mb-3">{opt.icon}</div>
          <div className="text-white font-semibold mb-1">{opt.label}</div>
          <div className="text-gray-400 text-sm">{opt.desc}</div>
        </button>
      ))}
    </div>
  )
}
