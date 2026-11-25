import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET() {
  const draft = await draftMode()

  // Solo permite desactivarlo si el modo borrador está activo
  if (!draft.isEnabled) {
    return new Response('Draft mode is not enabled', { status: 400 })
  }

  draft.disable()
  redirect('/')
}
