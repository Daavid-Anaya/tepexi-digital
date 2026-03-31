import { defineType, defineField } from 'sanity'
import { TagIcon } from '@sanity/icons'

export const categoria = defineType({
  name: 'categoria',
  title: 'Categoría',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'type',
      title: 'Tipo',
      type: 'string',
      options: {
        list: [
          { title: 'Lugar', value: 'lugar' },
          { title: 'Gastronomía', value: 'gastronomia' },
          { title: 'Cultura', value: 'cultura' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'icon',
      title: 'Ícono',
      type: 'string',
      description: 'Nombre del ícono para marcadores de mapa',
    }),
    defineField({
      name: 'color',
      title: 'Color',
      type: 'string',
      description: 'Color hex para marcadores de mapa (ej: #FF5733)',
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'type' },
  },
})
