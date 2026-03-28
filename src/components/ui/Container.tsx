import { cn } from '@/lib/utils'

type ContainerElement = 'div' | 'section' | 'article' | 'main' | 'header' | 'footer' | 'aside'

interface ContainerProps {
  className?: string
  children: React.ReactNode
  as?: ContainerElement
}

export function Container({
  className,
  children,
  as: Tag = 'div',
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        'max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8',
        className,
      )}
    >
      {children}
    </Tag>
  )
}
