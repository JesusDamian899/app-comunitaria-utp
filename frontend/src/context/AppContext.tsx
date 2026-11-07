import { createContext, useContext, useState, type ReactNode } from 'react';
import type { NavigationTab } from '../types';

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
