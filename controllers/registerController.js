// controllers/registerController.js

const User = require('../models/User');
const bcrypt = require('bcrypt');
require('dotenv').config(); // .env 파일 로드

// 회원가입 페이지 렌더링
exports.getRegisterPage = (req, res) => {
  res.render('register');
};

// 회원가입 처리
exports.registerUser = async (req, res) => {
  const {
    username,
    password,
    email,
    age,
    gender,
    interests,
    role,
    adminPassword,
  } = req.body;

  try {
    // 관리자 인증 비밀번호 검증
    if (role === 'admin') {
      const ADMIN_AUTH_PASSWORD = process.env.ADMIN_AUTH_PASSWORD; // .env에서 관리자 비밀번호 불러오기
      if (adminPassword !== ADMIN_AUTH_PASSWORD) {
        console.log('관리자 인증 실패: 잘못된 비밀번호');
        return res.status(403).send('Invalid admin authentication password.');
      }
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('회원가입 해싱된 비밀번호:', hashedPassword);

    // 새로운 사용자 생성
    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      age,
      gender,
      interests,
      role: role || 'user', // 역할은 기본적으로 'user'
    });

    console.log('DB 저장 직전의 비밀번호:', newUser.password);

    // 사용자 정보 저장
    await newUser.save();
    console.log('데이터베이스에 저장된 비밀번호:', newUser.password);

    res.redirect('/login'); // 로그인 페이지로 리다이렉트
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).send('Error registering new user.');
  }
};
