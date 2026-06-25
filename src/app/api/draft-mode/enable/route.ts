import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

function isRelativePath(url: string): boolean {
  // Allow only relative paths starting with "/" but not "//" (protocol-relative)
  return url.startsWith('/') && !url.startsWith('//')
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.SANITY_DRAFT_SECRET) {
    return new Response('Invalid token', { status: 401 })
  }

  const rawRedirect = searchParams.get('redirect') ?? '/'
  const safePath = isRelativePath(rawRedirect) ? rawRedirect : '/'

  const draft = await draftMode()
  draft.enable()
  redirect(safePath)
}
