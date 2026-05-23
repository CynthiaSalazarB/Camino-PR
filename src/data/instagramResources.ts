import { InstagramResource } from '@/types/profile';

export const instagramResources: InstagramResource[] = [
  // Immigration
  { id: 'ig-imm-1', category: 'immigration', platform: 'instagram', handle: '@voloimmigration', url: 'https://www.instagram.com/voloimmigration/', scope: 'Canada-wide', curated: true, priorityBase: 60, disclaimer: 'No es asesoría legal. Contenido informativo. No afiliados.' },
  { id: 'ig-imm-2', category: 'immigration', platform: 'instagram', handle: '@stateraimmigration', url: 'https://www.instagram.com/stateraimmigration/', scope: 'Canada-wide', curated: true, priorityBase: 58, disclaimer: 'No es asesoría legal. Contenido informativo. No afiliados.' },
  { id: 'ig-imm-3', category: 'immigration', platform: 'instagram', handle: '@immilandlaw', url: 'https://www.instagram.com/immilandlaw/', scope: 'Canada-wide', curated: true, priorityBase: 56, disclaimer: 'No es asesoría legal. Contenido informativo. No afiliados.' },
  // Taxes
  { id: 'ig-tax-1', category: 'taxes', platform: 'instagram', handle: '@paladinecorp', url: 'https://www.instagram.com/paladinecorp/', scope: 'Canada-wide', curated: true, priorityBase: 55, disclaimer: 'No es asesoría contable. Contenido informativo. No afiliados.' },
  { id: 'ig-tax-2', category: 'taxes', platform: 'instagram', handle: '@toroaccounting', url: 'https://www.instagram.com/toroaccounting/', scope: 'Canada-wide', curated: true, priorityBase: 53, disclaimer: 'No es asesoría contable. Contenido informativo. No afiliados.' },
  { id: 'ig-tax-3', category: 'taxes', platform: 'instagram', handle: '@suconsultingtax', url: 'https://www.instagram.com/suconsultingtax/', scope: 'Canada-wide', curated: true, priorityBase: 51, disclaimer: 'No es asesoría contable. Contenido informativo. No afiliados.' },
  // Networking
  { id: 'ig-net-1', category: 'networking', platform: 'instagram', handle: '@notworking2networking', url: 'https://www.instagram.com/notworking2networking/', scope: 'City', city: 'Toronto', curated: true, priorityBase: 50, disclaimer: 'No afiliados. Recomendación informativa.' },
  { id: 'ig-net-2', category: 'networking', platform: 'instagram', handle: '@notworking2networking.mtl', url: 'https://www.instagram.com/notworking2networking.mtl/', scope: 'City', city: 'Montreal', curated: true, priorityBase: 50, disclaimer: 'No afiliados. Recomendación informativa.' },
  { id: 'ig-net-3', category: 'networking', platform: 'instagram', handle: '@built2connect', url: 'https://www.instagram.com/built2connect/', scope: 'Canada-wide', curated: true, priorityBase: 48, disclaimer: 'No afiliados. Recomendación informativa.' },
];

export const instagramCategoryLabels: Record<string, string> = {
  immigration: '🛂 Inmigración',
  taxes: '💰 Impuestos',
  networking: '🤝 Networking',
};
