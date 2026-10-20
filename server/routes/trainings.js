const express = require('express');
const Training = require('../models/Training');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// Employees see programs they are part of. Managers see their own. HR sees all.
router.get('/', async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === 'employee') filter = { participants: req.user._id };
    if (req.user.role === 'manager') filter = { createdBy: req.user._id };
    res.json(
      await Training.find(filter)
        .populate('createdBy', 'name')
        .populate('participants', 'name')
        .sort('-createdAt')
    );
  } catch (err) {
    next(err);
  }
});

router.post('/', authorize('manager', 'hr'), async (req, res, next) => {
  try {
    const { title, description, startDate, endDate, participants } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    const training = await Training.create({
      title,
      description,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      participants: participants || [],
      createdBy: req.user._id,
    });
    await Notification.insertMany(
      (participants || []).map((id) => ({ user: id, message: `You were added to the training "${title}".` }))
    );
    res.status(201).json(training);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authorize('manager', 'hr'), async (req, res, next) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ message: 'Training not found' });
    if (req.user.role === 'manager' && String(training.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only delete your own programs' });
    }
    await training.deleteOne();
    res.json({ message: 'Training deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
