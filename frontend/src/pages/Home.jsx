import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../services/authContext';

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [roomId, setRoomId] = useState('');
  const [selected, setSelected] = useState('');

  useEffect(() => {
    api.get('/quiz/list').then(({ data }) => setQuizzes(data));
  }, []);

  const joinLobby = () => {
    if (!selected) return alert('Selecciona un quiz');
    // Si no se escribe un ID de sala, usar el nombre del quiz como sala por defecto
    // así todos los que entren al mismo quiz van a la misma sala
    const finalRoomId = roomId.trim() || selected;
    navigate(`/lobby/${selected}`, { state: { roomId: finalRoomId } });
  };

  return (
    <div className="page">
      <header className="top-bar">
        <span className="logo">🎯 Quiz App</span>
        <div className="top-bar-right">
          <span>Hola, {user.username}</span>
          {user.role === 'admin' && (
            <button className="btn-secondary" onClick={() => navigate('/admin')}>Admin</button>
          )}
          <button className="btn-secondary" onClick={() => navigate('/ranking')}>🏆 Ranking</button>
          <button className="btn-outline" onClick={logout}>Salir</button>
        </div>
      </header>

      <main className="home-main">
        <h2>Selecciona un Quiz</h2>
        <div className="quiz-grid">
          {quizzes.map((q) => (
            <button
              key={q}
              className={`quiz-card ${selected === q ? 'selected' : ''}`}
              onClick={() => setSelected(q)}
            >
              {q}
            </button>
          ))}
        </div>

        <div className="room-section">
          <input
            type="text"
            placeholder="ID de sala personalizado (opcional)"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <p className="hint">Si dejas vacío, todos entran a la misma sala del quiz seleccionado.</p>
          <button className="btn-primary" onClick={joinLobby}>Unirse / Crear Sala</button>
        </div>
      </main>
    </div>
  );
}
