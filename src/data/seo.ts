export type Language = 'es' | 'en' | 'zh';
export type PageKind = 'home' | 'location' | 'privacy';

export const siteUrl = 'https://www.businesssuitessg.com';
export const languages = ['es', 'en', 'zh'] as const;
export const htmlLanguage = { es: 'es', en: 'en', zh: 'zh-Hans' } as const;
export const pagePaths: Record<PageKind, Record<Language, string>> = {
  home: { es: '/', en: '/en/', zh: '/zh/' },
  location: { es: '/ubicacion/', en: '/en/location/', zh: '/zh/location/' },
  privacy: { es: '/privacy-policy/', en: '/en/privacy-policy/', zh: '/zh/privacy-policy/' },
};
export const absoluteUrl = (path: string) => new URL(path, `${siteUrl}/`).href;
export const mapsUrl = 'https://maps.app.goo.gl/xLqonEeihBtLZRte7';

// A production release is indexable regardless of its source branch.
// Preview, local and unknown deployment environments stay out of search.
export function robotsPolicy(environment?: string): string {
  return environment === 'production' ? 'index, follow' : 'noindex, follow';
}

export const homeSeo = {
  es: {
    title: 'Suites con cocina cerca de Reforma | Business Suites SG',
    description: 'Suites amuebladas con cocina en Río Nazas 138, colonia Cuauhtémoc, CDMX. Cerca de Reforma y el Ángel. Consulta estancias semanales y mensuales.',
  },
  en: {
    title: 'Suites with kitchens near Reforma | Business Suites SG',
    description: 'Furnished suites with kitchens at Río Nazas 138, Colonia Cuauhtémoc, Mexico City. Stay near Reforma and the Angel of Independence. Weekly and monthly stays.',
  },
  zh: {
    title: '墨西哥城改革大道附近带厨房套房 | Business Suites SG',
    description: 'Business Suites SG位于墨西哥城Cuauhtémoc街区Río Nazas 138号，提供带厨房的家具齐全套房，靠近改革大道和独立天使纪念碑。可咨询周租及月租住宿。',
  },
};

export function hotelSchema(lang: Language, image: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    '@id': `${siteUrl}/#hotel`,
    name: 'Business Suites SG',
    url: absoluteUrl(pagePaths.home[lang]),
    description: homeSeo[lang].description,
    image: absoluteUrl(image),
    telephone: '+525536668535',
    email: 'contacto@businesssuitessg.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Río Nazas 138, Colonia Cuauhtémoc',
      addressLocality: 'Ciudad de México',
      addressRegion: 'Ciudad de México',
      postalCode: '06500',
      addressCountry: 'MX',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 19.43080711, longitude: -99.1701355 },
    hasMap: mapsUrl,
    numberOfRooms: 6,
    checkinTime: '13:30:00',
    checkoutTime: '12:00:00',
    petsAllowed: false,
    amenityFeature: [
      { '@type': 'LocationFeatureSpecification', name: 'Wi-Fi', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Kitchen in every suite', value: true },
    ],
  };
}
