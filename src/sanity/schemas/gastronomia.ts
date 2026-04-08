import { defineType, defineField } from 'sanity'
import { BasketIcon } from '@sanity/icons'

export const gastronomia = defineType({
  name: 'gastronomia',
  title: 'Gastronomía',
  type: 'document',
  icon: BasketIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Nombre',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Categoría',
      type: 'reference',
      to: [{ type: 'categoria' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Descripción',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'images',
      title: 'Imágenes',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              title: 'Texto alternativo',
              type: 'string',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'coordinates',
      title: 'Coordenadas',
      type: 'object',
      fields: [
        defineField({
          name: 'lat',
          title: 'Latitud',
          type: 'number',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'lng',
          title: 'Longitud',
          type: 'number',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'address',
      title: 'Dirección',
      type: 'string',
    }),
    defineField({
      name: 'schedule',
      title: 'Horario',
      type: 'string',
    }),
    defineField({
      name: 'cost',
      title: 'Costo',
      type: 'string',
      initialValue: 'Gratuito',
    }),
    defineField({
      name: 'dishType',
      title: 'Tipo de platillo',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'featuredDishes',
      title: 'Platillos destacados',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Nombre del platillo',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Descripción',
              type: 'text',
            }),
            defineField({
              name: 'image',
              title: 'Imagen',
              type: 'image',
              options: { hotspot: true },
            }),
          ],
          preview: {
            select: { title: 'name', media: 'image' },
          },
        },
      ],
    }),
    defineField({
      name: 'priceRange',
      title: 'Rango de precios',
      type: 'string',
      options: {
        list: [
          { title: '$ — Económico', value: '$' },
          { title: '$$ — Moderado', value: '$$' },
          { title: '$$$ — Elevado', value: '$$$' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'origin',
      title: 'Origen del platillo',
      type: 'string',
      description: 'Ej: Mixteca Poblana, Puebla',
    }),
    defineField({
      name: 'season',
      title: 'Temporada',
      type: 'string',
      description: 'Ej: Octubre – Noviembre',
    }),
    defineField({
      name: 'ingredients',
      title: 'Ingredientes principales',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'pairings',
      title: 'Maridaje / Acompañamientos',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'history',
      title: 'Historia y contexto cultural',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'quote',
      title: 'Cita destacada',
      type: 'object',
      fields: [
        defineField({
          name: 'text',
          title: 'Texto de la cita',
          type: 'text',
          rows: 3,
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'author',
          title: 'Autor / Fuente',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'preparationTime',
      title: 'Tiempo de preparación',
      type: 'string',
      description: 'Ej: 3-4 horas',
    }),
    defineField({
      name: 'difficulty',
      title: 'Dificultad',
      type: 'string',
      options: {
        list: [
          { title: 'Fácil', value: 'facil' },
          { title: 'Medio', value: 'medio' },
          { title: 'Avanzado', value: 'avanzado' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'servings',
      title: 'Porciones',
      type: 'string',
      description: 'Ej: 4-6 personas',
    }),
    defineField({
      name: 'recommendations',
      title: 'Recomendaciones',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        defineField({
          name: 'metaTitle',
          title: 'Meta título',
          type: 'string',
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta descripción',
          type: 'text',
          rows: 3,
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'title', media: 'images.0' },
  },
})
