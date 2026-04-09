const router = require('express').Router();
const multer = require('multer');
const { protect, adminOnly } = require('../middleware/auth');
const {
  uploadQuestions,
  getQuizList,
  getQuestions,
  saveScore,
  getRanking,
  getHistory,
} = require('../controllers/quizController');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/list', protect, getQuizList);
router.get('/ranking', protect, getRanking);
router.get('/history', protect, getHistory);
router.get('/:quizName/questions', protect, getQuestions);
router.post('/score', protect, saveScore);
router.post('/upload', protect, adminOnly, upload.single('file'), uploadQuestions);

module.exports = router;
