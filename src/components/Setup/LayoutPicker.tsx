import type { PocketLayout } from '../../types/binder'

interface Props {
  value: PocketLayout | null
  onChange: (v: PocketLayout) => void
}

const OPTIONS: { value: PocketLayout; label: string; desc: string; grid: [number, number] }[] = [
  { value: '4-pocket', label: '4 Pocket', desc: '2 × 2 — oversized cards, postcards, fan art', grid: [2, 2] },
  { value: '9-pocket', label: '9 Pocket', desc: '3 × 3 — standard TCG binder layout', grid: [3, 3] },
  { value: '12-pocket', label: '12 Pocket', desc: '4 × 3 — maximum capacity per page', grid: [4, 3] },
]

function MiniGrid({ cols, rows }: { cols: number; rows: number }) {
  return (
    <div
      className="grid gap-0.5 w-16 h-14"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {Array.from({ length: cols * rows }).map((_, i) => (
        <div key={i} className="bg-gray-600 rounded-sm" />
      ))}
    </div>
  )
}

export function LayoutPicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`
            text-left p-5 rounded-xl border-2 transition-all flex flex-col gap-3
            ${value === opt.value
              ? 'border-purple-500 bg-purple-900/30'
              : 'border-gray-700 bg-gray-800 hover:border-gray-500'
            }
          `}
        >
          <MiniGrid cols={opt.grid[0]} rows={opt.grid[1]} />
          <div>
            <div className="text-white font-semibold">{opt.label}</div>
            <div className="text-gray-400 text-sm mt-1">{opt.desc}</div>
          </div>
        </button>
      ))}
    </div>
  )
}
