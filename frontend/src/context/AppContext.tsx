import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { NavigationTab } from '../types';
import type { TutorialModuleKey } from '../features/tutorial/data/tutorialSteps';

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
  isMobileFrame: boolean;
  toggleMobileFrame: () => void;
  hasConfirmedAttendance: boolean;
  toggleAttendance: () => void;
  attendeesCount: number;
  scopeFilter: 'portal' | 'edificio' | 'urbanizacion';
  setScopeFilter: (scope: 'portal' | 'edificio' | 'urbanizacion') => void;
  
  // Tutorial por Módulo
  isTutorialOpen: boolean;
  activeTutorialModule: TutorialModuleKey;
  openTutorial: (moduleKey?: TutorialModuleKey) => void;
  closeTutorial: () => void;
  selectTutorialModule: (moduleKey: TutorialModuleKey) => void;

  // Estados de Emergencia (Individual vs Crisis Real y Vulnerabilidad)
  isCrisisRealActive: boolean;
  setIsCrisisRealActive: (active: boolean) => void;
  toggleCrisisRealMode: () => void;
  userSafetyStatus: 'none' | 'safe' | 'needs_rescue';
  setUserSafetyStatus: (status: 'none' | 'safe' | 'needs_rescue') => void;
  isVulnerableHousehold: boolean;
  toggleVulnerableHousehold: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('inicio');
  const [isSosOpen, setIsSosOpen] = useState<boolean>(false);
  const [isSosAlertSent, setIsSosAlertSent] = useState<boolean>(true); // Activo tal como en la imagen
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(true);
  const [hasConfirmedAttendance, setHasConfirmedAttendance] = useState<boolean>(false);
  const [attendeesCount, setAttendeesCount] = useState<number>(32);
  const [scopeFilter, setScopeFilter] = useState<'portal' | 'edificio' | 'urbanizacion'>('urbanizacion');

  // Control del tutorial por módulo
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [activeTutorialModule, setActiveTutorialModule] = useState<TutorialModuleKey>('inicio');

  // Estados del sistema de Emergencia:
  // - isCrisisRealActive: conmuta entre Caso 1 (Individual) y Caso 2 (Crisis Real Multizona)
  const [isCrisisRealActive, setIsCrisisRealActive] = useState<boolean>(false);
  const [userSafetyStatus, setUserSafetyStatus] = useState<'none' | 'safe' | 'needs_rescue'>('none');
  // - isVulnerableHousehold: conectado al Perfil de Carlos (Adulto mayor en Dpto 4ºA)
  const [isVulnerableHousehold, setIsVulnerableHousehold] = useState<boolean>(true);

  // DISPARADOR: Cada vez que el usuario entra por primera vez a un módulo específico, se le muestra su tutorial
  useEffect(() => {
    const storageKey = `vecinos_tutorial_seen_${currentTab}`;
    const hasSeenModuleTutorial = localStorage.getItem(storageKey);

    if (!hasSeenModuleTutorial) {
      setActiveTutorialModule(currentTab);
      setIsTutorialOpen(true);
    }
  }, [currentTab]);

  // Si entra por primera vez al módulo SOS
  useEffect(() => {
    if (isSosOpen) {
      const storageKey = 'vecinos_tutorial_seen_sos';
      const hasSeenSos = localStorage.getItem(storageKey);
      if (!hasSeenSos) {
        setActiveTutorialModule('sos');
        setIsTutorialOpen(true);
      }
    }
  }, [isSosOpen]);

  // Abrir manual (ej. al pulsar '?')
  const openTutorial = (moduleKey?: TutorialModuleKey) => {
    const targetModule = moduleKey || (isSosOpen ? 'sos' : currentTab);
    setActiveTutorialModule(targetModule);
    setIsTutorialOpen(true);
  };

  // Cerrar tutorial y marcar como visto para este módulo
  const closeTutorial = () => {
    localStorage.setItem(`vecinos_tutorial_seen_${activeTutorialModule}`, 'true');
    setIsTutorialOpen(false);
  };

  const selectTutorialModule = (moduleKey: TutorialModuleKey) => {
    setActiveTutorialModule(moduleKey);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  const openSos = () => setIsSosOpen(true);
  const closeSos = () => setIsSosOpen(false);

  const toggleSosAlert = () => {
    setIsSosAlertSent((prev) => {
      const next = !prev;
      showToast(next ? '¡Alerta de Pánico Despachada a Central!' : 'Alerta SOS desactivada');
      return next;
    });
  };

  const toggleCrisisRealMode = () => {
    setIsCrisisRealActive((prev) => {
      const next = !prev;
      setUserSafetyStatus('none');
      showToast(
        next
          ? '🚨 Modo Crisis Comunitaria Activado (Múltiples Bloques)'
          : 'Modo Emergencia Individual Restaurado'
      );
      return next;
    });
  };

  const toggleVulnerableHousehold = () => {
    setIsVulnerableHousehold((prev) => {
      const next = !prev;
      showToast(
        next
          ? 'Hogar marcado como de Atención Prioritaria para conserjería'
          : 'Hogar configurado en condición estándar'
      );
      return next;
    });
  };

  const toggleAttendance = () => {
    setHasConfirmedAttendance((prev) => {
      const next = !prev;
      setAttendeesCount((c) => (next ? c + 1 : c - 1));
      showToast(next ? '¡Asistencia confirmada para la asamblea!' : 'Asistencia cancelada');
      return next;
    });
  };

  const toggleMobileFrame = () => setIsMobileFrame((prev) => !prev);

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
        isMobileFrame,
        toggleMobileFrame,
        hasConfirmedAttendance,
        toggleAttendance,
        attendeesCount,
        scopeFilter,
        setScopeFilter,
        isTutorialOpen,
        activeTutorialModule,
        openTutorial,
        closeTutorial,
        selectTutorialModule,
        isCrisisRealActive,
        setIsCrisisRealActive,
        toggleCrisisRealMode,
        userSafetyStatus,
        setUserSafetyStatus,
        isVulnerableHousehold,
        toggleVulnerableHousehold,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
};
