import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'

const BUTTON_VARIANT = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  GHOST: 'ghost',
  OUTLINE: 'outline',
} as const

const BUTTON_SIZE = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
} as const

type ButtonVariant = (typeof BUTTON_VARIANT)[keyof typeof BUTTON_VARIANT]
type ButtonSize = (typeof BUTTON_SIZE)[keyof typeof BUTTON_SIZE]

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: React.ReactNode
  asChild?: boolean
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-dark hover:shadow-md active:scale-[0.98] focus-visible:outline-primary',
  secondary:
    'bg-secondary text-white hover:bg-secondary/90 hover:shadow-md active:scale-[0.98] focus-visible:outline-secondary',
  ghost:
    'text-primary hover:bg-primary/10 active:bg-primary/15 focus-visible:outline-primary',
  outline:
    'border border-primary text-primary hover:bg-primary hover:text-white hover:shadow-md active:scale-[0.98] focus-visible:outline-primary',
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3.5 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg',
}

export function Button({
  variant = BUTTON_VARIANT.PRIMARY,
  size = BUTTON_SIZE.MD,
  className,
  children,
  disabled,
  asChild = false,
  ...props
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
    'transition-all duration-200',
    'focus-visible:outline-2 focus-visible:outline-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'hover:scale-[1.02]',
    variantClasses[variant],
    sizeClasses[size],
    className,
  )

  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      className={classes}
      disabled={disabled}
      {...props}
    >
      {children}
    </Comp>
  )
}
