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
      console.log('비밀번호가 일치하지 않습니다.');
      return res.status(400).send('Invalid credentials. Please try again.');
    }

    // 세션에 사용자 정보 저장 (isAdmin -> role)
    req.session.user = {
      username: user.username,
      role: user.role, // 'role' 값을 세션에 저장
    };

    console.log('로그인 성공! 세션 정보:', req.session.user);

    // 로그인 성공 시 홈 페이지로 리다이렉트
    res.redirect('/home');
  } catch (err) {
    console.error('로그인 처리 중 오류 발생:', err);
    res.status(500).send('Server error');
  }
};
