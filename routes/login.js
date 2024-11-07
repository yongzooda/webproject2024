// routes/login.js

const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController'); // 로그인 컨트롤러 불러오기

// 로그인 페이지 라우팅
router.get('/login', loginController.getLoginPage);

// 로그인 처리 라우팅
router.post('/login', loginController.handleLogin);

module.exports = router;
