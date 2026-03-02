import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createRequest } from '../services/api';
import { Stepper } from '../components/ui/Stepper';
import RouteMap from '../components/RouteMap';
import AddressInput from '../components/AddressInput';
import { useGeolocation } from '../hooks/useGeolocation';
import { useReverseGeocode } from '../hooks/useReverseGeocode';

const STEPS = [
  { label: 'Detalhes do Item' },
  { label: 'Definir Rota' },
];

export default function NewRequest() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1 - Item form
  const [itemForm, setItemForm] = useState({
    type: '',
    weight_kg: '',
    height_cm: '',
    width_cm: '',
    length_cm: '',
    notes: '',
  });

  // Step 2 - Route data
  const [origin, setOrigin] = useState(null); // { lat, lng, label, source }
  const [destination, setDestination] = useState(null); // { lat, lng, label }
  const [activeInput, setActiveInput] = useState(null); // 'origin' | 'destination'

  // Hooks
  const { 
    position: geoPosition, 
    loading: geoLoading, 
    error: geoError, 
    permissionState,
    requestLocation 
  } = useGeolocation();

  const { 
    getAddress: getOriginAddress, 
    address: originAddress, 
    loading: originAddressLoading 
  } = useReverseGeocode();

  const { 
    getAddress: getDestinationAddress, 
    address: destinationAddress, 
    loading: destinationAddressLoading 
  } = useReverseGeocode();

  // Auto-request geolocation when entering Step 2
  useEffect(() => {
    if (step === 2 && !origin && permissionState !== 'denied') {
      requestLocation().catch(() => {
        // Silent fail - user can set manually
      });
    }
  }, [step, origin, permissionState, requestLocation]);

  // Update origin when geolocation succeeds
  useEffect(() => {
    if (geoPosition && !origin) {
      setOrigin({
        lat: geoPosition.lat,
        lng: geoPosition.lng,
        source: 'geolocation',
      });
      getOriginAddress(geoPosition.lat, geoPosition.lng);
    }
  }, [geoPosition, origin, getOriginAddress]);

  // Update origin label when address resolves
  useEffect(() => {
    if (originAddress && origin) {
      setOrigin(prev => ({ ...prev, label: originAddress }));
    }
  }, [originAddress]);

  // Update destination label when address resolves
  useEffect(() => {
    if (destinationAddress && destination) {
      setDestination(prev => ({ ...prev, label: destinationAddress }));
    }
  }, [destinationAddress]);

  // Handle origin change (from map click or drag)
  const handleOriginChange = useCallback((coords) => {
    setOrigin({
      lat: coords.lat,
      lng: coords.lng,
      source: 'manual',
    });
    getOriginAddress(coords.lat, coords.lng);
  }, [getOriginAddress]);

  // Handle destination change (from map click or drag)
  const handleDestinationChange = useCallback((coords) => {
    setDestination({
      lat: coords.lat,
      lng: coords.lng,
    });
    getDestinationAddress(coords.lat, coords.lng);
  }, [getDestinationAddress]);

  // Handle origin selection from autocomplete
  const handleOriginSelect = useCallback((lat, lng, label) => {
    setOrigin({ lat, lng, label, source: 'autocomplete' });
    setActiveInput('destination'); // Move to destination after origin is set
  }, []);

  // Handle destination selection from autocomplete
  const handleDestinationSelect = useCallback((lat, lng, label) => {
    setDestination({ lat, lng, label });
  }, []);

  // Handle text change in origin input
  const handleOriginTextChange = useCallback((text) => {
    // If user is typing, clear coordinates until they select
    if (origin?.source === 'autocomplete' || origin?.source === 'geolocation') {
      // Keep existing coords while typing
    }
  }, [origin?.source]);

  // Handle text change in destination input  
  const handleDestinationTextChange = useCallback(() => {
    // Just track that user is typing
  }, []);

  // Item form handlers
  const handleItemChange = (e) => {
    setItemForm({ ...itemForm, [e.target.name]: e.target.value });
  };

  // Step validation
  const isStep1Valid = itemForm.type.trim().length > 0;
  const isStep2Valid = origin && destination;

  // Navigation
  const handleNext = () => {
    if (step === 1 && isStep1Valid) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  // Submit request
  const handleSubmit = async () => {
    if (!isStep2Valid) return;

    setError('');
    setLoading(true);

    try {
      const data = {
        item: {
          type: itemForm.type,
          weight_kg: itemForm.weight_kg ? parseFloat(itemForm.weight_kg) : null,
          height_cm: itemForm.height_cm ? parseFloat(itemForm.height_cm) : null,
          width_cm: itemForm.width_cm ? parseFloat(itemForm.width_cm) : null,
          length_cm: itemForm.length_cm ? parseFloat(itemForm.length_cm) : null,
          notes: itemForm.notes || null,
        },
        pickup_location: {
          latitude: origin.lat,
          longitude: origin.lng,
        },
        dropoff_location: {
          latitude: destination.lat,
          longitude: destination.lng,
        },
      };

      await createRequest(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar solicitação.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate distance between points (Haversine)
  const calculateDistance = () => {
    if (!origin || !destination) return null;
    
    const R = 6371; // Earth's radius in km
    const dLat = (destination.lat - origin.lat) * Math.PI / 180;
    const dLon = (destination.lng - origin.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  return (
    <div className="new-request-page">
      <header>
        <Link to="/" className="back-link">← Voltar</Link>
        <h1>Nova Solicitação</h1>
      </header>

      <main>
        <Stepper currentStep={step} steps={STEPS} />

        {error && <div className="error">{error}</div>}

        {/* Step 1: Item Details */}
        {step === 1 && (
          <section>
            <h2>📦 Detalhes do Item</h2>
            
            <div className="form-group">
              <label>Tipo de item *</label>
              <input
                type="text"
                name="type"
                value={itemForm.type}
                onChange={handleItemChange}
                placeholder="Ex: Documento, Comida, Pacote..."
                required
                autoFocus
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Peso (kg)</label>
                <input
                  type="number"
                  name="weight_kg"
                  value={itemForm.weight_kg}
                  onChange={handleItemChange}
                  placeholder="0.5"
                  step="0.1"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Altura (cm)</label>
                <input
                  type="number"
                  name="height_cm"
                  value={itemForm.height_cm}
                  onChange={handleItemChange}
                  placeholder="30"
                  min="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Largura (cm)</label>
                <input
                  type="number"
                  name="width_cm"
                  value={itemForm.width_cm}
                  onChange={handleItemChange}
                  placeholder="20"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Comprimento (cm)</label>
                <input
                  type="number"
                  name="length_cm"
                  value={itemForm.length_cm}
                  onChange={handleItemChange}
                  placeholder="10"
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Observações</label>
              <textarea
                name="notes"
                value={itemForm.notes}
                onChange={handleItemChange}
                placeholder="Ex: Frágil, manter na vertical..."
                rows={3}
              />
            </div>

            <div className="step-navigation">
              <button 
                type="button" 
                onClick={handleNext}
                disabled={!isStep1Valid}
                className="btn-next"
              >
                Próximo →
              </button>
            </div>
          </section>
        )}

        {/* Step 2: Route Definition */}
        {step === 2 && (
          <section className="route-step">
            <h2>📍 Definir Rota</h2>

            <div className="location-inputs">
              {/* Origin Input */}
              <AddressInput
                value={origin?.label || (origin ? `${origin.lat.toFixed(5)}, ${origin.lng.toFixed(5)}` : '')}
                onChange={handleOriginTextChange}
                onSelect={handleOriginSelect}
                placeholder={geoLoading ? 'Obtendo localização...' : 'Digite o endereço de retirada...'}
                dotColor="#22c55e"
                label="De (Retirada)"
                loading={geoLoading || originAddressLoading}
                className={activeInput === 'origin' ? 'active' : ''}
              />
              {geoError && (
                <div className="geo-status error">
                  ⚠️ {geoError}
                </div>
              )}

              {/* Destination Input */}
              <AddressInput
                value={destination?.label || (destination ? `${destination.lat.toFixed(5)}, ${destination.lng.toFixed(5)}` : '')}
                onChange={handleDestinationTextChange}
                onSelect={handleDestinationSelect}
                placeholder="Digite o endereço de entrega..."
                dotColor="#ef4444"
                label="Para (Entrega)"
                loading={destinationAddressLoading}
                className={activeInput === 'destination' ? 'active' : ''}
              />
            </div>

            <p className="map-hint">
              💡 Você também pode clicar no mapa para definir os locais
            </p>

            {/* Map */}
            <RouteMap
              origin={origin}
              destination={destination}
              activeInput={activeInput}
              onOriginChange={handleOriginChange}
              onDestinationChange={handleDestinationChange}
              height="350px"
            />

            {/* Route Summary */}
            {origin && destination && (
              <div className="route-summary">
                <div className="route-summary-item">
                  <span>Distância estimada</span>
                  <strong>{calculateDistance()} km</strong>
                </div>
              </div>
            )}

            <div className="step-navigation">
              <button 
                type="button" 
                onClick={handleBack}
                className="btn-back"
              >
                ← Voltar
              </button>
              <button 
                type="button" 
                onClick={handleSubmit}
                disabled={!isStep2Valid || loading}
                className="btn-primary"
              >
                {loading ? 'Criando...' : 'Criar Solicitação'}
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
