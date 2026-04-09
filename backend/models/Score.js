const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  quizName: { type: String, required: true },
  score:    { type: Number, required: true },
  playedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Score', scoreSchema);
