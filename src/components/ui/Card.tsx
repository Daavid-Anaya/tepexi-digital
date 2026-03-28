import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children: React.ReactNode
}

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        'bg-cream rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden',
        className,
      )}
    >
      {children}
    </div>
  )
}
