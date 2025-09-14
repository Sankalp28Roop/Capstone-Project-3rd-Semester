const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  description: String,
  amount: Number,
  paidBy: String,
  date: String,
  splitAmong: [String],
  createdAt: { type: Date, default: Date.now }
});

const GroupSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  members: [String],
  expenses: [ExpenseSchema],
  balances: { type: Map, of: Number, default: {} },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Group', GroupSchema);