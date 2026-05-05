/**
 * Script: upload-hero-images.mjs
 * Sube las imágenes hero estáticas a Sanity y retorna las URLs del CDN.
 *
 * Uso: node scripts/upload-hero-images.mjs
 */

import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// Lee variables de entorno del .env.local manualmente (sin dotenv)
const envPath = path.join(ROOT, '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const env = Object.fromEntries(
  envContent
    .split('\n')
    .filter((line) => line.includes('=') && !line.startsWith('#'))
    .map((line) => {
      const [key, ...rest] = line.split('=')
      return [key.trim(), rest.join('=').trim()]
    })
)

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  token: env.SANITY_API_READ_TOKEN,
  apiVersion: '2025-01-01',
  useCdn: false,
})

// Imágenes hero a subir: [nombre lógico, ruta relativa desde public/]
const HERO_IMAGES = [
  { key: 'agenda',       file: 'images/agenda/img-hero-agenda.jpg' },
  { key: 'como-llegar',  file: 'images/como-llegar/img-hero-como-llegar.jpg' },
  { key: 'contacto',     file: 'images/contacto/img-hero-contacto.jpg' },
  { key: 'cultura',      file: 'images/cultura/img-hero-cultura.jpg' },
  { key: 'gastronomia',  file: 'images/gastronomia/img-hero-gastronomia.jpg' },
  { key: 'lugares',      file: 'images/lugares/img-hero-lugares.jpg' },
  { key: 'mapa',         file: 'images/mapa/img-hero-mapa.jpg' },
  { key: 'servicios',    file: 'images/servicios/img-hero-servicios.jpg' },
]

async function uploadImage(key, filePath) {
  const fullPath = path.join(ROOT, 'public', filePath)
  const filename = path.basename(filePath)

  console.log(`⬆️  Subiendo [${key}]: ${filename}...`)

  const stream = fs.createReadStream(fullPath)
  const asset = await client.assets.upload('image', stream, {
    filename,
    label: `hero-${key}`,
  })

  const url = `https://cdn.sanity.io/images/${env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${env.NEXT_PUBLIC_SANITY_DATASET}/${asset._id.replace('image-', '').replace(/-jpg$/, '.jpg').replace(/-jpeg$/, '.jpeg').replace(/-png$/, '.png').replace(/-webp$/, '.webp')}`

  return { key, assetId: asset._id, url: asset.url }
}

async function main() {
  console.log('🚀 Iniciando upload de imágenes hero a Sanity...\n')

  const results = []

  for (const { key, file } of HERO_IMAGES) {
    try {
      const result = await uploadImage(key, file)
      results.push(result)
      console.log(`✅ [${key}] → ${result.url}\n`)
    } catch (err) {
      console.error(`❌ Error subiendo [${key}]:`, err.message)
    }
  }

  console.log('\n📋 RESULTADO FINAL — URLs del CDN:\n')
  console.log('Copiá este objeto para usar en el código:\n')

  const output = results.reduce((acc, { key, url }) => {
    acc[key] = url
    return acc
  }, {})

  console.log(JSON.stringify(output, null, 2))

  // Guarda el resultado en un archivo para referencia
  const outputPath = path.join(ROOT, 'scripts', 'hero-images-urls.json')
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2))
  console.log(`\n💾 URLs guardadas en: scripts/hero-images-urls.json`)
}

main().catch(console.error)
