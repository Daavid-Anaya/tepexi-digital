import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET() {
  const draft = await draftMode()

  // Only allow disabling if draft mode is currently active
  if (!draft.isEnabled) {
    return new Response('Draft mode is not enabled', { status: 400 })
  }

  draft.disable()
  redirect('/')
}
