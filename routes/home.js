// routes/home.js

const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const gymController = require('../controllers/gymController');
const path = require('path');
const multer = require('multer'); // multer 가져오기
const workoutLogController = require('../controllers/workoutLogController');

// 메뉴 페이지 라우트
router.get('/', homeController.getMenuPage);

// 주변 헬스장 검색 페이지 렌더링 (EJS 템플릿 반환)
router.get('/nearby-gyms', gymController.getNearbyGymsPage);
// 주변 헬스장 검색 데이터 API (위치 데이터를 기반으로 JSON 반환)
router.get('/api/nearby-gyms', gymController.getNearbyGyms);

// /home/workout-log 요청 시 /home/workout-logs로 리다이렉트
router.get('/workout-log', (req, res) => {
  res.redirect('/home/workout-logs');
});
// Multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads')); // 업로드 폴더 설정
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // 파일 이름 설정
  },
});
const upload = multer({ storage }); // multer 인스턴스 생성
// 운동 일지 페이지 라우트
router.get('/workout-logs', workoutLogController.getWorkoutLogs); // 운동 일지 목록
router.get('/workout-log/new', workoutLogController.getAddWorkoutLogPage); // 운동 일지 작성 폼
router.post(
  '/workout-log',
  upload.single('image'),
  workoutLogController.addWorkoutLog
); // 운동 일지 작성
router.post('/workout-log/:id/delete', workoutLogController.deleteWorkoutLog); // 운동 일지 삭제

// 식단 일지 페이지 라우트
router.get('/diet-log', homeController.getDietLog);

// 그룹 챌린지 페이지 라우트
router.get('/group-challenges', homeController.getGroupChallenges);

// 실시간 상담 페이지 라우트
router.get('/live-chat', homeController.getLiveChat);

module.exports = router;
