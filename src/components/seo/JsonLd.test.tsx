import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { JsonLd } from '@/components/seo/JsonLd'

describe('JsonLd', () => {
  it('serializes less-than characters as literal unicode escape sequences', () => {
    const markup = renderToStaticMarkup(
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Thing',
          description: '<script>alert("xss")</script>',
        }}
      />,
    )

    expect(markup).toContain('"description":"\\u003cscript>alert(\\"xss\\")\\u003c/script>"')
    expect(markup).not.toContain('</script><')
    expect(markup).not.toContain('<script>alert("xss")</script>')
  })
})
