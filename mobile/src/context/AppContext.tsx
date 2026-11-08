import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { NavigationTab } from '../types';
import { getSQLiteKeyValue, setSQLiteKeyValue } from '../lib/sqliteDatabase';

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
  // /Fase4: La alerta comienza apagada y cambia solo al guardar o cancelar un reporte.
  const [isSosAlertSent, setIsSosAlertSent] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasConfirmedAttendance, setHasConfirmedAttendance] = useState<boolean>(false);
  const [attendeesCount, setAttendeesCount] = useState<number>(32);

  const [isCrisisRealActive, setIsCrisisRealActive] = useState<boolean>(false);
  const [userSafetyStatus, setUserSafetyStatus] = useState<'none' | 'safe' | 'needs_rescue'>('none');

  // Carga inicial de persistencia SQLite (comunidad.db)
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
        console.warn('Error cargando estados desde SQLite:', e);
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

  // /Fase4: Estado compartido entre el botón SOS, el modal y el tablero de crisis (persistido en SQLite)
  const toggleSosAlert = () => {
    setIsSosAlertSent((prev) => {
      const next = !prev;
      setSQLiteKeyValue('sos_alerta_enviada', next);
      return next;
    });
  };

  // /Fase4: Cambiar de modo cierra la central y reinicia el estado personal de seguridad (persistido en SQLite)
  const toggleCrisisRealMode = () => {
    setIsCrisisRealActive((prev) => {
      const next = !prev;
      setSQLiteKeyValue('crisis_real_activa', next);
      return next;
    });
    setUserSafetyStatus('none');
    setSQLiteKeyValue('user_safety_status', 'none');
    setIsSosOpen(false);
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
