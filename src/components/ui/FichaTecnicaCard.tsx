import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export interface FichaItem {
  icon: LucideIcon
  iconColor: string
  iconBg: string
  label: string
  value: ReactNode
}

interface FichaTecnicaCardProps {
  title: string
  headerColor: string
  items: FichaItem[]
  emptyMessage?: string
  footer?: ReactNode
}

export function FichaTecnicaCard({
  title,
  headerColor,
  items,
  emptyMessage = 'Información no disponible aún.',
  footer,
}: FichaTecnicaCardProps) {
  const visibleItems = items.filter((item) => item.value != null)

  return (
    <aside className="space-y-4">
      <div className="bg-cream rounded-2xl border border-stone/10 overflow-hidden shadow-sm">
        <div className="px-4 sm:px-5 py-4" style={{ backgroundColor: headerColor }}>
          <h2 className="font-heading font-semibold text-white text-sm tracking-wide uppercase">
            {title}
          </h2>
        </div>

        <div className="p-4 sm:p-5">
          {visibleItems.length > 0 ? (
            <dl className="space-y-5">
              {visibleItems.map((item) => (
                <div key={item.label} className="flex gap-3.5">
                  <div
                    className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: item.iconBg }}
                  >
                    <item.icon
                      className="w-[18px] h-[18px]"
                      style={{ color: item.iconColor }}
                    />
                  </div>
                  <div>
                    <dt className="text-[11px] text-stone uppercase tracking-widest font-semibold mb-0.5">
                      {item.label}
                    </dt>
                    <dd className="text-sm text-stone leading-snug">{item.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-stone/60 italic text-center py-4">{emptyMessage}</p>
          )}
        </div>
      </div>
      {footer}
    </aside>
  )
}
