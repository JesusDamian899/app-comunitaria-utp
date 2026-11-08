import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { AuthScreen } from '../screens/AuthScreen';
import { CURRENT_USER } from '../mock/data';

interface AuthContextType {
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Copia de respaldo de Carlos Mendoza para el Modo Demo
const DEMO_USER_BACKUP = { ...CURRENT_USER };

export const AuthGuard = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Función que carga los datos reales del vecino desde Supabase y los inyecta en la App
  const syncUserProfile = async (user: User) => {
    const meta = user.user_metadata || {};

    // Intentamos leer primero de la tabla public.perfiles en Supabase
    let dbProfile: any = null;
    if (supabase) {
      const { data } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      dbProfile = data;
    }

    const nombre = dbProfile?.nombre || meta.nombre || user.email?.split('@')[0] || 'Vecino';
  // /Fase4: Solo app_metadata, asignado por administración, concede el rol de Junta.
    const rol = user.app_metadata?.community_role === 'Junta Vecinal'
      ? 'Junta Vecinal'
      : 'Vecino Residente';
    const urbanizacion = dbProfile?.urbanizacion || meta.urbanizacion || 'Urb. Las Palmeras';
    const sector = dbProfile?.sector || meta.sector || 'Sector 2 • Mz. B';
    const calle = dbProfile?.calle || meta.calle || 'Calle Los Sauces';
    const numero = dbProfile?.numero || meta.numero || 'S/N';
    const telefono = dbProfile?.telefono || meta.telefono || '999 888 777';
    const servicePin = dbProfile?.service_pin || meta.service_pin || '4826';

    Object.assign(CURRENT_USER, {
      id: user.id,
      name: nombre,
      role: rol,
      urbanizacion,
      sector,
      calle,
      numero,
      building: urbanizacion,
      portal: calle,
      apartment: numero,
      phone: telefono,
      servicePin,
      verified: true,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=1d4ed8&color=fff&bold=true&size=150`,
    });
  };

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        await syncUserProfile(data.session.user);
        setIsAuthenticated(true);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await syncUserProfile(session.user);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleDemoLogin = () => {
    // Restauramos los datos originales de Carlos Mendoza
    Object.assign(CURRENT_USER, DEMO_USER_BACKUP);
    setIsAuthenticated(true);
  };

  const handleRealLogin = async () => {
    if (supabase) {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await syncUserProfile(data.user);
      }
    }
    setIsAuthenticated(true);
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    Object.assign(CURRENT_USER, DEMO_USER_BACKUP);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <AuthScreen
        onDemoLogin={handleDemoLogin}
        onAuthenticated={handleRealLogin}
      />
    );
  }

  return (
    <AuthContext.Provider value={{ logout }}>
      {children}
    </AuthContext.Provider>
  );
};