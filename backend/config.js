require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/quizapp',
  JWT_SECRET: process.env.JWT_SECRET || 'supersecretkey',
  JWT_EXPIRES: '7d',
  ADMIN_CODE: process.env.ADMIN_CODE || 'profe2024', // cambia esto
};
