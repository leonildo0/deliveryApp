import { useState, useCallback, useRef } from 'react';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

export function useReverseGeocode() {
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastRequestRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  const getAddress = useCallback(async (lat, lng) => {
    // Cancel pending requests
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce to respect Nominatim rate limits (1 req/sec)
    return new Promise((resolve, reject) => {
      debounceTimeoutRef.current = setTimeout(async () => {
        const requestId = `${lat}-${lng}`;
        lastRequestRef.current = requestId;

        setLoading(true);
        setError(null);

        try {
          const url = `${NOMINATIM_BASE_URL}/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
          
          const response = await fetch(url, {
            headers: {
              'Accept-Language': 'pt-BR,pt;q=0.9',
            },
          });

          if (!response.ok) {
            throw new Error('Falha ao obter endereço');
          }

          const data = await response.json();

          // Only update if this is still the latest request
          if (lastRequestRef.current === requestId) {
            const displayName = formatAddress(data);
            setAddress(displayName);
            setLoading(false);
            console.log('[ReverseGeocode] Address resolved:', displayName);
            resolve(displayName);
          }
        } catch (err) {
          if (lastRequestRef.current === requestId) {
            const errorMsg = err.message || 'Erro ao obter endereço';
            setError(errorMsg);
            setLoading(false);
            console.error('[ReverseGeocode] Error:', errorMsg);
            reject(new Error(errorMsg));
          }
        }
      }, 300); // 300ms debounce
    });
  }, []);

  const clearAddress = useCallback(() => {
    setAddress(null);
    setError(null);
  }, []);

  return {
    address,
    loading,
    error,
    getAddress,
    clearAddress,
  };
}

function formatAddress(data) {
  if (!data || data.error) {
    return null;
  }

  // Build a readable address from components
  const addr = data.address || {};
  const parts = [];

  // Street + number
  if (addr.road) {
    let street = addr.road;
    if (addr.house_number) {
      street += `, ${addr.house_number}`;
    }
    parts.push(street);
  }

  // Neighborhood
  if (addr.suburb || addr.neighbourhood) {
    parts.push(addr.suburb || addr.neighbourhood);
  }

  // City
  if (addr.city || addr.town || addr.village) {
    parts.push(addr.city || addr.town || addr.village);
  }

  // State abbreviation
  if (addr.state) {
    // Try to get state abbreviation for Brazil
    const stateAbbr = getBrazilianStateAbbr(addr.state);
    parts.push(stateAbbr || addr.state);
  }

  return parts.join(', ') || data.display_name || 'Endereço não identificado';
}

function getBrazilianStateAbbr(state) {
  const states = {
    'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM',
    'Bahia': 'BA', 'Ceará': 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES',
    'Goiás': 'GO', 'Maranhão': 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS',
    'Minas Gerais': 'MG', 'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR',
    'Pernambuco': 'PE', 'Piauí': 'PI', 'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN',
    'Rio Grande do Sul': 'RS', 'Rondônia': 'RO', 'Roraima': 'RR', 'Santa Catarina': 'SC',
    'São Paulo': 'SP', 'Sergipe': 'SE', 'Tocantins': 'TO',
  };
  return states[state] || null;
}

export default useReverseGeocode;
