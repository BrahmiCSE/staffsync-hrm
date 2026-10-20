const express = require('express');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

const todayStr = () => new Date().toISOString().slice(0, 10);

// Mark attendance (check in) for today
router.post('/check-in', async (req, res, next) => {
  try {
    const date = todayStr();
    if (await Attendance.findOne({ user: req.user._id, date })) {
      return res.status(400).json({ message: 'You have already marked attendance today' });
    }
    const now = new Date();
    // After 10:00 server time counts as late
    const status = now.getHours() >= 10 ? 'late' : 'present';
    const record = await Attendance.create({ user: req.user._id, date, checkIn: now, status });
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
});

router.post('/check-out', async (req, res, next) => {
  try {
    const record = await Attendance.findOne({ user: req.user._id, date: todayStr() });
    if (!record) return res.status(400).json({ message: 'Check in first' });
    if (record.checkOut) return res.status(400).json({ message: 'Already checked out' });
    record.checkOut = new Date();
    await record.save();
    res.json(record);
  } catch (err) {
    next(err);
  }
});

// My own history (latest 60 days)
router.get('/my', async (req, res, next) => {
  try {
    res.json(await Attendance.find({ user: req.user._id }).sort('-date').limit(60));
  } catch (err) {
    next(err);
  }
});

// Manager: team. HR: everyone. Optional ?date=YYYY-MM-DD
router.get('/', authorize('manager', 'hr'), async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.date) filter.date = req.query.date;
    if (req.user.role === 'manager') {
      const team = await User.find({ manager: req.user._id }).select('_id');
      filter.user = { $in: team.map((u) => u._id) };
    }
    res.json(await Attendance.find(filter).populate('user', 'name department role').sort('-date').limit(200));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
