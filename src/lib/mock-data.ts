/**
 * Mock data for Tepexi de Rodríguez, Puebla, México.
 * Used when NEXT_PUBLIC_SANITY_PROJECT_ID is not set.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let _keyCounter = 0
function key(): string {
  return `mock-key-${++_keyCounter}`
}

function portableText(text: string) {
  return [
    {
      _type: 'block' as const,
      _key: key(),
      style: 'normal',
      children: [{ _type: 'span' as const, text, marks: [] as string[] }],
      markDefs: [] as unknown[],
    },
  ]
}

function portableTextMulti(...paragraphs: string[]) {
  return paragraphs.map((text) => ({
    _type: 'block' as const,
    _key: key(),
    style: 'normal',
    children: [{ _type: 'span' as const, text, marks: [] as string[] }],
    markDefs: [] as unknown[],
  }))
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MockImage {
  url: string
  alt: string
  asset: { url: string }
}

export interface MockCoordinates {
  lat: number
  lng: number
}

export interface MockSeo {
  metaTitle: string | null
  metaDescription: string | null
}

export interface MockCategory {
  _id: string
  name: string
  color: string
  icon: string
}

export interface MockLugar {
  _id: string
  title: string
  slug: { current: string }
  category: string
  categoryColor: string
  imageUrl: string
  imageAlt: string
  description: ReturnType<typeof portableTextMulti>
  images: MockImage[]
  coordinates: MockCoordinates
  address: string
  schedule: string
  cost: string
  recommendations: string
  seo: MockSeo
}

export interface MockGastronomia {
  _id: string
  title: string
  slug: { current: string }
  category: string
  categoryColor: string
  imageUrl: string
  imageAlt: string
  introduction: ReturnType<typeof portableTextMulti> | null
  description: ReturnType<typeof portableTextMulti>
  images: MockImage[]
  descriptionImage: { url: string; alt: string } | null
  cost: string | null
  dishType: string
  priceRange: string
  origin: string | null
  season: string | null
  quote: { text: string; author: string } | null
  preparationTime: string | null
  difficulty: string | null
  servings: string | null
  keyIngredients: Array<{ name: string | null; description: string | null; icon: string | null; imageUrl: string | null }>
  preparationSteps: Array<{ title: string; description: string; duration: string | null }>
  seo: MockSeo
}

export interface MockCultura {
  _id: string
  title: string
  slug: { current: string }
  category: string
  categoryColor: string
  imageUrl: string
  imageAlt: string
  description: ReturnType<typeof portableTextMulti>
  images: MockImage[]
  coordinates: MockCoordinates | null
  address: string | null
  schedule: string | null
  cost: string | null
  culturalType: string
  recommendations: string | null
  seo: MockSeo
}

export interface MockEvento {
  _id: string
  title: string
  slug: { current: string }
  description: ReturnType<typeof portableTextMulti> | null
  imageUrl: string | null
  imageAlt: string | null
  date: string
  endDate: string | null
  locationName: string | null
  locationText: string | null
  locationCoordinates: MockCoordinates | null
  locationAddress: string | null
  isFeatured: boolean
  seo: MockSeo
}

export interface SocialLink {
  platform: string
  url: string
}

export interface SeoDefaults {
  metaTitle: string | null
  metaDescription: string | null
  ogImageUrl: string | null
}

export interface MockSettings {
  siteName: string
  siteDescription: string
  heroImageUrl: string | null
  heroTitle: string
  heroSubtitle: string
  contactEmail: string
  contactPhone: string
  address: string
  socialLinks: SocialLink[] | null
  seoDefaults: SeoDefaults | null
}

// ---------------------------------------------------------------------------
// Helper to build MockImage
// ---------------------------------------------------------------------------

function img(seed: string, alt: string, width = 800, height = 600): MockImage {
  const url = `https://picsum.photos/seed/${seed}/${width}/${height}`
  return { url, alt, asset: { url } }
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const mockCategories: MockCategory[] = [
  { _id: 'cat-ecoturismo', name: 'Ecoturismo y Naturaleza', color: '#2E7D32', icon: 'leaf' },
  { _id: 'cat-historia', name: 'Historia y Arqueología', color: '#8B4513', icon: 'landmark' },
  { _id: 'cat-paleontologia', name: 'Paleontología', color: '#00838F', icon: 'bone' },
  { _id: 'cat-hospedaje', name: 'Hospedaje', color: '#1565C0', icon: 'bed' },
  { _id: 'cat-gastronomia', name: 'Gastronomía y Comercio Local', color: '#E65100', icon: 'utensils' },
  { _id: 'cat-cultura', name: 'Cultura y Espacios Públicos', color: '#7B1FA2', icon: 'palette' },
]

// ---------------------------------------------------------------------------
// Lugares Turísticos
// ---------------------------------------------------------------------------

export const mockLugares: MockLugar[] = [
  {
    _id: 'lugar-1',
    title: 'Huellas de Dinosaurio',
    slug: { current: 'huellas-de-dinosaurio' },
    category: 'Paleontología',
    categoryColor: '#00838F',
    imageUrl: 'https://picsum.photos/seed/huellas-dino-main/800/600',
    imageAlt: 'Huellas fósiles de dinosaurio en Tepexi de Rodríguez',
    description: portableTextMulti(
      'El sitio paleontológico de las Huellas de Dinosaurio es uno de los tesoros más extraordinarios de la Mixteca Poblana. Ubicado a las afueras de Tepexi de Rodríguez, este yacimiento conserva huellas fósiles de dinosaurios que datan del período Cretácico, hace más de 65 millones de años.',
      'Las huellas, impresas en roca caliza, fueron descubiertas por investigadores de la Universidad Autónoma de Puebla y han sido objeto de múltiples estudios paleontológicos. El sitio permite observar las icnitas —huellas fosilizadas— de al menos dos tipos de dinosaurios, probablemente hadrosáuridos y terópodos.',
      'El recorrido guiado dura aproximadamente 1.5 horas y es adecuado para todas las edades. Se recomienda llevar calzado cómodo, agua y protector solar. Los guías locales certificados explican la geología y paleontología de la región con gran detalle.',
    ),
    images: [
      img('huellas-dino-1', 'Vista panorámica del sitio paleontológico', 1200, 800),
      img('huellas-dino-2', 'Detalle de huella fósil de dinosaurio', 1200, 800),
      img('huellas-dino-3', 'Guía mostrando las huellas a visitantes', 1200, 800),
    ],
    coordinates: { lat: 18.575, lng: -97.925 },
    address: 'Camino a San Juan Ixcaquixtla, Tepexi de Rodríguez, Puebla',
    schedule: 'Lunes a domingo, 9:00 am – 5:00 pm',
    cost: '$30 MXN por persona',
    recommendations:
      'Usar calzado cerrado y cómodo. No tocar las huellas. Llevar agua y sombrero. Disponible visita guiada incluida en el precio.',
    seo: {
      metaTitle: 'Huellas de Dinosaurio – Tepexi de Rodríguez, Puebla',
      metaDescription:
        'Visita el sitio paleontológico de Huellas de Dinosaurio en Tepexi de Rodríguez. Fósiles del Cretácico en la Mixteca Poblana.',
    },
  },
  {
    _id: 'lugar-2',
    title: 'Ex-Convento de San Francisco',
    slug: { current: 'ex-convento-de-san-francisco' },
    category: 'Historia y Arqueología',
    categoryColor: '#8B4513',
    imageUrl: 'https://picsum.photos/seed/convento-sf-main/800/600',
    imageAlt: 'Fachada del Ex-Convento de San Francisco en Tepexi',
    description: portableTextMulti(
      'El Ex-Convento de San Francisco de Asís es el monumento histórico más emblemático de Tepexi de Rodríguez. Construido a mediados del siglo XVI por la orden franciscana, este conjunto conventual es un extraordinario ejemplo de la arquitectura colonial religiosa de la Mixteca Poblana.',
      'Su fachada plateresca conserva motivos renacentistas y elementos indígenas, reflejo del sincretismo cultural de la evangelización novohispana. El claustro interior exhibe frescos de la época que narran pasajes de la vida de San Francisco de Asís, parte de los cuales se han restaurado meticulosamente.',
      'El convento funcionó como centro educativo y espiritual durante casi tres siglos. Hoy en día, parte del conjunto alberga el Archivo Histórico Municipal y ocasionalmente sirve como espacio para exposiciones culturales y eventos cívicos de importancia para la comunidad.',
    ),
    images: [
      img('convento-sf-1', 'Fachada principal del Ex-Convento de San Francisco', 1200, 800),
      img('convento-sf-2', 'Claustro interior con jardín', 1200, 800),
      img('convento-sf-3', 'Detalle de frescos coloniales', 1200, 800),
    ],
    coordinates: { lat: 18.5793, lng: -97.9218 },
    address: 'Calle Francisco I. Madero s/n, Centro, Tepexi de Rodríguez, Puebla',
    schedule: 'Martes a domingo, 9:00 am – 6:00 pm',
    cost: 'Entrada gratuita',
    recommendations:
      'Respetar el silencio en el interior. Se permiten fotografías sin flash. Ideal visitar en la mañana para mejor iluminación natural.',
    seo: {
      metaTitle: 'Ex-Convento de San Francisco – Tepexi de Rodríguez',
      metaDescription:
        'Visita el Ex-Convento de San Francisco del siglo XVI en Tepexi de Rodríguez, Puebla. Patrimonio colonial de la Mixteca.',
    },
  },
  {
    _id: 'lugar-3',
    title: 'Manantiales de Axamilpa',
    slug: { current: 'manantiales-de-axamilpa' },
    category: 'Ecoturismo y Naturaleza',
    categoryColor: '#2E7D32',
    imageUrl: 'https://picsum.photos/seed/manantiales-main/800/600',
    imageAlt: 'Manantiales de aguas cristalinas de Axamilpa',
    description: portableTextMulti(
      'Los Manantiales de Axamilpa son un oasis natural en el árido paisaje de la Mixteca Poblana. Sus aguas brotan cristalinas de entre las rocas calizas y forman pequeñas pozas naturales de temperatura fresca, ideal para refrescarse en los calurosos días del verano mixteco.',
      'El entorno está poblado de vegetación riparia —sauces, álamos y helechos— que contrasta con la aridez del territorio circundante. La riqueza hídrica del lugar ha sido aprovechada por los pobladores de Axamilpa desde tiempos prehispánicos, como lo atestiguan vestigios arqueológicos encontrados en sus alrededores.',
      'El acceso es mediante una vereda de aproximadamente 20 minutos desde el pueblo de Axamilpa. Se puede llegar en vehículo hasta la localidad y continuar a pie. El lugar es apto para picnic, descanso y fotografía de naturaleza.',
    ),
    images: [
      img('manantiales-1', 'Pozas naturales de los manantiales', 1200, 800),
      img('manantiales-2', 'Vegetación alrededor del manantial', 1200, 800),
      img('manantiales-3', 'Sendero hacia los manantiales', 1200, 800),
    ],
    coordinates: { lat: 18.565, lng: -97.91 },
    address: 'Localidad de Axamilpa, municipio de Tepexi de Rodríguez, Puebla',
    schedule: 'Todos los días, 8:00 am – 6:00 pm',
    cost: '$20 MXN por persona (cuota de conservación)',
    recommendations:
      'Llevar ropa cómoda y calzado para caminar. Respetar el ecosistema y no dejar basura. Llevar alimentos y agua para el recorrido.',
    seo: {
      metaTitle: 'Manantiales de Axamilpa – Tepexi de Rodríguez',
      metaDescription:
        'Conoce los Manantiales de Axamilpa, aguas cristalinas naturales en Tepexi de Rodríguez, Puebla.',
    },
  },
  {
    _id: 'lugar-4',
    title: 'Cerro de Nopala',
    slug: { current: 'cerro-de-nopala' },
    category: 'Ecoturismo y Naturaleza',
    categoryColor: '#2E7D32',
    imageUrl: 'https://picsum.photos/seed/cerro-nopala-main/800/600',
    imageAlt: 'Vista panorámica desde el Cerro de Nopala',
    description: portableTextMulti(
      'El Cerro de Nopala es la formación geológica más característica del paisaje de Tepexi de Rodríguez. Su cima ofrece uno de los miradores naturales más impresionantes de la región, desde el cual se puede contemplar el valle tepexano y, en días despejados, los volcanes del altiplano poblano.',
      'La ruta de ascenso sigue una vereda tradicional utilizada por los pobladores locales durante generaciones. El cerro alberga flora xerófila característica de la Mixteca: biznagas, magueyes, nopales y copal, además de diversas aves rapaces que anidan en sus peñascos.',
      'El ascenso toma entre 45 minutos y 1 hora dependiendo del ritmo. No requiere equipo especial, aunque se recomienda calzado adecuado y buena condición física básica.',
    ),
    images: [
      img('cerro-nopala-1', 'Vista del valle desde la cima del Cerro de Nopala', 1200, 800),
      img('cerro-nopala-2', 'Flora xerófila en las laderas del cerro', 1200, 800),
    ],
    coordinates: { lat: 18.585, lng: -97.93 },
    address: 'Acceso por Barrio de Nopala, Tepexi de Rodríguez, Puebla',
    schedule: 'Acceso libre, se recomienda visitar de 7:00 am a 5:00 pm',
    cost: 'Acceso libre',
    recommendations:
      'Iniciar el ascenso temprano para evitar el calor. Llevar agua suficiente. No aventurarse de noche sin guía local.',
    seo: {
      metaTitle: 'Cerro de Nopala – Mirador en Tepexi de Rodríguez',
      metaDescription:
        'Sube al Cerro de Nopala y disfruta de las vistas panorámicas de Tepexi de Rodríguez y la Mixteca Poblana.',
    },
  },
  {
    _id: 'lugar-5',
    title: 'Museo Comunitario de Tepexi',
    slug: { current: 'museo-comunitario-de-tepexi' },
    category: 'Cultura y Espacios Públicos',
    categoryColor: '#7B1FA2',
    imageUrl: 'https://picsum.photos/seed/museo-tepexi-main/800/600',
    imageAlt: 'Sala de exposición del Museo Comunitario de Tepexi',
    description: portableTextMulti(
      'El Museo Comunitario de Tepexi de Rodríguez es un espacio dedicado a preservar y difundir la historia, la paleontología y la cultura del municipio. Su colección incluye piezas arqueológicas de las culturas que habitaron la región desde el período Preclásico, así como fósiles de fauna del Cretácico encontrados en el territorio municipal.',
      'La sala paleontológica es su atracción más visitada: alberga réplicas y fragmentos originales de huesos fosilizados de dinosaurios y reptiles marinos del Cretácico, complementando la visita al sitio de las huellas. La sala arqueológica exhibe cerámica, figurillas y herramientas de obsidiana de las culturas mixteca y popoloca.',
      'El museo también cuenta con una sala dedicada a la historia del municipio durante la Colonia, la Independencia y la Revolución, con documentos originales y fotografías históricas. Funciona como centro comunitario y alberga talleres educativos para escuelas locales.',
    ),
    images: [
      img('museo-tepexi-1', 'Fósiles en el Museo Comunitario', 1200, 800),
      img('museo-tepexi-2', 'Sala arqueológica con cerámica mixteca', 1200, 800),
      img('museo-tepexi-3', 'Sala histórica del museo', 1200, 800),
    ],
    coordinates: { lat: 18.5795, lng: -97.9215 },
    address: 'Av. Juárez 15, Centro, Tepexi de Rodríguez, Puebla',
    schedule: 'Martes a domingo, 10:00 am – 5:00 pm',
    cost: '$15 MXN adultos, gratuito niños menores de 12 años',
    recommendations:
      'Ideal para visitar con niños. Se permiten fotografías. Visita guiada disponible bajo petición.',
    seo: {
      metaTitle: 'Museo Comunitario – Tepexi de Rodríguez, Puebla',
      metaDescription:
        'El Museo Comunitario de Tepexi de Rodríguez alberga fósiles del Cretácico y piezas arqueológicas de la Mixteca Poblana.',
    },
  },
  {
    _id: 'lugar-6',
    title: 'Puente de Dios',
    slug: { current: 'puente-de-dios' },
    category: 'Ecoturismo y Naturaleza',
    categoryColor: '#2E7D32',
    imageUrl: 'https://picsum.photos/seed/puente-dios-main/800/600',
    imageAlt: 'Formación rocosa del Puente de Dios con río',
    description: portableTextMulti(
      'El Puente de Dios es una de las formaciones naturales más sorprendentes de Tepexi de Rodríguez. Se trata de un arco natural de roca caliza esculpido por la erosión del río que pasa por debajo durante milenios, creando una estructura que semeja un puente monumental sobre el cauce.',
      'El lugar tiene una profunda carga simbólica para los habitantes de la región, que desde antiguo le atribuyen propiedades místicas y lo vinculan con la cosmovisión de los pueblos originarios de la Mixteca. Fue un sitio de peregrinación y ofrenda en tiempos prehispánicos.',
      'El acceso requiere un recorrido de 30 minutos a pie por un sendero que bordea el río. En temporada de lluvias el caudal del río aumenta considerablemente, lo que hace más espectacular pero también más cauteloso el recorrido.',
    ),
    images: [
      img('puente-dios-1', 'Vista del arco natural del Puente de Dios', 1200, 800),
      img('puente-dios-2', 'Río fluyendo bajo el Puente de Dios', 1200, 800),
    ],
    coordinates: { lat: 18.57, lng: -97.915 },
    address: 'Paraje El Puente, Tepexi de Rodríguez, Puebla',
    schedule: 'Todos los días, acceso con luz solar (7:00 am – 6:00 pm)',
    cost: 'Acceso libre',
    recommendations:
      'No cruzar el río en temporada de lluvias sin guía. Llevar ropa que no importe mojar. Calzado con agarre en roca húmeda.',
    seo: {
      metaTitle: 'Puente de Dios – Tepexi de Rodríguez, Puebla',
      metaDescription:
        'Visita el Puente de Dios, formación rocosa natural con río en Tepexi de Rodríguez, Puebla.',
    },
  },
]

// ---------------------------------------------------------------------------
// Gastronomía
// ---------------------------------------------------------------------------

export const mockGastronomia: MockGastronomia[] = [
  {
    _id: 'gastro-1',
    title: 'Mole de Caderas',
    slug: { current: 'mole-de-caderas' },
    category: 'Gastronomía',
    categoryColor: '#BF360C',
    imageUrl: 'https://picsum.photos/seed/mole-caderas-main/800/600',
    imageAlt: 'Platillo de Mole de Caderas tradicional de la Mixteca Poblana',
    introduction: portableTextMulti(
      'Un ritual gastronómico que marca el inicio del otoño en la Mixteca Poblana. El Mole de Caderas es mucho más que un platillo: es la identidad de un pueblo entero condensada en una cazuela de barro.',
    ),
    description: portableTextMulti(
      'El Mole de Caderas es el platillo más representativo e identitario de la Mixteca Poblana. Se prepara con las caderas —parte de la cadera y muslo— del chivo criollo, cocidas lentamente en un caldo especiado con chiles secos, jitomate y hierbas de la región. Su preparación es todo un ritual gastronómico que marca el inicio del otoño.',
      'La temporada del Mole de Caderas va de octubre a noviembre, coincidiendo con la matanza tradicional del chivo —una costumbre ancestral que reúne a familias enteras y constituye un evento social y cultural de gran importancia para los pueblos mixtecos.',
      'El platillo se acompaña con tortillas de maíz criollo y frecuentemente con frijoles negros de olla. Su sabor es intenso, con notas terrosas de los chiles y el característico aroma de la carne de chivo de la Mixteca, criado en pastizales de mezquite y tuna.',
    ),
    images: [
      img('mole-caderas-1', 'Mole de Caderas servido con tortillas', 1200, 800),
      img('mole-caderas-2', 'Preparación tradicional del mole de caderas', 1200, 800),
      img('mole-caderas-3', 'Ingredientes del mole de caderas', 1200, 800),
    ],
    descriptionImage: { url: 'https://picsum.photos/seed/mole-desc/600/800', alt: 'Detalle del mole de caderas' },
    cost: '$80–$120 MXN por porción',
    dishType: 'platillo-tipico',
    priceRange: 'medio',
    origin: 'Mixteca Poblana, Puebla',
    season: 'Octubre – Noviembre',
    quote: {
      text: 'El mole de caderas no es solo un platillo, es el alma de la Mixteca que regresa cada otoño.',
      author: 'Tradición oral de Tepexi de Rodríguez',
    },
    preparationTime: '3-4 horas',
    difficulty: 'avanzado',
    servings: '6-8 personas',
    keyIngredients: [
      { name: 'Caderas de Chivo Criollo', description: 'La pieza central del platillo. El chivo criollo de la Mixteca se cría en libertad entre mezquites y nopales, lo que le da un sabor inigualable, terroso y concentrado.', icon: 'utensils', imageUrl: null },
      { name: 'Chile Costeño', description: null, icon: 'grain', imageUrl: null },
      { name: 'Fuego de Leña', description: null, icon: 'flame', imageUrl: null },
      { name: null, description: null, icon: null, imageUrl: 'https://picsum.photos/seed/ingredient-mix/600/400' },
      { name: 'Hierba Santa', description: 'Hoja aromática endémica de la región que aporta un perfume anisado sutil. Se añade en los últimos minutos de cocción para preservar su esencia.', icon: 'leaf', imageUrl: null },
    ],
    preparationSteps: [
      { title: 'Selección y limpieza', description: 'Se seleccionan las caderas del chivo criollo, se lavan cuidadosamente y se dejan reposar con sal gruesa y hierbas de monte.', duration: '30 minutos' },
      { title: 'Tostado de chiles', description: 'Los chiles costeño y guajillo se tuestan en comal de barro a fuego medio hasta que sueltan su aroma, sin quemarse. Se hidratan en agua caliente.', duration: '20 minutos' },
      { title: 'Preparación del recaudo', description: 'Los chiles hidratados se muelen en molcajete con jitomate asado, ajo y especias hasta obtener una pasta espesa y aromática.', duration: '45 minutos' },
      { title: 'Cocción lenta', description: 'Las caderas se cocinan a fuego bajo en cazuela de barro con el recaudo, ejotes y chipotles. El fuego debe ser constante pero suave para que la carne se desprenda del hueso.', duration: '2-3 horas' },
      { title: 'Reposo y servicio', description: 'Se deja reposar 15 minutos fuera del fuego. Se sirve en plato hondo de barro con caldo abundante, hierba santa fresca por encima y tortillas de maíz criollo recién hechas.', duration: '15 minutos' },
    ],
    seo: {
      metaTitle: 'Mole de Caderas – Gastronomía Típica de Tepexi de Rodríguez',
      metaDescription:
        'El Mole de Caderas es el platillo más representativo de la Mixteca Poblana, disponible cada otoño en Tepexi de Rodríguez.',
    },
  },
  {
    _id: 'gastro-2',
    title: 'Restaurante La Mixteca',
    slug: { current: 'restaurante-la-mixteca' },
    category: 'Gastronomía',
    categoryColor: '#BF360C',
    imageUrl: 'https://picsum.photos/seed/rest-mixteca-main/800/600',
    imageAlt: 'Interior del Restaurante La Mixteca en Tepexi de Rodríguez',
    introduction: null,
    description: portableTextMulti(
      'Restaurante La Mixteca es el establecimiento gastronómico más reconocido de Tepexi de Rodríguez. Fundado en 1989 por la familia Flores, ha mantenido la tradición culinaria mixteco-poblana a través de tres generaciones, siendo el lugar de referencia para conocer la cocina auténtica de la región.',
      'Su menú destaca por el Mole de Caderas en temporada —el más solicitado de la región—, la Barbacoa de Chivo preparada en horno de tierra con magueyes, y los Tamales de Tesmole rellenos de chivo con salsa de tomatillo verde y epazote. Todo elaborado con productos locales y técnicas tradicionales.',
      'El restaurante cuenta con un comedor de 60 personas, cocina abierta donde los visitantes pueden observar la preparación de los platillos, y una pequeña tienda de productos regionales: mezcal artesanal, chiles secos, mole en pasta y artesanías locales.',
    ),
    images: [
      img('rest-mixteca-1', 'Comedor del Restaurante La Mixteca', 1200, 800),
      img('rest-mixteca-2', 'Platillos típicos en La Mixteca', 1200, 800),
      img('rest-mixteca-3', 'Cocina tradicional en Restaurante La Mixteca', 1200, 800),
    ],
    descriptionImage: null,
    cost: 'Menú promedio $120–$180 MXN por persona',
    dishType: 'restaurante',
    priceRange: 'medio',
    origin: null,
    season: null,
    quote: null,
    preparationTime: null,
    difficulty: null,
    servings: null,
    keyIngredients: [],
    preparationSteps: [],
    seo: {
      metaTitle: 'Restaurante La Mixteca – Cocina Regional en Tepexi de Rodríguez',
      metaDescription:
        'Restaurante La Mixteca ofrece cocina regional de la Mixteca Poblana en Tepexi de Rodríguez: mole de caderas, barbacoa y más.',
    },
  },
  {
    _id: 'gastro-3',
    title: 'Mercado Municipal de Tepexi',
    slug: { current: 'mercado-municipal-de-tepexi' },
    category: 'Gastronomía',
    categoryColor: '#BF360C',
    imageUrl: 'https://picsum.photos/seed/mercado-tepexi-main/800/600',
    imageAlt: 'Puestos de comida en el Mercado Municipal de Tepexi',
    introduction: null,
    description: portableTextMulti(
      'El Mercado Municipal de Tepexi de Rodríguez es el corazón culinario del municipio. En su planta baja se concentran los puestos de comida tradicional donde las cocineras locales —principalmente mujeres mayores— sirven los antojitos y platillos de la Mixteca Poblana desde las primeras horas de la mañana.',
      'El desayuno en el mercado es una experiencia imperdible: enchiladas verdes, memelas con frijoles, tamales de rajas y tostadas de tinga de chivo. Al mediodía se sirven comidas corridas de tres tiempos con sopas de fideo, guisados de la región y arroz rojo al estilo mixteco.',
      'Los fines de semana el mercado cobra vida especial con productores de las comunidades rurales que traen verduras orgánicas, frutas de temporada, quesos de leche de cabra, mezcal artesanal y chiles secos de cosecha propia.',
    ),
    images: [
      img('mercado-1', 'Vista del mercado municipal de Tepexi', 1200, 800),
      img('mercado-2', 'Cocinera tradicional en el mercado', 1200, 800),
    ],
    descriptionImage: null,
    cost: 'Antojitos desde $20 MXN, comida corrida $50–$80 MXN',
    dishType: 'mercado',
    priceRange: 'bajo',
    origin: null,
    season: null,
    quote: null,
    preparationTime: null,
    difficulty: null,
    servings: null,
    keyIngredients: [],
    preparationSteps: [],
    seo: {
      metaTitle: 'Mercado Municipal – Gastronomía de Tepexi de Rodríguez',
      metaDescription:
        'El Mercado Municipal de Tepexi de Rodríguez es el mejor lugar para probar antojitos y comida tradicional de la Mixteca Poblana.',
    },
  },
  {
    _id: 'gastro-4',
    title: 'Mezcal Artesanal de Tepexi',
    slug: { current: 'mezcal-artesanal-de-tepexi' },
    category: 'Gastronomía',
    categoryColor: '#BF360C',
    imageUrl: 'https://picsum.photos/seed/mezcal-tepexi-main/800/600',
    imageAlt: 'Mezcal artesanal de Tepexi servido en jícara',
    introduction: null,
    description: portableTextMulti(
      'El mezcal artesanal de Tepexi de Rodríguez es una bebida con historia y terroir propios. Elaborado principalmente con agave tobalá y agave espadín que crecen en forma silvestre en las laderas de la Mixteca, su producción sigue métodos ancestrales que no han cambiado en siglos: cocción en horno de tierra, molienda en tahona y fermentación en tinas de madera.',
      'Los papalometeros —productores de mezcal— de Tepexi y sus comunidades vecinas elaboran pequeñas partidas de mezcal que se distinguen por su complejidad aromática: notas de tierra húmeda, miel de agave, hierbas silvestres y un ligero ahumado característico del maguey mixteco.',
      'Se puede visitar algunos palenques locales con cita previa para conocer el proceso completo de elaboración, desde la cosecha del agave hasta la destilación. Algunos productores ofrecen catas comentadas y venta directa a precio de productor.',
    ),
    images: [
      img('mezcal-1', 'Producción artesanal de mezcal en Tepexi', 1200, 800),
      img('mezcal-2', 'Agave silvestre en la Mixteca Poblana', 1200, 800),
    ],
    descriptionImage: null,
    cost: '$150–$350 MXN por botella 750 ml según productor',
    dishType: 'bebida',
    priceRange: 'medio',
    origin: null,
    season: null,
    quote: null,
    preparationTime: null,
    difficulty: null,
    servings: null,
    keyIngredients: [],
    preparationSteps: [],
    seo: {
      metaTitle: 'Mezcal Artesanal – Tepexi de Rodríguez, Puebla',
      metaDescription:
        'El mezcal artesanal de Tepexi de Rodríguez se elabora con agave silvestre de la Mixteca siguiendo métodos ancestrales.',
    },
  },
  {
    _id: 'gastro-5',
    title: 'Tamales de Tesmole',
    slug: { current: 'tamales-de-tesmole' },
    category: 'Gastronomía',
    categoryColor: '#BF360C',
    imageUrl: 'https://picsum.photos/seed/tamales-tesmole-main/800/600',
    imageAlt: 'Tamales de tesmole tradicionales de Tepexi',
    introduction: null,
    description: portableTextMulti(
      'Los Tamales de Tesmole son un platillo emblemático de la gastronomía de Tepexi de Rodríguez y la Mixteca Poblana en general. El tesmole es una salsa espesa preparada con chiles ancho y mulato, tomate verde, pepita de calabaza molida, epazote y especias, que da un sabor único e inconfundible al relleno de chivo o pollo del tamal.',
      'La masa de los tamales es de maíz criollo nixtamalizado, extendida sobre hoja de milpa o totomoxtle. Su textura es más densa que los tamales del centro de México, con un sabor profundo que refleja la identidad culinaria de la Mixteca.',
      'Se preparan principalmente para fiestas, bodas y eventos especiales, aunque algunos puestos del mercado municipal los elaboran diariamente. La preparación es laboriosa: una familia completa puede pasar el día entero preparando varios centenares de tamales para una celebración.',
    ),
    images: [
      img('tamales-1', 'Tamales de tesmole recién salidos del vaporero', 1200, 800),
      img('tamales-2', 'Preparación de tamales en familia', 1200, 800),
    ],
    descriptionImage: null,
    cost: '$20–$30 MXN por tamal',
    dishType: 'platillo-tipico',
    priceRange: 'bajo',
    origin: null,
    season: null,
    quote: null,
    preparationTime: null,
    difficulty: null,
    servings: null,
    keyIngredients: [],
    preparationSteps: [],
    seo: {
      metaTitle: 'Tamales de Tesmole – Gastronomía de Tepexi de Rodríguez',
      metaDescription:
        'Los Tamales de Tesmole son un platillo tradicional de Tepexi de Rodríguez, Puebla, rellenos de chivo con salsa de pepita y chile.',
    },
  },
]

// ---------------------------------------------------------------------------
// Cultura
// ---------------------------------------------------------------------------

export const mockCultura: MockCultura[] = [
  {
    _id: 'cultura-1',
    title: 'Zona Arqueológica de San Juan Ixcaquixtla',
    slug: { current: 'zona-arqueologica-san-juan-ixcaquixtla' },
    category: 'Cultura',
    categoryColor: '#7B1FA2',
    imageUrl: 'https://picsum.photos/seed/zona-arq-main/800/600',
    imageAlt: 'Vestigios arqueológicos de San Juan Ixcaquixtla',
    description: portableTextMulti(
      'La Zona Arqueológica de San Juan Ixcaquixtla es uno de los sitios prehispánicos más importantes de la Mixteca Poblana, ubicado en el municipio vecino de Ixcaquixtla, a escasos kilómetros de Tepexi de Rodríguez. El sitio evidencia una ocupación humana continua desde el período Preclásico Medio (800 a.C.) hasta la época colonial temprana.',
      'Los vestigios incluyen plataformas ceremoniales, adoratorios y evidencias de producción artesanal en cerámica y obsidiana. Los materiales encontrados revelan relaciones comerciales e intercambios culturales con la Mixteca de Oaxaca y el Valle de Tehuacán, mostrando la importancia de esta región como nodo cultural del sureste de Puebla.',
      'El INAH ha realizado varias temporadas de excavación en el sitio y muchas de las piezas recuperadas forman parte de la colección del Museo Comunitario de Tepexi. Se recomienda contratar un guía local para una interpretación más completa del sitio.',
    ),
    images: [
      img('zona-arq-1', 'Plataforma ceremonial de San Juan Ixcaquixtla', 1200, 800),
      img('zona-arq-2', 'Vestigios arqueológicos en el sitio', 1200, 800),
      img('zona-arq-3', 'Pieza arqueológica de la zona', 1200, 800),
    ],
    coordinates: { lat: 18.56, lng: -97.89 },
    address: 'San Juan Ixcaquixtla, Puebla (cerca de Tepexi de Rodríguez)',
    schedule: 'Martes a domingo, 10:00 am – 5:00 pm',
    cost: '$65 MXN (cuota INAH)',
    culturalType: 'sitio-arqueologico',
    recommendations:
      'Llegar temprano para evitar el calor. Usar calzado cómodo. Llevar agua y protector solar. El sitio no tiene tienda.',
    seo: {
      metaTitle: 'Zona Arqueológica de San Juan Ixcaquixtla – Puebla',
      metaDescription:
        'Visita la Zona Arqueológica de San Juan Ixcaquixtla, sitio prehispánico de la Mixteca Poblana cerca de Tepexi de Rodríguez.',
    },
  },
  {
    _id: 'cultura-2',
    title: 'Fiesta del Señor de las Maravillas',
    slug: { current: 'fiesta-del-senor-de-las-maravillas' },
    category: 'Cultura',
    categoryColor: '#7B1FA2',
    imageUrl: 'https://picsum.photos/seed/fiesta-maravillas-main/800/600',
    imageAlt: 'Procesión de la Fiesta del Señor de las Maravillas en Tepexi',
    description: portableTextMulti(
      'La Fiesta del Señor de las Maravillas es la celebración religiosa y cultural más importante de Tepexi de Rodríguez. Se celebra cada mes de abril en torno a la imagen venerada del Señor de las Maravillas, un Cristo negro guardado en la Parroquia de Santiago Apóstol cuya historia se remonta al siglo XVII.',
      'La fiesta dura aproximadamente una semana e incluye misas solemnes, procesiones multitudinarias, fuegos artificiales, feria de artesanías y gastronomía local, juegos mecánicos y presentaciones de danza tradicional. Miles de peregrinos llegan de municipios vecinos y de la diáspora mixteca radicada en las ciudades del norte del país.',
      'Es una oportunidad única para presenciar la danza de los Tecuanes, música de banda de vientos, la quema del castillo en la noche principal y degustar la gastronomía festiva: mole de caderas (si hay inventario), barbacoa de chivo, tepache y los dulces típicos del convento.',
    ),
    images: [
      img('fiesta-maravillas-1', 'Procesión nocturna del Señor de las Maravillas', 1200, 800),
      img('fiesta-maravillas-2', 'Feria durante las festividades de Tepexi', 1200, 800),
    ],
    coordinates: null,
    address: 'Parroquia de Santiago Apóstol y Plaza Principal, Tepexi de Rodríguez, Puebla',
    schedule: 'Mes de abril (fechas variables según calendario litúrgico)',
    cost: 'Acceso libre a ceremonias religiosas y eventos públicos',
    culturalType: 'tradicion',
    recommendations:
      'Reservar alojamiento con anticipación. Llevar efectivo para artesanías y gastronomía. La noche de la quema del castillo es la más concurrida.',
    seo: {
      metaTitle: 'Fiesta del Señor de las Maravillas – Tepexi de Rodríguez',
      metaDescription:
        'La Fiesta del Señor de las Maravillas es la celebración más importante de Tepexi de Rodríguez, en abril de cada año.',
    },
  },
  {
    _id: 'cultura-3',
    title: 'Alfarería y Barro de Tepexi',
    slug: { current: 'alfareria-y-barro-de-tepexi' },
    category: 'Cultura',
    categoryColor: '#7B1FA2',
    imageUrl: 'https://picsum.photos/seed/alfareria-main/800/600',
    imageAlt: 'Artesano trabajando el barro en Tepexi de Rodríguez',
    description: portableTextMulti(
      'La alfarería de Tepexi de Rodríguez es una tradición artesanal que se remonta a la época prehispánica. Los alfareros locales trabajan el barro rojo de las canteras del municipio para crear piezas utilitarias y decorativas que mantienen formas y técnicas heredadas de generaciones.',
      'Los objetos más típicos incluyen ollas de barro para cocinar (ideales para el mole de caderas), cántaros para agua, comales, macetones decorativos y figuras de animales y personajes de la vida cotidiana. La cocción se realiza en hornos artesanales de leña, lo que da a cada pieza un acabado único.',
      'Algunos talleres familiares abren sus puertas a visitantes interesados en conocer el proceso: desde la extracción y preparación del barro hasta el torneado, el secado y la cocción. También se ofrecen talleres vivenciales para turistas donde es posible modelar y llevarse una pieza como recuerdo.',
    ),
    images: [
      img('alfareria-1', 'Artesano dando forma al barro en torno', 1200, 800),
      img('alfareria-2', 'Piezas de alfarería de Tepexi secándose al sol', 1200, 800),
      img('alfareria-3', 'Colección de cerámica típica de Tepexi', 1200, 800),
    ],
    coordinates: null,
    address: 'Barrio de los Alfareros, Tepexi de Rodríguez, Puebla',
    schedule: 'Lunes a sábado, 9:00 am – 6:00 pm (talleres con cita previa)',
    cost: 'Visita gratuita; taller vivencial $100 MXN',
    culturalType: 'artesania',
    recommendations:
      'Llevar efectivo para comprar directamente a los artesanos. Los talleres vivenciales son ideales para niños y familias.',
    seo: {
      metaTitle: 'Alfarería de Tepexi – Artesanías de Barro de la Mixteca',
      metaDescription:
        'La alfarería de Tepexi de Rodríguez es una tradición ancestral de la Mixteca Poblana. Conoce los talleres artesanales locales.',
    },
  },
  {
    _id: 'cultura-4',
    title: 'Danza de los Tecuanes',
    slug: { current: 'danza-de-los-tecuanes' },
    category: 'Cultura',
    categoryColor: '#7B1FA2',
    imageUrl: 'https://picsum.photos/seed/danza-tecuanes-main/800/600',
    imageAlt: 'Danzantes en la Danza de los Tecuanes de Tepexi',
    description: portableTextMulti(
      'La Danza de los Tecuanes es una de las tradiciones culturales más arraigadas de Tepexi de Rodríguez y la Mixteca Poblana. "Tecuán" proviene del náhuatl y significa "bestia feroz" o "jaguar"; la danza representa la cacería colectiva de un jaguar o tigre por parte de los campesinos de la comunidad, que luchan para proteger su ganado y sus cosechas.',
      'Los danzantes se disfrazan con coloridos trajes de vaquero o campesino y portan máscaras de madera policromada representando a los personajes de la narración: el cazador mayor, los ayudantes, el diablo y, por supuesto, el tecuán. La música es interpretada por músicos locales con chirimía, tambor y otros instrumentos tradicionales.',
      'La danza tiene un profundo significado simbólico: representa la lucha del ser humano contra las fuerzas de la naturaleza y el mal, así como la importancia de la solidaridad comunitaria. Se presenta en las fiestas patronales, en el Día de Muertos y en celebraciones cívicas, manteniendo viva la identidad cultural de la región.',
    ),
    images: [
      img('tecuanes-1', 'Danzantes de los Tecuanes con máscaras tradicionales', 1200, 800),
      img('tecuanes-2', 'Actuación de la Danza de los Tecuanes en plaza', 1200, 800),
    ],
    coordinates: null,
    address: 'Plaza Principal y eventos culturales de Tepexi de Rodríguez, Puebla',
    schedule: 'En fiestas patronales (abril) y eventos culturales del municipio',
    cost: 'Acceso libre en eventos públicos',
    culturalType: 'tradicion',
    recommendations:
      'Asistir durante la Feria de Tepexi en abril para la presentación más completa. Fotografiar con respeto a los danzantes.',
    seo: {
      metaTitle: 'Danza de los Tecuanes – Tradición de Tepexi de Rodríguez',
      metaDescription:
        'La Danza de los Tecuanes es una tradición cultural de Tepexi de Rodríguez que representa la cacería del jaguar.',
    },
  },
]

// ---------------------------------------------------------------------------
// Eventos (fechas en 2026, futuras desde marzo 28 de 2026)
// ---------------------------------------------------------------------------

export const mockEventos: MockEvento[] = [
  {
    _id: 'evento-1',
    title: 'Feria de Tepexi 2026',
    slug: { current: 'feria-de-tepexi-2026' },
    description: portableTextMulti(
      'La Feria de Tepexi es la celebración anual más importante del municipio, donde se reúnen tradiciones, gastronomía, música y cultura de la Mixteca Poblana.',
      'Durante casi una semana, la Plaza Principal se transforma con juegos mecánicos, puestos de comida tradicional, exposiciones artesanales y presentaciones de danza de los Tecuanes.',
    ),
    imageUrl: 'https://picsum.photos/seed/feria-tepexi-2026/800/600',
    imageAlt: 'Feria anual de Tepexi de Rodríguez 2026',
    date: '2026-04-15T00:00:00.000Z',
    endDate: '2026-04-20T00:00:00.000Z',
    locationName: null,
    locationText: 'Plaza Principal, Tepexi de Rodríguez',
    locationCoordinates: { lat: 18.5794, lng: -97.9231 },
    locationAddress: 'Plaza Principal, Centro, Tepexi de Rodríguez, Puebla',
    isFeatured: true,
    seo: {
      metaTitle: 'Feria de Tepexi 2026 — Celebración anual',
      metaDescription: 'La Feria de Tepexi 2026 reúne tradiciones, gastronomía y cultura de la Mixteca Poblana del 15 al 20 de abril.',
    },
  },
  {
    _id: 'evento-2',
    title: 'Festival del Mole de Caderas',
    slug: { current: 'festival-del-mole-de-caderas-2026' },
    description: portableTextMulti(
      'El Festival del Mole de Caderas celebra uno de los platillos más emblemáticos de la Mixteca Poblana: el mole de caderas, preparado con chivo criollo de la región.',
      'Cocineras tradicionales, productores locales y visitantes se reúnen para degustar, aprender y celebrar esta tradición culinaria ancestral.',
    ),
    imageUrl: 'https://picsum.photos/seed/festival-mole-2026/800/600',
    imageAlt: 'Festival Gastronómico del Mole de Caderas 2026',
    date: '2026-10-20T00:00:00.000Z',
    endDate: '2026-10-22T00:00:00.000Z',
    locationName: null,
    locationText: 'Mercado Municipal, Tepexi de Rodríguez',
    locationCoordinates: { lat: 18.5786, lng: -97.9225 },
    locationAddress: 'Mercado Municipal, Centro, Tepexi de Rodríguez, Puebla',
    isFeatured: true,
    seo: {
      metaTitle: 'Festival del Mole de Caderas 2026 — Tepexi',
      metaDescription: 'Festival gastronómico del Mole de Caderas en Tepexi de Rodríguez, octubre 2026.',
    },
  },
  {
    _id: 'evento-3',
    title: 'Noche de Museos 2026',
    slug: { current: 'noche-de-museos-2026' },
    description: portableTextMulti(
      'Noche de Museos es un evento especial donde el Museo Comunitario de Tepexi abre sus puertas en horario nocturno con visitas guiadas y actividades culturales.',
    ),
    imageUrl: 'https://picsum.photos/seed/noche-museos-2026/800/600',
    imageAlt: 'Noche de Museos en el Museo Comunitario de Tepexi',
    date: '2026-05-18T00:00:00.000Z',
    endDate: null,
    locationName: null,
    locationText: 'Museo Comunitario de Tepexi de Rodríguez',
    locationCoordinates: null,
    locationAddress: null,
    isFeatured: false,
    seo: {
      metaTitle: 'Noche de Museos 2026 — Tepexi',
      metaDescription: 'Visitas guiadas nocturnas en el Museo Comunitario de Tepexi de Rodríguez.',
    },
  },
  {
    _id: 'evento-4',
    title: 'Taller de Alfarería Artesanal',
    slug: { current: 'taller-de-alfareria-artesanal-2026' },
    description: portableTextMulti(
      'Taller práctico de alfarería artesanal impartido por maestros artesanos de la región. Aprende técnicas ancestrales de la cerámica mixteca.',
    ),
    imageUrl: 'https://picsum.photos/seed/taller-alfareria-2026/800/600',
    imageAlt: 'Taller de alfarería artesanal en Tepexi',
    date: '2026-06-05T00:00:00.000Z',
    endDate: null,
    locationName: null,
    locationText: 'Centro Cultural, Tepexi de Rodríguez',
    locationCoordinates: null,
    locationAddress: null,
    isFeatured: false,
    seo: {
      metaTitle: 'Taller de Alfarería Artesanal 2026 — Tepexi',
      metaDescription: 'Aprende alfarería artesanal con maestros de la Mixteca Poblana en Tepexi de Rodríguez.',
    },
  },
  {
    _id: 'evento-5',
    title: 'Día del Mezcal Artesanal de Tepexi',
    slug: { current: 'dia-del-mezcal-artesanal-2026' },
    description: portableTextMulti(
      'Celebración dedicada al mezcal artesanal de la región. Degustaciones, exposiciones de productores locales y talleres sobre el proceso de elaboración del mezcal mixteco.',
    ),
    imageUrl: 'https://picsum.photos/seed/dia-mezcal-2026/800/600',
    imageAlt: 'Degustación de mezcales artesanales de Tepexi',
    date: '2026-08-12T00:00:00.000Z',
    endDate: null,
    locationName: null,
    locationText: 'Plaza Principal y Mercado Municipal, Tepexi de Rodríguez',
    locationCoordinates: { lat: 18.5794, lng: -97.9231 },
    locationAddress: 'Plaza Principal, Centro, Tepexi de Rodríguez, Puebla',
    isFeatured: true,
    seo: {
      metaTitle: 'Día del Mezcal Artesanal 2026 — Tepexi',
      metaDescription: 'Degustación de mezcales artesanales de la Mixteca Poblana en Tepexi de Rodríguez.',
    },
  },
]

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export const mockSettings: MockSettings = {
  siteName: 'Tepexi Digital',
  siteDescription:
    'Plataforma turística e informativa del municipio de Tepexi de Rodríguez, Puebla',
  heroImageUrl: 'https://picsum.photos/seed/tepexi-nature/1920/1080',
  heroTitle: 'Descubre Tepexi de Rodríguez',
  heroSubtitle:
    'Explora la riqueza turística, cultural y gastronómica de la Mixteca Poblana',
  contactEmail: 'turismo@tepexi.gob.mx',
  contactPhone: '+52 243 436 0001',
  address: 'Palacio Municipal, Centro, Tepexi de Rodríguez, Puebla, México',
  socialLinks: null,
  seoDefaults: {
    metaTitle: 'Tepexi Digital · Turismo, Cultura y Gastronomía de Tepexi de Rodríguez',
    metaDescription:
      'Descubre Tepexi de Rodríguez, Puebla: huellas de dinosaurios, manantiales, arquitectura colonial y la gastronomía auténtica de la Mixteca Poblana.',
    ogImageUrl: 'https://picsum.photos/seed/tepexi-og/1200/630',
  },
}
