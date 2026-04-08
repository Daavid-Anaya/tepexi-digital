import { defineType, defineField } from 'sanity'
import { CaseIcon } from '@sanity/icons'

export const servicio = defineType({
  name: 'servicio',
  title: 'Servicio',
  type: 'document',
  icon: CaseIcon,
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
      title: 'Categoria',
      type: 'reference',
      to: [{ type: 'categoria' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Descripcion',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'images',
      title: 'Imagenes',
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
      title: 'Direccion',
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
          title: 'Meta titulo',
          type: 'string',
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta descripcion',
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
