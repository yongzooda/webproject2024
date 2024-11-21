//liveChat.js

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

const authenticateJWT = require('../middlewares/auth');

// 기본 경로: 사용자 역할에 따라 처리
router.get('/', authenticateJWT, (req, res) => {
  console.log('Decoded user from JWT:', req.user);
  if (req.user && req.user.role === 'admin') {
    // 관리자인 경우 채팅방 목록으로 이동
    res.redirect('/live-chat/rooms');
  } else if (req.user && req.user.role === 'user') {
    // 일반 사용자인 경우 본인의 채팅방으로 이동
    const userRoomId = encodeURIComponent(`${req.user.username}_admin`); // 사용자 이름 기반의 고유 roomId 생성 (URI 인코딩)
    res.redirect(`/live-chat/room/${userRoomId}`); // 템플릿 리터럴 사용
  } else {
    console.error('User role not found or unauthorized:', req.user);
    // 로그인하지 않은 경우
    res.status(403).send('Access denied. Please log in first!!!');
  }
});

// 일반 사용자가 관리자와의 채팅방 참여 또는 생성
router.get('/room', authenticateJWT, (req, res) => {
  if (req.user) {
    chatController.joinOrCreateChatRoom(req, res); // 일반 사용자 처리
  } else {
    res
      .status(403)
      .send('Access denied. Please log in first.(일반관리자가 생성시도)');
  }
});

// 채팅방 목록 페이지
router.get('/rooms', authenticateJWT, chatController.getChatRooms);

// 특정 채팅방으로 들어가기
router.get('/room/:roomId', authenticateJWT, (req, res) => {
  console.log('User in /live-chat/room/:roomId route:', req.user); // 디버깅 로그 추가
  const decodedRoomId = decodeURIComponent(req.params.roomId); // roomId 디코딩
  req.params.roomId = decodedRoomId;
  chatController.getChatRoom(req, res);
});

// 메시지 전송 처리
router.post(
  '/room/:roomId',
  authenticateJWT,
  (req, res, next) => {
    try {
      req.params.roomId = decodeURIComponent(req.params.roomId); // URI 복원
      next();
    } catch (error) {
      console.error('Error decoding roomId:', error);
      return res.status(400).send('Invalid roomId format.');
    }
  },
  chatController.postMessage
);

module.exports = router;
