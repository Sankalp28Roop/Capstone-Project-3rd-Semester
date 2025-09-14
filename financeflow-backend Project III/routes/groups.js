const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Group = require('../models/Group');

router.get('/', auth, async (req, res) => {
  const groups = await Group.find({ user: req.user._id });
  res.json(groups);
});

router.post('/', auth, async (req, res) => {
  const { name, members } = req.body;
  if (!name || !Array.isArray(members)) return res.status(400).json({ error: 'name and members required' });

  const balances = {};
  members.forEach(m => balances[m] = 0);

  const g = new Group({ user: req.user._id, name, members, balances });
  await g.save();
  res.json(g);
});

router.post('/:id/expense', auth, async (req, res) => {
  const { description, amount, paidBy, date, splitAmong } = req.body;
  const group = await Group.findOne({ _id: req.params.id, user: req.user._id });
  if (!group) return res.status(404).json({ error: 'Group not found' });

  const expense = { description, amount, paidBy, date, splitAmong };
  group.expenses.push(expense);

  const splitAmount = amount / splitAmong.length;
  splitAmong.forEach(member => {
    const prev = group.balances.get(member) || 0;
    if (member === paidBy) {
      group.balances.set(member, prev + (amount - splitAmount));
    } else {
      group.balances.set(member, prev - splitAmount);
    }
  });

  await group.save();
  res.json(group);
});

router.post('/:id/settle', auth, async (req, res) => {
  const { member } = req.body;
  const group = await Group.findOne({ _id: req.params.id, user: req.user._id });
  if (!group) return res.status(404).json({ error: 'Group not found' });

  group.balances.set(member, 0);
  await group.save();
  res.json(group);
});

router.delete('/:id', auth, async (req, res) => {
  await Group.deleteOne({ _id: req.params.id, user: req.user._id });
  res.json({ success: true });
});

module.exports = router;