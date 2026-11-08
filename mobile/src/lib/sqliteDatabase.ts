import * as SQLite from 'expo-sqlite';
import type { ServiceProvider, SolidaridadFavor, ServiceReview } from '../types';

export const DATABASE_NAME = 'comunidad.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export const getSQLiteDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        
        -- Tabla para reportes de emergencia offline (SOS y Crisis)
        CREATE TABLE IF NOT EXISTS offline_reports (
          id TEXT PRIMARY KEY NOT NULL,
          payload TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          sync_status TEXT NOT NULL DEFAULT 'pending'
        );

        -- Tabla SQLite para Servicios publicados por vecinos
        CREATE TABLE IF NOT EXISTS local_servicios (
          id TEXT PRIMARY KEY NOT NULL,
          payload TEXT NOT NULL,
          created_at INTEGER NOT NULL
        );

        -- Tabla SQLite para Favores y Muro Solidario
        CREATE TABLE IF NOT EXISTS local_favores (
          id TEXT PRIMARY KEY NOT NULL,
          payload TEXT NOT NULL,
          created_at INTEGER NOT NULL
        );

        -- Tabla SQLite para Estados Clave-Valor de la App (Asistencia, perfil, modo crisis)
        CREATE TABLE IF NOT EXISTS local_key_value (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );
      `);
      return db;
    })().catch((err) => {
      dbPromise = null;
      throw err;
    });
  }
  return dbPromise;
};

// ==========================================
// 1. GESTIÓN DE SERVICIOS EN SQLITE
// ==========================================

export const saveLocalServiceToSQLite = async (service: ServiceProvider): Promise<boolean> => {
  try {
    const db = await getSQLiteDatabase();
    await db.runAsync(
      `INSERT INTO local_servicios (id, payload, created_at)
       VALUES (?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, created_at = excluded.created_at`,
      service.id,
      JSON.stringify(service),
      Date.now()
    );
    return true;
  } catch (error) {
    console.error('Error guardando servicio en SQLite:', error);
    return false;
  }
};

export const getLocalServicesFromSQLite = async (): Promise<ServiceProvider[]> => {
  try {
    const db = await getSQLiteDatabase();
    const rows = await db.getAllAsync<{ payload: string }>(
      `SELECT payload FROM local_servicios ORDER BY created_at DESC`
    );
    return rows.map((r) => JSON.parse(r.payload) as ServiceProvider);
  } catch (error) {
    console.error('Error leyendo servicios desde SQLite:', error);
    return [];
  }
};

export const updateServiceInSQLite = async (
  serviceId: string,
  newRecommendations: number,
  newReview?: ServiceReview
): Promise<void> => {
  try {
    const db = await getSQLiteDatabase();
    const row = await db.getFirstAsync<{ payload: string }>(
      `SELECT payload FROM local_servicios WHERE id = ?`,
      serviceId
    );
    if (!row) return;

    const service = JSON.parse(row.payload) as ServiceProvider;
    service.recommendationsCount = newRecommendations;
    if (newReview) {
      service.reviews = [newReview, ...(service.reviews || [])];
    }

    await db.runAsync(
      `UPDATE local_servicios SET payload = ? WHERE id = ?`,
      JSON.stringify(service),
      serviceId
    );
  } catch (error) {
    console.error('Error actualizando servicio en SQLite:', error);
  }
};

// ==========================================
// 2. GESTIÓN DE FAVOR EN SOLIDARIDAD EN SQLITE
// ==========================================

export const saveLocalFavorToSQLite = async (favor: SolidaridadFavor): Promise<boolean> => {
  try {
    const db = await getSQLiteDatabase();
    await db.runAsync(
      `INSERT INTO local_favores (id, payload, created_at)
       VALUES (?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, created_at = excluded.created_at`,
      favor.id,
      JSON.stringify(favor),
      Date.now()
    );
    return true;
  } catch (error) {
    console.error('Error guardando favor en SQLite:', error);
    return false;
  }
};

export const updateFavorStatusInSQLite = async (
  favorId: string,
  newStatus: 'disponible' | 'ayuda_solicitada' | 'recibido'
): Promise<void> => {
  try {
    const db = await getSQLiteDatabase();
    const row = await db.getFirstAsync<{ payload: string }>(
      `SELECT payload FROM local_favores WHERE id = ?`,
      favorId
    );
    if (!row) return;

    const favor = JSON.parse(row.payload) as SolidaridadFavor;
    favor.estado = newStatus;

    await db.runAsync(
      `UPDATE local_favores SET payload = ? WHERE id = ?`,
      JSON.stringify(favor),
      favorId
    );
  } catch (error) {
    console.error('Error actualizando favor en SQLite:', error);
  }
};

export const getLocalFavoresFromSQLite = async (): Promise<SolidaridadFavor[]> => {
  try {
    const db = await getSQLiteDatabase();
    const rows = await db.getAllAsync<{ payload: string }>(
      `SELECT payload FROM local_favores ORDER BY created_at DESC`
    );
    return rows.map((r) => JSON.parse(r.payload) as SolidaridadFavor);
  } catch (error) {
    console.error('Error leyendo favores desde SQLite:', error);
    return [];
  }
};

// ==========================================
// 3. GESTIÓN DE ESTADOS CLAVE-VALOR EN SQLITE
// ==========================================

export const setSQLiteKeyValue = async (key: string, value: any): Promise<void> => {
  try {
    const db = await getSQLiteDatabase();
    await db.runAsync(
      `INSERT INTO local_key_value (key, value)
       VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      key,
      JSON.stringify(value)
    );
  } catch (error) {
    console.error(`Error guardando ${key} en SQLite:`, error);
  }
};

export const getSQLiteKeyValue = async <T>(key: string, defaultValue: T): Promise<T> => {
  try {
    const db = await getSQLiteDatabase();
    const row = await db.getFirstAsync<{ value: string }>(
      `SELECT value FROM local_key_value WHERE key = ?`,
      key
    );
    if (!row) return defaultValue;
    return JSON.parse(row.value) as T;
  } catch (error) {
    console.error(`Error leyendo ${key} desde SQLite:`, error);
    return defaultValue;
  }
};
