import type { Language } from './seo';

type Localized<T> = Record<Language, T>;
export interface Area {
  id: string;
  title: Localized<string>;
  text: Localized<string>;
  keywords: Localized<string[]>;
}

export const locationSeo = {
  es: { title: 'Suites en Cuauhtémoc, cerca de Reforma | Ubicación SG', description: 'Encuentra Business Suites SG en Río Nazas 138, colonia Cuauhtémoc. Organiza tu estancia cerca de Reforma, el Ángel, la Bolsa Mexicana de Valores y Zona Rosa.' },
  en: { title: 'Suites in Cuauhtémoc, near Reforma | SG location', description: 'Find Business Suites SG at Río Nazas 138, Colonia Cuauhtémoc. Plan your stay near Reforma, the Angel of Independence, the Mexican Stock Exchange and Zona Rosa.' },
  zh: { title: 'Cuauhtémoc街区套房与周边指南 | Business Suites SG', description: 'Business Suites SG位于墨西哥城Cuauhtémoc街区Río Nazas 138号。了解改革大道、独立天使纪念碑、墨西哥证券交易所及Zona Rosa周边住宿。' },
};

export const areas: Area[] = [
  {
    id: 'cuauhtemoc',
    title: { es: 'Colonia Cuauhtémoc', en: 'Colonia Cuauhtémoc', zh: 'Cuauhtémoc街区' },
    text: {
      es: 'Business Suites SG está en la colonia Cuauhtémoc, Ciudad de México. Sus seis suites amuebladas cuentan con cocina, sala y cama queen para organizar una estancia de trabajo o de placer con independencia. Si buscas alojamiento por semanas o meses, consulta directamente las condiciones y la disponibilidad con el hotel.',
      en: 'Business Suites SG is in Colonia Cuauhtémoc, Mexico City. Its six furnished suites have a kitchen, living area and queen bed, giving you independence on a business or leisure trip. For weekly or monthly accommodation, contact the hotel directly for availability and terms.',
      zh: 'Business Suites SG位于墨西哥城Cuauhtémoc街区，设有六间家具齐全的套房，每间均配有厨房、起居空间和大床，适合商务出行或休闲住宿。计划按周或按月长住时，请直接联系酒店确认房态与条件。',
    },
    keywords: {
      es: ['Suites en colonia Cuauhtémoc CDMX', 'Hotel en colonia Cuauhtémoc', 'Suites con cocina en colonia Cuauhtémoc', 'Suites amuebladas en colonia Cuauhtémoc', 'Estancias largas en colonia Cuauhtémoc'],
      en: ['Suites in Colonia Cuauhtémoc, Mexico City', 'Hotel in Colonia Cuauhtémoc', 'Suites with kitchens in Colonia Cuauhtémoc', 'Furnished suites in Colonia Cuauhtémoc', 'Extended stays in Colonia Cuauhtémoc'],
      zh: ['墨西哥城Cuauhtémoc街区套房', 'Cuauhtémoc街区酒店', 'Cuauhtémoc街区带厨房套房', 'Cuauhtémoc街区家具齐全的套房', 'Cuauhtémoc街区长住住宿'],
    },
  },
  {
    id: 'rio-nazas',
    title: { es: 'Río Nazas 138', en: 'Río Nazas 138', zh: 'Río Nazas 138号' },
    text: {
      es: 'Nuestra dirección es Río Nazas 138, colonia Cuauhtémoc, C.P. 06500. La cocina dentro de cada suite permite preparar tus propios alimentos durante tu estancia. Reserva mediante el motor oficial de Business Suites SG y utiliza el mapa para consultar la ruta exacta hasta la entrada.',
      en: 'Our address is Río Nazas 138, Colonia Cuauhtémoc, postal code 06500. Each suite has its own kitchen so you can prepare meals during your stay. Reserve through the official Business Suites SG booking engine and use the map to check your route to the entrance.',
      zh: '酒店地址为Río Nazas 138号，Cuauhtémoc街区，邮编06500。每间套房均设有独立厨房，方便您在住宿期间自行准备餐食。请通过Business Suites SG官方预订系统查询房态，并使用地图确认前往酒店入口的路线。',
    },
    keywords: {
      es: ['Hotel en Río Nazas CDMX', 'Suites en Río Nazas 138', 'Apart hotel en Río Nazas', 'Business Suites SG reservaciones'],
      en: ['Hotel on Río Nazas, Mexico City', 'Suites at Río Nazas 138', 'Aparthotel on Río Nazas', 'Business Suites SG reservations'],
      zh: ['墨西哥城Río Nazas街酒店', 'Río Nazas 138号套房', 'Río Nazas街公寓式酒店', 'Business Suites SG预订'],
    },
  },
  {
    id: 'reforma',
    title: { es: 'Paseo de la Reforma', en: 'Paseo de la Reforma', zh: '改革大道' },
    text: {
      es: 'Paseo de la Reforma está a unas calles del hotel: una referencia para organizar reuniones, paseos y comidas en la zona. Las suites ofrecen cocina y Wi-Fi; algunas cuentan con balcón privado. Para estancias semanales o mensuales cerca de Reforma, solicita las condiciones directamente al hotel. Estamos en Río Nazas, no sobre la avenida.',
      en: 'Paseo de la Reforma is a few streets from the hotel, a useful landmark for planning meetings, walks and meals in the area. Suites offer a kitchen and Wi-Fi; some also have a private balcony. Ask the hotel directly about weekly or monthly stays near Reforma. The property is on Río Nazas, off the avenue.',
      zh: '改革大道距离酒店仅几条街，方便安排周边会议、散步和用餐。套房配有厨房和无线网络，部分设有私人阳台。如需在改革大道附近按周或按月住宿，请直接向酒店咨询具体条件。酒店位于Río Nazas街，并非改革大道沿街。',
    },
    keywords: {
      es: ['Suites cerca de Paseo de la Reforma', 'Hotel cerca de Reforma CDMX', 'Apart hotel cerca de Reforma', 'Suites con cocina cerca de Reforma', 'Alojamiento ejecutivo cerca de Reforma', 'Estancias semanales cerca de Reforma', 'Estancias mensuales cerca de Reforma', 'Suites con Wi-Fi cerca de Reforma', 'Suites con balcón cerca de Reforma'],
      en: ['Suites near Paseo de la Reforma', 'Hotel near Reforma, Mexico City', 'Aparthotel near Reforma', 'Suites with kitchens near Reforma', 'Business accommodation near Reforma', 'Weekly stays near Reforma', 'Monthly stays near Reforma', 'Suites with Wi-Fi near Reforma', 'Suites with balconies near Reforma'],
      zh: ['改革大道附近套房', '墨西哥城改革大道附近酒店', '改革大道附近公寓式酒店', '改革大道附近带厨房套房', '改革大道附近商务住宿', '改革大道附近周租住宿', '改革大道附近月租住宿', '改革大道附近带无线网络的套房', '改革大道附近带阳台套房'],
    },
  },
  {
    id: 'angel',
    title: { es: 'Ángel de la Independencia', en: 'Angel of Independence', zh: '独立天使纪念碑' },
    text: {
      es: 'El Ángel de la Independencia es uno de los puntos de referencia del entorno de Reforma. Desde Río Nazas puedes organizar una visita al monumento y continuar por los cafés y restaurantes de la zona. De regreso, tu suite conserva la comodidad de una cocina y un espacio propio. Consulta el mapa antes de salir; los tiempos dependen de la ruta y el tránsito.',
      en: 'The Angel of Independence is a landmark in the Reforma area. From Río Nazas, plan a visit to the monument and explore nearby cafés and restaurants. Return to the comfort of your own suite with a kitchen and living space. Check the map before setting out; travel times depend on your route and traffic.',
      zh: '独立天使纪念碑是改革大道一带的重要地标。您可以从Río Nazas街出发参观纪念碑，再探索周边咖啡馆与餐厅。返回后，在带厨房和起居空间的套房中自在休息。出发前请查看地图，实际行程时间取决于路线及交通情况。',
    },
    keywords: {
      es: ['Hotel cerca del Ángel de la Independencia', 'Suites cerca del Ángel de la Independencia', 'Apart hotel cerca del Ángel de la Independencia', 'Suites con cocina cerca del Ángel de la Independencia'],
      en: ['Hotel near the Angel of Independence', 'Suites near the Angel of Independence', 'Aparthotel near the Angel of Independence', 'Suites with kitchens near the Angel of Independence'],
      zh: ['独立天使纪念碑附近酒店', '独立天使纪念碑附近套房', '独立天使纪念碑附近公寓式酒店', '独立天使纪念碑附近带厨房套房'],
    },
  },
  {
    id: 'alrededores',
    title: { es: 'Bolsa Mexicana de Valores y Zona Rosa', en: 'Mexican Stock Exchange and Zona Rosa', zh: '墨西哥证券交易所与Zona Rosa' },
    text: {
      es: 'Si tu visita incluye una cita en la Bolsa Mexicana de Valores, su dirección es Paseo de la Reforma 255, colonia Cuauhtémoc. También puedes explorar Zona Rosa, al otro lado de Reforma, en la colonia Juárez. Business Suites SG está en la colonia Cuauhtémoc; estas referencias cercanas te ayudan a organizar tus recorridos desde el hotel.',
      en: 'If your trip includes an appointment at the Mexican Stock Exchange, its address is Paseo de la Reforma 255, Colonia Cuauhtémoc. You can also explore Zona Rosa across Reforma in Colonia Juárez. Business Suites SG is in Colonia Cuauhtémoc; these nearby landmarks help you plan your outings from the hotel.',
      zh: '如需前往墨西哥证券交易所，其地址为Cuauhtémoc街区改革大道255号。您也可以穿过改革大道，探索Juárez街区的Zona Rosa。Business Suites SG实际位于Cuauhtémoc街区，这些周边地标可帮助您安排从酒店出发的行程。',
    },
    keywords: {
      es: ['Hotel cerca de la Bolsa Mexicana de Valores', 'Suites cerca de la Bolsa Mexicana de Valores', 'Alojamiento cerca de Zona Rosa CDMX'],
      en: ['Hotel near the Mexican Stock Exchange', 'Suites near the Mexican Stock Exchange', 'Accommodation near Zona Rosa, Mexico City'],
      zh: ['墨西哥证券交易所附近酒店', '墨西哥证券交易所附近套房', '墨西哥城Zona Rosa附近住宿'],
    },
  },
];
