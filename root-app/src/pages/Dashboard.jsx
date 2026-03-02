import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await api.getStats()
      setStats(response.data)
    } catch (err) {
      setError('Erro ao carregar estatísticas')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (loading) {
    return <div className="loading">Carregando...</div>
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
        <Link to="/" className="nav-link active">📊 Dashboard</Link>
        <Link to="/users" className="nav-link">👥 Usuários</Link>
        <Link to="/deliveries" className="nav-link">📦 Entregas</Link>
        <Link to="/logs" className="nav-link">📋 Logs</Link>
      </nav>

      <main className="dashboard-main">
        {error && <div className="error-message">{error}</div>}

        <section className="stats-grid">
          <div className="stat-card">
            <h3>👥 Total de Usuários</h3>
            <p className="stat-value">{stats?.users?.total || 0}</p>
          </div>
          
          <div className="stat-card">
            <h3>👤 Clientes</h3>
            <p className="stat-value">{stats?.users?.clientes || 0}</p>
          </div>
          
          <div className="stat-card">
            <h3>🏍️ Entregadores</h3>
            <p className="stat-value">{stats?.users?.entregadores || 0}</p>
          </div>
          
          <div className="stat-card">
            <h3>📋 Solicitações</h3>
            <p className="stat-value">{stats?.requests?.total || 0}</p>
            <div className="stat-details">
              <span>Pendentes: {stats?.requests?.requested || 0}</span>
              <span>Aceitas: {stats?.requests?.accepted || 0}</span>
              <span>Concluídas: {stats?.requests?.fulfilled || 0}</span>
            </div>
          </div>
          
          <div className="stat-card">
            <h3>📦 Entregas</h3>
            <p className="stat-value">{stats?.deliveries?.total || 0}</p>
            <div className="stat-details">
              <span>Em andamento: {stats?.deliveries?.in_progress || 0}</span>
              <span>Concluídas: {stats?.deliveries?.completed || 0}</span>
            </div>
          </div>
          
          <div className="stat-card">
            <h3>📍 Localizações</h3>
            <p className="stat-value">{stats?.locations || 0}</p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Dashboard
