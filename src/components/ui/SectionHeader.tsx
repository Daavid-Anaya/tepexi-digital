interface SectionHeaderProps {
  eyebrow: string
  title: string
  description?: string
  /** CSS color value passed as inline style, e.g. CATEGORY_COLORS.cultura */
  accentColor: string
}

export function SectionHeader({ eyebrow, title, description, accentColor }: SectionHeaderProps) {
  return (
    <div className="mb-8 md:mb-12 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-3">
        <span
          className="block w-8 h-0.5 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
        <span
          className="text-sm font-semibold uppercase tracking-widest"
          style={{ color: accentColor }}
        >
          {eyebrow}
        </span>
      </div>
      <h2 className="font-heading font-bold text-3xl md:text-4xl text-text-primary">
        {title}
      </h2>
      {description && (
        <p className="mt-2 text-stone text-base max-w-xl leading-relaxed">
          {description}
        </p>
      )}
    </div>
  )
}
