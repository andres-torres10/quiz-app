import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../services/authContext';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', adminCode: '' });
  const [error, setError] = useState('');
  const [showCode, setShowCode] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/register', form);
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="logo">🎯 Quiz App</h1>
        <h2>Crear Cuenta</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text" placeholder="Nombre de usuario" required
            value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <input
            type="email" placeholder="Email" required
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password" placeholder="Contraseña" required
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <div className="admin-code-toggle">
            <button type="button" className="btn-outline btn-sm" onClick={() => setShowCode(!showCode)}>
              {showCode ? '▲ Ocultar código admin' : '🔑 Tengo código de administrador'}
            </button>
          </div>

          {showCode && (
            <input
              type="password" placeholder="Código secreto de administrador"
              value={form.adminCode} onChange={(e) => setForm({ ...form, adminCode: e.target.value })}
            />
          )}

          <button type="submit" className="btn-primary">Registrarse</button>
        </form>
        <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
      </div>
    </div>
  );
}
