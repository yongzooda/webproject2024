const express = require('express');
const engine = require('ejs-mate');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const connectDB = require('./config/db');
const loginRoutes = require('./routes/login');
const logoutRoutes = require('./routes/logout');
const registerRoutes = require('./routes/register');
const homeRoutes = require('./routes/home');
const liveChatRoutes = require('./routes/liveChat');
const chatController = require('./controllers/chatController');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const server = http.createServer(app); // HTTP 서버 생성
const io = new Server(server);

const expressLayouts = require('express-ejs-layouts');

const PORT = process.env.PORT || 3000;

// 기본 CORS 설정
app.use(cors());

// 환경 변수 로드 (JWT_SECRET 설정 필요)
require('dotenv').config();

// 쿠키 파서 추가
app.use(cookieParser());

// JWT 기반 글로벌 미들웨어
app.use((req, res, next) => {
  const token = req.cookies.token; // 쿠키에서 JWT 가져오기
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // JWT 검증
      req.user = decoded; // 사용자 정보 설정
    } catch (error) {
      console.error('Invalid or expired JWT:', error.message);
      req.user = null; // 인증 실패 시 req.user를 null로 설정
    }
  } else {
    console.log('No JWT token found in cookies.');
    req.user = null;
  }

  next();
});

// MongoDB 연결 실행
connectDB();

// EJS 템플릿 엔진 설정
app.engine('ejs', engine); // EJS-Mate 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 레이아웃 활성화
app.use(expressLayouts);
app.set('layout', 'layouts/main'); // 레이아웃 기본 설정

// 정적 파일 경로 설정
app.use(express.static(path.join(__dirname, 'public')));

// res.locals.user 설정 미들웨어
app.use((req, res, next) => {
  res.locals.user = req.user || null; // res.locals에 user 설정
  next();
});

// Body-parser 미들웨어
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 기본 홈페이지 리다이렉트
app.get('/', (req, res) => {
  res.redirect('/login');
});

// 라우트 설정
app.use('/', loginRoutes);
app.use('/', logoutRoutes);
app.use('/register', registerRoutes);
app.use('/home', homeRoutes);
app.use('/live-chat', liveChatRoutes);

// 다른 미들웨어와 라우트 정의 이후에 추가
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Socket.IO 인증 처리 및 이벤트 처리
io.on('connection', (socket) => {
  const token = socket.handshake.auth.token; // 클라이언트에서 전달된 JWT

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // JWT 검증
      socket.data.username = decoded.username; // 사용자 이름 저장
      socket.data.role = decoded.role; // 역할 저장
    } catch (error) {
      console.error('Invalid JWT for socket connection:', error.message);
      socket.disconnect(); // 인증 실패 시 연결 해제
    }
  } else {
    console.error('No token provided for socket connection');
    socket.disconnect(); // 토큰 없을 시 연결 해제
  }

  // 방 참여
  socket.on('join room', ({ roomId }) => {
    socket.join(roomId);
    console.log(`${socket.data.username} joined room: ${roomId}`);
  });

  // 메시지 전송
  socket.on('chat message', ({ roomId, message }) => {
    const sender = socket.data.username;
    console.log('Received chat message:', { roomId, sender, message });

    // 메시지 저장
    chatController
      .saveMessage(roomId, sender, message)
      .then(() => {
        // 방에 메시지 브로드캐스트
        io.to(roomId).emit('chat message', { sender, message });
      })
      .catch((error) => {
        console.error('Error saving message:', error.message);
      });
  });

  // 사용자 연결 해제
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// 서버 시작
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
