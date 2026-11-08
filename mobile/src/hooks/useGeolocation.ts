import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';

export type UserLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  timestamp?: number;
};

export const useGeolocation = () => {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status !== 'granted') {
        const message = 'Se necesitan permisos de ubicación para enviar tu posición.';
        setError(message);
        return null;
      }

      const result = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const nextLocation: UserLocation = {
        latitude: result.coords.latitude,
        longitude: result.coords.longitude,
        accuracy: result.coords.accuracy,
        timestamp: result.timestamp,
      };

      setLocation(nextLocation);
      return nextLocation;
    } catch (e) {
      const message = 'No se pudo obtener la ubicación del dispositivo.';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const checkPermission = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (mounted) {
          setPermissionStatus(status);
        }
      } catch (e) {
        if (mounted) {
          setError('No se pudo verificar el permiso de ubicación.');
        }
      }
    };

    checkPermission();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    location,
    permissionStatus,
    isLoading,
    error,
    requestLocation,
    clearError: () => setError(null),
  };
};
