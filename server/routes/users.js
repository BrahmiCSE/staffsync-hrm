const express = require('express');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// Update my own personal information
router.put('/me', async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    await user.save();
    const { password, ...safe } = user.toObject();
    res.json(safe);
  } catch (err) {
    next(err);
  }
});

// Manager: my team members
router.get('/team', authorize('manager', 'hr'), async (req, res, next) => {
  try {
    const filter = req.user.role === 'manager' ? { manager: req.user._id } : { role: 'employee' };
    res.json(await User.find(filter).select('-password').sort('name'));
  } catch (err) {
    next(err);
  }
});

// HR: report numbers for the dashboard
router.get('/stats', authorize('hr'), async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [employees, managers, hrs, pendingLeaves, presentToday] = await Promise.all([
      User.countDocuments({ role: 'employee' }),
      User.countDocuments({ role: 'manager' }),
      User.countDocuments({ role: 'hr' }),
      Leave.countDocuments({ status: 'pending' }),
      Attendance.countDocuments({ date: today }),
    ]);
    const byDepartment = await User.aggregate([
      { $group: { _id: { $ifNull: ['$department', 'Unassigned'] }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ employees, managers, hrs, pendingLeaves, presentToday, byDepartment });
  } catch (err) {
    next(err);
  }
});

// HR: list everyone (optional ?role=employee&search=ann)
router.get('/', authorize('hr'), async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      const rx = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: rx }, { email: rx }, { department: rx }];
    }
    res.json(await User.find(filter).select('-password').populate('manager', 'name').sort('name'));
  } catch (err) {
    next(err);
  }
});

// HR: create employee / manager / hr
router.post('/', authorize('hr'), async (req, res, next) => {
  try {
    const { name, email, password, role, department, position, phone, salary, manager } = req.body;
    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({ message: 'Name, email and password (min 6 chars) are required' });
    }
    if (await User.findOne({ email: email.toLowerCase() })) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const user = await User.create({
      name, email, password, role: role || 'employee', department, position, phone, salary,
      manager: manager || null,
    });
    const { password: _p, ...safe } = user.toObject();
    res.status(201).json(safe);
  } catch (err) {
    next(err);
  }
});

// HR: edit anyone (password is changed only if one is sent)
router.put('/:id', authorize('hr'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const fields = ['name', 'email', 'role', 'department', 'position', 'phone', 'address', 'salary', 'leaveBalance'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) user[f] = req.body[f];
    });
    if (req.body.manager !== undefined) user.manager = req.body.manager || null;
    if (req.body.password) user.password = req.body.password;
    await user.save();

    const { password, ...safe } = user.toObject();
    res.json(safe);
  } catch (err) {
    next(err);
  }
});

// Manager/HR: set a performance rating (0-5)
router.put('/:id/rating', authorize('manager', 'hr'), async (req, res, next) => {
  try {
    const rating = Number(req.body.rating);
    if (Number.isNaN(rating) || rating < 0 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 0 and 5' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (req.user.role === 'manager' && String(user.manager) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only rate your own team' });
    }
    user.performanceRating = rating;
    await user.save();
    res.json({ _id: user._id, performanceRating: user.performanceRating });
  } catch (err) {
    next(err);
  }
});

// HR: delete a user
router.delete('/:id', authorize('hr'), async (req, res, next) => {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
