const mongoose = require('mongoose');

// 댓글 스키마 (공통 사용)
const commentSchema = new mongoose.Schema({
  username: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

// 식단 일지 스키마
const dietLogSchema = new mongoose.Schema({
  username: { type: String, required: true }, // 작성자
  title: { type: String, required: true }, // 식단 제목
  foodName: { type: String, required: true }, // 음식명
  calories: { type: Number, required: true }, // 칼로리
  nutrition: {
    carbs: { type: Number, required: true }, // 탄수화물 (g)
    protein: { type: Number, required: true }, // 단백질 (g)
    fat: { type: Number, required: true }, // 지방 (g)
    sugar: { type: Number, required: true }, // 당 (g)
    sodium: { type: Number, required: true }, // 나트륨 (mg)
  }, // 영양성분
  mealTime: { type: Date, required: true }, // 식사 시간
  description: { type: String, required: false }, // 추가 설명 (선택)
  image: { type: String }, // 이미지 파일 이름 (선택 사항)
  comments: [commentSchema], // 댓글 필드
  createdAt: { type: Date, default: Date.now }, // 등록 시간
});

const DietLog = mongoose.model('DietLog', dietLogSchema);

module.exports = DietLog;
