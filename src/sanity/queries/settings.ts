import { defineQuery } from 'next-sanity'

export const settingsQuery = defineQuery(`*[_type == "settings"][0] {
  siteName,
  siteDescription,
  heroImage,
  heroTitle,
  heroSubtitle,
  contactEmail,
  contactPhone,
  address,
  socialLinks,
  seoDefaults
}`)
