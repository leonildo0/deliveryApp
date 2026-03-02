import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function Logs() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [canceledRequests, setCanceledRequests] = useState([])
  const [canceledDeliveries, setCanceledDeliveries] = useState([])
  const [statusHistory, setStatusHistory] = useState([])
  const [activeTab, setActiveTab] = useState('canceled')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    if (activeTab === 'canceled') {
      loadCanceled()
    } else {
      loadStatusHistory()
    }
  }, [page, activeTab])

  const loadCanceled = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.getLogs(page)
      setCanceledRequests(response.data.canceled_requests?.data || [])
      setCanceledDeliveries(response.data.canceled_deliveries?.data || [])
      setHasMore(
        response.data.canceled_requests?.next_page_url !== null ||
        response.data.canceled_deliveries?.next_page_url !== null
      )
    } catch (err) {
      setError('Erro ao carregar logs de cancelamento')
    } finally {
      setLoading(false)
    }
  }

  const loadStatusHistory = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.getStatusHistory(page)
      setStatusHistory(response.data.data || [])
      setHasMore(response.data.next_page_url !== null)
    } catch (err) {
      setError('Erro ao carregar histórico de status')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const switchTab = (tab) => {
    setActiveTab(tab)
    setPage(1)
    setError('')
  }

  const getEntityLabel = (type) => {
    switch (type) {
      case 'solicitacao': return 'Solicitação'
      case 'entrega': return 'Entrega'
      case 'cliente': return 'Cliente'
      case 'entregador': return 'Entregador'
      default: return type
    }
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>🛡️ Painel Administrativo</h1>
        <div className="user-info">
          <span>👤 {user?.name}</span>
          <button onClick={handleLogout} className="btn-logout">Sair</button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <Link to="/" className="nav-link">📊 Dashboard</Link>
        <Link to="/users" className="nav-link">👥 Usuários</Link>
        <Link to="/deliveries" className="nav-link">📦 Entregas</Link>
        <Link to="/logs" className="nav-link active">📋 Logs</Link>
      </nav>

      <main className="dashboard-main">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'canceled' ? 'active' : ''}`}
            onClick={() => switchTab('canceled')}
          >
            ❌ Cancelamentos
          </button>
          <button 
            className={`tab ${activeTab === 'status' ? 'active' : ''}`}
            onClick={() => switchTab('status')}
          >
            🔄 Histórico de Status
          </button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : activeTab === 'canceled' ? (
          <>
            <h3 style={{ marginBottom: '16px' }}>Solicitações Canceladas</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cancelado por</th>
                  <th>Status Anterior</th>
                  <th>Data/Hora</th>
                </tr>
              </thead>
              <tbody>
                {canceledRequests.map((log) => (
                  <tr key={log.idstatus_history}>
                    <td>#{log.entity_id}</td>
                    <td>{log.changed_by?.name || '-'}</td>
                    <td><span className={`status-badge status-${log.old_status}`}>{log.old_status || '-'}</span></td>
                    <td>{new Date(log.changed_at).toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
                {canceledRequests.length === 0 && (
                  <tr>
                    <td colSpan="4" className="no-data">Nenhuma solicitação cancelada</td>
                  </tr>
                )}
              </tbody>
            </table>

            <h3 style={{ margin: '24px 0 16px' }}>Entregas Canceladas</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cancelado por</th>
                  <th>Status Anterior</th>
                  <th>Data/Hora</th>
                </tr>
              </thead>
              <tbody>
                {canceledDeliveries.map((log) => (
                  <tr key={log.idstatus_history}>
                    <td>#{log.entity_id}</td>
                    <td>{log.changed_by?.name || '-'}</td>
                    <td><span className={`status-badge status-${log.old_status}`}>{log.old_status || '-'}</span></td>
                    <td>{new Date(log.changed_at).toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
                {canceledDeliveries.length === 0 && (
                  <tr>
                    <td colSpan="4" className="no-data">Nenhuma entrega cancelada</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="pagination">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary"
              >
                ← Anterior
              </button>
              <span>Página {page}</span>
              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={!hasMore}
                className="btn-secondary"
              >
                Próxima →
              </button>
            </div>
          </>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tipo</th>
                  <th>Entidade ID</th>
                  <th>Alterado por</th>
                  <th>Status Anterior</th>
                  <th>Novo Status</th>
                  <th>Data/Hora</th>
                </tr>
              </thead>
              <tbody>
                {statusHistory.map((h) => (
                  <tr key={h.idstatus_history}>
                    <td>{h.idstatus_history}</td>
                    <td>{getEntityLabel(h.entity_type)}</td>
                    <td>#{h.entity_id}</td>
                    <td>{h.changed_by?.name || '-'}</td>
                    <td><span className={`status-badge status-${h.old_status}`}>{h.old_status || '-'}</span></td>
                    <td><span className={`status-badge status-${h.new_status}`}>{h.new_status}</span></td>
                    <td>{new Date(h.changed_at).toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
                {statusHistory.length === 0 && (
                  <tr>
                    <td colSpan="7" className="no-data">Nenhum histórico encontrado</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="pagination">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary"
              >
                ← Anterior
              </button>
              <span>Página {page}</span>
              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={!hasMore}
                className="btn-secondary"
              >
                Próxima →
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default Logs
