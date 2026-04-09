const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  quizName:  { type: String, required: true },
  question:  { type: String, required: true },
  correct:   { type: String, required: true },   // primera columna del CSV
  options:   { type: [String], required: true },  // las 4 opciones (incluye la correcta)
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
