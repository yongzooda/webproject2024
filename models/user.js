// models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  age: { type: Number },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  interests: [String],
});

module.exports = mongoose.model('User', userSchema);
