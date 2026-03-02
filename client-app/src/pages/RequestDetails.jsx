import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getRequest, cancelRequest, shareRequest, getTracking } from '../services/api';
import { TrackingMap } from '../components/MapComponents';

const STATUS_LABELS = {
  requested: 'Aguardando Entregador',
  accepted: 'Entregador a Caminho',
  canceled: 'Cancelada',
  expired: 'Expirada',
  fulfilled: 'Entregue',
};

const DELIVERY_STATUS_LABELS = {
  checkin_pending: 'Aguardando Check-in',
  in_progress: 'Em Trânsito',
  completed: 'Concluída',
  canceled: 'Cancelada',
};

export default function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [shareInfo, setShareInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRequest = async () => {
    try {
      const res = await getRequest(id);
      setRequest(res.data.request);
      
      // If there's a delivery share, set it
      if (res.data.request.delivery_share) {
        setShareInfo({
          share_url: `${window.location.origin}/track/${res.data.request.delivery_share.share_token}`,
          checkout_code: res.data.request.delivery_share.checkout_code,
        });
      }
    } catch (err) {
      setError('Erro ao carregar solicitação.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTracking = async () => {
    if (!request || !['accepted'].includes(request.status)) return;
    if (!request.entrega || request.entrega.status !== 'in_progress') return;
    
    try {
      const res = await getTracking(id);
      setTracking(res.data);
    } catch (err) {
      // Ignore tracking errors
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  useEffect(() => {
    if (request?.entrega?.status === 'in_progress') {
      const interval = setInterval(fetchTracking, 5000);
      fetchTracking();
      return () => clearInterval(interval);
    }
  }, [request]);

  const handleCancel = async () => {
    if (!window.confirm('Tem certeza que deseja cancelar esta solicitação?')) return;
    
    try {
      await cancelRequest(id);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao cancelar.');
    }
  };

  const handleShare = async () => {
    try {
      const res = await shareRequest(id);
      setShareInfo({
        share_url: res.data.share_url,
        checkout_code: res.data.checkout_code,
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao gerar link.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copiado!');
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  if (error || !request) {
    return (
      <div className="error-page">
        <p>{error || 'Solicitação não encontrada.'}</p>
        <Link to="/">Voltar</Link>
      </div>
    );
  }

  return (
    <div className="request-details-page">
      <header>
        <Link to="/" className="back-link">← Voltar</Link>
        <h1>Detalhes da Solicitação</h1>
      </header>

      <main>
        <section className="status-section">
          <div className="status-large">
            {STATUS_LABELS[request.status]}
          </div>
          {request.entrega && (
            <div className="delivery-status">
              Entrega: {DELIVERY_STATUS_LABELS[request.entrega.status]}
            </div>
          )}
        </section>

        <section className="code-section">
          <div className="code-box">
            <h3>Código de Check-in</h3>
            <p className="code-value">{request.checkin_code}</p>
            <small>Informe este código ao entregador na retirada</small>
          </div>

          {shareInfo && (
            <div className="code-box">
              <h3>Código de Checkout</h3>
              <p className="code-value">{shareInfo.checkout_code}</p>
              <small>O destinatário deve informar ao entregador</small>
            </div>
          )}
        </section>

        <section className="item-section">
          <h2>📦 Item</h2>
          <p><strong>Tipo:</strong> {request.item?.type}</p>
          {request.item?.weight_kg && <p><strong>Peso:</strong> {request.item.weight_kg} kg</p>}
          {request.item?.notes && <p><strong>Observações:</strong> {request.item.notes}</p>}
        </section>

        <section className="locations-section">
          <h2>📍 Mapa</h2>
          <TrackingMap
            pickupLocation={request.pickup_location ? { lat: parseFloat(request.pickup_location.latitude), lng: parseFloat(request.pickup_location.longitude) } : null}
            dropoffLocation={request.dropoff_location ? { lat: parseFloat(request.dropoff_location.latitude), lng: parseFloat(request.dropoff_location.longitude) } : null}
            delivererLocation={tracking ? { lat: parseFloat(tracking.latitude), lng: parseFloat(tracking.longitude) } : null}
            height="300px"
          />
        </section>

        {request.entrega && (
          <section className="deliverer-section">
            <h2>🛵 Entregador</h2>
            <p><strong>Nome:</strong> {request.entrega.entregador?.usuario?.name}</p>
            {request.entrega.entregador?.moto && (
              <>
                <p><strong>Moto:</strong> {request.entrega.entregador.moto.model}</p>
                <p><strong>Placa:</strong> {request.entrega.entregador.moto.plate}</p>
                <p><strong>Cor:</strong> {request.entrega.entregador.moto.color}</p>
              </>
            )}
          </section>
        )}

        {tracking && (
          <section className="tracking-section">
            <h2>📡 Localização do Entregador</h2>
            <div className="live-indicator">
              <span className="pulse"></span>
              Rastreamento ao vivo
            </div>
            <small>Atualizado: {new Date(tracking.updated_at).toLocaleTimeString('pt-BR')}</small>
          </section>
        )}

        {request.entrega?.status === 'in_progress' && !shareInfo && (
          <section className="share-section">
            <h2>🔗 Compartilhar</h2>
            <p>Gere um link para o destinatário acompanhar a entrega.</p>
            <button onClick={handleShare} className="btn-primary">
              Gerar Link de Rastreamento
            </button>
          </section>
        )}

        {shareInfo && (
          <section className="share-info">
            <h2>🔗 Link de Rastreamento</h2>
            <div className="share-url">
              <input type="text" value={shareInfo.share_url} readOnly />
              <button onClick={() => copyToClipboard(shareInfo.share_url)} className="btn-secondary">
                Copiar
              </button>
            </div>
          </section>
        )}

        {request.status === 'requested' && (
          <div className="actions">
            <button onClick={handleCancel} className="btn-danger">
              Cancelar Solicitação
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
