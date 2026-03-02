import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline, useMap } from 'react-leaflet';
import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons
const createIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export const pickupIcon = createIcon('green');
export const dropoffIcon = createIcon('red');
export const delivererIcon = createIcon('orange');

// Auto-fit bounds component
export function AutoFitBounds({ positions, padding = [50, 50] }) {
  const map = useMap();
  
  useEffect(() => {
    if (positions && positions.length >= 2) {
      const validPositions = positions.filter(p => p && p.lat && p.lng);
      if (validPositions.length >= 2) {
        const bounds = L.latLngBounds(validPositions.map(p => [p.lat, p.lng]));
        map.fitBounds(bounds, { padding });
      }
    } else if (positions && positions.length === 1 && positions[0]) {
      map.setView([positions[0].lat, positions[0].lng], 15);
    }
  }, [positions, map, padding]);
  
  return null;
}

// Click handler component
function ClickHandler({ onClick }) {
  useMapEvents({
    click: (e) => {
      if (onClick) {
        onClick(e.latlng);
      }
    },
  });
  return null;
}

// Draggable marker component
function DraggableMarker({ position, onDragEnd, icon, popupText }) {
  const markerRef = useRef(null);
  
  const eventHandlers = useMemo(() => ({
    dragend() {
      const marker = markerRef.current;
      if (marker) {
        onDragEnd(marker.getLatLng());
      }
    },
  }), [onDragEnd]);

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={icon}
    >
      {popupText && <Popup>{popupText}</Popup>}
    </Marker>
  );
}

// Location picker map for creating requests
export function LocationPicker({ 
  value, 
  onChange, 
  type = 'pickup', // 'pickup' or 'dropoff'
  height = '300px' 
}) {
  const [position, setPosition] = useState(value || null);
  const icon = type === 'pickup' ? pickupIcon : dropoffIcon;
  const label = type === 'pickup' ? 'Local de Retirada' : 'Local de Entrega';

  const handleClick = useCallback((latlng) => {
    const newPos = { lat: latlng.lat, lng: latlng.lng };
    setPosition(newPos);
    onChange?.(newPos);
  }, [onChange]);

  const handleDragEnd = useCallback((latlng) => {
    const newPos = { lat: latlng.lat, lng: latlng.lng };
    setPosition(newPos);
    onChange?.(newPos);
  }, [onChange]);

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setPosition(newPos);
          onChange?.(newPos);
        },
        () => {
          alert('Não foi possível obter sua localização. Clique no mapa para selecionar.');
        }
      );
    }
  };

  useEffect(() => {
    if (value && (value.lat !== position?.lat || value.lng !== position?.lng)) {
      setPosition(value);
    }
  }, [value, position?.lat, position?.lng]);

  return (
    <div className="location-picker">
      <div className="location-picker-header">
        <button type="button" onClick={handleUseMyLocation} className="btn-location">
          📍 Usar minha localização
        </button>
        {position && (
          <span className="coords">
            {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
          </span>
        )}
      </div>
      <MapContainer
        center={position || { lat: -23.5505, lng: -46.6333 }} // São Paulo default
        zoom={13}
        style={{ height, width: '100%', borderRadius: '8px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onClick={handleClick} />
        {position && (
          <DraggableMarker
            position={position}
            onDragEnd={handleDragEnd}
            icon={icon}
            popupText={label}
          />
        )}
      </MapContainer>
      <p className="location-hint">Clique no mapa ou arraste o marcador para selecionar</p>
    </div>
  );
}

// Tracking map for viewing delivery progress
export function TrackingMap({
  pickupLocation,
  dropoffLocation,
  delivererLocation,
  height = '400px',
  showRoute = true,
}) {
  const positions = [pickupLocation, dropoffLocation, delivererLocation].filter(Boolean);
  const center = delivererLocation || pickupLocation || { lat: -23.5505, lng: -46.6333 };

  const routePositions = showRoute && pickupLocation && dropoffLocation
    ? [[pickupLocation.lat, pickupLocation.lng], [dropoffLocation.lat, dropoffLocation.lng]]
    : null;

  return (
    <div className="tracking-map">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={14}
        style={{ height, width: '100%', borderRadius: '8px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {pickupLocation && (
          <Marker position={[pickupLocation.lat, pickupLocation.lng]} icon={pickupIcon}>
            <Popup>📍 Local de Retirada</Popup>
          </Marker>
        )}
        
        {dropoffLocation && (
          <Marker position={[dropoffLocation.lat, dropoffLocation.lng]} icon={dropoffIcon}>
            <Popup>🏠 Local de Entrega</Popup>
          </Marker>
        )}
        
        {delivererLocation && (
          <Marker position={[delivererLocation.lat, delivererLocation.lng]} icon={delivererIcon}>
            <Popup>🏍️ Entregador</Popup>
          </Marker>
        )}

        {routePositions && (
          <Polyline positions={routePositions} color="#6366f1" weight={3} dashArray="10, 10" />
        )}
        
        <AutoFitBounds positions={positions} />
      </MapContainer>
    </div>
  );
}

// Static map display (non-interactive)
export function StaticMap({
  location,
  type = 'pickup',
  height = '200px',
  showNavigation = false,
}) {
  const icon = type === 'pickup' ? pickupIcon : type === 'dropoff' ? dropoffIcon : delivererIcon;
  const label = type === 'pickup' ? 'Local de Retirada' : type === 'dropoff' ? 'Local de Entrega' : 'Entregador';

  const openNavigation = (app) => {
    const { lat, lng } = location;
    const url = app === 'google'
      ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
      : `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
    window.open(url, '_blank');
  };

  if (!location) return null;

  return (
    <div className="static-map">
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={15}
        style={{ height, width: '100%', borderRadius: '8px' }}
        scrollWheelZoom={false}
        dragging={false}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[location.lat, location.lng]} icon={icon}>
          <Popup>{label}</Popup>
        </Marker>
      </MapContainer>
      
      {showNavigation && (
        <div className="navigation-buttons">
          <button onClick={() => openNavigation('google')} className="btn-nav">
            🗺️ Google Maps
          </button>
          <button onClick={() => openNavigation('waze')} className="btn-nav">
            🚗 Waze
          </button>
        </div>
      )}
    </div>
  );
}

export default { LocationPicker, TrackingMap, StaticMap };
