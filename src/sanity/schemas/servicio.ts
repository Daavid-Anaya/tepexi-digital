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
            defineField({
              name: 'alt',
              title: 'Texto alternativo',
              type: 'string',
            }),
            defineField({
              name: 'isDecorative',
              title: 'Imagen decorativa',
              type: 'boolean',
              initialValue: false,
            }),
          ],
          validation: (rule) =>
            rule.custom((value) => {
              const imageValue = value as { asset?: unknown; isDecorative?: boolean; alt?: string } | undefined

              if (!imageValue?.asset) return true
              if (imageValue.isDecorative) return true

              return typeof imageValue.alt === 'string' && imageValue.alt.trim().length > 0
                ? true
                : 'Add alt text for informative images or mark the image as decorative.'
            }),
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
          validation: (rule) => rule.max(60).warning('Keep SEO titles at or below 60 characters.'),
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta descripcion',
          type: 'text',
          rows: 3,
          validation: (rule) => rule.max(160).warning('Keep meta descriptions at or below 160 characters.'),
        }),
        defineField({
          name: 'ogImage',
          title: 'Open Graph image',
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Image alt text',
              type: 'string',
              validation: (rule) => rule.required().error('Open Graph images need alt text.'),
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'title', media: 'images.0' },
  },
})
