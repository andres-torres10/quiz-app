import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { disconnectSocket } from '../services/socket';

export default function Results() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const results = state?.results || [];
  const myScore = state?.myScore || 0;

  const handleHome = () => {
    disconnectSocket();
    navigate('/');
  };

  return (
    <div className="page results-page">
      <h2>🏁 Resultados</h2>
      <div className="my-score">Tu puntuación: <strong>{myScore}</strong></div>

      <div className="results-list">
        {results.map((r, i) => (
          <div key={i} className={`result-item ${i === 0 ? 'first' : ''}`}>
            <span className="rank">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
            <span className="rname">{r.username}</span>
            <span className="rscore">{r.score} pts</span>
          </div>
        ))}
      </div>

      <div className="results-actions">
        <button className="btn-primary" onClick={handleHome}>Volver al inicio</button>
        <button className="btn-secondary" onClick={() => navigate('/ranking')}>Ver Ranking Global</button>
      </div>
    </div>
  );
}
