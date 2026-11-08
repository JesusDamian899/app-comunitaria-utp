import type {
  UserProfile,
  Convocatoria,
  MantenimientoAviso,
  ActaAviso,
  ServiceProvider,
  SolidaridadFavor,
  EmergencyDirectCall,
  SpecialistGuard,
  CommunityNeighborRanking
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

// Tablero de Vecino del Mes (Gamificación: Top 3 con más favores en el mes)
export const MOCK_TOP_VECINOS_DEL_MES: CommunityNeighborRanking[] = [
  {
    id: 'rnk-1',
    name: 'Ricardo Salinas',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    calle: 'Calle Los Sauces',
    numero: '310',
    favoresCount: 24,
    level: 'heroe_del_barrio',
    badgeTitle: 'Héroe del barrio',
    position: 1,
    destacadoPor: 'Préstamo de herramientas, reparaciones en alumbrado y apoyo en serenazgo vecinal',
  },
  {
    id: 'rnk-2',
    name: 'Doña Rosa Valdivia',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    calle: 'Calle Los Pinos',
    numero: '180',
    favoresCount: 16,
    level: 'oro',
    badgeTitle: 'Oro',
    position: 2,
    destacadoPor: 'Donación de libros, apoyo a adultos mayores y cuidado del vivero del barrio',
  },
  {
    id: 'rnk-3',
    name: 'Tomás Quispe',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    calle: 'Calle Las Magnolias',
    numero: '112',
    favoresCount: 9,
    level: 'plata',
    badgeTitle: 'Plata',
    position: 3,
    destacadoPor: 'Acompañamiento a botica y apoyo con compras pesadas para vecinos vulnerables',
  },
];

// Favores Solidarios con las 4 Categorías Oficiales:
// PRESTAMO, DONACION, ACOMPAÑAMIENTO, INTERCAMBIO HABILIDADES
export const MOCK_FAVORES: SolidaridadFavor[] = [
  {
    id: 'fav-1',
    type: 'prestamo',
    categoria: 'prestamo',
    badgeTag: 'Préstamo disponible',
    badgeTime: 'Hoy',
    title: 'Escalera de aluminio 6 peldaños',
    description: 'Escalera tijera de aluminio marca Cuprum de 6 pasos (1.80m). Soporta hasta 150 kg, ideal para pintar techos, cambiar focos o limpiar canaletas. Se presta por turnos de 24 horas y se entrega en mano.',
    ownerName: 'Ricardo Salinas',
    ownerAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    location: 'Calle Los Sauces 310 (Sector 2)',
    phone: '998123456',
    actionButtonText: 'Pedir prestada',
    iconName: 'wrench',
    estado: 'disponible',
    donorBadgeLevel: 'heroe_del_barrio',
  },
  {
    id: 'fav-2',
    type: 'donacion',
    categoria: 'donacion',
    badgeTag: 'Donación solidaria',
    badgeTime: 'Hoy',
    title: 'Caja con 15 libros escolares y cuentos infantiles',
    description: 'Lote de libros educativos para primaria y secundaria (matemáticas, literatura peruana y enciclopedias) más 5 cuentos ilustrados en excelente estado de conservación. Donación libre para escolares de la urbanización.',
    ownerName: 'Doña Rosa Valdivia',
    ownerAvatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    location: 'Calle Los Pinos 180 (Sector 1)',
    phone: '997234567',
    actionButtonText: 'Solicitar donación',
    iconName: 'gift',
    estado: 'disponible',
    donorBadgeLevel: 'oro',
  },
  {
    id: 'fav-3',
    type: 'acompanamiento',
    categoria: 'acompanamiento',
    badgeTag: 'Acompañamiento',
    badgeTime: 'Mañana 10:00 AM',
    title: 'Acompañamiento a botica / centro de salud',
    description: 'Ofrezco acompañamiento para vecinos mayores o personas con movilidad reducida que requieran acudir a comprar medicinas a la botica o asistir a consulta en el centro médico local. Cuento con vehículo particular para traslados cortos.',
    ownerName: 'Tomás Quispe',
    ownerAvatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    location: 'Calle Las Magnolias 112 (Sector 3)',
    phone: '996345678',
    actionButtonText: 'Ofrecer apoyo',
    iconName: 'users',
    estado: 'disponible',
    donorBadgeLevel: 'plata',
  },
  {
    id: 'fav-4',
    type: 'intercambio_habilidades',
    categoria: 'intercambio_habilidades',
    badgeTag: 'Intercambio Habilidades',
    badgeTime: 'Esta semana',
    title: 'Intercambio: Cuidado de plantas por asesoría digital / smartphone',
    description: 'Enseño técnicas de propagación y cuidado de suculentas e interiores a cambio de que me ayuden a configurar mi banca móvil y carpetas de Google Drive. Encuentro agradable en el parque o en casa.',
    ownerName: 'Valeria Torres',
    ownerAvatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    location: 'Calle Los Pinos 210 (Sector 1)',
    phone: '995456789',
    actionButtonText: 'Intercambiar habilidad',
    iconName: 'sparkles',
    estado: 'disponible',
    donorBadgeLevel: 'bronce',
  },
  {
    id: 'fav-5',
    type: 'intercambio_habilidades',
    categoria: 'intercambio_habilidades',
    badgeTag: 'Intercambio Habilidades',
    badgeTime: 'Jueves 5:00 PM',
    title: 'Asistencia técnica: Citas médicas ESSALUD y trámites digitales',
    description: 'Pongo a disposición mis conocimientos de computación para vecinos adultos mayores que necesiten sacar citas en el portal de ESSALUD, consultar pensiones ONP o tramitar duplicados de DNI.',
    ownerName: 'Javier Vega',
    ownerAvatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    location: 'Calle Los Sauces 420 (Sector 2)',
    phone: '994567890',
    actionButtonText: 'Solicitar asesoría',
    iconName: 'sparkles',
    estado: 'disponible',
    donorBadgeLevel: 'plata',
  },
  {
    id: 'fav-6',
    type: 'prestamo',
    categoria: 'prestamo',
    badgeTag: 'Préstamo disponible',
    badgeTime: 'Fin de semana',
    title: 'Taladro percutor Bosch con brocas de concreto',
    description: 'Taladro percutor de 650W con maletín y set completo de brocas para pared y madera. Se entrega probado y limpio. Se solicita devolver en las mismas condiciones al finalizar el uso.',
    ownerName: 'Don Carlos Mendoza',
    ownerAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    location: 'Calle Los Sauces 420 (Sector 2)',
    phone: '998765432',
    actionButtonText: 'Pedir prestado',
    iconName: 'wrench',
    estado: 'disponible',
    donorBadgeLevel: 'plata',
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
