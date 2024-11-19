const express = require('express');
const multer = require('multer'); // multer 가져오기
const path = require('path');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const loginRoutes = require('./routes/login');
const registerRoutes = require('./routes/register');
const homeRoutes = require('./routes/home');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB 연결 실행
connectDB();

// EJS 템플릿 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 정적 파일 경로 설정
app.use(express.static(path.join(__dirname, 'public')));

// 기본 홈페이지 진입 시 로그인 페이지로 리다이렉트
app.get('/', (req, res) => {
  res.redirect('/login');
});

// 로그인 및 회원가입 라우트 사용
app.use('/', loginRoutes);
app.use('/register', registerRoutes);
app.use('/home', homeRoutes);

// Body-parser 설정 (POST 요청 처리)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
