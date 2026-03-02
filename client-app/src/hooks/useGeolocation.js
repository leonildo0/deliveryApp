import { useState, useCallback, useEffect } from 'react';

export function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionState, setPermissionState] = useState('prompt');

  // Check permission state on mount
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' })
        .then((result) => {
          setPermissionState(result.state);
          result.addEventListener('change', () => {
            setPermissionState(result.state);
          });
        })
        .catch(() => {
          // Permissions API not supported
        });
    }
  }, []);

  const requestLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const err = 'Geolocalização não suportada pelo navegador';
        setError(err);
        reject(new Error(err));
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPosition = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };
          setPosition(newPosition);
          setLoading(false);
          setPermissionState('granted');
          console.log('[Geolocation] Position obtained:', newPosition);
          resolve(newPosition);
        },
        (err) => {
          let errorMsg;
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMsg = 'Permissão de localização negada';
              setPermissionState('denied');
              break;
            case err.POSITION_UNAVAILABLE:
              errorMsg = 'Localização indisponível';
              break;
            case err.TIMEOUT:
              errorMsg = 'Tempo esgotado ao obter localização';
              break;
            default:
              errorMsg = 'Erro ao obter localização';
          }
          setError(errorMsg);
          setLoading(false);
          console.error('[Geolocation] Error:', errorMsg);
          reject(new Error(errorMsg));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    position,
    loading,
    error,
    permissionState,
    requestLocation,
    clearError,
  };
}

export default useGeolocation;
