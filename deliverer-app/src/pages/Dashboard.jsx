import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  getProfile, 
  updateStatus, 
  updateLocation, 
  getAvailableRequests, 
  acceptRequest,
  getCurrentDelivery,
  logout 
} from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const STATUS_LABELS = {
  offline: 'Offline',
  online: 'Online',
  busy: 'Em Entrega',
};

const STATUS_COLORS = {
  offline: '#6b7280',
  online: '#10b981',
  busy: '#f59e0b',
};

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [currentDelivery, setCurrentDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const [profileRes, deliveryRes] = await Promise.all([
        getProfile(),
        getCurrentDelivery(),
      ]);
      setProfile(profileRes.data.profile);
      setCurrentDelivery(deliveryRes.data.delivery);

      // Only fetch available requests if online and no active delivery
      if (profileRes.data.profile.status === 'online' && !deliveryRes.data.delivery) {
        const requestsRes = await getAvailableRequests();
        setRequests(requestsRes.data.requests);
      }
    } catch (err) {
      setError('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Send location every 10 seconds when online or busy
  useEffect(() => {
    if (!profile || profile.status === 'offline') return;

    const sendLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            updateLocation(position.coords.latitude, position.coords.longitude)
              .catch(() => {}); // Ignore errors
          },
          () => {}, // Ignore errors
          { enableHighAccuracy: true }
        );
      }
    };

    sendLocation(); // Send immediately
    const interval = setInterval(sendLocation, 10000);
    return () => clearInterval(interval);
  }, [profile?.status]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {}
    logoutUser();
    navigate('/login');
  };

  const handleStatusToggle = async () => {
    if (profile.status === 'busy') return; // Can't change status while busy

    setStatusLoading(true);
    const newStatus = profile.status === 'offline' ? 'online' : 'offline';
    
    try {
      await updateStatus(newStatus);
      setProfile({ ...profile, status: newStatus });
      if (newStatus === 'online') {
        const requestsRes = await getAvailableRequests();
        setRequests(requestsRes.data.requests);
      } else {
        setRequests([]);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao alterar status.');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    if (!window.confirm('Aceitar esta entrega?')) return;

    try {
      const res = await acceptRequest(requestId);
      setCurrentDelivery(res.data.delivery);
      setProfile({ ...profile, status: 'busy' });
      setRequests([]);
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao aceitar.');
    }
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="dashboard">
      <header>
        <h1>🛵 Entregador</h1>
        <div className="user-info">
          <span>{user?.name}</span>
          <button onClick={handleLogout} className="btn-secondary btn-small">Sair</button>
        </div>
      </header>

      <main>
        {error && <div className="error">{error}</div>}

        {/* Status Section */}
        <section className="status-section">
          <div className="status-display">
            <div 
              className="status-indicator"
              style={{ backgroundColor: STATUS_COLORS[profile?.status] }}
            />
            <span className="status-label">{STATUS_LABELS[profile?.status]}</span>
          </div>
          
          {profile?.status !== 'busy' && (
            <button 
              onClick={handleStatusToggle} 
              disabled={statusLoading}
              className={`status-toggle ${profile?.status === 'online' ? 'online' : ''}`}
            >
              {statusLoading ? 'Aguarde...' : profile?.status === 'offline' ? 'Ficar Online' : 'Ficar Offline'}
            </button>
          )}
        </section>

        {/* Moto Warning */}
        {!profile?.moto && (
          <section className="warning-section">
            <p>⚠️ Você precisa cadastrar sua moto para aceitar entregas.</p>
            <Link to="/profile" className="btn-primary">Cadastrar Moto</Link>
          </section>
        )}

        {/* Moto Info */}
        {profile?.moto && (
          <section className="moto-section">
            <div className="moto-info">
              <span className="moto-plate">{profile.moto.plate}</span>
              <span className="moto-model">{profile.moto.model} - {profile.moto.color}</span>
            </div>
            <Link to="/profile" className="btn-secondary btn-small">Editar</Link>
          </section>
        )}

        {/* Current Delivery */}
        {currentDelivery && (
          <section className="current-delivery">
            <h2>📦 Entrega Ativa</h2>
            <div className="delivery-card">
              <div className="delivery-status">
                {currentDelivery.status === 'checkin_pending' ? 'Aguardando Check-in' : 'Em Trânsito'}
              </div>
              <p><strong>Item:</strong> {currentDelivery.solicitacao?.item?.type}</p>
              {currentDelivery.solicitacao?.item?.notes && (
                <p><strong>Obs:</strong> {currentDelivery.solicitacao.item.notes}</p>
              )}
              <Link to="/delivery" className="btn-primary">Ver Detalhes</Link>
            </div>
          </section>
        )}

        {/* Available Requests */}
        {profile?.status === 'online' && !currentDelivery && profile?.moto && (
          <section className="requests-section">
            <h2>📋 Solicitações Disponíveis</h2>
            {requests.length === 0 ? (
              <p className="no-requests">Nenhuma solicitação disponível no momento.</p>
            ) : (
              <div className="request-list">
                {requests.map((req) => (
                  <div key={req.idsolicitacao} className="request-card">
                    <div className="request-info">
                      <h3>{req.item?.type}</h3>
                      {req.item?.notes && <p className="notes">{req.item.notes}</p>}
                      <p className="location">
                        📍 Retirada: {parseFloat(req.pickup_location?.latitude).toFixed(4)}, {parseFloat(req.pickup_location?.longitude).toFixed(4)}
                      </p>
                      <p className="location">
                        🏠 Entrega: {parseFloat(req.dropoff_location?.latitude).toFixed(4)}, {parseFloat(req.dropoff_location?.longitude).toFixed(4)}
                      </p>
                      <p className="client">Cliente: {req.cliente?.usuario?.name}</p>
                    </div>
                    <button 
                      onClick={() => handleAccept(req.idsolicitacao)}
                      className="btn-primary"
                    >
                      Aceitar
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button onClick={fetchData} className="btn-secondary refresh-btn">
              🔄 Atualizar Lista
            </button>
          </section>
        )}

        {/* Offline Message */}
        {profile?.status === 'offline' && (
          <section className="offline-message">
            <p>Você está offline. Fique online para ver solicitações disponíveis.</p>
          </section>
        )}
      </main>
    </div>
  );
}
