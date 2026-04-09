import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/authContext';

export default function NavBar({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="top-bar">
      <span className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        🎯 {title || 'Quiz App'}
      </span>
      <div className="top-bar-right">
        {user && <span className="nav-user">👤 {user.username}</span>}
        {user?.role === 'admin' && (
          <button className="btn-secondary" onClick={() => navigate('/admin')}>Admin</button>
        )}
        <button className="btn-secondary" onClick={() => navigate('/ranking')}>🏆</button>
        <button className="btn-outline" onClick={() => { logout(); navigate('/login'); }}>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
