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
      name: 'introduction',
      title: 'Introducción',
      type: 'array',
      of: [{ type: 'block' }],
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
      name: 'descriptionImage',
      title: 'Imagen de descripción',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          title: 'Texto alternativo',
          type: 'string',
        },
      ],
      description: 'Imagen que acompaña la descripción del platillo',
    }),
    defineField({
      name: 'keyIngredients',
      title: 'Ingredientes clave',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Nombre',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Descripción',
              type: 'text',
              rows: 3,
            }),
            defineField({
              name: 'icon',
              title: 'Ícono',
              type: 'string',
              description: 'Nombre del ícono: utensils, flame, leaf, grain (semillas/puntos)',
              options: {
                list: [
                  { title: 'Cubiertos', value: 'utensils' },
                  { title: 'Llama', value: 'flame' },
                  { title: 'Hoja', value: 'leaf' },
                  { title: 'Grano/Semillas', value: 'grain' },
                ],
              },
            }),
            defineField({
              name: 'image',
              title: 'Imagen (para tarjeta tipo imagen)',
              type: 'image',
              options: { hotspot: true },
            }),
          ],
          preview: {
            select: { title: 'name' },
          },
        },
      ],
      description: 'Ingredientes clave con ícono. Para el grid: tarjeta 1 (2col), tarjeta 2 (1col cuadrada), tarjeta 3 (1col cuadrada), tarjeta 4 (imagen 2col), tarjeta 5 (2col)',
    }),
    defineField({
      name: 'preparationSteps',
      title: 'Pasos de preparación',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Título del paso',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Descripción',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'duration',
              title: 'Duración',
              type: 'string',
              description: 'Ej: 30 minutos, 2 horas',
            }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'duration' },
          },
        },
      ],
      description: 'Pasos de preparación para la línea de tiempo',
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
