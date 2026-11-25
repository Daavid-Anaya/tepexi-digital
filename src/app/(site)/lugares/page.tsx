import type { Metadata } from 'next'
import { MapPin } from 'lucide-react'
import { getAllLugares } from '@/lib/data'

// F-21: ISR — las páginas de listado se revalidan cada hora para que las nuevas entradas aparezcan sin un redeploy completo.
export const revalidate = 3600
import { Container } from '@/components/ui/Container'
import { CategoryNav, type CategoryNavItem } from '@/components/places/CategoryNav'
import { CategorySection } from '@/components/places/CategorySection'
import type { PlaceCardProps } from '@/types'
import { buildStaticPageMetadata } from '@/lib/metadata'
import { PageHero, PageHeroBreadcrumb, PageHeroHeader, PageHeroStats } from '@/components/ui/PageHero'
import { HERO_FALLBACKS } from '@/lib/constants'

export const metadata: Metadata = buildStaticPageMetadata({
  title: 'Lugares Turísticos',
  description: 'Explora lugares turísticos y atractivos en Tepexi de Rodríguez, Puebla: fósiles, manantiales, miradores, historia local y recomendaciones para tu visita.',
  path: '/lugares',
})

/**
 * Orden fijo de visualización de las categorías.
 * Las categorías que no aparecen aquí se muestran al final, en el orden en que se encuentran.
 */
const CATEGORY_ORDER = [
  'Ecoturismo y Naturaleza',
  'Historia y Arqueología',
  'Paleontología',
  'Cultura y Espacios Públicos',
  'Gastronomía y Comercio Local',
]

/** Convierte el nombre de una categoría en un id HTML válido */
function toSectionId(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // elimina diacríticos
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
  // Construye un mapa: nombre de categoría → { color, places[] }
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

  // Ordena las categorías según CATEGORY_ORDER y deja las no listadas al final
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

  // Construye los elementos de navegación para el CategoryNav fijo
  const navItems: CategoryNavItem[] = groups.map((g) => ({
    id: g.sectionId,
    label: g.name,
    color: g.color,
    count: g.places.length,
  }))

  return (
    <>
      {/* Hero de la página */}
      <PageHero imageUrl={HERO_FALLBACKS.lugares} className="mb-10 md:mb-16">
        <PageHeroBreadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Lugares Turísticos' }]} currentPath="/lugares" />
        <PageHeroHeader
          icon={MapPin}
          title="Lugares Turísticos"
          description="Explora los sitios más representativos de Tepexi de Rodríguez — desde vestigios prehispánicos hasta miradores y Ex Conventos."
        />
        <PageHeroStats stats={[{ value: totalPlaces, label: 'lugares' }, { value: groups.length, label: 'categorías' }, { value: 'Mixteca', label: 'región' }]} />
      </PageHero>

      {/* Navegación por categorías + secciones agrupadas */}
      <section className="py-10 md:py-16">
        <Container>
          {totalPlaces === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                 <MapPin className="w-10 h-10 text-primary/50" aria-hidden="true" />
              </div>
              <h2 className="font-heading font-semibold text-xl text-text-primary mb-2">
                Sin lugares disponibles
              </h2>
              <p className="text-stone max-w-sm mx-auto">
                Pronto encontrarás aquí los sitios más increíbles de Tepexi de Rodríguez.
              </p>
            </div>
          ) : (
            <>
              {/* Navegación fija por categorías */}
              <CategoryNav categories={navItems} />

              {/* Secciones por categoría */}
              <div className="mt-8 md:mt-12 flex flex-col gap-10 md:gap-16">
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
