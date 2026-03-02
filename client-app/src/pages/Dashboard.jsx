import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getRequests, cancelRequest } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { logout } from '../services/api';

const STATUS_LABELS = {
  requested: 'Aguardando Entregador',
  accepted: 'Entregador a Caminho',
  canceled: 'Cancelada',
  expired: 'Expirada',
  fulfilled: 'Entregue',
};

const STATUS_COLORS = {
  requested: '#f59e0b',
  accepted: '#3b82f6',
  canceled: '#ef4444',
  expired: '#6b7280',
  fulfilled: '#10b981',
};

export default function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      const res = await getRequests();
      setRequests(res.data.requests);
    } catch (err) {
      setError('Erro ao carregar solicitações.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      // ignore
    }
    logoutUser();
    navigate('/login');
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Tem certeza que deseja cancelar esta solicitação?')) return;
    
    try {
      await cancelRequest(id);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao cancelar.');
    }
  };

  const activeRequest = requests.find((r) => ['requested', 'accepted'].includes(r.status));

  return (
    <div className="dashboard">
      <header>
        <h1>🛵 DeliveryApp</h1>
        <div className="user-info">
          <span>Olá, {user?.name}</span>
          <button onClick={handleLogout} className="btn-secondary">Sair</button>
        </div>
      </header>

      <main>
        {error && <div className="error">{error}</div>}

        <section className="active-section">
          <h2>Solicitação Ativa</h2>
          {loading ? (
            <p>Carregando...</p>
          ) : activeRequest ? (
            <div className="active-request">
              <div className="request-card">
                <div className="status-badge" style={{ backgroundColor: STATUS_COLORS[activeRequest.status] }}>
                  {STATUS_LABELS[activeRequest.status]}
                </div>
                <p><strong>Item:</strong> {activeRequest.item?.type}</p>
                {activeRequest.item?.notes && <p><strong>Obs:</strong> {activeRequest.item.notes}</p>}
                <p><strong>Código Check-in:</strong> <span className="code">{activeRequest.checkin_code}</span></p>
                
                <div className="request-actions">
                  <Link to={`/request/${activeRequest.idsolicitacao}`} className="btn-primary">
                    Ver Detalhes
                  </Link>
                  {activeRequest.status === 'requested' && (
                    <button onClick={() => handleCancel(activeRequest.idsolicitacao)} className="btn-danger">
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="no-active">
              <p>Você não tem solicitações ativas.</p>
              <Link to="/new-request" className="btn-primary">Nova Solicitação</Link>
            </div>
          )}
        </section>

        {!activeRequest && (
          <div className="new-request-cta">
            <Link to="/new-request" className="btn-primary btn-large">
              + Nova Solicitação de Entrega
            </Link>
          </div>
        )}

        <section className="history-section">
          <h2>Histórico</h2>
          {requests.filter((r) => !['requested', 'accepted'].includes(r.status)).length === 0 ? (
            <p>Nenhuma solicitação anterior.</p>
          ) : (
            <div className="request-list">
              {requests
                .filter((r) => !['requested', 'accepted'].includes(r.status))
                .map((req) => (
                  <div key={req.idsolicitacao} className="request-item">
                    <div>
                      <span className="item-type">{req.item?.type}</span>
                      <span className="item-date">
                        {new Date(req.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <span 
                      className="status-badge-small"
                      style={{ backgroundColor: STATUS_COLORS[req.status] }}
                    >
                      {STATUS_LABELS[req.status]}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
