import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function Users() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [page])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await api.getUsers(page)
      setUsers(response.data.data || response.data)
      setHasMore(response.data.next_page_url !== null)
    } catch (err) {
      setError('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case 'root': return <span className="badge badge-root">Admin</span>
      case 'cliente': return <span className="badge badge-cliente">Cliente</span>
      case 'entregador': return <span className="badge badge-entregador">Entregador</span>
      default: return <span className="badge">{role}</span>
    }
  }

  const getStatusBadge = (user) => {
    if (user.role === 'cliente' && user.cliente) {
      return user.cliente.status === 'active' 
        ? <span className="status-badge status-active">Ativo</span>
        : <span className="status-badge status-blocked">Bloqueado</span>
    }
    if (user.role === 'entregador' && user.entregador) {
      const status = user.entregador.status
      if (status === 'online') return <span className="status-badge status-online">Online</span>
      if (status === 'busy') return <span className="status-badge status-busy">Ocupado</span>
      return <span className="status-badge status-offline">Offline</span>
    }
    return null
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
        <Link to="/users" className="nav-link active">👥 Usuários</Link>
        <Link to="/deliveries" className="nav-link">📦 Entregas</Link>
        <Link to="/logs" className="nav-link">📋 Logs</Link>
      </nav>

      <main className="dashboard-main">
        <h2>👥 Usuários do Sistema</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Tipo</th>
                  <th>Status</th>
                  <th>Criado em</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.idusuario}>
                    <td>{u.idusuario}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{getRoleBadge(u.role)}</td>
                    <td>{getStatusBadge(u)}</td>
                    <td>{new Date(u.created_at).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
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

export default Users
