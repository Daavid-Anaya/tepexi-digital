import { defineType, defineField } from 'sanity'

export const settings = defineType({
  name: 'settings',
  title: 'Configuración del sitio',
  type: 'document',
  fields: [
    defineField({
      name: 'siteName',
      title: 'Nombre del sitio',
      type: 'string',
    }),
    defineField({
      name: 'siteDescription',
      title: 'Descripción del sitio',
      type: 'text',
    }),
    defineField({
      name: 'heroImage',
      title: 'Imagen hero',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'heroTitle',
      title: 'Título hero',
      type: 'string',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Subtítulo hero',
      type: 'string',
    }),
    defineField({
      name: 'contactEmail',
      title: 'Email de contacto',
      type: 'string',
    }),
    defineField({
      name: 'contactPhone',
      title: 'Teléfono de contacto',
      type: 'string',
    }),
    defineField({
      name: 'address',
      title: 'Dirección',
      type: 'text',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Redes sociales',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              title: 'Plataforma',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: 'platform', subtitle: 'url' },
          },
        },
      ],
    }),
    defineField({
      name: 'seoDefaults',
      title: 'SEO por defecto',
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
        defineField({
          name: 'ogImage',
          title: 'Imagen Open Graph',
          type: 'image',
          options: { hotspot: true },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'siteName' },
  },
})
