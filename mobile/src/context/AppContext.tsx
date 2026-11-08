import React, { createContext, useContext, useState, ReactNode } from 'react';
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
  hasConfirmedAttendance: boolean;
  toggleAttendance: () => void;
  attendeesCount: number;

  // Estados de Emergencia (Individual vs Crisis Real Multizona)
  isCrisisRealActive: boolean;
  setIsCrisisRealActive: (active: boolean) => void;
  toggleCrisisRealMode: () => void;
  userSafetyStatus: 'none' | 'safe' | 'needs_rescue';
  setUserSafetyStatus: (status: 'none' | 'safe' | 'needs_rescue') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('inicio');
  const [isSosOpen, setIsSosOpen] = useState<boolean>(false);
  const [isSosAlertSent, setIsSosAlertSent] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasConfirmedAttendance, setHasConfirmedAttendance] = useState<boolean>(false);
  const [attendeesCount, setAttendeesCount] = useState<number>(32);

  const [isCrisisRealActive, setIsCrisisRealActive] = useState<boolean>(false);
  const [userSafetyStatus, setUserSafetyStatus] = useState<'none' | 'safe' | 'needs_rescue'>('none');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
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

  const toggleAttendance = () => {
    setHasConfirmedAttendance((prev) => {
      const next = !prev;
      setAttendeesCount((c) => (next ? c + 1 : c - 1));
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
        setIsCrisisRealActive,
        toggleCrisisRealMode,
        userSafetyStatus,
        setUserSafetyStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
