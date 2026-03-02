import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from 'react-leaflet';
import { useRef, useMemo, useCallback } from 'react';
import { pickupIcon, dropoffIcon, AutoFitBounds } from './MapComponents';
import 'leaflet/dist/leaflet.css';

// Click handler for setting points
function ClickHandler({ onClick }) {
  useMapEvents({
    click: (e) => {
      if (onClick) {
        onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
}

// Draggable marker
function DraggableMarker({ position, onDragEnd, icon, popupText }) {
  const markerRef = useRef(null);
  
  const eventHandlers = useMemo(() => ({
    dragend() {
      const marker = markerRef.current;
      if (marker) {
        const latlng = marker.getLatLng();
        onDragEnd({ lat: latlng.lat, lng: latlng.lng });
      }
    },
  }), [onDragEnd]);

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={[position.lat, position.lng]}
      ref={markerRef}
      icon={icon}
    >
      {popupText && <Popup>{popupText}</Popup>}
    </Marker>
  );
}

export function RouteMap({
  origin,
  destination,
  activeInput, // 'origin' | 'destination' | null
  onOriginChange,
  onDestinationChange,
  height = '400px',
}) {
  // Default center (São Paulo)
  const defaultCenter = { lat: -23.5505, lng: -46.6333 };
  const center = origin || destination || defaultCenter;

  // Build positions array for auto-fit
  const positions = [origin, destination].filter(Boolean);

  // Route line positions
  const routePositions = origin && destination
    ? [[origin.lat, origin.lng], [destination.lat, destination.lng]]
    : null;

  // Handle map click
  const handleMapClick = useCallback((latlng) => {
    if (activeInput === 'origin') {
      onOriginChange?.(latlng);
    } else if (activeInput === 'destination') {
      onDestinationChange?.(latlng);
    } else if (!origin) {
      // If no origin set yet, set origin
      onOriginChange?.(latlng);
    } else if (!destination) {
      // If origin set but no destination, set destination
      onDestinationChange?.(latlng);
    }
  }, [activeInput, origin, destination, onOriginChange, onDestinationChange]);

  // Handle marker drag
  const handleOriginDrag = useCallback((latlng) => {
    onOriginChange?.(latlng);
  }, [onOriginChange]);

  const handleDestinationDrag = useCallback((latlng) => {
    onDestinationChange?.(latlng);
  }, [onDestinationChange]);

  return (
    <div className="route-map">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={14}
        style={{ height, width: '100%', borderRadius: '12px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <ClickHandler onClick={handleMapClick} />
        
        {/* Auto-fit bounds when both points exist */}
        <AutoFitBounds positions={positions} />
        
        {/* Origin marker (green) */}
        {origin && (
          <DraggableMarker
            position={origin}
            onDragEnd={handleOriginDrag}
            icon={pickupIcon}
            popupText="📍 De (Retirada)"
          />
        )}
        
        {/* Destination marker (red) */}
        {destination && (
          <DraggableMarker
            position={destination}
            onDragEnd={handleDestinationDrag}
            icon={dropoffIcon}
            popupText="🏠 Para (Entrega)"
          />
        )}
        
        {/* Route line */}
        {routePositions && (
          <Polyline 
            positions={routePositions} 
            color="#6366f1" 
            weight={4} 
            dashArray="10, 10"
            opacity={0.8}
          />
        )}
      </MapContainer>
      
      <p className="route-map-hint">
        {!origin && !destination && 'Clique no mapa para definir o ponto de retirada'}
        {origin && !destination && 'Clique no mapa para definir o ponto de entrega'}
        {origin && destination && 'Arraste os marcadores para ajustar as localizações'}
      </p>
    </div>
  );
}

export default RouteMap;
