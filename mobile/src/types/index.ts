export type NavigationTab = 'inicio' | 'servicios' | 'mapa' | 'solidaridad' | 'perfil';

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  urbanizacion: string;
  sector: string;
  calle: string;
  numero: string;
  servicePin: string; // PIN de 4 dígitos para validar servicios otorgados
  building: string;
  portal: string;
  apartment: string;
  avatarUrl?: string;
  phone: string;
  verified: boolean;
  vistosBuenos?: number;
  favoresCount?: number;
}

export interface Convocatoria {
  id: string;
  type: string;
  publishedAt: string;
  month: string;
  day: string;
  dayOfWeek: string;
  title: string;
  time: string;
  location: string;
  keyPoints: string[];
  imageUrl: string;
  attendeesCount: number;
  hasConfirmed?: boolean;
}

export interface MantenimientoAviso {
  id: string;
  issuerName: string;
  issuerRole: string;
  issuerInitials: string;
  category: string;
  title: string;
  description: string;
  dateText: string;
  timeSlot: string;
  alertNote?: string;
}

export interface ActaAviso {
  id: string;
  authorName: string;
  authorRole: string;
  timeAgo: string;
  title: string;
  previewText: string;
}

export type ServiceCategoryType =
  | 'todos'
  | 'alimentacion'
  | 'mantenimiento_hogar'
  | 'salud_bienestar'
  | 'compras_bazar'
  | 'servicios_tramites'
  | 'vehiculos_mascotas'
  | 'otros';

export type TipoActividadServicio = 'profesion' | 'oficio';

export interface ServiceReview {
  id: string;
  author: string;
  unit: string;
  comment: string;
  rating: number;
}

export interface ServiceProvider {
  id: string;
  name: string;
  experience: string;
  role: string;
  location: string;
  avatarUrl: string;
  recommendationsCount: number;
  specialtyDetails: string;
  category: ServiceCategoryType;
  tipoActividad: TipoActividadServicio; // 'profesion' (requiere verificación) | 'oficio' (sin verificación, avalado por vistos buenos)
  colegiatura?: string; // Ej: CEP #48291, CAL #71204
  verified: boolean; // true ÚNICAMENTE para personas con profesión
  servicePin?: string; // PIN de 4 dígitos para que el cliente valide la recomendación
  reviews: ServiceReview[];
  phone: string;
  ownerId?: string;
  tarifa?: number;
}

export type SolidaridadEstado = 'disponible' | 'ayuda_solicitada' | 'recibido';

// Categorías oficiales de Solidaridad: PRESTAMO, DONACION, ACOMPAÑAMIENTO, INTERCAMBIO HABILIDADES
export type SolidaridadCategory =
  | 'prestamo'
  | 'donacion'
  | 'acompanamiento'
  | 'intercambio_habilidades';

// Niveles de Gamificación / Estatus Comunitario
export type CommunityStatusLevel = 'bronce' | 'plata' | 'oro' | 'heroe_del_barrio';

export interface CommunityNeighborRanking {
  id: string;
  name: string;
  avatarUrl: string;
  calle: string;
  numero: string;
  favoresCount: number;
  level: CommunityStatusLevel;
  badgeTitle: string; // 'Bronce' | 'Plata' | 'Oro' | 'Héroe del barrio'
  position: 1 | 2 | 3;
  destacadoPor: string;
}

export interface SolidaridadFavor {
  id: string;
  type: SolidaridadCategory | 'peticion' | string;
  categoria?: SolidaridadCategory;
  badgeTag: string;
  badgeTime: string;
  title: string;
  description?: string; // Descripción del favor o artículo (fija y visible, no desplegable)
  ownerName: string;
  ownerAvatarUrl?: string;
  location: string;
  phone?: string;
  actionButtonText: string;
  iconName: 'wrench' | 'plant' | 'users' | 'heart' | 'gift' | 'arrow-left-right' | 'sparkles' | 'award';
  estado?: SolidaridadEstado;
  donorBadgeLevel?: CommunityStatusLevel;
  ownerId?: string;
}

export interface EmergencyDirectCall {
  id: string;
  name: string;
  subtitle: string;
  badgeCode?: string;
  phone: string;
  iconType: 'shield' | 'ambulance' | 'fire' | 'police';
}

export interface SpecialistGuard {
  id: string;
  name: string;
  role: string;
  eta: string;
  description: string;
  phone: string;
  avatarUrl: string;
}
