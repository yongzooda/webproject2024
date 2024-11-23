const express = require('express');
const router = express.Router();

// 로그아웃 처리
router.get('/logout', (req, res) => {
  // JWT 토큰을 쿠키에서 제거
  res.clearCookie('token'); // 클라이언트의 쿠키에서 'token' 삭제
  res.redirect('/login'); // 로그인 페이지로 리다이렉트
});

module.exports = router;
