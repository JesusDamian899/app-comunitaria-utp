import { useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabaseClient';
import { AuthScreen } from './AuthScreen';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return sessionStorage.getItem('vecinos_demo_mode') === 'true';
  });
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return;
    }

    // 1. Verificar sesión actual al cargar
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });

    // 2. Escuchar cambios de login / logout en tiempo real
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleEnableDemo = () => {
    sessionStorage.setItem('vecinos_demo_mode', 'true');
    setIsDemoMode(true);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-xs font-bold text-slate-500">
        Verificando sesión vecinal...
      </div>
    );
  }

  // Si no ha iniciado sesión en Supabase ni está en modo Demo, muestra el Login
  if (!session && !isDemoMode) {
    return <AuthScreen onDemoLogin={handleEnableDemo} />;
  }

  // Si ya inició sesión o entró en Modo Demo, renderiza la app normal
  return <>{children}</>;
};