import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function Deliveries() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    loadDeliveries()
  }, [page])

  const loadDeliveries = async () => {
    try {
      setLoading(true)
      const response = await api.getDeliveries(page)
      setDeliveries(response.data.data || response.data)
      setHasMore(response.data.next_page_url !== null)
    } catch (err) {
      setError('Erro ao carregar entregas')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'checkin_pending': return <span className="status-badge status-pending">Aguardando Check-in</span>
      case 'in_progress': return <span className="status-badge status-progress">Em Andamento</span>
      case 'completed': return <span className="status-badge status-completed">Concluída</span>
      case 'canceled': return <span className="status-badge status-canceled">Cancelada</span>
      default: return <span className="status-badge">{status}</span>
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
        <Link to="/deliveries" className="nav-link active">📦 Entregas</Link>
        <Link to="/logs" className="nav-link">📋 Logs</Link>
      </nav>

      <main className="dashboard-main">
        <h2>📦 Histórico de Entregas</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Entregador</th>
                  <th>Item</th>
                  <th>Status</th>
                  <th>Criada em</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((d) => (
                  <tr key={d.identrega}>
                    <td>{d.identrega}</td>
                    <td>{d.solicitacao?.cliente?.usuario?.name || '-'}</td>
                    <td>{d.entregador?.usuario?.name || '-'}</td>
                    <td>{d.solicitacao?.item?.type || '-'}</td>
                    <td>{getStatusBadge(d.status)}</td>
                    <td>{new Date(d.created_at).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
                {deliveries.length === 0 && (
                  <tr>
                    <td colSpan="6" className="no-data">Nenhuma entrega encontrada</td>
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

export default Deliveries
