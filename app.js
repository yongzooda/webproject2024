const express = require('express');
const session = require('express-session'); // 세션 관리용 모듈
const http = require('http'); // HTTP 서버 생성
const { Server } = require('socket.io');
const path = require('path');
const connectDB = require('./config/db');
const loginRoutes = require('./routes/login');
const registerRoutes = require('./routes/register');
const homeRoutes = require('./routes/home');
const liveChatRoutes = require('./routes/liveChat'); // liveChat 라우트 추가
const ChatRoom = require('./models/ChatRoom'); // ChatRoom 모델 추가

const app = express();
const server = http.createServer(app); // HTTP 서버를 Socket.IO와 함께 사용
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// MongoDB 연결 실행
connectDB();

// 세션 미들웨어 설정
app.use(
  session({
    secret: 'yourSecretKey', // 임의의 보안 키를 설정
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // HTTPS 사용 시 secure를 true로 설정
  })
);

// EJS 템플릿 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 정적 파일 경로 설정
app.use(express.static(path.join(__dirname, 'public')));

// Body-parser 내장 미들웨어
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 사용자 역할 구분 미들웨어
app.use((req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user; // 세션에서 사용자 정보 가져오기
  } else {
    req.user = null; // 로그인되지 않은 경우 null 설정
  }
  next();
});

// 기본 홈페이지 진입 시 로그인 페이지로 리다이렉트
app.get('/', (req, res) => {
  res.redirect('/login');
});

// 라우트 설정
app.use('/', loginRoutes);
app.use('/register', registerRoutes);
app.use('/home', homeRoutes);
app.use('/live-chat', liveChatRoutes); // liveChat 라우트 연결

// Socket.IO 이벤트 처리
io.on('connection', (socket) => {
  console.log('A user connected.');

  // 방에 참여
  socket.on('join', async ({ roomId, role }) => {
    console.log(`${role} joined room: ${roomId}`);
    socket.join(roomId);
  });

  // 메시지 수신 및 브로드캐스트
  socket.on('chat message', async ({ roomId, sender, message }) => {
    console.log(`Message from ${sender} in room ${roomId}: ${message}`);

    // 메시지를 데이터베이스에 저장
    const chatRoom = await ChatRoom.findOne({ roomId });
    if (chatRoom) {
      chatRoom.messages.push({ sender, message });
      await chatRoom.save();
    }

    // 해당 방에 메시지 전송
    io.to(roomId).emit('chat message', { sender, message });
  });

  // 사용자 연결 해제
  socket.on('disconnect', () => {
    console.log('A user disconnected.');
  });
});

// 서버 시작
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
