import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Ranking() {
  const navigate = useNavigate();
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    api.get('/quiz/ranking').then(({ data }) => setRanking(data));
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="page ranking-page">
      <header className="top-bar">
        <span className="logo">🏆 Ranking Global</span>
        <button className="btn-outline" onClick={() => navigate('/')}>← Volver</button>
      </header>

      <main>
        <div className="ranking-list">
          {ranking.map((r, i) => (
            <div key={i} className={`ranking-item ${i < 3 ? 'top3' : ''}`}>
              <span className="rank">{medals[i] || `#${i + 1}`}</span>
              <span className="rname">{r.username}</span>
              <span className="rscore">{r.totalScore} pts</span>
            </div>
          ))}
          {ranking.length === 0 && <p className="hint">Aún no hay puntuaciones.</p>}
        </div>
      </main>
    </div>
  );
}
