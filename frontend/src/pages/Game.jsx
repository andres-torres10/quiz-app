import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSocket } from '../services/socket';
import api from '../services/api';
import { useAuth } from '../services/authContext';

export default function Game() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [question, setQuestion]   = useState(null);
  const [options, setOptions]     = useState([]);
  const [timeLeft, setTimeLeft]   = useState(30);
  const [timeLimit, setTimeLimit] = useState(30);
  const [selected, setSelected]   = useState(null);
  const [feedback, setFeedback]   = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [qIndex, setQIndex]       = useState(0);
  const [total, setTotal]         = useState(10);
  const [quizName, setQuizName]   = useState('');
  const [timerActive, setTimerActive] = useState(false);

  const timerRef    = useRef(null);
  const timeLeftRef = useRef(30);  // ref para leer timeLeft en submit sin stale closure
  const quizNameRef = useRef('');
  const totalScoreRef = useRef(0);
  const selectedRef = useRef(null);

  // ── Efecto 1: socket listeners (solo se monta una vez) ──
  useEffect(() => {
    const socket = getSocket();

    socket.on('new_question', (data) => {
      // Limpiar timer anterior
      clearInterval(timerRef.current);

      setQuestion(data.question);
      setOptions(data.options);
      setSelected(null);
      setFeedback(null);
      setQIndex(data.index);
      setTotal(data.total);
      setTimeLimit(data.timeLimit);
      setTimeLeft(data.timeLimit);
      setTimerActive(true);

      timeLeftRef.current  = data.timeLimit;
      selectedRef.current  = null;
      if (data.quizName) {
        setQuizName(data.quizName);
        quizNameRef.current = data.quizName;
      }
    });

    socket.on('answer_result', (data) => {
      clearInterval(timerRef.current);
      setTimerActive(false);
      setFeedback(data);
      setTotalScore(data.totalScore);
      totalScoreRef.current = data.totalScore;
      // La siguiente pregunta llega sola desde el servidor tras 2s, no hacemos nada más
    });

    socket.on('time_up', ({ correctAnswer }) => {
      clearInterval(timerRef.current);
      setTimerActive(false);
      if (!selectedRef.current) {
        setFeedback({ correct: false, correctAnswer, points: 0, totalScore: totalScoreRef.current });
      }
    });

    socket.on('player_finished', () => {
      clearInterval(timerRef.current);
      setQuestion(null); // vuelve a pantalla de espera hasta game_over
    });

    socket.on('game_over', async ({ results }) => {
      clearInterval(timerRef.current);
      const myResult = results.find((r) => r.username === user.username);
      if (myResult) {
        try {
          await api.post('/quiz/score', { quizName: quizNameRef.current, score: myResult.score });
        } catch {}
      }
      navigate('/results', { state: { results, myScore: myResult?.score || 0 } });
    });

    return () => {
      socket.off('new_question');
      socket.off('answer_result');
      socket.off('time_up');
      socket.off('player_finished');
      socket.off('game_over');
      clearInterval(timerRef.current);
    };
  }, []); // sin dependencias — se monta una sola vez

  // ── Efecto 2: timer reactivo al activarse ──
  useEffect(() => {
    if (!timerActive) return;

    timerRef.current = setInterval(() => {
      timeLeftRef.current -= 1;
      setTimeLeft(timeLeftRef.current);
      if (timeLeftRef.current <= 0) {
        clearInterval(timerRef.current);
        setTimerActive(false);
      }
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  const submitAnswer = (answer) => {
    if (selectedRef.current || feedback) return;
    selectedRef.current = answer;
    setSelected(answer);
    const socket = getSocket();
    socket.emit('submit_answer', { answer, timeLeft: timeLeftRef.current });
  };

  if (!question) {
    return (
      <div className="page center">
        <div className="spinner" />
        <p>{totalScore > 0 ? '¡Terminaste! Esperando a los demás...' : 'Esperando pregunta...'}</p>
        {totalScore > 0 && <div className="score-badge" style={{marginTop:'1rem', fontSize:'1.2rem'}}>⭐ {totalScore} pts</div>}
      </div>
    );
  }

  const timerPct   = (timeLeft / timeLimit) * 100;
  const timerColor = timeLeft > 10 ? '#4ade80' : timeLeft > 5 ? '#facc15' : '#f87171';

  return (
    <div className="page game-page">
      <div className="game-header">
        <span>Pregunta {qIndex + 1}/{total}</span>
        <span className="score-badge">⭐ {totalScore}</span>
      </div>

      <div className="timer-bar-wrap">
        <div className="timer-bar" style={{ width: `${timerPct}%`, background: timerColor }} />
      </div>
      <div className="timer-number" style={{ color: timerColor }}>{timeLeft}s</div>

      <div className="question-box">
        <p>{question}</p>
      </div>

      <div className="options-grid">
        {options.map((opt, i) => {
          let cls = 'option-btn';
          if (feedback) {
            if (opt === feedback.correctAnswer) cls += ' correct';
            else if (opt === selected) cls += ' wrong';
          } else if (opt === selected) {
            cls += ' selected';
          }
          return (
            <button key={i} className={cls} onClick={() => submitAnswer(opt)} disabled={!!selected || !!feedback}>
              {opt}
            </button>
          );
        })}
      </div>

      {feedback && (
        <div className={`feedback-banner ${feedback.correct ? 'fb-correct' : 'fb-wrong'}`}>
          {feedback.correct
            ? `✅ ¡Correcto! +${feedback.points} puntos`
            : `❌ Incorrecto. Respuesta: ${feedback.correctAnswer}`}
        </div>
      )}
    </div>
  );
}
