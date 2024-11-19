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

  console.log('Received username:', username); // username 출력
  console.log('Received password:', password); // password 출력

  try {
    // 사용자 검색
    const user = await User.findOne({ username });

    if (!user) {
      console.log('사용자를 찾을 수 없습니다.');
      return res.status(400).send('Invalid credentials. Please try again.');
    }

    // 비밀번호 검증
    const isMatch = await bcrypt.compare(password, user.password); // 해싱된 비밀번호와 비교

    if (!isMatch) {
      console.log('사용자를 찾을 수 없습니다.');
      return res.status(400).send('틀린 비번입니다');
    }

    // 로그인 성공 시 홈 페이지로 리다이렉트
    console.log('로그인 성공! 메뉴 페이지로 리다이렉트합니다.');
    res.redirect('/home');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
