import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { NavigationTab, ServiceProvider, SolidaridadFavor } from '../types';
import { getSQLiteKeyValue, setSQLiteKeyValue } from '../lib/sqliteDatabase';

export interface CustomAviso {
  id: string;
  authorName: string;
  authorRole: string;
  category: string;
  title: string;
  description: string;
  timeAgo: string;
  isOfficial?: boolean;
}

interface AppContextType {
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
  isSosOpen: boolean;
  openSos: () => void;
  closeSos: () => void;
  isSosAlertSent: boolean;
  toggleSosAlert: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  hasConfirmedAttendance: boolean;
  toggleAttendance: () => void;
  attendeesCount: number;

  // Estados de Emergencia (Individual vs Crisis Real Multizona)
  isCrisisRealActive: boolean;
  setIsCrisisRealActive: (active: boolean) => void;
  toggleCrisisRealMode: () => void;
  userSafetyStatus: 'none' | 'safe' | 'needs_rescue';
  setUserSafetyStatus: (status: 'none' | 'safe' | 'needs_rescue') => void;

  // Tutorial / Onboarding
  isTutorialOpen: boolean;
  openTutorial: () => void;
  closeTutorial: () => void;

  // Selector de Radios de Proximidad (500m Hiperlocal, 2km Zonal, 5km Comunitario)
  proximityRadius: 500 | 2000 | 5000;
  setProximityRadius: (radius: 500 | 2000 | 5000) => void;

  // Estado de Red (Simulación Online / Offline para Demostración al Jurado)
  isNetworkOnline: boolean;
  toggleNetworkOnline: () => void;

  // Avisos Vecinales Funcionales (Evitar placeholders "en preparación")
  isAvisoModalOpen: boolean;
  openAvisoModal: () => void;
  closeAvisoModal: () => void;
  customAvisos: CustomAviso[];
  addCustomAviso: (aviso: Omit<CustomAviso, 'id' | 'timeAgo'>) => void;

  // Servicios y Favores dinámicos en tiempo real para el Mapa
  customServices: ServiceProvider[];
  addCustomService: (service: ServiceProvider) => void;
  customFavores: SolidaridadFavor[];
  addCustomFavor: (favor: SolidaridadFavor) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('inicio');
  const [isSosOpen, setIsSosOpen] = useState<boolean>(false);
  const [isSosAlertSent, setIsSosAlertSent] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasConfirmedAttendance, setHasConfirmedAttendance] = useState<boolean>(false);
  const [attendeesCount, setAttendeesCount] = useState<number>(32);

  const [isCrisisRealActive, setIsCrisisRealActive] = useState<boolean>(false);
  const [userSafetyStatus, setUserSafetyStatus] = useState<'none' | 'safe' | 'needs_rescue'>('none');

  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [proximityRadius, setProximityRadius] = useState<500 | 2000 | 5000>(500);
  const [isNetworkOnline, setIsNetworkOnline] = useState<boolean>(true);

  const [isAvisoModalOpen, setIsAvisoModalOpen] = useState<boolean>(false);
  const [customAvisos, setCustomAvisos] = useState<CustomAviso[]>([]);

  // Servicios y Favores dinámicos en tiempo real para el Mapa
  const [customServices, setCustomServices] = useState<ServiceProvider[]>([]);
  const [customFavores, setCustomFavores] = useState<SolidaridadFavor[]>([]);

  const addCustomService = (service: ServiceProvider) => {
    setCustomServices((prev) => [service, ...prev]);
  };

  const addCustomFavor = (favor: SolidaridadFavor) => {
    setCustomFavores((prev) => [favor, ...prev]);
  };

  // Carga inicial de persistencia SQLite / AsyncStorage
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [savedAttendance, savedAttendees, savedCrisis, savedSafety, savedSos] = await Promise.all([
          getSQLiteKeyValue<boolean>('asamblea_asistencia_confirmada', false),
          getSQLiteKeyValue<number>('asamblea_asistentes_count', 32),
          getSQLiteKeyValue<boolean>('crisis_real_activa', false),
          getSQLiteKeyValue<'none' | 'safe' | 'needs_rescue'>('user_safety_status', 'none'),
          getSQLiteKeyValue<boolean>('sos_alerta_enviada', false),
        ]);
        if (isMounted) {
          setHasConfirmedAttendance(savedAttendance);
          setAttendeesCount(savedAttendees);
          setIsCrisisRealActive(savedCrisis);
          setUserSafetyStatus(savedSafety);
          setIsSosAlertSent(savedSos);
        }
      } catch (e) {
        console.warn('Error cargando estados clave-valor:', e);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const openSos = () => setIsSosOpen(true);
  const closeSos = () => setIsSosOpen(false);

  const openTutorial = () => setIsTutorialOpen(true);
  const closeTutorial = () => setIsTutorialOpen(false);

  const openAvisoModal = () => setIsAvisoModalOpen(true);
  const closeAvisoModal = () => setIsAvisoModalOpen(false);

  const toggleNetworkOnline = () => {
    setIsNetworkOnline((prev) => {
      const next = !prev;
      showToast(
        next
          ? '🟢 Modo En Línea: Conexión a Supabase restaurada'
          : '📡 Modo Offline Activado: Los reportes se guardan en SQLite local'
      );
      return next;
    });
  };

  const addCustomAviso = (aviso: Omit<CustomAviso, 'id' | 'timeAgo'>) => {
    const nuevo: CustomAviso = {
      ...aviso,
      id: `aviso-${Date.now()}`,
      timeAgo: 'Hace un momento',
    };
    setCustomAvisos((prev) => [nuevo, ...prev]);
    showToast('✓ Aviso vecinal publicado en la comunidad');
  };

  const toggleSosAlert = () => {
    setIsSosAlertSent((prev) => {
      const next = !prev;
      setSQLiteKeyValue('sos_alerta_enviada', next);
      showToast(next ? '¡Alerta de Pánico Despachada a Central!' : 'Alerta SOS desactivada');
      return next;
    });
  };

  const toggleCrisisRealMode = () => {
    setIsCrisisRealActive((prev) => {
      const next = !prev;
      setSQLiteKeyValue('crisis_real_activa', next);
      setUserSafetyStatus('none');
      setSQLiteKeyValue('user_safety_status', 'none');
      showToast(
        next
          ? '🚨 Modo Crisis Comunitaria Activado (Múltiples Bloques)'
          : 'Modo Emergencia Individual Restaurado'
      );
      return next;
    });
  };

  const handleSetIsCrisisRealActive = (active: boolean) => {
    setIsCrisisRealActive(active);
    setSQLiteKeyValue('crisis_real_activa', active);
  };

  const handleSetUserSafetyStatus = (status: 'none' | 'safe' | 'needs_rescue') => {
    setUserSafetyStatus(status);
    setSQLiteKeyValue('user_safety_status', status);
  };

  const toggleAttendance = () => {
    setHasConfirmedAttendance((prev) => {
      const next = !prev;
      setAttendeesCount((c) => {
        const nextCount = next ? c + 1 : c - 1;
        setSQLiteKeyValue('asamblea_asistentes_count', nextCount);
        return nextCount;
      });
      setSQLiteKeyValue('asamblea_asistencia_confirmada', next);
      showToast(next ? '¡Asistencia confirmada para la asamblea!' : 'Asistencia cancelada');
      return next;
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        isSosOpen,
        openSos,
        closeSos,
        isSosAlertSent,
        toggleSosAlert,
        toastMessage,
        showToast,
        hasConfirmedAttendance,
        toggleAttendance,
        attendeesCount,
        isCrisisRealActive,
        setIsCrisisRealActive: handleSetIsCrisisRealActive,
        toggleCrisisRealMode,
        userSafetyStatus,
        setUserSafetyStatus: handleSetUserSafetyStatus,
        isTutorialOpen,
        openTutorial,
        closeTutorial,
        proximityRadius,
        setProximityRadius,
        isNetworkOnline,
        toggleNetworkOnline,
        isAvisoModalOpen,
        openAvisoModal,
        closeAvisoModal,
        customAvisos,
        addCustomAviso,
        customServices,
        addCustomService,
        customFavores,
        addCustomFavor,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe usarse dentro de un AppProvider');
  }
  return context;
};
