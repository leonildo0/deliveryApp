import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProfile, createMoto, updateMoto } from '../services/api';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    plate: '',
    model: '',
    color: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        setProfile(res.data.profile);
        if (res.data.profile.moto) {
          setForm({
            plate: res.data.profile.moto.plate || '',
            model: res.data.profile.moto.model || '',
            color: res.data.profile.moto.color || '',
          });
        }
      } catch (err) {
        setError('Erro ao carregar perfil.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      if (profile?.moto) {
        await updateMoto(form);
        setSuccess('Moto atualizada com sucesso!');
      } else {
        await createMoto(form);
        setSuccess('Moto cadastrada com sucesso!');
      }
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="profile-page">
      <header>
        <Link to="/" className="back-link">← Voltar</Link>
        <h1>Meu Perfil</h1>
      </header>

      <main>
        <section className="user-section">
          <h2>👤 Dados Pessoais</h2>
          <p><strong>Nome:</strong> {profile?.usuario?.name || 'N/A'}</p>
          <p><strong>Email:</strong> {profile?.usuario?.email || 'N/A'}</p>
        </section>

        <section className="moto-section">
          <h2>🏍️ Minha Moto</h2>
          
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Placa *</label>
              <input
                type="text"
                name="plate"
                value={form.plate}
                onChange={handleChange}
                placeholder="ABC-1234"
                required
              />
            </div>

            <div className="form-group">
              <label>Modelo</label>
              <input
                type="text"
                name="model"
                value={form.model}
                onChange={handleChange}
                placeholder="Honda CG 160"
              />
            </div>

            <div className="form-group">
              <label>Cor</label>
              <input
                type="text"
                name="color"
                value={form.color}
                onChange={handleChange}
                placeholder="Vermelha"
              />
            </div>

            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Salvando...' : profile?.moto ? 'Atualizar Moto' : 'Cadastrar Moto'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
