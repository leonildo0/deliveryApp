import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getTrackingByToken } from '../services/api';
import { TrackingMap } from '../components/MapComponents';

const STATUS_LABELS = {
  requested: 'Aguardando Entregador',
  accepted: 'Entregador a Caminho',
  canceled: 'Cancelada',
  expired: 'Expirada',
  fulfilled: 'Entregue',
};

const DELIVERY_STATUS_LABELS = {
  checkin_pending: 'Aguardando Retirada',
  in_progress: 'Em Trânsito',
  completed: 'Entrega Concluída',
  canceled: 'Entrega Cancelada',
};

const STATUS_ICONS = {
  requested: '⏳',
  accepted: '🛵',
  canceled: '❌',
  expired: '⏰',
  fulfilled: '✅',
};

export default function Tracking() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchTracking = async () => {
    try {
      const res = await getTrackingByToken(token);
      setData(res.data);
      setLastUpdate(new Date());
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Link inválido ou expirado.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
    
    // Poll every 5 seconds if delivery is in progress
    const interval = setInterval(() => {
      if (data?.delivery_status === 'in_progress') {
        fetchTracking();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [token, data?.delivery_status]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Carregando rastreamento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <div className="error-icon">❌</div>
        <h1>Ops!</h1>
        <p>{error}</p>
      </div>
    );
  }

  const isCompleted = data.delivery_status === 'completed' || data.request_status === 'fulfilled';
  const isInProgress = data.delivery_status === 'in_progress';

  return (
    <div className="tracking-page">
      <header>
        <h1>🛵 Rastreamento de Entrega</h1>
      </header>

      <main>
        <section className="status-card">
          <div className="status-icon">
            {STATUS_ICONS[data.request_status]}
          </div>
          <div className="status-text">
            <h2>{STATUS_LABELS[data.request_status]}</h2>
            {data.delivery_status && (
              <p className="delivery-status">
                {DELIVERY_STATUS_LABELS[data.delivery_status]}
              </p>
            )}
          </div>
        </section>

        {isCompleted && (
          <section className="completed-card">
            <div className="completed-icon">🎉</div>
            <h2>Entrega Concluída!</h2>
            {data.checkout_at && (
              <p>Concluída em: {new Date(data.checkout_at).toLocaleString('pt-BR')}</p>
            )}
          </section>
        )}

        <section className="item-card">
          <h3>📦 Item</h3>
          <p className="item-type">{data.item?.type}</p>
          {data.item?.notes && <p className="item-notes">{data.item.notes}</p>}
        </section>

        {isInProgress && data.deliverer_location && (
          <section className="location-card live">
            <h3>📍 Localização do Entregador</h3>
            <div className="live-indicator">
              <span className="pulse"></span>
              Ao vivo
            </div>
            <TrackingMap
              pickupLocation={data.pickup_location ? { lat: parseFloat(data.pickup_location.latitude), lng: parseFloat(data.pickup_location.longitude) } : null}
              dropoffLocation={data.dropoff_location ? { lat: parseFloat(data.dropoff_location.latitude), lng: parseFloat(data.dropoff_location.longitude) } : null}
              delivererLocation={data.deliverer_location ? { lat: parseFloat(data.deliverer_location.latitude), lng: parseFloat(data.deliverer_location.longitude) } : null}
              height="300px"
            />
            {data.deliverer_location.updated_at && (
              <p className="update-time">
                Atualizado: {new Date(data.deliverer_location.updated_at).toLocaleTimeString('pt-BR')}
              </p>
            )}
          </section>
        )}

        {!isInProgress && (data.pickup_location || data.dropoff_location) && (
          <section className="location-card">
            <h3>🗺️ Mapa</h3>
            <TrackingMap
              pickupLocation={data.pickup_location ? { lat: parseFloat(data.pickup_location.latitude), lng: parseFloat(data.pickup_location.longitude) } : null}
              dropoffLocation={data.dropoff_location ? { lat: parseFloat(data.dropoff_location.latitude), lng: parseFloat(data.dropoff_location.longitude) } : null}
              delivererLocation={null}
              height="250px"
            />
          </section>
        )}

        <section className="locations-card">
          <div className="location-item">
            <div className="location-icon pickup">📦</div>
            <div className="location-info">
              <h4>Local de Retirada</h4>
              <p>Lat: {data.pickup_location?.latitude}</p>
              <p>Lng: {data.pickup_location?.longitude}</p>
            </div>
          </div>
          <div className="location-divider">
            <div className="divider-line"></div>
            <div className="divider-arrow">↓</div>
            <div className="divider-line"></div>
          </div>
          <div className="location-item">
            <div className="location-icon dropoff">🏠</div>
            <div className="location-info">
              <h4>Local de Entrega</h4>
              <p>Lat: {data.dropoff_location?.latitude}</p>
              <p>Lng: {data.dropoff_location?.longitude}</p>
            </div>
          </div>
        </section>

        {data.checkout_code && !isCompleted && (
          <section className="code-card">
            <h3>🔐 Código de Checkout</h3>
            <p className="code-description">
              Informe este código ao entregador para confirmar o recebimento
            </p>
            <div className="code-display">
              {data.checkout_code}
            </div>
          </section>
        )}

        {data.checkin_at && (
          <section className="timeline-card">
            <h3>📋 Histórico</h3>
            <div className="timeline">
              <div className="timeline-item done">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <strong>Retirada realizada</strong>
                  <span>{new Date(data.checkin_at).toLocaleString('pt-BR')}</span>
                </div>
              </div>
              {data.checkout_at && (
                <div className="timeline-item done">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <strong>Entrega concluída</strong>
                    <span>{new Date(data.checkout_at).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {lastUpdate && (
          <p className="last-update">
            Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
          </p>
        )}
      </main>

      <footer>
        <p>Powered by DeliveryApp 🛵</p>
      </footer>
    </div>
  );
}
