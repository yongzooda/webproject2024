// controllers/loginController.js

const User = require('../models/User');
const bcrypt = require('bcrypt');

// 로그인 페이지 렌더링
exports.getLoginPage = (req, res) => {
  res.render('login');
};

// 로그인 처리
exports.handleLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    // 사용자 검색
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).send('Invalid credentials. Please try again.');
    }

    // 비밀번호 검증
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).send('Invalid credentials. Please try again.');
    }

    // 로그인 성공 시 홈 페이지로 리다이렉트
    res.redirect('/home');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
