// routes/menu.js

const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const gymController = require('../controllers/gymController');

// 메뉴 페이지 라우트
router.get('/', homeController.getMenuPage);

// 주변 헬스장 검색 페이지 라우트
router.get('/nearby-gyms', gymController.getNearbyGyms);

// 운동 일지 페이지 라우트
router.get('/workout-log', homeController.getWorkoutLog);

// 식단 일지 페이지 라우트
router.get('/diet-log', homeController.getDietLog);

// 그룹 챌린지 페이지 라우트
router.get('/group-challenges', homeController.getGroupChallenges);

// 실시간 상담 페이지 라우트
router.get('/live-chat', homeController.getLiveChat);

module.exports = router;
