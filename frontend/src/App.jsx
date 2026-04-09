import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import AdminPanel from './pages/AdminPanel';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import Results from './pages/Results';
import Ranking from './pages/Ranking';
import { useAuth } from './services/authContext';

function PrivateRoute({ children, adminOnly = false }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/admin" element={<PrivateRoute adminOnly><AdminPanel /></PrivateRoute>} />
      <Route path="/lobby/:quizName" element={<PrivateRoute><Lobby /></PrivateRoute>} />
      <Route path="/game/:roomId"    element={<PrivateRoute><Game /></PrivateRoute>} />
      <Route path="/results"         element={<PrivateRoute><Results /></PrivateRoute>} />
      <Route path="/ranking"         element={<PrivateRoute><Ranking /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
