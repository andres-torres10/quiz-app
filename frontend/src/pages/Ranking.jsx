import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import NavBar from '../components/NavBar';

export default function Ranking() {
  const navigate = useNavigate();
  const [ranking, setRanking] = useState([]);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState('ranking');

  useEffect(() => {
    api.get('/quiz/ranking').then(({ data }) => setRanking(data));
    api.get('/quiz/history').then(({ data }) => setHistory(data));
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  const formatDate = (d) => new Date(d).toLocaleDateString('es', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="page ranking-page">
      <NavBar title="Estadísticas" />

      <div className="tab-bar">
        <button className={`tab-btn ${tab === 'ranking' ? 'active' : ''}`} onClick={() => setTab('ranking')}>
          🏆 Ranking Global
        </button>
        <button className={`tab-btn ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>
          📋 Mis Partidas
        </button>
      </div>

      <main>
        {tab === 'ranking' && (
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
        )}

        {tab === 'history' && (
          <div className="ranking-list">
            {history.map((h, i) => (
              <div key={i} className="ranking-item">
                <span className="rank">🎮</span>
                <div className="history-info">
                  <span className="rname">{h.quizName}</span>
                  <span className="history-date">{formatDate(h.playedAt)}</span>
                </div>
                <span className="rscore">{h.score} pts</span>
              </div>
            ))}
            {history.length === 0 && <p className="hint">Aún no has jugado ninguna partida.</p>}
          </div>
        )}
      </main>
    </div>
  );
}
