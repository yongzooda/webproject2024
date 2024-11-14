// routes/register.js

const express = require('express');
const router = express.Router();
const registerController = require('../controllers/registerController'); // 회원가입 컨트롤러 불러오기

// 회원가입 페이지 라우팅
router.get('/', registerController.getRegisterPage);

// 회원가입 처리 라우팅
router.post('/', registerController.registerUser);

module.exports = router;
