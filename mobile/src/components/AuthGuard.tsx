import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { AuthScreen } from '../screens/AuthScreen';
import { CURRENT_USER } from '../mock/data';
import type { UserProfile, CommunityStatusLevel } from '../types';

export const getCommunityStatusLevel = (favores: number): CommunityStatusLevel => {
  if (favores >= 20) return 'heroe_del_barrio';
  if (favores >= 10) return 'oro';
  if (favores >= 5) return 'plata';
  return 'bronce';
};

interface AuthContextType {
  currentUser: UserProfile;
  addFavorCompleted: () => void;
  logout: () => Promise<void>;
}

// Copia de respaldo de Carlos Mendoza para el Modo Demo
const DEMO_USER_BACKUP: UserProfile = { ...CURRENT_USER };

const AuthContext = createContext<AuthContextType>({
  currentUser: DEMO_USER_BACKUP,
  addFavorCompleted: () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthGuard = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USER_BACKUP);

  // Función que carga los datos reales del vecino desde Supabase y actualiza React + CURRENT_USER
  const syncUserProfile = async (user: User) => {
    const meta = user.user_metadata || {};

    // 1. Primero aplicamos los metadatos de inmediato para evitar cualquier parpadeo con datos de Carlos
    const immediateName = meta.nombre || user.email?.split('@')[0] || 'Vecino';
    const immediateProfile: UserProfile = {
      id: user.id,
      name: immediateName,
      role: meta.rol || 'Vecino Residente',
      urbanizacion: meta.urbanizacion || 'Urb. Las Palmeras',
      sector: meta.sector || 'Sector 2 • Mz. B',
      calle: meta.calle || 'Calle Los Sauces',
      numero: meta.numero || 'S/N',
      building: meta.urbanizacion || 'Urb. Las Palmeras',
      portal: meta.calle || 'Calle Los Sauces',
      apartment: meta.numero || 'S/N',
      phone: meta.telefono || '999 888 777',
      servicePin: meta.service_pin || '4826',
      vistosBuenos: typeof meta.vistos_buenos === 'number' ? meta.vistos_buenos : 0,
      favoresCount: typeof meta.favores_realizados === 'number' ? meta.favores_realizados : 1,
      verified: false,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(immediateName)}&background=1d4ed8&color=fff&bold=true&size=150`,
    };
    Object.assign(CURRENT_USER, immediateProfile);
    setCurrentUser(immediateProfile);

    // 2. Luego consultamos la tabla public.perfiles en Supabase por si tiene puntos/vistos buenos acumulados
    if (supabase) {
      const { data: dbProfile } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (dbProfile) {
        const nombre = dbProfile.nombre || immediateProfile.name;
        const vistos = typeof dbProfile.vistos_buenos === 'number' ? dbProfile.vistos_buenos : immediateProfile.vistosBuenos ?? 0;
        const favores = typeof dbProfile.favores_realizados === 'number' ? dbProfile.favores_realizados : immediateProfile.favoresCount ?? 1;
        const mergedProfile: UserProfile = {
          id: user.id,
          name: nombre,
          role: dbProfile.rol || immediateProfile.role,
          urbanizacion: dbProfile.urbanizacion || immediateProfile.urbanizacion,
          sector: dbProfile.sector || immediateProfile.sector,
          calle: dbProfile.calle || immediateProfile.calle,
          numero: dbProfile.numero || immediateProfile.numero,
          building: dbProfile.urbanizacion || immediateProfile.urbanizacion,
          portal: dbProfile.calle || immediateProfile.calle,
          apartment: dbProfile.numero || immediateProfile.numero,
          phone: dbProfile.telefono || immediateProfile.phone,
          servicePin: dbProfile.service_pin || immediateProfile.servicePin,
          vistosBuenos: vistos,
          favoresCount: favores,
          verified: Boolean(dbProfile.verificado) || vistos >= 5,
          avatarUrl:
            dbProfile.avatar_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=1d4ed8&color=fff&bold=true&size=150`,
        };
        Object.assign(CURRENT_USER, mergedProfile);
        setCurrentUser(mergedProfile);
      }
    }
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
    setCurrentUser({ ...DEMO_USER_BACKUP });
    setIsAuthenticated(true);
  };

  const handleRealLogin = async (loggedInUser?: User) => {
    if (loggedInUser) {
      await syncUserProfile(loggedInUser);
    } else if (supabase) {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await syncUserProfile(data.user);
      }
    }
    setIsAuthenticated(true);
  };

  const addFavorCompleted = () => {
    setCurrentUser((prev) => {
      const nextFavores = (prev.favoresCount ?? 1) + 1;
      const updated = { ...prev, favoresCount: nextFavores };
      Object.assign(CURRENT_USER, updated);
      if (supabase && prev.id !== 'usr-1') {
        supabase
          .from('perfiles')
          .update({ favores_realizados: nextFavores })
          .eq('id', prev.id)
          .then(() => {});
      }
      return updated;
    });
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    Object.assign(CURRENT_USER, DEMO_USER_BACKUP);
    setCurrentUser({ ...DEMO_USER_BACKUP });
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
    <AuthContext.Provider value={{ currentUser, addFavorCompleted, logout }} key={currentUser.id}>
      {children}
    </AuthContext.Provider>
  );
};