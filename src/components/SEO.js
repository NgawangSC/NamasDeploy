import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
  title = 'NAMAS Architecture Studio - Design & Build Solutions in Bhutan',
  description = 'Leading architectural firm in Bhutan providing integrated design, planning, and construction services. Expert solutions for residential, commercial, and institutional projects.',
  keywords = 'architecture Bhutan, construction Bhutan, interior design, landscape design, architectural planning, building construction, NAMAS, design build, Thimphu architecture',
  image = '/android-chrome-512x512.png',
  url = 'https://namasarchitecture.com',
  type = 'website',
  schemaData = null,
  canonical = null
}) => {
  const fullImage = image.startsWith('http') ? image : `https://namasarchitecture.com${image}`;
  const fullUrl = url.startsWith('http') ? url : `https://namasarchitecture.com${url}`;
  const canonicalUrl = canonical || fullUrl;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="NAMAS Architecture Studio" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      
      {/* Schema.org Structured Data */}
      {schemaData && (
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;