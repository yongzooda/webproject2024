const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET; // JWT 서명용 비밀 키

const authenticateJWT = (req, res, next) => {
  console.log('--- authenticateJWT called ---');
  console.log('Cookies in request:', req.cookies); // 전체 쿠키 출력
  const token = req.cookies.token; // 쿠키에서 JWT 가져오기
  console.log('JWT Token from cookies:', token);

  if (!token) {
    console.error('No token found in cookies');
    return res.status(401).send('Access denied. No token provided.');
  }

  try {
    const decoded = jwt.verify(token, jwtSecret); // JWT 검증
    req.user = decoded; // 사용자 정보 설정
    console.log('Decoded JWT:', decoded);

    if (!req) {
      console.error('Error: req is undefined');
    } else {
      req.user = decoded; // 디코딩된 사용자 정보 설정
      console.log('req.user set in authenticateJWT:', req.user); // 확인 로그 추가
    }

    next();
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    res.status(403).send('Invalid or expired token.');
  }
};

module.exports = authenticateJWT;
