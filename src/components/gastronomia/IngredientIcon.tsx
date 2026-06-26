import { Utensils, Flame, Leaf, CircleDot } from 'lucide-react'

interface IngredientIconProps {
  icon: string | null
}

export function IngredientIcon({ icon }: IngredientIconProps) {
  if (icon === 'utensils') return <Utensils className="w-5 h-5 text-accent" />
  if (icon === 'flame') return <Flame className="w-5 h-5 text-accent" />
  if (icon === 'leaf') return <Leaf className="w-5 h-5 text-accent" />
  if (icon === 'grain') return <CircleDot className="w-5 h-5 text-accent" />
  return <Utensils className="w-5 h-5 text-accent" />
}
