import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_QUEUE_KEY = '@sos_offline_queue_web';

export type OfflineReport = Record<string, unknown> & {
  id: string;
  timestamp: number;
};

type QueueListener = (reports: OfflineReport[]) => void;
const queueListeners = new Set<QueueListener>();

const notifyListeners = (reports: OfflineReport[]) => {
  queueListeners.forEach((listener) => listener(reports));
};

export const useOfflineSync = () => {
  const [offlineQueue, setOfflineQueue] = useState<OfflineReport[]>([]);
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  const loadQueue = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      if (stored) {
        const parsed: OfflineReport[] = JSON.parse(stored);
        setOfflineQueue(parsed);
        notifyListeners(parsed);
      }
    } catch (e) {
      console.warn('Error leyendo cola web:', e);
    }
  }, []);

  useEffect(() => {
    loadQueue();
    queueListeners.add(setOfflineQueue);
    return () => {
      queueListeners.delete(setOfflineQueue);
    };
  }, [loadQueue]);

  const saveToOfflineQueue = async (report: Record<string, unknown>): Promise<boolean> => {
    try {
      const timestamp = typeof report.timestamp === 'number' ? report.timestamp : Date.now();
      const id = typeof report.id === 'string' ? report.id : `report-${timestamp}`;
      const newReport: OfflineReport = { ...report, id, timestamp };

      const existing = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      const parsed: OfflineReport[] = existing ? JSON.parse(existing) : [];
      const updated = [newReport, ...parsed.filter((r) => r.id !== id)];

      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updated));
      setOfflineQueue(updated);
      notifyListeners(updated);
      return true;
    } catch (e) {
      console.warn('Error guardando en cola web:', e);
      return false;
    }
  };

  const removeFromOfflineQueue = async (id: string): Promise<boolean> => {
    try {
      const existing = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      if (!existing) return true;
      const parsed: OfflineReport[] = JSON.parse(existing);
      const updated = parsed.filter((r) => r.id !== id);
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updated));
      setOfflineQueue(updated);
      notifyListeners(updated);
      return true;
    } catch (e) {
      return false;
    }
  };

  const clearOfflineQueue = async (): Promise<boolean> => {
    try {
      await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
      setOfflineQueue([]);
      notifyListeners([]);
      return true;
    } catch (e) {
      return false;
    }
  };

  return {
    isOnline,
    offlineQueue,
    saveToOfflineQueue,
    removeFromOfflineQueue,
    clearOfflineQueue,
    loadQueue,
  };
};
