import { Helmet } from "react-helmet-async"
import { useLocation } from "react-router-dom"

const DEFAULT_SITE_NAME = "NAMAS Bhutan"
const DEFAULT_TITLE = "NAMAS Bhutan — Architecture, Planning, Interiors & Construction"
const DEFAULT_DESCRIPTION = "NAMAS Design and Build delivers integrated architectural design, planning, interior, construction, and supervision services across Bhutan."
const DEFAULT_IMAGE = "/android-chrome-512x512.png"
const DEFAULT_TWITTER_HANDLE = "@namasbhutan"

function absoluteUrl(pathname, baseUrl) {
  if (!pathname) return baseUrl
  try {
    const base = baseUrl || process.env.REACT_APP_SITE_URL || "https://www.namasbhutan.com"
    return new URL(pathname, base).toString()
  } catch {
    return pathname
  }
}

export default function SEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  type = "website",
  canonical,
  robots,
  publishedTime,
  modifiedTime,
  schema = [],
}) {
  const location = useLocation()
  const siteUrl = process.env.REACT_APP_SITE_URL || "https://www.namasbhutan.com"
  const url = canonical || absoluteUrl(location.pathname + location.search, siteUrl)
  const ogImage = image?.startsWith("http") ? image : absoluteUrl(image, siteUrl)

  const robotsContent = robots || "index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1"

  return (
    <Helmet prioritizeSeoTags>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta name="robots" content={robotsContent} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={DEFAULT_SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={title} />

      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={DEFAULT_TWITTER_HANDLE} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD */}
      {Array.isArray(schema) && schema.length > 0 && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  )
}