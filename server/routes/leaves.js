const express = require('express');
const Leave = require('../models/Leave');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

const dayCount = (start, end) => Math.round((end - start) / 86400000) + 1;

// Apply for leave
router.post('/', async (req, res, next) => {
  try {
    const { type, startDate, endDate, reason } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
      return res.status(400).json({ message: 'Please give valid start and end dates' });
    }
    const leave = await Leave.create({
      user: req.user._id,
      type: type || 'casual',
      startDate: start,
      endDate: end,
      days: dayCount(start, end),
      reason,
    });
    res.status(201).json(leave);
  } catch (err) {
    next(err);
  }
});

// My leave requests and status
router.get('/my', async (req, res, next) => {
  try {
    res.json(await Leave.find({ user: req.user._id }).sort('-createdAt'));
  } catch (err) {
    next(err);
  }
});

// Manager: team requests. HR: all requests. Optional ?status=pending
router.get('/', authorize('manager', 'hr'), async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.user.role === 'manager') {
      const team = await User.find({ manager: req.user._id }).select('_id');
      filter.user = { $in: team.map((u) => u._id) };
    }
    res.json(await Leave.find(filter).populate('user', 'name department').sort('-createdAt'));
  } catch (err) {
    next(err);
  }
});

// Approve / reject
router.put('/:id/review', authorize('manager', 'hr'), async (req, res, next) => {
  try {
    const { status, reviewNote } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });
    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'This request has already been reviewed' });
    }

    const applicant = await User.findById(leave.user);
    if (req.user.role === 'manager' && String(applicant.manager) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only review your own team' });
    }

    leave.status = status;
    leave.reviewNote = reviewNote || '';
    leave.reviewedBy = req.user._id;
    await leave.save();

    if (status === 'approved' && leave.type !== 'unpaid') {
      applicant.leaveBalance = Math.max(0, applicant.leaveBalance - leave.days);
      await applicant.save();
    }

    await Notification.create({
      user: leave.user,
      message: `Your ${leave.type} leave request was ${status}.`,
    });

    res.json(leave);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
