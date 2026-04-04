import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children: React.ReactNode
}

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        'group bg-cream rounded-xl border border-stone/10 shadow-sm overflow-hidden',
        'hover:-translate-y-0.5 hover:shadow-lg hover:border-stone/20',
        'transition-all duration-300',
        className,
      )}
    >
      {children}
    </div>
  )
}
