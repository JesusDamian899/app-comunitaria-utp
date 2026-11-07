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
  name: 'Carlos',
  role: 'Vecino Propietario',
  building: 'Edificio Roble',
  portal: 'Portal B',
  apartment: '4º A',
  phone: '+34 612 345 678',
  verified: true,
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
};

export const MOCK_CONVOCATORIA: Convocatoria = {
  id: 'conv-1',
  type: 'CONVOCATORIA OFICIAL',
  publishedAt: 'Publicado hoy',
  month: 'OCT',
  day: '24',
  dayOfWeek: 'Jueves',
  title: 'Asamblea General Extraordinaria de Propietarios',
  time: '19:30 h',
  location: 'Sala Común Portal B',
  keyPoints: [
    'Aprobación de presupuesto para rehabilitación de fachada.',
    'Sustitución de maquinaria del ascensor principal.'
  ],
  imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
  attendeesCount: 32,
  hasConfirmed: false,
};

export const MOCK_MANTENIMIENTO: MantenimientoAviso = {
  id: 'mant-1',
  issuerName: 'Administración Fincas',
  issuerRole: 'Técnico colegiado #4190',
  issuerInitials: 'AD',
  category: 'Mantenimiento',
  title: 'Inspección técnica de tuberías y caldera comunitaria',
  description: 'Revisión anual obligatoria de bajantes y circuito de calefacción central. Se ruega facilitar el acceso al patinillo comunitario.',
  dateText: 'Mañana',
  timeSlot: '09:00 - 12:00',
  alertNote: 'Corte puntual de agua de 10:00 a 11:00',
};

export const MOCK_ACTA: ActaAviso = {
  id: 'acta-1',
  authorName: 'Marta Sánchez (3ºB)',
  authorRole: 'Secretaria de la Junta',
  timeAgo: 'Ayer 18:40',
  title: 'Acta de la última reunión disponible para consulta...',
  previewText: 'Ya se encuentra firmada por el Presidente y depositada formalmente la copia física en conserjería y en formato PDF en el panel vecinal.',
};

export const MOCK_PROVIDERS: ServiceProvider[] = [
  {
    id: 'prov-1',
    name: 'Don Mario Ramos',
    experience: '30 años exp.',
    role: 'Plomero / Fontanero Maestro',
    location: 'Vecino Portal B, Torre A',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    recommendationsCount: 32,
    specialtyDetails: 'Especialista en detección de fugas, cambio de grifería, desatascos y calderas comunitarias. Tarifa vecinal: Diagnóstico gratuito en el portal + 20€/hora.',
    category: 'fontaneria',
    phone: '+34 655 432 109',
    reviews: [
      {
        id: 'rev-1',
        author: 'Carmen P.',
        unit: 'Dpto 301',
        comment: 'Puntual y muy limpio el trabajo.',
        rating: 5,
      },
      {
        id: 'rev-2',
        author: 'Jorge L.',
        unit: 'Dpto 104',
        comment: 'Solucionó una fuga de urgencia en 20 minutos.',
        rating: 5,
      }
    ]
  },
  {
    id: 'prov-2',
    name: 'Lucía Méndez',
    experience: '12 años exp.',
    role: 'Electricista Autorizada e Instalaciones',
    location: 'Vecina Portal A, Torre B',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    recommendationsCount: 24,
    specialtyDetails: 'Cuadros eléctricos, iluminación LED de bajo consumo, porteros automáticos y diferenciales.',
    category: 'electricidad',
    phone: '+34 688 123 456',
    reviews: [
      {
        id: 'rev-3',
        author: 'Felipe S.',
        unit: 'Dpto 202',
        comment: 'Instaló los nuevos magnetotérmicos sin cortar la luz general.',
        rating: 5,
      }
    ]
  },
  {
    id: 'prov-3',
    name: 'Roberto Gil',
    experience: '18 años exp.',
    role: 'Cerrajero de Seguridad 24h',
    location: 'Vecino Portal C, Torre A',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    recommendationsCount: 19,
    specialtyDetails: 'Aperturas sin rotura, bombines antibumping, cerraduras electrónicas comunitarias.',
    category: 'cerrajeria',
    phone: '+34 677 987 654',
    reviews: [
      {
        id: 'rev-4',
        author: 'Elena M.',
        unit: 'Dpto 504',
        comment: 'Llegó en 10 minutos y abrió la puerta blindada con total cuidado.',
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
    ownerName: 'Conserjería / Don Carlos',
    location: 'Disponible en Conserjería / Don Carlos',
    actionButtonText: 'Pedir prestada',
    iconName: 'wrench',
  },
  {
    id: 'fav-2',
    type: 'peticion',
    badgeTag: 'Petición solidaria',
    badgeTime: 'Fin de semana',
    title: 'Cuidado y riego de macetas',
    ownerName: 'Doña Rosa (Dpto 302)',
    location: 'Publicado por Doña Rosa (Dpto 302)',
    actionButtonText: 'Ayudar a Rosa',
    iconName: 'plant',
  },
  {
    id: 'fav-3',
    type: 'acompanamiento',
    badgeTag: 'Acompañamiento',
    badgeTime: 'Mañana 10:00 AM',
    title: 'Acompañamiento a farmacia / trámites',
    ownerName: 'Tomás (Portal A)',
    location: 'Publicado por Tomás (Portal A)',
    actionButtonText: 'Ofrecer apoyo',
    iconName: 'users',
  },
  {
    id: 'fav-4',
    type: 'prestamo',
    badgeTag: 'Préstamo disponible',
    badgeTime: 'Toda la semana',
    title: 'Taladro percutor con juego de brocas',
    ownerName: 'Javier (Dpto 501)',
    location: 'Publicado por Javier (Dpto 501)',
    actionButtonText: 'Pedir prestado',
    iconName: 'wrench',
  }
];

export const MOCK_DIRECT_CALLS: EmergencyDirectCall[] = [
  {
    id: 'call-1',
    name: 'Portería Central / Conserjería',
    subtitle: 'Guardia de turno 24h • Intercom Directo',
    phone: 'Ext. 100',
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
    name: 'Policía Nacional',
    subtitle: 'Comisaría sectorial y patrullaje',
    badgeCode: '105',
    phone: '105',
    iconType: 'police'
  }
];

export const MOCK_SPECIALIST_GUARD: SpecialistGuard = {
  id: 'guard-1',
  name: 'Don Mario Ramos',
  role: 'Plomero Matriz • Llaves maestras del edificio',
  eta: 'Llegada 5 min',
  description: 'Cierre de matriz principal de agua, filtraciones mayores y rebalses.',
  phone: '+34 655 432 109',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
};
