const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const userResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department,
  position: user.position,
});

const isEmail = (s) => /^\S+@\S+\.\S+$/.test(s || '');

// Public registration always creates an EMPLOYEE.
// HR creates managers/HR accounts from the HR dashboard.
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !isEmail(email) || !password || password.length < 6) {
      return res.status(400).json({ message: 'Name, a valid email and a password (min 6 chars) are required' });
    }
    if (await User.findOne({ email: email.toLowerCase() })) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const user = await User.create({ name, email, password, role: 'employee' });
    res.status(201).json({ token: signToken(user._id), user: userResponse(user) });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!isEmail(email) || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({ token: signToken(user._id), user: userResponse(user) });
  } catch (err) {
    next(err);
  }
});

router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

module.exports = router;
