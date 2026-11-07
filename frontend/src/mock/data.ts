import type {
  UserProfile,
  Convocatoria,
  MantenimientoAviso,
  ActaAviso,
  ServiceProvider,
  SolidaridadFavor,
  EmergencyDirectCall,
  SpecialistGuard
} from '../types';

export const CURRENT_USER: UserProfile = {
  id: 'usr-1',
  name: 'Carlos Mendoza',
  role: 'Vecino Residente',
  urbanizacion: 'Urb. Las Palmeras',
  sector: 'Sector 2 • Mz. B',
  calle: 'Calle Los Sauces',
  numero: '420',
  building: 'Urb. Las Palmeras',
  portal: 'Calle Los Sauces',
  apartment: '420',
  phone: '998 765 432',
  verified: true,
  servicePin: '4826', // PIN de 4 dígitos visible en el perfil para validar servicios
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
};

export const MOCK_CONVOCATORIA: Convocatoria = {
  id: 'conv-1',
  type: 'CONVOCATORIA OFICIAL',
  publishedAt: 'Publicado hoy',
  month: 'OCT',
  day: '24',
  dayOfWeek: 'Jueves',
  title: 'Asamblea General Vecinal de la Urbanización',
  time: '19:30 h',
  location: 'Local Comunal • Frente al Parque Central',
  keyPoints: [
    'Instalación de cámaras de seguridad y sirenas vecinales por calles.',
    'Mantenimiento de pistas, alumbrado público y rejas de acceso sectorial.'
  ],
  imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
  attendeesCount: 32,
  hasConfirmed: false,
};

export const MOCK_MANTENIMIENTO: MantenimientoAviso = {
  id: 'mant-1',
  issuerName: 'Junta Vecinal & Sedapal',
  issuerRole: 'Coordinación de Obras',
  issuerInitials: 'JV',
  category: 'Redes de Agua',
  title: 'Mantenimiento de tubería matriz y alcantarillado',
  description: 'Revisión y mantenimiento de válvulas matrices en Calle Los Sauces y Calle Los Pinos. Se ruega precaución por obras en la calzada.',
  dateText: 'Mañana',
  timeSlot: '09:00 - 13:00',
  alertNote: 'Corte temporal de agua en Calle Los Sauces y aledaños (10:00 - 12:00)',
};

export const MOCK_ACTA: ActaAviso = {
  id: 'acta-1',
  authorName: 'Marta Sánchez (Calle Las Violetas 112)',
  authorRole: 'Secretaria de la Junta Vecinal',
  timeAgo: 'Ayer 18:40',
  title: 'Acta de la última sesión vecinal aprobada para consulta...',
  previewText: 'Aprobado formalmente el cronograma de seguridad ciudadana, rondas de serenazgo y limpieza comunal del parque de la urbanización.',
};

export const MOCK_PROVIDERS: ServiceProvider[] = [
  {
    id: 'prov-1',
    name: 'Don Mario Ramos',
    experience: '30 años exp.',
    role: 'Plomero / Gasfitero Maestro',
    location: 'Calle Los Sauces 310 (Mz. B)',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    recommendationsCount: 32,
    specialtyDetails: 'Detección de fugas en tuberías domiciliarias, medidores de calle, desatoros y bombas de agua. Tarifa vecinal acordada en la urbanización.',
    category: 'mantenimiento_hogar',
    tipoActividad: 'oficio',
    verified: false, // Oficio: NO tiene verificación de título, respaldado por Vistos Buenos
    servicePin: '3150', // PIN para que el vecino valide el servicio
    phone: '955432109',
    reviews: [
      {
        id: 'rev-1',
        author: 'Carmen P.',
        unit: 'Calle Los Pinos 142',
        comment: 'Puntual y muy limpio el trabajo en la tubería de entrada.',
        rating: 5,
      },
      {
        id: 'rev-2',
        author: 'Jorge L.',
        unit: 'Calle Los Sauces 405',
        comment: 'Solucionó una fuga de urgencia en la calle en 20 minutos.',
        rating: 5,
      }
    ]
  },
  {
    id: 'prov-2',
    name: 'Lic. Lucía Méndez',
    experience: '12 años exp.',
    role: 'Lic. en Enfermería y Cuidados a Domicilio',
    location: 'Jr. Los Pinos 240 (Sector 1)',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    recommendationsCount: 41,
    specialtyDetails: 'Atención a adultos mayores, inyectables, curaciones y control de presión arterial a domicilio en la urbanización.',
    category: 'salud_bienestar',
    tipoActividad: 'profesion',
    colegiatura: 'Col. CEP #48291',
    verified: true, // Profesión: SÍ cuenta con verificación colegiada oficial
    servicePin: '7294',
    phone: '988123456',
    reviews: [
      {
        id: 'rev-3',
        author: 'Felipe S.',
        unit: 'Calle Las Violetas 202',
        comment: 'Muy profesional y paciente atendiendo a mi abuela.',
        rating: 5,
      }
    ]
  },
  {
    id: 'prov-3',
    name: 'Doña Carmen Pardo',
    experience: '15 años exp.',
    role: 'Almuerzos Caseros y Viandas Diarias',
    location: 'Calle Las Violetas 112 (Mz. D)',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    recommendationsCount: 29,
    specialtyDetails: 'Menús criollos diarios, queques caseros y postres por encargo con delivery a pie en toda la urbanización.',
    category: 'alimentacion',
    tipoActividad: 'oficio',
    verified: false, // Oficio
    servicePin: '1842',
    phone: '944888222',
    reviews: [
      {
        id: 'rev-4',
        author: 'Rosa M.',
        unit: 'Calle Los Sauces 110',
        comment: 'La comida es deliciosa y llega calientita a la puerta.',
        rating: 5,
      }
    ]
  },
  {
    id: 'prov-4',
    name: 'Dr. Jorge Salazar',
    experience: '10 años exp.',
    role: 'Abogado y Notaría / Trámites Comunitarios',
    location: 'Calle Los Sauces 405 (Mz. B)',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    recommendationsCount: 25,
    specialtyDetails: 'Asesoría jurídica en saneamiento de títulos de propiedad, contratos de alquiler vecinal y trámites municipales.',
    category: 'servicios_tramites',
    tipoActividad: 'profesion',
    colegiatura: 'Reg. CAL #71204',
    verified: true, // Profesión: SÍ cuenta con verificación
    servicePin: '9035',
    phone: '966333111',
    reviews: [
      {
        id: 'rev-5',
        author: 'Carlos M.',
        unit: 'Calle Los Sauces 420',
        comment: 'Me ayudó a regularizar los papeles de la casa en la municipalidad.',
        rating: 5,
      }
    ]
  },
  {
    id: 'prov-5',
    name: 'Roberto Gil',
    experience: '18 años exp.',
    role: 'Cerrajero de Seguridad 24h',
    location: 'Av. Principal 510 (Cerca a Garita)',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    recommendationsCount: 19,
    specialtyDetails: 'Aperturas sin daño, cerraduras de rejas vecinales, portones y cerrojos de alta seguridad.',
    category: 'mantenimiento_hogar',
    tipoActividad: 'oficio',
    verified: false, // Oficio
    servicePin: '5621',
    phone: '977987654',
    reviews: [
      {
        id: 'rev-6',
        author: 'Elena M.',
        unit: 'Calle Los Sauces 210',
        comment: 'Llegó en 10 minutos y reparó la chapa del portón con total cuidado.',
        rating: 5,
      }
    ]
  },
  {
    id: 'prov-6',
    name: 'Valeria Torres',
    experience: '4 años exp.',
    role: 'Paseadora Canina y Baño a Domicilio',
    location: 'Calle Los Pinos 180 (Sector 1)',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    recommendationsCount: 18,
    specialtyDetails: 'Paseos diarios por el parque central, socialización y baño canino sin salir de casa.',
    category: 'vehiculos_mascotas',
    tipoActividad: 'oficio',
    verified: false, // Oficio
    servicePin: '8401',
    phone: '911223344',
    reviews: [
      {
        id: 'rev-7',
        author: 'Pedro C.',
        unit: 'Calle Los Sauces 300',
        comment: 'Cuida a mi perrita como si fuera suya, muy responsable.',
        rating: 5,
      }
    ]
  }
];

export const MOCK_FAVORES: SolidaridadFavor[] = [
  {
    id: 'fav-1',
    type: 'prestamo',
    badgeTag: 'Préstamo disponible',
    badgeTime: 'Hoy',
    title: 'Escalera de aluminio 6 peldaños',
    ownerName: 'Don Carlos (Calle Los Sauces)',
    location: 'Disponible en Calle Los Sauces 420',
    actionButtonText: 'Pedir prestada',
    iconName: 'wrench',
  },
  {
    id: 'fav-2',
    type: 'peticion',
    badgeTag: 'Petición solidaria',
    badgeTime: 'Fin de semana',
    title: 'Cuidado y riego de jardín frontal',
    ownerName: 'Doña Rosa (Calle Los Pinos 180)',
    location: 'Publicado por Doña Rosa (Calle Los Pinos)',
    actionButtonText: 'Ayudar a Rosa',
    iconName: 'plant',
  },
  {
    id: 'fav-3',
    type: 'acompanamiento',
    badgeTag: 'Acompañamiento',
    badgeTime: 'Mañana 10:00 AM',
    title: 'Acompañamiento a botica / mercado',
    ownerName: 'Tomás (Calle Las Magnolias)',
    location: 'Publicado por Tomás (Calle Las Magnolias)',
    actionButtonText: 'Ofrecer apoyo',
    iconName: 'users',
  },
  {
    id: 'fav-4',
    type: 'prestamo',
    badgeTag: 'Préstamo disponible',
    badgeTime: 'Toda la semana',
    title: 'Taladro percutor con juego de brocas',
    ownerName: 'Javier (Calle Los Eucaliptos 310)',
    location: 'Publicado por Javier (Calle Los Eucaliptos)',
    actionButtonText: 'Pedir prestado',
    iconName: 'wrench',
  }
];

export const MOCK_DIRECT_CALLS: EmergencyDirectCall[] = [
  {
    id: 'call-1',
    name: 'Serenazgo y Seguridad Vecinal',
    subtitle: 'Patrullaje 24h • Garita de Acceso Sectorial',
    phone: '01 548 7000',
    iconType: 'shield'
  },
  {
    id: 'call-2',
    name: 'Ambulancias SAMU',
    subtitle: 'Urgencias médicas y rescate',
    badgeCode: '106',
    phone: '106',
    iconType: 'ambulance'
  },
  {
    id: 'call-3',
    name: 'Cuerpo de Bomberos',
    subtitle: 'Fugas de gas, incendios y auxilio',
    badgeCode: '116',
    phone: '116',
    iconType: 'fire'
  },
  {
    id: 'call-4',
    name: 'Policía Nacional (Comisaría)',
    subtitle: 'Comisaría del sector y patrullaje',
    badgeCode: '105',
    phone: '105',
    iconType: 'police'
  }
];

export const MOCK_SPECIALIST_GUARD: SpecialistGuard = {
  id: 'guard-1',
  name: 'Don Mario Ramos',
  role: 'Gasfitero Vecinal • Atención de Urgencias',
  eta: 'En la zona (a 3 cuadras)',
  description: 'Corte de llave de paso principal en vereda, filtraciones de tuberías y emergencias de agua.',
  phone: '955 432 109',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
};
