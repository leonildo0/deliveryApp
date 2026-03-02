import { useState, useRef, useCallback } from 'react';

/**
 * Hook for address autocomplete using Nominatim search API
 * @param {Object} options - Configuration options
 * @param {number} options.debounceMs - Debounce delay in ms (default: 300)
 * @param {number} options.minChars - Minimum characters to trigger search (default: 3)
 * @param {number} options.limit - Max results to return (default: 5)
 * @returns {Object} - { suggestions, loading, error, search, clear }
 */
export function useAddressAutocomplete({ 
  debounceMs = 300, 
  minChars = 3, 
  limit = 5 
} = {}) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  const search = useCallback((query) => {
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Clear previous request
    if (abortRef.current) {
      abortRef.current.abort();
    }

    // Don't search if query too short
    if (!query || query.trim().length < minChars) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    debounceRef.current = setTimeout(async () => {
      try {
        abortRef.current = new AbortController();
        
        const params = new URLSearchParams({
          q: query.trim(),
          format: 'json',
          addressdetails: '1',
          countrycodes: 'br',
          limit: String(limit),
        });

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?${params}`,
          {
            signal: abortRef.current.signal,
            headers: {
              'Accept': 'application/json',
              // Nominatim requires User-Agent
              'User-Agent': 'DeliveryApp/1.0',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Erro ao buscar endereços');
        }

        const data = await response.json();
        
        // Transform to simpler format
        const results = data.map((item) => ({
          id: item.place_id,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          displayName: item.display_name,
          // Shorter label for input display
          label: formatAddress(item),
          type: item.type,
          addressDetails: item.address,
        }));

        setSuggestions(results);
        setLoading(false);
      } catch (err) {
        if (err.name === 'AbortError') {
          // Request was cancelled, ignore
          return;
        }
        setError('Erro ao buscar endereços');
        setSuggestions([]);
        setLoading(false);
      }
    }, debounceMs);
  }, [debounceMs, minChars, limit]);

  const clear = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (abortRef.current) {
      abortRef.current.abort();
    }
    setSuggestions([]);
    setLoading(false);
    setError(null);
  }, []);

  return { suggestions, loading, error, search, clear };
}

/**
 * Format Nominatim address to a shorter, readable string
 */
function formatAddress(item) {
  const addr = item.address || {};
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
  if (addr.city || addr.town || addr.village || addr.municipality) {
    parts.push(addr.city || addr.town || addr.village || addr.municipality);
  }

  // State abbreviation
  const state = addr.state || addr['ISO3166-2-lvl4'];
  if (state) {
    const abbr = getStateAbbreviation(state);
    parts.push(abbr || state);
  }

  return parts.join(', ') || item.display_name;
}

/**
 * Map Brazilian state names to abbreviations
 */
function getStateAbbreviation(state) {
  const map = {
    'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM',
    'Bahia': 'BA', 'Ceará': 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES',
    'Goiás': 'GO', 'Maranhão': 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS',
    'Minas Gerais': 'MG', 'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR',
    'Pernambuco': 'PE', 'Piauí': 'PI', 'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN',
    'Rio Grande do Sul': 'RS', 'Rondônia': 'RO', 'Roraima': 'RR', 'Santa Catarina': 'SC',
    'São Paulo': 'SP', 'Sergipe': 'SE', 'Tocantins': 'TO',
  };
  return map[state] || null;
}

export default useAddressAutocomplete;
