import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import type { UserProfile } from '../types';
import { supabase } from '../lib/supabaseClient';
import { AuthScreen } from '../screens/AuthScreen';
import { CURRENT_USER } from '../mock/data';

export type CommunityStatusLevel = 'bronce' | 'plata' | 'oro' | 'heroe_del_barrio';

export const getCommunityStatusLevel = (favoresCount: number): CommunityStatusLevel => {
  if (favoresCount >= 20) return 'heroe_del_barrio';
  if (favoresCount >= 10) return 'oro';
  if (favoresCount >= 5) return 'plata';
  return 'bronce';
};

interface AuthContextType {
  currentUser: UserProfile;
  logout: () => Promise<void>;
  addFavorCompleted: () => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: CURRENT_USER,
  logout: async () => {},
  addFavorCompleted: () => {},
});

export const useAuth = () => useContext(AuthContext);

// Copia de respaldo de Carlos Mendoza para el Modo Demo
const DEMO_USER_BACKUP = { ...CURRENT_USER };

export const AuthGuard = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile>({ ...CURRENT_USER });

  // Función que carga los datos reales del vecino desde Supabase y los inyecta en la App
  const syncUserProfile = async (user: User) => {
    const meta = user.user_metadata || {};

    // Intentamos leer primero de la tabla public.perfiles en Supabase
    let dbProfile: any = null;
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        if (!error && data) {
          dbProfile = data;
        }
      } catch (err) {
        console.warn('Lectura de perfil en Supabase no disponible, usando metadatos locales:', err);
      }
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
    const vistosBuenos = dbProfile?.vistos_buenos ?? meta.vistosBuenos ?? CURRENT_USER.vistosBuenos ?? 0;
    const favoresCount = dbProfile?.favores_realizados ?? meta.favoresCount ?? CURRENT_USER.favoresCount ?? 0;

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
      vistosBuenos,
      favoresCount,
      verified: true,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=1d4ed8&color=fff&bold=true&size=150`,
    });
    setCurrentUser({ ...CURRENT_USER });
  };

  useEffect(() => {
    if (!supabase) return;

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (data?.session?.user) {
          await syncUserProfile(data.session.user);
          setIsAuthenticated(true);
        }
      })
      .catch((err) => {
        console.warn('Sesión no encontrada o Supabase fuera de línea:', err);
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
    setCurrentUser({ ...DEMO_USER_BACKUP });
    setIsAuthenticated(true);
  };

  const handleRealLogin = async () => {
    if (supabase) {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          await syncUserProfile(data.user);
        }
      } catch (err) {
        console.warn('Error recuperando usuario Supabase:', err);
      }
    }
    setIsAuthenticated(true);
  };

  const logout = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Error cerrando sesión Supabase:', err);
      }
    }
    Object.assign(CURRENT_USER, DEMO_USER_BACKUP);
    setCurrentUser({ ...DEMO_USER_BACKUP });
    setIsAuthenticated(false);
  };

  const addFavorCompleted = async () => {
    const nextFavoresCount = (CURRENT_USER.favoresCount ?? 0) + 1;
    Object.assign(CURRENT_USER, { favoresCount: nextFavoresCount });
    setCurrentUser({ ...CURRENT_USER });

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(CURRENT_USER.id);
    if (supabase && isUuid) {
      try {
        await supabase
          .from('perfiles')
          .update({ favores_realizados: nextFavoresCount })
          .eq('id', CURRENT_USER.id);
      } catch (err) {
        console.warn('Error actualizando favores en Supabase:', err);
      }
    }
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
    <AuthContext.Provider value={{ currentUser, logout, addFavorCompleted }}>
      {children}
    </AuthContext.Provider>
  );
};