interface QuoteCardProps {
  text: string
  author: string
}

export function QuoteCard({ text, author }: QuoteCardProps) {
  return (
    <figure className="rounded-2xl p-4 sm:p-6 border bg-primary-50 border-[#E8DDD5]">
      <span
        className="block font-heading text-5xl leading-none mb-3 text-accent/25"
        aria-hidden="true"
      >
        &ldquo;
      </span>
      <blockquote className="font-heading italic text-primary text-base leading-relaxed mb-3">
        {text}
      </blockquote>
      <figcaption className="text-xs tracking-widest uppercase font-medium text-accent">
        — {author}
      </figcaption>
    </figure>
  )
}
