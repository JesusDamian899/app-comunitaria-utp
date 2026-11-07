export type NavigationTab = 'inicio' | 'servicios' | 'solidaridad' | 'perfil';

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  urbanizacion: string;
  sector: string;
  calle: string;
  numero: string;
  servicePin: string; // PIN de 4 dígitos para validar servicios otorgados
  // Propiedades de retrocompatibilidad
  building: string;
  portal: string;
  apartment: string;
  avatarUrl?: string;
  phone: string;
  verified: boolean;
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
  servicePin: string; // PIN de 4 dígitos para que el cliente valide la recomendación
  reviews: ServiceReview[];
  phone: string;
}

export interface SolidaridadFavor {
  id: string;
  type: 'prestamo' | 'peticion' | 'acompanamiento';
  badgeTag: string;
  badgeTime: string;
  title: string;
  ownerName: string;
  location: string;
  actionButtonText: string;
  iconName: 'wrench' | 'plant' | 'users' | 'heart';
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
