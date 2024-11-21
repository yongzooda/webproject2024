//liveChat.js

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// 기본 경로: 사용자 역할에 따라 처리
router.get('/', (req, res) => {
  if (req.user && req.user.role === 'admin') {
    // 관리자인 경우 채팅방 목록으로 이동
    res.redirect('/live-chat/rooms');
  } else if (req.user) {
    // 일반 사용자인 경우 본인의 채팅방으로 이동
    const userRoomId = encodeURIComponent(`${req.user.username}_admin`); // 사용자 이름 기반의 고유 roomId 생성 (URI 인코딩)
    res.redirect(`/live-chat/room/${userRoomId}`); // 템플릿 리터럴 사용
  } else {
    // 로그인하지 않은 경우
    res.status(403).send('Access denied. Please log in first.');
  }
});

// 일반 사용자가 관리자와의 채팅방 참여 또는 생성
router.get('/room', (req, res) => {
  if (req.user) {
    chatController.joinOrCreateChatRoom(req, res); // 일반 사용자 처리
  } else {
    res.status(403).send('Access denied. Please log in first.');
  }
});

// 채팅방 목록 페이지
router.get('/rooms', chatController.getChatRooms);

// 특정 채팅방으로 들어가기
router.get('/room/:roomId', (req, res) => {
  const decodedRoomId = decodeURIComponent(req.params.roomId); // roomId 디코딩
  req.params.roomId = decodedRoomId; // 디코딩된 값을 req.params에 덮어쓰기
  chatController.getChatRoom(req, res);
});

// 메시지 전송 처리
router.post(
  '/room/:roomId',
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
