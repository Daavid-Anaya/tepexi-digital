import type { PortableTextComponents } from '@portabletext/react'
import { isSafeUrl } from '@/lib/safe-url'

type AccentColor = 'primary' | 'secondary'

const COLOR_MAP = {
  primary: {
    rgb: '139,69,19',
    highlightClass: 'text-primary-dark not-italic font-medium',
    linkClass: 'text-primary underline underline-offset-4 hover:text-primary-dark transition-colors',
  },
  secondary: {
    rgb: '46,125,50',
    highlightClass: 'text-secondary not-italic font-medium',
    linkClass: 'text-secondary underline underline-offset-4 hover:text-secondary/80 transition-colors',
  },
} as const

export function makeDescriptionComponents(accent: AccentColor): PortableTextComponents {
  const c = COLOR_MAP[accent]
  return {
    block: {
      normal: ({ children }) => (
        <p style={{ marginBottom: '1rem', lineHeight: '1.75' }} className="text-stone">
          {children}
        </p>
      ),
      h2: ({ children }) => (
        <h2
          style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '2rem', marginBottom: '0.75rem', lineHeight: '1.3' }}
          className="font-heading text-text-primary"
        >
          {children}
        </h2>
      ),
      h3: ({ children }) => (
        <h3
          style={{ fontSize: '1.2rem', fontWeight: 600, marginTop: '1.5rem', marginBottom: '0.5rem', lineHeight: '1.4' }}
          className="font-heading text-text-primary"
        >
          {children}
        </h3>
      ),
      blockquote: ({ children }) => (
        <blockquote
          style={{
            borderLeft: `4px solid rgba(${c.rgb},0.4)`,
            backgroundColor: `rgba(${c.rgb},0.05)`,
            paddingLeft: '1rem',
            paddingRight: '1rem',
            paddingTop: '0.5rem',
            paddingBottom: '0.5rem',
            marginTop: '1rem',
            marginBottom: '1rem',
            borderRadius: '0 0.5rem 0.5rem 0',
            fontStyle: 'italic',
          }}
          className="text-stone"
        >
          {children}
        </blockquote>
      ),
    },
    marks: {
      highlight: ({ children }) => (
        <mark
          style={{ backgroundColor: `rgba(${c.rgb},0.12)`, borderRadius: '2px', padding: '0 2px' }}
          className={c.highlightClass}
        >
          {children}
        </mark>
      ),
      link: ({ value, children }) => {
        const href = value?.href
        if (!isSafeUrl(href)) return <>{children}</>
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={c.linkClass}
          >
            {children}
          </a>
        )
      },
    },
  }
}
