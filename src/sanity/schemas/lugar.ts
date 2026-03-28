import { defineType, defineField } from 'sanity'

export const lugar = defineType({
  name: 'lugar',
  title: 'Lugar',
  type: 'document',
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
