import { defineQuery } from 'next-sanity'

export const settingsQuery = defineQuery(`*[_type == "settings"][0] {
  siteName,
  siteDescription,
  "heroImageUrl": heroImage.asset->url,
  heroTitle,
  heroSubtitle,
  contactEmail,
  contactPhone,
  address,
  socialLinks[] { platform, url },
  "seoDefaults": {
    "metaTitle": seoDefaults.metaTitle,
    "metaDescription": seoDefaults.metaDescription,
    "ogImageUrl": seoDefaults.ogImage.asset->url
  }
}`)
