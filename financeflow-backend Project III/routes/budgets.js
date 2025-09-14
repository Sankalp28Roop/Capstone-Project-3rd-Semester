const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Budget = require('../models/Budget');

router.get('/', auth, async (req, res) => {
  const budgets = await Budget.find({ user: req.user._id });
  res.json(budgets);
});

router.post('/', auth, async (req, res) => {
  const { category, amount } = req.body;
  if (!category || amount == null) return res.status(400).json({ error: 'category and amount required' });

  const budget = await Budget.findOneAndUpdate(
    { user: req.user._id, category },
    { amount },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json(budget);
});

router.delete('/:category', auth, async (req, res) => {
  await Budget.findOneAndDelete({ user: req.user._id, category: req.params.category });
  res.json({ success: true });
});

module.exports = router;