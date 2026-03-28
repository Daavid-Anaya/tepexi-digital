import { defineType, defineField } from 'sanity'

export const evento = defineType({
  name: 'evento',
  title: 'Evento',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
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
      name: 'description',
      title: 'Descripción',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'image',
      title: 'Imagen',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          title: 'Texto alternativo',
          type: 'string',
        },
      ],
    }),
    defineField({
      name: 'date',
      title: 'Fecha',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'endDate',
      title: 'Fecha de fin',
      type: 'datetime',
    }),
    defineField({
      name: 'location',
      title: 'Lugar (referencia)',
      type: 'reference',
      to: [{ type: 'lugar' }],
    }),
    defineField({
      name: 'locationText',
      title: 'Ubicación (texto libre)',
      type: 'string',
      description: 'Texto de ubicación alternativo si no hay un lugar registrado en el sistema',
    }),
    defineField({
      name: 'isFeatured',
      title: 'Destacado',
      type: 'boolean',
      initialValue: false,
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
    select: {
      title: 'title',
      media: 'image',
      date: 'date',
    },
    prepare({ title, media, date }) {
      return {
        title,
        media,
        subtitle: date ? new Date(date).toLocaleDateString('es-MX') : '',
      }
    },
  },
})
