import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import { supabase } from '../lib/supabaseClient';

// /Fase4: Persistencia local de SOS; AsyncStorage queda solo para migrar la cola antigua.
const OFFLINE_QUEUE_KEY = '@sos_offline_queue';
const DATABASE_NAME = 'comunidad.db';
const DATABASE_TABLE = 'offline_reports';

export type OfflineReport = Record<string, unknown> & {
  id: string;
  timestamp: number;
};

type QueueListener = (reports: OfflineReport[]) => void;

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;
const queueListeners = new Set<QueueListener>();

// /Fase4: Migra los reportes previos sin descartarlos al actualizar la app.
const migrateLegacyQueue = async (database: SQLite.SQLiteDatabase) => {
  try {
    const storedQueue = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!storedQueue) return;

    const legacyReports: unknown = JSON.parse(storedQueue);
    if (!Array.isArray(legacyReports)) return;

    await database.withTransactionAsync(async () => {
      for (const [index, legacyReport] of legacyReports.entries()) {
        if (!legacyReport || typeof legacyReport !== 'object') continue;

        const report = legacyReport as Record<string, unknown>;
        const timestamp = typeof report.timestamp === 'number' ? report.timestamp : Date.now();
        const id = typeof report.id === 'string'
          ? report.id
          : `legacy-${timestamp}-${index}`;
        const migratedReport = { ...report, id, timestamp };

        await database.runAsync(
          `INSERT OR IGNORE INTO ${DATABASE_TABLE} (id, payload, created_at)
           VALUES (?, ?, ?)`,
          id,
          JSON.stringify(migratedReport),
          timestamp
        );
      }
    });

    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
  } catch (error) {
    console.error('Error migrando la cola SOS a SQLite', error);
  }
};

const isBoardStatusReport = (report: Record<string, unknown>) =>
  report.source === 'crisis-board' ||
  (report.source == null &&
    (report.type === 'SAFE' || report.type === 'RESCUE') &&
    (report.status === 'safe' || report.status === 'needs_rescue'));

// /Fase4: Reduce el historial acumulado anterior a un único estado vigente por cuenta.
const compactCurrentSafetyStatuses = async (database: SQLite.SQLiteDatabase) => {
  const rows = await database.getAllAsync<{ id: string; payload: string }>(
    `SELECT id, payload FROM ${DATABASE_TABLE} ORDER BY created_at ASC, rowid ASC`
  );
  const latestIdByUser = new Map<string, string>();
  const duplicateIds: string[] = [];

  for (const row of rows) {
    let report: Record<string, unknown>;
    try {
      report = JSON.parse(row.payload) as Record<string, unknown>;
    } catch {
      continue;
    }

    if (!isBoardStatusReport(report)) continue;

    const userKey = typeof report.userId === 'string' ? report.userId : '__legacy__';
    const previousId = latestIdByUser.get(userKey);
    if (previousId) duplicateIds.push(previousId);
    latestIdByUser.set(userKey, row.id);
  }

  if (duplicateIds.length === 0) return;

  await database.withTransactionAsync(async () => {
    for (const reportId of duplicateIds) {
      await database.runAsync(`DELETE FROM ${DATABASE_TABLE} WHERE id = ?`, reportId);
    }
  });
};

const getDatabase = () => {
  if (!databasePromise) {
    databasePromise = (async () => {
      const database = await SQLite.openDatabaseAsync(DATABASE_NAME);
      await database.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS ${DATABASE_TABLE} (
          id TEXT PRIMARY KEY NOT NULL,
          payload TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          sync_status TEXT NOT NULL DEFAULT 'pending'
        );
      `);
      await migrateLegacyQueue(database);
      await compactCurrentSafetyStatuses(database);
      return database;
    })().catch((error) => {
      databasePromise = null;
      throw error;
    });
  }

  return databasePromise;
};

const readOfflineQueue = async () => {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{ payload: string }>(
    `SELECT payload FROM ${DATABASE_TABLE} ORDER BY created_at ASC`
  );
  return rows.map(({ payload }) => JSON.parse(payload) as OfflineReport);
};

const publishOfflineQueue = async () => {
  try {
    const reports = await readOfflineQueue();
    queueListeners.forEach((listener) => listener(reports));
  } catch (error) {
    console.error('Error actualizando la cola SOS', error);
  }
};

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState<OfflineReport[]>([]);

  useEffect(() => {
    let isMounted = true;
    const updateQueue: QueueListener = (reports) => {
      if (isMounted) setOfflineQueue(reports);
    };

    queueListeners.add(updateQueue);
    readOfflineQueue().then(updateQueue).catch((error) => {
      console.error('Error leyendo cola SOS desde SQLite', error);
    });

    return () => {
      isMounted = false;
      queueListeners.delete(updateQueue);
    };
  }, []);

  const saveToOfflineQueue = async (reportData: Record<string, unknown>) => {
    try {
      const database = await getDatabase();
      const timestamp = Date.now();
      const currentStatusUserId = reportData.source === 'crisis-board' && typeof reportData.userId === 'string'
        ? reportData.userId
        : null;
      const id = currentStatusUserId
        ? `crisis-status-${currentStatusUserId}`
        : typeof reportData.id === 'string'
        ? reportData.id
        : `report-${timestamp}-${Math.random().toString(36).slice(2, 8)}`;
      const report = { ...reportData, id, timestamp };
      let saved = false;

      await database.withTransactionAsync(async () => {
        if (currentStatusUserId) {
          const existingReports = await database.getAllAsync<{ id: string; payload: string }>(
            `SELECT id, payload FROM ${DATABASE_TABLE}`
          );

          for (const existing of existingReports) {
            let existingReport: Record<string, unknown>;
            try {
              existingReport = JSON.parse(existing.payload) as Record<string, unknown>;
            } catch {
              continue;
            }

            const belongsToAccount = existingReport.userId === currentStatusUserId || existingReport.userId == null;
            if (existing.id !== id && belongsToAccount && isBoardStatusReport(existingReport)) {
              await database.runAsync(`DELETE FROM ${DATABASE_TABLE} WHERE id = ?`, existing.id);
            }
          }
        }

        const result = await database.runAsync(
          `INSERT INTO ${DATABASE_TABLE} (id, payload, created_at)
           VALUES (?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             payload = excluded.payload,
             created_at = excluded.created_at,
             sync_status = 'pending'`,
          id,
          JSON.stringify(report),
          timestamp
        );
        saved = result.changes > 0;
      });

      await publishOfflineQueue();
      return saved;
    } catch (error) {
      console.error('Error guardando SOS en SQLite', error);
      return false;
    }
  };

  const removeFromOfflineQueue = async (reportId?: string | null): Promise<boolean> => {
    try {
      const database = await getDatabase();
      if (reportId) {
        await database.runAsync(
          `DELETE FROM ${DATABASE_TABLE} WHERE id = ?`,
          reportId
        );
      }
      await publishOfflineQueue();
      return true;
    } catch (error) {
      console.error('Error cancelando reporte offline', error);
      return false;
    }
  };

  const clearSosModalReports = async (userId?: string): Promise<boolean> => {
    try {
      const database = await getDatabase();
      const rows = await database.getAllAsync<{ id: string; payload: string }>(
        `SELECT id, payload FROM ${DATABASE_TABLE}`
      );
      for (const row of rows) {
        try {
          const report = JSON.parse(row.payload) as Record<string, unknown>;
          if (
            report.source === 'sos-modal' ||
            report.type === 'RESCUE' ||
            (userId && report.userId === userId)
          ) {
            await database.runAsync(`DELETE FROM ${DATABASE_TABLE} WHERE id = ?`, row.id);
          }
        } catch {
          continue;
        }
      }
      await publishOfflineQueue();
      return true;
    } catch (error) {
      console.error('Error limpiando reportes SOS en SQLite', error);
      return false;
    }
  };

  const syncOfflineData = useCallback(async () => {
    if (!isOnline || offlineQueue.length === 0 || !supabase) return;

    try {
      const database = await getDatabase();
      const rows = await database.getAllAsync<{ id: string; payload: string }>(
        `SELECT id, payload FROM ${DATABASE_TABLE}`
      );

      for (const row of rows) {
        let report: Record<string, unknown>;
        try {
          report = JSON.parse(row.payload);
        } catch {
          continue;
        }

        const coords = report.coordinates as { latitude: number; longitude: number } | undefined;
        const lat = coords?.latitude ?? -11.8675;
        const lon = coords?.longitude ?? -77.0754;
        const pointWkt = `SRID=4326;POINT(${lon} ${lat})`;

        const userIdStr = typeof report.userId === 'string' ? report.userId : '';
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdStr);

        const { error } = await supabase.from('alertas_emergencia').insert({
          vecino_id: isUuid ? userIdStr : null,
          tipo_emergencia: String(report.incident || report.type || 'ALERTA'),
          gravedad: String(report.status || 'alta'),
          ubicacion: pointWkt,
        });

        // Solo si Supabase confirmó el guardado con éxito lo retiramos de SQLite
        if (!error) {
          await database.runAsync(`DELETE FROM ${DATABASE_TABLE} WHERE id = ?`, row.id);
        } else {
          console.warn('Aviso sincronización SOS (mantenido en SQLite):', error.message);
        }
      }

      await publishOfflineQueue();
    } catch (err) {
      console.warn('Error en syncOfflineData (reportes preservados localmente):', err);
    }
  }, [isOnline, offlineQueue]);

  return {
    isOnline,
    setIsOnline,
    offlineQueue,
    saveToOfflineQueue,
    removeFromOfflineQueue,
    clearSosModalReports,
    syncOfflineData,
  };
};