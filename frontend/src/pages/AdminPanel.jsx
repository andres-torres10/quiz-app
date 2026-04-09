import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [quizName, setQuizName] = useState('');
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!quizName || !file) return setError('Completa todos los campos');
    setLoading(true);
    setMsg('');
    setError('');
    try {
      const fd = new FormData();
      fd.append('quizName', quizName);
      fd.append('file', file);
      const { data } = await api.post('/quiz/upload', fd);
      setMsg(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al subir');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <header className="top-bar">
        <span className="logo">🎯 Admin</span>
        <button className="btn-outline" onClick={() => navigate('/')}>← Volver</button>
      </header>

      <main className="admin-main">
        <div className="admin-card">
          <h2>Subir Preguntas</h2>
          <p className="hint">
            El archivo CSV/Excel debe tener columnas:<br />
            <code>question, answer1, answer2, answer3, answer4</code><br />
            La primera respuesta (answer1) siempre es la correcta.
          </p>

          {msg   && <p className="success">{msg}</p>}
          {error && <p className="error">{error}</p>}

          <form onSubmit={handleUpload}>
            <input
              type="text" placeholder="Nombre del Quiz" required
              value={quizName} onChange={(e) => setQuizName(e.target.value)}
            />
            <label className="file-label">
              {file ? file.name : 'Seleccionar CSV o Excel'}
              <input
                type="file" accept=".csv,.xlsx,.xls" hidden
                onChange={(e) => setFile(e.target.files[0])}
              />
            </label>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Subiendo...' : 'Subir Preguntas'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
