// SEO utility functions for consistent meta data and schema generation

export const generatePageMeta = (pageType, customData = {}) => {
  const baseUrl = 'https://namasarchitecture.com';
  const baseMeta = {
    siteName: 'NAMAS Architecture Studio',
    author: 'NAMAS Architecture Studio',
    baseKeywords: 'architecture Bhutan, construction Bhutan, interior design, landscape design, architectural planning, building construction, NAMAS, design build, Thimphu architecture'
  };

  const pageConfigs = {
    service: {
      titleSuffix: ' | NAMAS Architecture Studio Bhutan',
      descriptionPrefix: 'Professional ',
      descriptionSuffix: ' services by NAMAS Architecture Studio in Bhutan. Expert solutions for residential, commercial, and institutional projects.',
      priority: 0.8
    },
    construction: {
      titleSuffix: ' | NAMAS Construction Services Bhutan',
      descriptionPrefix: 'Expert ',
      descriptionSuffix: ' construction services by NAMAS in Bhutan. Quality building solutions with innovative design and sustainable practices.',
      priority: 0.7
    },
    about: {
      titleSuffix: ' | About NAMAS Architecture Studio',
      descriptionPrefix: 'Learn about ',
      descriptionSuffix: ' at NAMAS Architecture Studio - leading architectural firm in Bhutan with expertise in design, construction, and planning.',
      priority: 0.6
    }
  };

  const config = pageConfigs[pageType] || pageConfigs.service;
  
  return {
    title: `${customData.serviceName || customData.title}${config.titleSuffix}`,
    description: `${config.descriptionPrefix}${customData.description || customData.serviceName}${config.descriptionSuffix}`,
    keywords: `${customData.keywords || customData.serviceName}, ${baseMeta.baseKeywords}`,
    url: `${baseUrl}${customData.path || ''}`,
    image: customData.image || '/android-chrome-512x512.png',
    ...baseMeta,
    ...customData
  };
};

export const generateServiceSchema = (serviceName, description, path) => {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": serviceName,
    "description": description,
    "provider": {
      "@type": "ArchitecturalFirm",
      "name": "NAMAS Architecture Studio",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "Bhutan"
      }
    },
    "serviceType": serviceName,
    "areaServed": {
      "@type": "Country",
      "name": "Bhutan"
    },
    "url": `https://namasarchitecture.com${path}`
  };
};

export const generateConstructionSchema = (serviceType, description, path) => {
  return {
    "@context": "https://schema.org",
    "@type": "ConstructionBusiness",
    "name": `NAMAS ${serviceType}`,
    "description": description,
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "Bhutan"
    },
    "serviceArea": {
      "@type": "Country",
      "name": "Bhutan"
    },
    "services": [serviceType],
    "url": `https://namasarchitecture.com${path}`
  };
};

export const generateProjectSchema = (project) => {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": project.title,
    "description": project.description,
    "creator": {
      "@type": "ArchitecturalFirm", 
      "name": "NAMAS Architecture Studio"
    },
    "dateCreated": project.completionDate,
    "image": project.image,
    "url": `https://namasarchitecture.com/project/${project.id}`
  };
};

export const generateBreadcrumbSchema = (breadcrumbs) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://namasarchitecture.com${item.path}`
    }))
  };
};

// Pre-configured service data
export const servicePages = {
  architecture: {
    serviceName: 'Architectural Design Services',
    description: 'Innovative architectural design solutions combining traditional Bhutanese aesthetics with modern functionality',
    keywords: 'architectural design, building architecture, residential architecture, commercial architecture',
    path: '/architecture'
  },
  interior: {
    serviceName: 'Interior Design Services', 
    description: 'Bespoke interior design solutions creating stylish and functional living and working environments',
    keywords: 'interior design, interior decoration, space planning, furniture design',
    path: '/interior-design'
  },
  landscape: {
    serviceName: 'Landscape Design Services',
    description: 'Sustainable landscape design creating harmonious outdoor spaces that complement architectural designs',
    keywords: 'landscape design, garden design, outdoor spaces, sustainable landscaping',
    path: '/landscape'
  },
  planning: {
    serviceName: 'Architectural Planning Services',
    description: 'Comprehensive planning services ensuring projects meet regulations and optimize site potential',
    keywords: 'architectural planning, building permits, site planning, urban planning',
    path: '/planning'
  },
  construction: {
    serviceName: 'Construction Management Services',
    description: 'Full-service construction management delivering quality builds on time and within budget',
    keywords: 'construction management, building construction, project management, quality construction',
    path: '/build'
  }
};

export default {
  generatePageMeta,
  generateServiceSchema,
  generateConstructionSchema,
  generateProjectSchema,
  generateBreadcrumbSchema,
  servicePages
};