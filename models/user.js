//user.js

const mongoose = require('mongoose');

// 월별 목표를 위한 서브 스키마 추가
const goalSchema = new mongoose.Schema({
  month: { type: String, required: true }, // 'YYYY-MM' 형식
  monthlyWorkoutGoal: { type: Number, default: 0 }, // 운동 목표
  monthlyWorkoutTimeGoal: { type: Number, default: 0 }, // 운동 목표 시간 (분)
  nutritionGoals: {
    protein: { type: Number, default: 0 },
    carbohydrate: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
  },
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  age: { type: Number },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  interests: [String],
  role: { type: String, enum: ['user', 'admin'], default: 'user' }, // 역할 필드
  monthlyGoals: [goalSchema], // 월별 목표 배열
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
