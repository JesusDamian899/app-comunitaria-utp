import { 
  Building2, 
  Calendar, 
  Store, 
  HandHeart, 
  ShieldAlert, 
  CheckCircle2, 
  PlusCircle, 
  Search, 
  ThumbsUp, 
  Wrench, 
  Sprout, 
  HeartPulse, 
  Phone 
} from 'lucide-react';
import type { NavigationTab } from '../../../types';

export type TutorialModuleKey = NavigationTab | 'sos';

export interface TutorialStepItem {
  title: string;
  description: string;
  highlightText: string;
  icon: typeof Building2;
}

export interface ModuleTutorialData {
  id: TutorialModuleKey;
  label: string;
  icon: typeof Building2;
  headerTitle: string;
  headerSubtitle: string;
  accentGradient: string;
  steps: TutorialStepItem[];
}

export const MODULE_TUTORIALS: Record<TutorialModuleKey, ModuleTutorialData> = {
  inicio: {
    id: 'inicio',
    label: 'Inicio',
    icon: Building2,
    headerTitle: 'Módulo de Inicio',
    headerSubtitle: 'Tablero oficial de tu comunidad',
    accentGradient: 'from-blue-600 to-indigo-700',
    steps: [
      {
        title: 'Filtros de Alcance Vecinal',
        description: 'Filtra las noticias para ver lo que ocurre en Todo el Portal B, Solo en tu Edificio o en toda la Urbanización.',
        highlightText: 'Botones: Todo el Portal • Solo Edificio • Urbanización',
        icon: Building2,
      },
      {
        title: 'Asambleas con Asistencia en 1 Clic',
        description: 'Revisa fecha, hora y puntos clave a votar en las juntas de propietarios. Confirma tu asistencia de inmediato sin papeleos.',
        highlightText: 'Botón: Confirmar Asistencia (1 Clic)',
        icon: Calendar,
      },
      {
        title: 'Mantenimientos y Cortes de Servicio',
        description: 'Infórmate con anticipación sobre revisiones obligatorias de calderas, bajantes o cortes puntuales de agua con franja horaria.',
        highlightText: 'Tarjetas de Administración con horarios y detalles técnicos',
        icon: CheckCircle2,
      },
      {
        title: 'Publicar Nuevo Aviso Comunitario',
        description: 'Si necesitas avisar algo a tus vecinos, presiona el botón superior "+ Aviso" para publicar en el tablero.',
        highlightText: 'Botón: + Aviso en la cabecera',
        icon: PlusCircle,
      },
    ],
  },
  servicios: {
    id: 'servicios',
    label: 'Servicios',
    icon: Store,
    headerTitle: 'Directorio de Oficios',
    headerSubtitle: 'Profesionales y servicios locales confiables',
    accentGradient: 'from-blue-700 to-cyan-600',
    steps: [
      {
        title: 'Buscador y Categorías Rápidas',
        description: 'Filtra por oficios: Fontanería, Electricidad, Cerrajería o Hogar, o busca directamente por nombre de trabajo.',
        highlightText: 'Chips horizontales y buscador en vivo',
        icon: Search,
      },
      {
        title: 'Profesionales Verificados y Tarifas',
        description: 'Visualiza la experiencia, años de servicio y tarifa vecinal acordada (ej. diagnóstico gratuito en el portal).',
        highlightText: 'Tarjetas con tarifa vecinal e historial de trabajos',
        icon: Wrench,
      },
      {
        title: 'Sistema de "Visto Bueno" (3 Clics)',
        description: 'Recomienda a los profesionales que hicieron un buen trabajo para sumar Vistos Buenos a su reputación vecinal.',
        highlightText: 'Botón: 👍 Recomendar (+1 Visto Bueno)',
        icon: ThumbsUp,
      },
      {
        title: 'Publicar tu Propio Servicio',
        description: 'Si tienes un oficio o habilidad, presiona "+ Publicar servicio" para ofrecerlo a tus vecinos en solo 3 clics.',
        highlightText: 'Banner: ¿Ofreces un servicio local? (+ Publicar)',
        icon: PlusCircle,
      },
    ],
  },
  solidaridad: {
    id: 'solidaridad',
    label: 'Solidaridad',
    icon: HandHeart,
    headerTitle: 'Muro Solidario',
    headerSubtitle: 'Préstamos y apoyo mutuo entre vecinos',
    accentGradient: 'from-emerald-600 to-teal-700',
    steps: [
      {
        title: 'Resumen Solidario en el Portal',
        description: 'Conoce los favores resueltos en el mes y comprueba el impacto colaborativo en el Edificio Roble.',
        highlightText: 'Contador mensual de favores resueltos',
        icon: HandHeart,
      },
      {
        title: 'Pestañas de Ayuda Mutua',
        description: 'Alterna entre "Todos", "Necesito ayuda" (solicitudes de apoyo) y "Brindo Ayuda" (préstamos disponibles).',
        highlightText: 'Pestañas: Todos • Necesito ayuda • Brindo Ayuda',
        icon: CheckCircle2,
      },
      {
        title: 'Préstamo de Objetos y Herramientas',
        description: 'Pide prestada una escalera en conserjería, un taladro o apoya con el riego de plantas y acompañamiento a trámites.',
        highlightText: 'Botones: Pedir prestada • Ayudar a vecino',
        icon: Sprout,
      },
      {
        title: 'Pedir o Prestar en 1 Clic',
        description: 'Crea tu propia solicitud en el muro mediante el botón azul "+ Pedir o prestar en el portal (1 Clic)".',
        highlightText: 'Botón azul principal en la parte superior',
        icon: PlusCircle,
      },
    ],
  },
  perfil: {
    id: 'perfil',
    label: 'Perfil',
    icon: CheckCircle2,
    headerTitle: 'Mi Perfil Vecinal',
    headerSubtitle: 'Identidad, confianza y seguridad comunitaria',
    accentGradient: 'from-indigo-600 to-purple-700',
    steps: [
      {
        title: 'Identidad y Confianza Ganada',
        description: 'Acredita tu condición de vecino verificado con tu departamento y portal asignados sin necesidad de validación manual.',
        highlightText: 'Insignia: Confianza Ganada (Vistos Buenos)',
        icon: CheckCircle2,
      },
      {
        title: 'Métricas de Participación Comunitaria',
        description: 'Monitorea tus Vistos Buenos recibidos, favores en el Muro Solidario y tu porcentaje de asistencia a asambleas.',
        highlightText: 'Tarjetas numéricas de reputación vecinal',
        icon: ThumbsUp,
      },
      {
        title: 'Atención Prioritaria (Motor de Vulnerabilidad)',
        description: 'Activa el interruptor si en tu hogar residen adultos mayores o personas con movilidad reducida para priorizar rescates.',
        highlightText: 'Switch: Atención Prioritaria y Vulnerabilidad',
        icon: HeartPulse,
      },
      {
        title: 'Gestión de Publicaciones y Emergencias',
        description: 'Administra tus oficios publicados, solicitudes de solidaridad y contactos de emergencia personales.',
        highlightText: 'Menú inferior con enlaces de gestión',
        icon: Building2,
      },
    ],
  },
  sos: {
    id: 'sos',
    label: 'SOS Pánico',
    icon: ShieldAlert,
    headerTitle: 'Sistema de Pánico SOS',
    headerSubtitle: 'Centro de crisis y guardia activa 24/7',
    accentGradient: 'from-red-600 to-rose-700',
    steps: [
      {
        title: 'Botón de Pánico Flotante',
        description: 'Siempre visible en la esquina inferior derecha. Presiónalo ante cualquier emergencia crítica en el edificio.',
        highlightText: 'Botón rojo flotante con escudo SOS',
        icon: ShieldAlert,
      },
      {
        title: 'Despacho Inmediato Georreferenciado',
        description: 'La alerta notifica instantáneamente a la portería central con tu número de portal y departamento.',
        highlightText: 'Estado: ! ALERTA ENVIADA despachada a Monitoreo',
        icon: CheckCircle2,
      },
      {
        title: 'Llamadas Directas de Emergencia',
        description: 'Marcación a un solo toque para Portería Central, SAMU 106, Bomberos 116 y Policía Nacional 105.',
        highlightText: 'Lista de llamadas directas 24h',
        icon: Phone,
      },
      {
        title: 'Especialista en Guardia Activa',
        description: 'Contacto directo con Don Mario Ramos (plomero matriz con llaves maestras para corte inmediato de inundaciones).',
        highlightText: 'Llegada estimada en 5 minutos con llaves de paso',
        icon: Wrench,
      },
    ],
  },
};
