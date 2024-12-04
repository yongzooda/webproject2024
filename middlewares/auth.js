const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET; // JWT 서명용 비밀 키

const authenticateJWT = (req, res, next) => {
  const token = req.cookies.token; // 쿠키에서 JWT 가져오기

  if (!token) {
    req.user = null; // 로그인되지 않음
    return res.status(401).send('Access denied. No token provided.');
  }

  try {
    const decoded = jwt.verify(token, jwtSecret); // JWT 검증
    req.user = decoded; // 사용자 정보 설정

    if (!req) {
      console.error('Error: req is undefined');
    } else {
      req.user = decoded; // 디코딩된 사용자 정보 설정
    }

    next();
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    res.status(403).send('Invalid or expired token.');
  }
};

module.exports = authenticateJWT;
