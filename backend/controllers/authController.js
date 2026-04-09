const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET, JWT_EXPIRES, ADMIN_CODE } = require('../config');

const signToken = (user) =>
  jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  });

exports.register = async (req, res) => {
  try {
    const { username, email, password, adminCode } = req.body;
    const role = adminCode && adminCode === ADMIN_CODE ? 'admin' : 'user';
    const user = await User.create({ username, email, password, role });
    res.status(201).json({ token: signToken(user), username: user.username, role: user.role });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    res.json({ token: signToken(user), username: user.username, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { email, username } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      const randomPass = Math.random().toString(36).slice(-10);
      user = await User.create({
        username: username || email.split('@')[0],
        email,
        password: randomPass,
        role: 'user',
      });
    }
    res.json({ token: signToken(user), username: user.username, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
