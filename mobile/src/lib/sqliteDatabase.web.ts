import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ServiceProvider, SolidaridadFavor, ServiceReview } from '../types';

const STORAGE_PREFIX = '@comunidad_sqlite_web:';

// ==========================================
// REGISTROS ELIMINADOS (SOFT/HARD DELETE)
// ==========================================

export const markRecordDeletedInSQLite = async (id: string): Promise<void> => {
  try {
    const raw = await AsyncStorage.getItem(`${STORAGE_PREFIX}deleted_records`);
    const set: string[] = raw ? JSON.parse(raw) : [];
    if (!set.includes(id)) {
      set.push(id);
      await AsyncStorage.setItem(`${STORAGE_PREFIX}deleted_records`, JSON.stringify(set));
    }
  } catch (error) {
    console.error('Error marcando registro eliminado en Web:', error);
  }
};

export const getDeletedRecordIdsFromSQLite = async (): Promise<Set<string>> => {
  try {
    const raw = await AsyncStorage.getItem(`${STORAGE_PREFIX}deleted_records`);
    const list: string[] = raw ? JSON.parse(raw) : [];
    return new Set(list);
  } catch (error) {
    console.error('Error leyendo registros eliminados en Web:', error);
    return new Set();
  }
};

// ==========================================
// 1. GESTIÓN DE SERVICIOS EN WEB (CRUD)
// ==========================================

export const saveLocalServiceToSQLite = async (service: ServiceProvider): Promise<boolean> => {
  try {
    const raw = await AsyncStorage.getItem(`${STORAGE_PREFIX}servicios`);
    const list: ServiceProvider[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((s) => s.id !== service.id);
    await AsyncStorage.setItem(`${STORAGE_PREFIX}servicios`, JSON.stringify([service, ...filtered]));
    return true;
  } catch (error) {
    console.error('Error guardando servicio en Web:', error);
    return false;
  }
};

export const getLocalServicesFromSQLite = async (): Promise<ServiceProvider[]> => {
  try {
    const raw = await AsyncStorage.getItem(`${STORAGE_PREFIX}servicios`);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error leyendo servicios en Web:', error);
    return [];
  }
};

export const updateLocalServiceDetailsInSQLite = async (service: ServiceProvider): Promise<boolean> => {
  try {
    const list = await getLocalServicesFromSQLite();
    const idx = list.findIndex((s) => s.id === service.id);
    if (idx >= 0) {
      list[idx] = service;
    } else {
      list.unshift(service);
    }
    await AsyncStorage.setItem(`${STORAGE_PREFIX}servicios`, JSON.stringify(list));
    return true;
  } catch (error) {
    console.error('Error actualizando servicio en Web:', error);
    return false;
  }
};

export const deleteServiceFromSQLite = async (serviceId: string): Promise<boolean> => {
  try {
    const list = await getLocalServicesFromSQLite();
    const filtered = list.filter((s) => s.id !== serviceId);
    await AsyncStorage.setItem(`${STORAGE_PREFIX}servicios`, JSON.stringify(filtered));
    await markRecordDeletedInSQLite(serviceId);
    return true;
  } catch (error) {
    console.error('Error eliminando servicio en Web:', error);
    return false;
  }
};

export const updateServiceInSQLite = async (
  serviceId: string,
  newRecommendations: number,
  newReview?: ServiceReview
): Promise<void> => {
  try {
    const list = await getLocalServicesFromSQLite();
    const item = list.find((s) => s.id === serviceId);
    if (!item) return;
    item.recommendationsCount = newRecommendations;
    if (newReview) {
      item.reviews = [newReview, ...(item.reviews || [])];
    }
    await AsyncStorage.setItem(`${STORAGE_PREFIX}servicios`, JSON.stringify(list));
  } catch (error) {
    console.error('Error actualizando servicio en Web:', error);
  }
};

// ==========================================
// 2. GESTIÓN DE FAVORES EN WEB (CRUD)
// ==========================================

export const saveLocalFavorToSQLite = async (favor: SolidaridadFavor): Promise<boolean> => {
  try {
    const raw = await AsyncStorage.getItem(`${STORAGE_PREFIX}favores`);
    const list: SolidaridadFavor[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((f) => f.id !== favor.id);
    await AsyncStorage.setItem(`${STORAGE_PREFIX}favores`, JSON.stringify([favor, ...filtered]));
    return true;
  } catch (error) {
    console.error('Error guardando favor en Web:', error);
    return false;
  }
};

export const getLocalFavoresFromSQLite = async (): Promise<SolidaridadFavor[]> => {
  try {
    const raw = await AsyncStorage.getItem(`${STORAGE_PREFIX}favores`);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error leyendo favores en Web:', error);
    return [];
  }
};

export const updateLocalFavorDetailsInSQLite = async (favor: SolidaridadFavor): Promise<boolean> => {
  try {
    const list = await getLocalFavoresFromSQLite();
    const idx = list.findIndex((f) => f.id === favor.id);
    if (idx >= 0) {
      list[idx] = favor;
    } else {
      list.unshift(favor);
    }
    await AsyncStorage.setItem(`${STORAGE_PREFIX}favores`, JSON.stringify(list));
    return true;
  } catch (error) {
    console.error('Error actualizando favor en Web:', error);
    return false;
  }
};

export const deleteFavorFromSQLite = async (favorId: string): Promise<boolean> => {
  try {
    const list = await getLocalFavoresFromSQLite();
    const filtered = list.filter((f) => f.id !== favorId);
    await AsyncStorage.setItem(`${STORAGE_PREFIX}favores`, JSON.stringify(filtered));
    await markRecordDeletedInSQLite(favorId);
    return true;
  } catch (error) {
    console.error('Error eliminando favor en Web:', error);
    return false;
  }
};

export const updateFavorStatusInSQLite = async (
  favorId: string,
  newStatus: 'disponible' | 'ayuda_solicitada' | 'recibido'
): Promise<void> => {
  try {
    const list = await getLocalFavoresFromSQLite();
    const item = list.find((f) => f.id === favorId);
    if (!item) return;
    item.estado = newStatus;
    await AsyncStorage.setItem(`${STORAGE_PREFIX}favores`, JSON.stringify(list));
  } catch (error) {
    console.error('Error actualizando favor en Web:', error);
  }
};

// ==========================================
// 3. GESTIÓN DE ESTADOS CLAVE-VALOR EN WEB
// ==========================================

export const setSQLiteKeyValue = async (key: string, value: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(`${STORAGE_PREFIX}kv_${key}`, JSON.stringify(value));
  } catch (error) {
    console.error(`Error guardando ${key} en Web:`, error);
  }
};

export const getSQLiteKeyValue = async <T>(key: string, defaultValue: T): Promise<T> => {
  try {
    const val = await AsyncStorage.getItem(`${STORAGE_PREFIX}kv_${key}`);
    return val !== null ? JSON.parse(val) : defaultValue;
  } catch (error) {
    console.error(`Error leyendo ${key} en Web:`, error);
    return defaultValue;
  }
};
