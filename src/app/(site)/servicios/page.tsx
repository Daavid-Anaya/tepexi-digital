import { redirect } from 'next/navigation'

// Servicios don't have a dedicated list page yet.
// Redirect users to the map where all service markers are visible.
export default function ServiciosPage() {
  redirect('/mapa')
}
