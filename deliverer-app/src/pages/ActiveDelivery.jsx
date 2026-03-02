import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  getCurrentDelivery, 
  checkinDelivery, 
  completeDelivery, 
  cancelDelivery,
  updateLocation 
} from '../services/api';
import { StaticMap } from '../components/MapComponents';
import { CodeInput, Button } from '../components/ui';

const DELIVERY_STATUS = {
  checkin_pending: {
    label: 'Aguardando Check-in',
    color: '#f59e0b',
    icon: '📍',
  },
  in_progress: {
    label: 'Em Trânsito',
    color: '#3b82f6',
    icon: '🛵',
  },
};

export default function ActiveDelivery() {
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkinCode, setCheckinCode] = useState('');
  const [checkoutCode, setCheckoutCode] = useState('');

  const fetchDelivery = async () => {
    try {
      const res = await getCurrentDelivery();
      if (!res.data.delivery) {
        navigate('/');
        return;
      }
      setDelivery(res.data.delivery);
    } catch (err) {
      setError('Erro ao carregar entrega.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDelivery();
  }, []);

  // Send location every 10 seconds
  useEffect(() => {
    if (!delivery) return;

    const sendLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            updateLocation(position.coords.latitude, position.coords.longitude)
              .catch(() => {});
          },
          () => {},
          { enableHighAccuracy: true }
        );
      }
    };

    sendLocation();
    const interval = setInterval(sendLocation, 10000);
    return () => clearInterval(interval);
  }, [delivery]);

  const handleCheckin = async (e) => {
    e.preventDefault();
    if (!checkinCode.trim()) return;

    setActionLoading(true);
    setError('');

    try {
      await checkinDelivery(delivery.identrega, checkinCode);
      fetchDelivery();
    } catch (err) {
      setError(err.response?.data?.message || 'Código inválido.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    if (!checkoutCode.trim()) return;

    setActionLoading(true);
    setError('');

    try {
      await completeDelivery(delivery.identrega, checkoutCode);
      alert('Entrega concluída com sucesso! 🎉');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Código inválido.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Tem certeza que deseja cancelar esta entrega?')) return;

    setActionLoading(true);
    try {
      await cancelDelivery(delivery.identrega);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao cancelar.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  if (!delivery) {
    return (
      <div className="no-delivery">
        <p>Nenhuma entrega ativa.</p>
        <Link to="/">Voltar</Link>
      </div>
    );
  }

  const status = DELIVERY_STATUS[delivery.status];
  const solicitacao = delivery.solicitacao;

  return (
    <div className="delivery-page">
      <header>
        <Link to="/" className="back-link">← Dashboard</Link>
        <h1>Entrega Ativa</h1>
      </header>

      <main>
        {error && <div className="error">{error}</div>}

        {/* Status */}
        <section className="status-section">
          <div className="delivery-status-badge" style={{ backgroundColor: status.color }}>
            <span className="status-icon">{status.icon}</span>
            <span>{status.label}</span>
          </div>
        </section>

        {/* Item Info */}
        <section className="item-section">
          <h2>📦 Item</h2>
          <p className="item-type">{solicitacao?.item?.type}</p>
          {solicitacao?.item?.weight_kg && (
            <p>Peso: {solicitacao.item.weight_kg} kg</p>
          )}
          {solicitacao?.item?.notes && (
            <p className="notes">📝 {solicitacao.item.notes}</p>
          )}
        </section>

        {/* Locations */}
        <section className="locations-section">
          <div className={`location-card ${delivery.status === 'checkin_pending' ? 'active' : 'done'}`}>
            <h3>📍 Local de Retirada</h3>
            {solicitacao?.pickup_location && (
              <StaticMap
                location={{ lat: parseFloat(solicitacao.pickup_location.latitude), lng: parseFloat(solicitacao.pickup_location.longitude) }}
                type="pickup"
                height="180px"
                showNavigation={delivery.status === 'checkin_pending'}
              />
            )}
            {delivery.status === 'checkin_pending' && (
              <span className="location-badge">Próximo destino</span>
            )}
          </div>

          <div className="location-arrow">↓</div>

          <div className={`location-card ${delivery.status === 'in_progress' ? 'active' : ''}`}>
            <h3>🏠 Local de Entrega</h3>
            {solicitacao?.dropoff_location && (
              <StaticMap
                location={{ lat: parseFloat(solicitacao.dropoff_location.latitude), lng: parseFloat(solicitacao.dropoff_location.longitude) }}
                type="dropoff"
                height="180px"
                showNavigation={delivery.status === 'in_progress'}
              />
            )}
            {delivery.status === 'in_progress' && (
              <span className="location-badge">Próximo destino</span>
            )}
          </div>
        </section>

        {/* Client Info */}
        <section className="client-section">
          <h2>👤 Cliente</h2>
          <p>{solicitacao?.cliente?.usuario?.name}</p>
        </section>

        {/* Check-in Form */}
        {delivery.status === 'checkin_pending' && (
          <section className="action-section checkin">
            <h2>🔐 Check-in</h2>
            <p>Chegou no local de retirada? Peça o código ao cliente.</p>
            <form onSubmit={handleCheckin}>
              <CodeInput
                value={checkinCode}
                onChange={setCheckinCode}
                error={error}
                autoFocus
              />
              <Button 
                type="submit" 
                loading={actionLoading} 
                disabled={checkinCode.length !== 6}
                fullWidth
                variant="primary"
                size="large"
              >
                Confirmar Check-in
              </Button>
            </form>
          </section>
        )}

        {/* Checkout Form */}
        {delivery.status === 'in_progress' && (
          <section className="action-section checkout">
            <h2>✅ Finalizar Entrega</h2>
            <p>Chegou no destino? Peça o código de checkout ao destinatário.</p>
            <form onSubmit={handleComplete}>
              <CodeInput
                value={checkoutCode}
                onChange={setCheckoutCode}
                error={error}
                autoFocus
              />
              <Button 
                type="submit" 
                loading={actionLoading}
                disabled={checkoutCode.length !== 6}
                fullWidth
                variant="success"
                size="large"
              >
                Concluir Entrega
              </Button>
            </form>
          </section>
        )}

        {/* Cancel Button */}
        <section className="cancel-section">
          <button 
            onClick={handleCancel} 
            disabled={actionLoading}
            className="btn-danger"
          >
            Cancelar Entrega
          </button>
        </section>
      </main>
    </div>
  );
}
