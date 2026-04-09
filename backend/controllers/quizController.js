const Question = require('../models/Question');
const Score = require('../models/Score');
const csv = require('csv-parser');
const XLSX = require('xlsx');
const { Readable } = require('stream');

// Admin: subir preguntas desde CSV o Excel
exports.uploadQuestions = async (req, res) => {
  try {
    const { quizName } = req.body;
    if (!quizName) return res.status(400).json({ message: 'quizName requerido' });
    if (!req.file)  return res.status(400).json({ message: 'Archivo requerido' });

    const ext = req.file.originalname.split('.').pop().toLowerCase();
    let rows = [];

    if (ext === 'csv') {
      rows = await parseCSV(req.file.buffer);
    } else if (ext === 'xlsx' || ext === 'xls') {
      rows = parseExcel(req.file.buffer);
    } else {
      return res.status(400).json({ message: 'Solo CSV o Excel' });
    }

    // Validar estructura: columnas question, answer1, answer2, answer3, answer4
    const required = ['question', 'answer1', 'answer2', 'answer3', 'answer4'];
    const keys = Object.keys(rows[0] || {}).map((k) => k.toLowerCase().trim());
    const valid = required.every((r) => keys.includes(r));
    if (!valid) return res.status(400).json({ message: `Columnas requeridas: ${required.join(', ')}` });

    const docs = rows.map((r) => ({
      quizName,
      question: r.question,
      correct: r.answer1,           // primera respuesta = correcta
      options: [r.answer1, r.answer2, r.answer3, r.answer4],
    }));

    await Question.deleteMany({ quizName });
    await Question.insertMany(docs);
    res.json({ message: `${docs.length} preguntas guardadas`, quizName });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Obtener lista de quizzes disponibles
exports.getQuizList = async (req, res) => {
  try {
    const quizzes = await Question.distinct('quizName');
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 10 preguntas aleatorias de un quiz
exports.getQuestions = async (req, res) => {
  try {
    const { quizName } = req.params;
    const questions = await Question.aggregate([
      { $match: { quizName } },
      { $sample: { size: 10 } },
    ]);
    if (!questions.length) return res.status(404).json({ message: 'Quiz no encontrado' });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Guardar puntuación
exports.saveScore = async (req, res) => {
  try {
    const { quizName, score } = req.body;
    await Score.create({ userId: req.user.id, username: req.user.username, quizName, score });
    // Actualizar total del usuario
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, { $inc: { totalScore: score } });
    res.json({ message: 'Puntuación guardada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Top 10 ranking global
exports.getRanking = async (req, res) => {
  try {
    const ranking = await Score.aggregate([
      { $group: { _id: '$username', totalScore: { $sum: '$score' } } },
      { $sort: { totalScore: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, username: '$_id', totalScore: 1 } },
    ]);
    res.json(ranking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Historial de partidas del usuario actual
exports.getHistory = async (req, res) => {
  try {
    const history = await Score.find({ userId: req.user.id })
      .sort({ playedAt: -1 })
      .limit(20);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- helpers ---
function parseCSV(buffer) {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(buffer.toString());
    stream
      .pipe(csv())
      .on('data', (d) => results.push(d))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

function parseExcel(buffer) {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(ws);
}
