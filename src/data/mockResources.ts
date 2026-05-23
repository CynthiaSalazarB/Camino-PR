export interface ResourceItem {
  id: string;
  name: string;
  category: 'telefono' | 'banco' | 'salud' | 'vivienda' | 'servicios' | 'networking';
  description: string;
  pros: string[];
  cons: string[];
  budgetFriendly: boolean;
  url: string;
  nextStep: string;
  provinces?: string[]; // empty = all
  provinceTip?: Record<string, string>; // province-specific notes
}

// Provincial health plan names for reference
export const provincialHealthPlans: Record<string, { name: string; waitPeriod: string; url: string }> = {
  'Ontario': { name: 'OHIP', waitPeriod: '3 meses de espera para la mayoría de newcomers', url: 'https://www.ontario.ca/page/apply-ohip-and-get-health-card' },
  'British Columbia': { name: 'MSP', waitPeriod: 'Sin período de espera desde 2020', url: 'https://www2.gov.bc.ca/gov/content/health/health-drug-coverage/msp' },
  'Alberta': { name: 'AHCIP', waitPeriod: 'Cobertura desde el día que llegas si tienes permiso válido', url: 'https://www.alberta.ca/ahcip-how-to-apply' },
  'Quebec': { name: 'RAMQ', waitPeriod: '3 meses de espera (seguro privado recomendado)', url: 'https://www.ramq.gouv.qc.ca/en/citizens/health-insurance/register' },
  'Manitoba': { name: 'Manitoba Health', waitPeriod: '3 meses de espera', url: 'https://www.gov.mb.ca/health/mhsip/' },
  'Saskatchewan': { name: 'Saskatchewan Health Card', waitPeriod: '3 meses de espera', url: 'https://www.ehealthsask.ca/residents/health-cards' },
  'Nova Scotia': { name: 'MSI', waitPeriod: 'Posible espera — consulta tu elegibilidad', url: 'https://novascotia.ca/DHW/msi/' },
  'New Brunswick': { name: 'Medicare NB', waitPeriod: '3 meses de espera', url: 'https://www2.gnb.ca/content/gnb/en/departments/health/MedicarePrescriptionDrugPlan.html' },
  'Newfoundland and Labrador': { name: 'MCP', waitPeriod: 'Posible espera — aplica al llegar', url: 'https://www.gov.nl.ca/hcs/mcp/' },
  'Prince Edward Island': { name: 'PEI Health Card', waitPeriod: 'Posible espera', url: 'https://www.princeedwardisland.ca/en/information/health-pei/pei-health-card' },
};

export const mockResources: ResourceItem[] = [
  // Phone
  { id: 'phone-1', name: 'Public Mobile', category: 'telefono', description: 'Planes prepagados económicos con buena cobertura nacional.', pros: ['Desde $15/mes', 'Sin contrato', 'Red de Telus'], cons: ['Solo en línea', 'Sin roaming internacional incluido'], budgetFriendly: true, url: 'https://www.publicmobile.ca', nextStep: 'Visita publicmobile.ca y elige un plan prepagado.' },
  { id: 'phone-2', name: 'Lucky Mobile', category: 'telefono', description: 'Planes básicos con datos y llamadas ilimitadas en Canadá.', pros: ['Desde $18/mes', 'Tiendas físicas', 'Red de Bell'], cons: ['Velocidad limitada en datos', 'Pocos datos incluidos'], budgetFriendly: true, url: 'https://www.luckymobile.ca', nextStep: 'Visita una tienda Lucky Mobile con tu ID.' },
  { id: 'phone-3', name: 'Chatr Mobile', category: 'telefono', description: 'Planes prepagados flexibles con buena cobertura urbana.', pros: ['Desde $20/mes', 'Tiendas físicas', 'Red de Rogers'], cons: ['Cobertura rural limitada'], budgetFriendly: true, url: 'https://www.chatrwireless.com', nextStep: 'Visita chatrwireless.com o una tienda.' },
  { id: 'phone-4', name: 'Freedom Mobile', category: 'telefono', description: 'Buenos planes con más datos. Ideal si necesitas más conectividad.', pros: ['Más datos por tu dinero', 'Planes desde $24/mes'], cons: ['Cobertura varía por zona'], budgetFriendly: false, url: 'https://www.freedommobile.ca', nextStep: 'Compara planes en freedommobile.ca.' },
  // Banks
  { id: 'bank-1', name: 'Simplii Financial', category: 'banco', description: 'Banco digital sin cargos mensuales. Ideal para recién llegados.', pros: ['Sin cargos mensuales', 'Programa para newcomers', 'App fácil de usar'], cons: ['Sin sucursales físicas propias', 'Usa cajeros CIBC'], budgetFriendly: true, url: 'https://www.simplii.com', nextStep: 'Abre tu cuenta en línea en simplii.com con tu pasaporte y permiso de trabajo/estudio.' },
  { id: 'bank-2', name: 'Tangerine', category: 'banco', description: 'Banco en línea con cuenta corriente y de ahorro sin cargos.', pros: ['Sin cargos', 'Bono de bienvenida', 'Buena app'], cons: ['Sin sucursales', 'Usa cajeros Scotiabank'], budgetFriendly: true, url: 'https://www.tangerine.ca', nextStep: 'Regístrate en tangerine.ca con tu identificación.' },
  { id: 'bank-3', name: 'Scotiabank — StartRight', category: 'banco', description: 'Programa especial para newcomers con beneficios exclusivos.', pros: ['Programa newcomer', 'Sucursales físicas', 'Asesoría en persona'], cons: ['Puede tener cargos después del período gratis'], budgetFriendly: false, url: 'https://www.scotiabank.com/ca/en/personal/programs/newcomers.html', nextStep: 'Visita una sucursal Scotiabank con tu permiso y pasaporte.' },
  { id: 'bank-4', name: 'RBC — Newcomer Advantage', category: 'banco', description: 'Cuenta sin cargos por 1 año y tarjeta de crédito para newcomers.', pros: ['Sin cargos 1 año', 'Tarjeta de crédito sin historial', 'Muchas sucursales'], cons: ['Cargos después del año'], budgetFriendly: false, url: 'https://www.rbc.com/newcomers', nextStep: 'Agenda una cita en rbc.com/newcomers.' },
  // Health — generic (all provinces)
  { id: 'health-1', name: 'Blue Cross', category: 'salud', description: 'Seguro médico privado con planes flexibles. Útil durante el período de espera del plan provincial.', pros: ['Planes desde $30/mes', 'Cobertura dental opcional', 'Aceptado en todo Canadá'], cons: ['Puede excluir condiciones preexistentes'], budgetFriendly: true, url: 'https://www.bluecross.ca', nextStep: 'Solicita una cotización en bluecross.ca seleccionando tu provincia.',
    provinceTip: {
      'Ontario': 'En Ontario, OHIP tiene ~3 meses de espera. Blue Cross cubre ese período.',
      'British Columbia': 'En BC, MSP ya no tiene período de espera, pero Blue Cross puede complementar con dental y visión.',
      'Alberta': 'En Alberta, AHCIP cubre desde el día 1. Blue Cross sirve para cobertura dental y de medicamentos.',
      'Quebec': 'En Quebec, RAMQ tiene ~3 meses de espera. Blue Cross cubre ese período.',
    }
  },
  { id: 'health-2', name: 'Guard.me', category: 'salud', description: 'Seguro enfocado en estudiantes internacionales. Disponible en varias provincias.', pros: ['Diseñado para estudiantes', 'Cobertura inmediata', 'Precio competitivo'], cons: ['Solo para estudiantes'], budgetFriendly: true, url: 'https://www.guard.me', nextStep: 'Verifica si tu escuela ya incluye Guard.me o solicita en guard.me.' },
  { id: 'health-3', name: 'Manulife — CoverMe', category: 'salud', description: 'Planes individuales y familiares con buena cobertura. Disponible en todo Canadá.', pros: ['Planes familiares', 'Buena reputación', 'App para reclamaciones'], cons: ['Puede ser más caro'], budgetFriendly: false, url: 'https://www.coverme.com', nextStep: 'Compara planes en coverme.com seleccionando tu provincia.' },
  // Housing
  { id: 'housing-1', name: 'Realtor.ca', category: 'vivienda', description: 'Portal oficial de bienes raíces de Canadá. Busca alquileres y compra en cualquier provincia.', pros: ['Listados verificados', 'Filtros por zona y precio'], cons: ['Principalmente para compra'], budgetFriendly: false, url: 'https://www.realtor.ca', nextStep: 'Busca "for rent" en tu ciudad en realtor.ca.' },
  { id: 'housing-2', name: 'Rentals.ca', category: 'vivienda', description: 'Buscador de alquileres con amplia cobertura en todo Canadá.', pros: ['Enfocado en alquileres', 'Fácil de usar', 'Fotos y precios claros'], cons: ['Puede no tener todas las opciones'], budgetFriendly: true, url: 'https://www.rentals.ca', nextStep: 'Filtra por tu presupuesto y zona en rentals.ca.',
    provinceTip: {
      'Ontario': 'En Ontario, el promedio de renta en Toronto supera $2,300/mes. Considera ciudades como Hamilton o London.',
      'British Columbia': 'En BC, Vancouver es muy caro. Considera Surrey, Burnaby o Kelowna para rentas más accesibles.',
      'Alberta': 'Alberta tiene rentas más accesibles. Calgary y Edmonton ofrecen buenas opciones desde ~$1,200/mes.',
      'Quebec': 'Montreal tiene rentas más bajas que Toronto/Vancouver. Busca en Plateau, Verdun o Villeray.',
      'Manitoba': 'Winnipeg ofrece rentas muy accesibles comparado con otras ciudades grandes (~$900-1,200/mes).',
      'Saskatchewan': 'Saskatoon y Regina tienen rentas accesibles (~$900-1,100/mes).',
      'Nova Scotia': 'Halifax ha subido en precio, pero sigue más accesible que Toronto o Vancouver.',
    }
  },
  { id: 'housing-3', name: 'Kijiji', category: 'vivienda', description: 'Clasificados con muchas opciones de alquiler, incluyendo cuartos compartidos en todo Canadá.', pros: ['Cuartos compartidos', 'Precios negociables', 'Mucha variedad'], cons: ['Riesgo de estafas — verifica siempre'], budgetFriendly: true, url: 'https://www.kijiji.ca', nextStep: 'Busca en Kijiji > Real Estate > For Rent en tu ciudad.' },
  { id: 'housing-4', name: 'Facebook Marketplace', category: 'vivienda', description: 'Grupos y listados de vivienda en tu comunidad local.', pros: ['Contacto directo', 'Grupos latinos de vivienda'], cons: ['Sin verificación formal'], budgetFriendly: true, url: 'https://www.facebook.com/marketplace', nextStep: 'Busca grupos de vivienda latino en Facebook para tu ciudad.' },
  // Newcomer services — province-specific
  { id: 'service-1', name: 'COSTI Immigrant Services', category: 'servicios', description: 'Servicios de asentamiento gratuitos: orientación, empleo, idiomas.', pros: ['Gratis', 'Servicios en español', 'Ayuda con empleo'], cons: ['Principalmente en el GTA (Ontario)'], budgetFriendly: true, url: 'https://www.costi.org', nextStep: 'Llama o visita costi.org para agendar una cita.', provinces: ['Ontario'] },
  { id: 'service-1b', name: 'ACCES Employment', category: 'servicios', description: 'Servicios de empleo para newcomers con programas sectoriales.', pros: ['Gratis', 'Programas especializados por industria', 'Mentores'], cons: ['Principalmente en Ontario'], budgetFriendly: true, url: 'https://accesemployment.ca', nextStep: 'Regístrate en accesemployment.ca para orientación.', provinces: ['Ontario'] },
  { id: 'service-2', name: 'MOSAIC', category: 'servicios', description: 'Organización de asentamiento con servicios en múltiples idiomas.', pros: ['Servicios en español', 'Talleres de empleo', 'Gratis'], cons: ['Principalmente en BC'], budgetFriendly: true, url: 'https://www.mosaicbc.org', nextStep: 'Contacta MOSAIC para una sesión de orientación.', provinces: ['British Columbia'] },
  { id: 'service-2b', name: 'ISSofBC', category: 'servicios', description: 'Servicios de asentamiento y empleo para newcomers en British Columbia.', pros: ['Gratis', 'Orientación personal', 'Clases de inglés'], cons: ['Solo en BC'], budgetFriendly: true, url: 'https://issbc.org', nextStep: 'Visita issbc.org y agenda una cita de orientación.', provinces: ['British Columbia'] },
  { id: 'service-3', name: 'Centre for Newcomers', category: 'servicios', description: 'Apoyo integral para recién llegados en Alberta.', pros: ['Gratis', 'Orientación personal', 'Clases de inglés'], cons: ['Ubicado en Calgary'], budgetFriendly: true, url: 'https://www.centrefornewcomers.ca', nextStep: 'Visita centrefornewcomers.ca y agenda una cita.', provinces: ['Alberta'] },
  { id: 'service-3b', name: 'Edmonton Mennonite Centre', category: 'servicios', description: 'Servicios de asentamiento para newcomers en Edmonton, Alberta.', pros: ['Gratis', 'Múltiples idiomas', 'Ayuda con vivienda y empleo'], cons: ['Solo en Edmonton'], budgetFriendly: true, url: 'https://www.emcn.ab.ca', nextStep: 'Contacta EMCN para una sesión de orientación.', provinces: ['Alberta'] },
  { id: 'service-4q', name: 'PROMIS', category: 'servicios', description: 'Centro de asentamiento multiétnico en Montreal con servicios en español.', pros: ['Gratis', 'Servicios en español', 'Talleres de francés'], cons: ['Solo en Montreal'], budgetFriendly: true, url: 'https://www.promis.qc.ca', nextStep: 'Contacta PROMIS para una sesión de orientación.', provinces: ['Quebec'] },
  { id: 'service-4m', name: 'Entry Program Manitoba', category: 'servicios', description: 'Servicios de orientación y asentamiento para newcomers en Manitoba.', pros: ['Gratis', 'Orientación cultural', 'Ayuda con empleo'], cons: ['Principalmente en Winnipeg'], budgetFriendly: true, url: 'https://www.entryprogram.ca', nextStep: 'Visita entryprogram.ca para agendar orientación.', provinces: ['Manitoba'] },
  { id: 'service-4s', name: 'Regina Open Door Society', category: 'servicios', description: 'Apoyo integral para newcomers en Saskatchewan.', pros: ['Gratis', 'Clases de inglés', 'Empleo y vivienda'], cons: ['Solo en Regina'], budgetFriendly: true, url: 'https://rods.sk.ca', nextStep: 'Contacta RODS para una cita de orientación.', provinces: ['Saskatchewan'] },
  { id: 'service-4ns', name: 'ISANS', category: 'servicios', description: 'Servicios de asentamiento para newcomers en Nova Scotia.', pros: ['Gratis', 'Orientación laboral', 'Múltiples idiomas'], cons: ['Principalmente en Halifax'], budgetFriendly: true, url: 'https://www.isans.ca', nextStep: 'Visita isans.ca para orientación.', provinces: ['Nova Scotia'] },
  { id: 'service-5', name: 'YMCA Newcomer Services', category: 'servicios', description: 'Programas de integración y asentamiento disponibles en múltiples provincias.', pros: ['Presencia nacional', 'Gratis', 'Programas de empleo'], cons: ['Servicios varían por ubicación'], budgetFriendly: true, url: 'https://www.ymca.ca', nextStep: 'Busca tu YMCA local y pregunta por servicios para newcomers.' },
  // Networking
  { id: 'net-1', name: 'LinkedIn — Networking Profesional', category: 'networking', description: 'Construye tu red profesional en Canadá. Busca grupos latinos.', pros: ['Gratis', 'Conexiones profesionales', 'Ofertas de empleo'], cons: ['Requiere perfil en inglés'], budgetFriendly: true, url: 'https://www.linkedin.com', nextStep: 'Busca "#LatinosInCanada" y únete a grupos de tu industria.' },
  { id: 'net-2', name: 'Meetup — Eventos Locales', category: 'networking', description: 'Encuentra eventos de networking, idiomas y comunidad latina en tu ciudad.', pros: ['Eventos presenciales', 'Variedad de temas', 'Gratis muchos eventos'], cons: ['Disponibilidad varía por ciudad'], budgetFriendly: true, url: 'https://www.meetup.com', nextStep: 'Busca "Spanish" o "Latino" en Meetup para tu ciudad.' },
  { id: 'net-3', name: 'YouTube & Instagram — Comunidad', category: 'networking', description: 'Busca creadores latinos en Canadá para tips y comunidad.', pros: ['Gratis', 'Info actualizada', 'Comunidad activa'], cons: ['Calidad varía'], budgetFriendly: true, url: 'https://www.youtube.com', nextStep: 'Busca: "latinos en Canada tips", "#latinosencanada", "#newcomerscanada".' },
];

export const categoryLabels: Record<string, string> = {
  telefono: '📱 Teléfono',
  banco: '🏦 Banco',
  salud: '🏥 Salud',
  vivienda: '🏠 Vivienda',
  servicios: '🤝 Servicios para Recién Llegados',
  networking: '🌐 Networking y Comunidad',
};
