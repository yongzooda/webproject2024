// routes/home.js

const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const gymController = require('../controllers/gymController');
const path = require('path');
const multer = require('multer');
const workoutLogController = require('../controllers/workoutLogController');
const dietLogController = require('../controllers/dietLogController');
const challengeController = require('../controllers/challengeController');

const authenticateJWT = require('../middlewares/auth');

// 홈 페이지 라우트
router.get('/', authenticateJWT, homeController.getMenuPage);

// 주변 헬스장 검색 페이지 렌더링 (EJS 템플릿 반환)
router.get('/nearby-gyms', authenticateJWT, gymController.getNearbyGymsPage);
// 주변 헬스장 검색 데이터 API (위치 데이터를 기반으로 JSON 반환)
router.get('/api/nearby-gyms', authenticateJWT, gymController.getNearbyGyms);

// /home/workout-log 요청 시 /home/workout-logs로 리다이렉트
router.get('/workout-log', authenticateJWT, (req, res) => {
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
router.get(
  '/workout-logs',
  authenticateJWT,
  workoutLogController.getWorkoutLogs
); // 운동 일지 목록
router.get(
  '/workout-log/new',
  authenticateJWT,
  workoutLogController.getAddWorkoutLogPage
); // 운동 일지 작성 폼
router.post(
  '/workout-log',
  upload.single('image'),
  workoutLogController.addWorkoutLog
); // 운동 일지 작성
router.get(
  '/workout-log/:id/edit',
  authenticateJWT,
  workoutLogController.getEditWorkoutLogPage
); // 운동 일지 수정 폼

router.post(
  '/workout-log/:id/edit',
  authenticateJWT,
  upload.single('image'),
  workoutLogController.editWorkoutLog
); // 운동 일지 수정

router.post(
  '/workout-log/:id/delete',
  authenticateJWT,
  workoutLogController.deleteWorkoutLog
); // 운동 일지 삭제

// 댓글 관련 라우트 추가
router.post(
  '/workout-log/:id/comments',
  authenticateJWT,
  workoutLogController.addComment
); // 댓글 추가

router.delete(
  '/workout-log/:id/comments/:commentId',
  authenticateJWT,
  workoutLogController.deleteComment
);
// 댓글 삭제

router.patch(
  '/workout-log/:id/comments/:commentId',
  authenticateJWT,
  workoutLogController.editComment
); // 댓글 수정

// 식단 일지 페이지 라우트
router.get('/diet-logs', authenticateJWT, dietLogController.getDietLogs); // 식단 일지 목록
router.get(
  '/diet-log/new',
  authenticateJWT,
  dietLogController.getAddDietLogPage
); // 식단 일지 작성 폼
router.post('/diet-log', upload.single('image'), dietLogController.addDietLog); // 식단 일지 작성
router.get(
  '/diet-log/:id/edit',
  authenticateJWT,
  dietLogController.getEditDietLogPage
); // 식단 일지 수정 폼

router.post(
  '/diet-log/:id/edit',
  authenticateJWT,
  upload.single('image'),
  dietLogController.editDietLog
); // 식단 일지 수정

router.post(
  '/diet-log/:id/delete',
  authenticateJWT,
  dietLogController.deleteDietLog
); // 식단 일지 삭제

// 댓글 관련 라우트 추가
router.post(
  '/diet-log/:id/comments',
  authenticateJWT,
  dietLogController.addComment
); // 댓글 추가

router.delete(
  '/diet-log/:id/comments/:commentId',
  authenticateJWT,
  dietLogController.deleteComment
); // 댓글 삭제

router.patch(
  '/diet-log/:id/comments/:commentId',
  authenticateJWT,
  dietLogController.editComment
); // 댓글 수정

/// 챌린지 페이지 라우트 추가
router.get('/challenges', authenticateJWT, challengeController.getChallenges);

// 그룹 챌린지 페이지로 이동
router.get(
  '/challenges/group-challenges',
  authenticateJWT,
  challengeController.getGroupChallenges
);

router.get(
  '/challenges/set-goals',
  authenticateJWT,
  challengeController.getSetGoalsPage
);
router.post(
  '/challenges/set-goals',
  authenticateJWT,
  challengeController.setGoals
);

// 실시간 상담 라우트
router.get('/live-chat', authenticateJWT, (req, res) => {
  console.log('User in /live-chat route:', req.user); // 디버깅 로그 추가
  if (req.user && req.user.role === 'admin') {
    // 관리자는 채팅방 목록으로 이동
    res.redirect('/live-chat/rooms');
  } else if (req.user) {
    // 일반 사용자는 관리자와의 채팅방으로 이동
    const userRoomId = `${req.user.username}_admin`;
    res.redirect(`/live-chat/room/${userRoomId}`);
  } else {
    // 로그인하지 않은 경우
    res.status(403).send('Access denied. Please log in first.');
  }
});

module.exports = router;
