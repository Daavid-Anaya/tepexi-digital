import Image from 'next/image'
import { Utensils } from 'lucide-react'
import { IngredientIcon } from './IngredientIcon'
import { Container } from '@/components/ui/Container'

interface Ingredient {
  name: string | null
  description: string | null
  icon: string | null
  imageUrl: string | null
}

interface KeyIngredientsBentoProps {
  ingredients: Ingredient[]
}

export function KeyIngredientsBento({ ingredients }: KeyIngredientsBentoProps) {
  return (
    <section className="py-10 md:py-16 bg-primary-50">
      <Container>
        {/* Section header */}
        <div className="flex items-center gap-3 mb-6 md:mb-10">
          <span className="w-1 h-8 rounded-full inline-block bg-accent" />
          <h2 className="font-heading font-bold text-text-primary text-2xl md:text-3xl">
            Ingredientes Clave
          </h2>
        </div>

        {/* Grid: mobile=1col, md=2col, lg=4col */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 0 — spans 2 cols, large with icon + title + description */}
          {ingredients[0] && (
            <div
              className="group lg:col-span-2 rounded-xl p-4 sm:p-6 border flex flex-col gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
              style={{ background: '#FFFFFF', borderColor: '#E8DDD5' }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent/10 group-hover:bg-accent/25 transition-colors duration-300">
                <IngredientIcon icon={ingredients[0].icon} />
              </div>
              {ingredients[0].name && (
                <h3 className="font-heading font-bold text-primary text-xl">
                  {ingredients[0].name}
                </h3>
              )}
              {ingredients[0].description && (
                <p className="text-sm leading-relaxed text-stone">
                  {ingredients[0].description}
                </p>
              )}
            </div>
          )}

          {/* Card 1 — 1 col square, icon centered + title + subtitle */}
          {ingredients[1] && (
            <div
              className="group rounded-xl p-4 sm:p-6 border flex flex-col items-center justify-center gap-3 text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300"
              style={{ background: '#FFFFFF', borderColor: '#E8DDD5', minHeight: '160px' }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-accent/10 group-hover:bg-accent/25 transition-colors duration-300">
                <IngredientIcon icon={ingredients[1].icon} />
              </div>
              {ingredients[1].name && (
                <h3 className="font-heading font-semibold text-primary text-base">
                  {ingredients[1].name}
                </h3>
              )}
              {ingredients[1].description && (
                <p className="text-xs font-medium tracking-widest uppercase text-stone">
                  {ingredients[1].description}
                </p>
              )}
            </div>
          )}

          {/* Card 2 — 1 col square, small icon + title + subtitle */}
          {ingredients[2] && (
            <div
              className="group rounded-xl p-4 sm:p-6 border flex flex-col items-center justify-center gap-3 text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300"
              style={{ background: '#FFFFFF', borderColor: '#E8DDD5', minHeight: '160px' }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-accent/10 group-hover:bg-accent/25 transition-colors duration-300">
                <IngredientIcon icon={ingredients[2].icon} />
              </div>
              {ingredients[2].name && (
                <h3 className="font-heading font-semibold text-primary text-base">
                  {ingredients[2].name}
                </h3>
              )}
              {ingredients[2].description && (
                <p className="text-xs font-medium tracking-widest uppercase text-stone">
                  {ingredients[2].description}
                </p>
              )}
            </div>
          )}

          {/* Card 3 — spans 2 cols, full image */}
          {ingredients[3] && (
            <div
              className="group lg:col-span-2 rounded-xl overflow-hidden hover:-translate-y-1 hover:shadow-md transition-all duration-300"
              style={{ minHeight: '200px' }}
            >
              {ingredients[3].imageUrl ? (
                <Image
                  src={ingredients[3].imageUrl}
                  alt={ingredients[3].name ?? 'Ingrediente'}
                  width={800}
                  height={400}
                  className="w-full h-full object-cover"
                  style={{ minHeight: '200px' }}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100"
                  style={{ minHeight: '200px' }}
                >
                  <Utensils className="w-10 h-10 text-accent/20" />
                </div>
              )}
            </div>
          )}

          {/* Card 4 — spans 2 cols, icon + title + description, text left */}
          {ingredients[4] && (
            <div
              className="group lg:col-span-2 rounded-xl p-4 sm:p-6 border flex flex-col gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
              style={{ background: '#FFFFFF', borderColor: '#E8DDD5' }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent/10 group-hover:bg-accent/25 transition-colors duration-300">
                <IngredientIcon icon={ingredients[4].icon} />
              </div>
              {ingredients[4].name && (
                <h3 className="font-heading font-bold text-primary text-xl">
                  {ingredients[4].name}
                </h3>
              )}
              {ingredients[4].description && (
                <p className="text-sm leading-relaxed text-stone">
                  {ingredients[4].description}
                </p>
              )}
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}
