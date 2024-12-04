const User = require('../models/user');
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET; // JWT 서명용 비밀 키

// 로그인 페이지 렌더링
exports.getLoginPage = (req, res) => {
  res.render('login', {
    user: null, // user 변수를 명시적으로 null로 설정,
    title: 'Login',
    currentPage: 'Login',
    referer: req.headers.referer || null, // 이전 페이지 URL 전달 (없을 경우 null)
  });
};

// 로그인 처리
exports.handleLogin = async (req, res) => {
  const { email, password } = req.body;

  console.log('Received email:', email); // email 출력
  console.log('Received password:', password); // password 출력

  try {
    // 사용자 검색
    const user = await User.findOne({ email });

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

    // JWT 생성
    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      }, // JWT 페이로드
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    });

    res.redirect('/home'); // 홈 페이지로 리다이렉트
  } catch (err) {
    console.error('Error setting cookie:', err.message);
    res.status(500).send('Server error');
  }
};
