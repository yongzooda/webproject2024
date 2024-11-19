const mongoose = require('mongoose');

const workoutLogSchema = new mongoose.Schema({
  username: { type: String, required: true },
  title: { type: String, required: true },
  exercise: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  image: { type: String }, // 이미지 파일 이름 (선택 사항)
});

const WorkoutLog = mongoose.model('WorkoutLog', workoutLogSchema);

module.exports = WorkoutLog;
