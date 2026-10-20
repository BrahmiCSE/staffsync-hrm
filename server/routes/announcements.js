const express = require('express');
const Announcement = require('../models/Announcement');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    res.json(await Announcement.find().populate('postedBy', 'name').sort('-createdAt').limit(50));
  } catch (err) {
    next(err);
  }
});

router.post('/', authorize('hr'), async (req, res, next) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) return res.status(400).json({ message: 'Title and message are required' });
    const item = await Announcement.create({ title, message, postedBy: req.user._id });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authorize('hr'), async (req, res, next) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Announcement deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
