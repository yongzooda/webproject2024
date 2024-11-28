const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  username: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const workoutLogSchema = new mongoose.Schema({
  username: { type: String, required: true },
  title: { type: String, required: true },
  exercise: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  image: { type: String }, // 이미지 파일 이름 (선택 사항)
  comments: [commentSchema], // 댓글 필드 추가
  createdAt: { type: Date, default: Date.now }, // 등록 시간
});

const WorkoutLog = mongoose.model('WorkoutLog', workoutLogSchema);

module.exports = WorkoutLog;
