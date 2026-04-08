'use client'

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import {
  CogIcon,
  PinIcon,
  BasketIcon,
  CalendarIcon,
  TagIcon,
} from '@sanity/icons'
import { schemaTypes } from '@/sanity/schemas'

// Singleton document IDs
const SETTINGS_ID = 'siteSettings'

export default defineConfig({
  name: 'tepexi-digital',
  title: 'Tepexi Digital',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  basePath: '/studio',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Contenido')
          .items([
            // Singleton: Configuracion del sitio
            S.listItem()
              .title('Configuracion del sitio')
              .icon(CogIcon)
              .child(
                S.document()
                  .schemaType('settings')
                  .documentId(SETTINGS_ID)
                  .title('Configuracion del sitio'),
              ),

            // Categorias
            S.listItem()
              .title('Categorias')
              .icon(TagIcon)
              .child(
                S.documentTypeList('categoria').title('Categorias'),
              ),

            S.divider(),

            // Content types
            S.listItem()
              .title('Lugares')
              .icon(PinIcon)
              .child(
                S.documentTypeList('lugar').title('Lugares'),
              ),

            S.listItem()
              .title('Gastronomia')
              .icon(BasketIcon)
              .child(
                S.documentTypeList('gastronomia').title('Gastronomia'),
              ),

            S.listItem()
              .title('Eventos')
              .icon(CalendarIcon)
              .child(
                S.documentTypeList('evento').title('Eventos'),
              ),
          ]),
    }),
    visionTool({ defaultApiVersion: '2025-03-01' }),
  ],
  schema: {
    types: schemaTypes,
  },
})
