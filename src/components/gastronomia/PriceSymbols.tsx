import { PRICE_RANGE_SYMBOLS } from './constants'

interface PriceSymbolsProps {
  priceRange: string
}

export function PriceSymbols({ priceRange }: PriceSymbolsProps) {
  const active = PRICE_RANGE_SYMBOLS[priceRange] ?? 1
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={`text-lg font-bold ${n <= active ? 'text-accent' : 'text-stone/40'}`}
        >
          $
        </span>
      ))}
    </div>
  )
}
