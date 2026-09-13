import { defineType, defineField } from 'sanity'
import { CalendarIcon } from '@sanity/icons'
import { formatEventDate, validateEventSchedule } from '../../lib/event-schedule'
import { eventScheduleFields } from './event-schedule-fields'

export const evento = defineType({
  name: 'evento',
  title: 'Evento',
  type: 'document',
  icon: CalendarIcon,
  validation: (rule) => rule.custom(validateEventSchedule),
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
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Título (H2)', value: 'h2' },
            { title: 'Subtítulo (H3)', value: 'h3' },
            { title: 'Encabezado menor (H4)', value: 'h4' },
            { title: 'Aviso importante', value: 'notice' },
            { title: 'Cita', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Negrita', value: 'strong' },
              { title: 'Cursiva', value: 'em' },
              { title: 'Resaltado', value: 'highlight', icon: () => '🖊' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Enlace',
                fields: [
                  { name: 'href', type: 'url', title: 'URL' },
                ],
              },
            ],
          },
        },
      ],
    }),
    defineField({
      name: 'image',
      title: 'Imagen',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Texto alternativo',
          type: 'string',
          validation: (rule) => rule.required().error('Event images need alt text.'),
        }),
      ],
    }),
    ...eventScheduleFields,
    defineField({
      name: 'date',
      title: 'Fecha',
      type: 'datetime',
      hidden: ({ document }) => document?.scheduleType === 'weekly',
    }),
    defineField({
      name: 'endDate',
      title: 'Fecha de fin',
      type: 'datetime',
      hidden: ({ document }) => document?.scheduleType === 'weekly',
      description: 'Opcional. Si se desconoce, el evento permanece en curso hasta marcarlo como finalizado manualmente.',
    }),
    defineField({
      name: 'location',
      title: 'Lugar registrado (opcional)',
      type: 'reference',
      to: [{ type: 'lugar' }],
      description: 'Selecciona un lugar del directorio para mostrar su nombre, dirección y ubicación en el mapa.',
    }),
    defineField({
      name: 'locationText',
      title: 'Ubicación no registrada (opcional)',
      type: 'string',
      description: 'Utilízala solo cuando el lugar no exista en el directorio. Déjala vacía si seleccionaste un lugar registrado.',
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
          validation: (rule) => rule.max(60).warning('Keep SEO titles at or below 60 characters.'),
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta descripción',
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
    select: {
      title: 'title',
      media: 'image',
      date: 'date',
      scheduleType: 'scheduleType',
      seriesStart: 'weekly.seriesStart',
      timezone: 'timezone',
    },
    prepare({ title, media, date, scheduleType, seriesStart, timezone }) {
      let subtitle = scheduleType === 'weekly' ? `Semanal desde ${seriesStart ?? 'fecha pendiente'}` : ''
      if (scheduleType !== 'weekly' && date) {
        try {
          subtitle = formatEventDate(date, timezone ?? undefined)
        } catch {
          subtitle = 'Revisar fecha y zona horaria'
        }
      }
      return {
        title,
        media,
        subtitle,
      }
    },
  },
})
