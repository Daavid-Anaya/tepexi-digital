import { Flame } from 'lucide-react'
import { DIFFICULTY_FLAMES, DIFFICULTY_LABEL } from './constants'

interface DifficultyFlamesProps {
  difficulty: string
}

export function DifficultyFlames({ difficulty }: DifficultyFlamesProps) {
  const filled = DIFFICULTY_FLAMES[difficulty] ?? 1
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3].map((n) => (
        <Flame
          key={n}
          className={`w-4 h-4 ${n <= filled ? 'text-accent fill-accent' : 'text-stone/40 fill-stone/40'}`}
        />
      ))}
      <span className="ml-1.5 text-sm text-stone font-medium">
        {DIFFICULTY_LABEL[difficulty] ?? difficulty}
      </span>
    </div>
  )
}
