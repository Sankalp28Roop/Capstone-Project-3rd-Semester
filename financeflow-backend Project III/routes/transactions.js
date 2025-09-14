const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');

router.get('/', auth, async (req, res) => {
  const tx = await Transaction.find({ user: req.user._id }).sort({ date: -1, createdAt: -1 });
  res.json(tx);
});

router.post('/', auth, async (req, res) => {
  const { type, amount, category, date, notes } = req.body;
  const t = new Transaction({ user: req.user._id, type, amount, category, date, notes });
  await t.save();
  res.json(t);
});

router.put('/:id', auth, async (req, res) => {
  const t = await Transaction.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true }
  );
  if (!t) return res.status(404).json({ error: 'Transaction not found' });
  res.json(t);
});

router.delete('/:id', auth, async (req, res) => {
  const t = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!t) return res.status(404).json({ error: 'Transaction not found' });
  res.json({ success: true });
});

module.exports = router;