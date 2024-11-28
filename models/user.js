const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  age: { type: Number },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  interests: [String],
  role: { type: String, enum: ['user', 'admin'], default: 'user' }, // 역할 필드
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
