import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { getAllLugares } from '@/lib/data'
import { Container } from '@/components/ui/Container'
import { CategoryNav, type CategoryNavItem } from '@/components/places/CategoryNav'
import { CategorySection } from '@/components/places/CategorySection'
import type { PlaceCardProps } from '@/types'

export const metadata: Metadata = {
  title: 'Lugares Turísticos',
  description: 'Descubre los lugares turísticos de Tepexi de Rodríguez, Puebla.',
}

/**
 * Fixed display order for categories.
 * Categories not listed here appear at the end in the order they're found.
 */
const CATEGORY_ORDER = [
  'Ecoturismo y Naturaleza',
  'Historia y Arqueología',
  'Paleontología',
  'Cultura y Espacios Públicos',
  'Gastronomía y Comercio Local',
]

/** Slugify a category name into a valid HTML id */
function toSectionId(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

interface CategoryGroup {
  name: string
  color: string
  sectionId: string
  places: PlaceCardProps[]
}

function groupByCategory(
  data: Awaited<ReturnType<typeof getAllLugares>>
): CategoryGroup[] {
  // Build a map: category name → { color, places[] }
  const map = new Map<string, { color: string; places: PlaceCardProps[] }>()

  for (const lugar of data) {
    const existing = map.get(lugar.category)
    const card: PlaceCardProps = {
      title: lugar.title,
      slug: lugar.slug.current,
      category: lugar.category,
      categoryColor: lugar.categoryColor,
      imageUrl: lugar.imageUrl,
      imageAlt: lugar.imageAlt,
      excerpt: lugar.address ?? undefined,
    }

    if (existing) {
      existing.places.push(card)
    } else {
      map.set(lugar.category, {
        color: lugar.categoryColor,
        places: [card],
      })
    }
  }

  // Sort categories by CATEGORY_ORDER, then any unlisted at the end
  const sortedNames = [...map.keys()].sort((a, b) => {
    const idxA = CATEGORY_ORDER.indexOf(a)
    const idxB = CATEGORY_ORDER.indexOf(b)
    const posA = idxA === -1 ? CATEGORY_ORDER.length : idxA
    const posB = idxB === -1 ? CATEGORY_ORDER.length : idxB
    return posA - posB
  })

  return sortedNames.map((name) => {
    const group = map.get(name)!
    return {
      name,
      color: group.color,
      sectionId: toSectionId(name),
      places: group.places,
    }
  })
}

export default async function LugaresPage() {
  const data = await getAllLugares()
  const groups = groupByCategory(data)
  const totalPlaces = groups.reduce((sum, g) => sum + g.places.length, 0)

  // Build nav items for the sticky CategoryNav
  const navItems: CategoryNavItem[] = groups.map((g) => ({
    id: g.sectionId,
    label: g.name,
    color: g.color,
    count: g.places.length,
  }))

  return (
    <>
      {/* Page hero */}
      <section className="relative overflow-hidden bg-primary py-20">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-primary-light" />
          <div className="absolute bottom-0 left-1/4 w-40 h-40 rounded-full bg-primary-dark" />
        </div>

        <Container className="relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-white/90">Lugares Turísticos</span>
          </nav>

          <div className="flex items-start gap-5">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <MapPin className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-4xl md:text-5xl text-white leading-tight mb-3">
                Lugares Turísticos
              </h1>
              <p className="text-white/75 text-lg max-w-2xl leading-relaxed">
                Explora los sitios más representativos de Tepexi de Rodríguez —
                desde vestigios prehispánicos hasta miradores y Ex Conventos.
              </p>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-10 flex gap-6 flex-wrap">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 text-white">
              <div className="text-2xl font-bold font-heading">{totalPlaces}</div>
              <div className="text-xs text-white/70 uppercase tracking-wide">lugares</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 text-white">
              <div className="text-2xl font-bold font-heading">{groups.length}</div>
              <div className="text-xs text-white/70 uppercase tracking-wide">categorías</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 text-white">
              <div className="text-2xl font-bold font-heading">Mixteca</div>
              <div className="text-xs text-white/70 uppercase tracking-wide">región</div>
            </div>
          </div>
        </Container>
      </section>

      {/* Category nav + grouped sections */}
      <section className="py-16">
        <Container>
          {totalPlaces === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <MapPin className="w-10 h-10 text-primary/50" />
              </div>
              <h2 className="font-heading font-semibold text-xl text-primary mb-2">
                Sin lugares disponibles
              </h2>
              <p className="text-stone max-w-sm mx-auto">
                Pronto encontrarás aquí los sitios más increíbles de Tepexi de Rodríguez.
              </p>
            </div>
          ) : (
            <>
              {/* Sticky category navigation */}
              <CategoryNav categories={navItems} />

              {/* Category sections */}
              <div className="mt-12 flex flex-col gap-16">
                {groups.map((group) => (
                  <CategorySection
                    key={group.sectionId}
                    id={group.sectionId}
                    label={group.name}
                    color={group.color}
                    places={group.places}
                    basePath="/lugares"
                  />
                ))}
              </div>
            </>
          )}
        </Container>
      </section>
    </>
  )
}
