//chatController.js

const ChatRoom = require('../models/ChatRoom');

// 채팅방 목록 렌더링 (관리자만 접근 가능)
exports.getChatRooms = async (req, res) => {
  console.log('User from req:', req.user); // 디버깅: req.user 확인
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).send('Access denied'); // 일반 사용자는 접근 불가
  }

  try {
    const chatRooms = await ChatRoom.find(); // 모든 채팅방 조회
    res.render('chat-rooms', {
      chatRooms,
      user: req.user, // 사용자 정보 전달
      title: 'chat rooms(관리자용)', // 페이지 제목
      currentPage: 'chat rooms(관리자용)', // 현재 페이지 이름
      referer: req.headers.referer || null, // 이전 페이지 URL 전달 (없을 경우 null)
    }); // chat-rooms.ejs 렌더링
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).send('Error fetching chat rooms');
  }
};

// 특정 채팅방 조회 및 렌더링
exports.getChatRoom = async (req, res) => {
  console.log('User from req:', req.user); // req.user 확인
  const roomId = decodeURIComponent(req.params.roomId); // URI 복원
  console.log('Room ID:', roomId); // 디버깅: roomId 확인

  if (!req.user) {
    console.error('Error: req.user is undefined in getChatRoom');
    return res.status(403).send('Access denied: User not authenticated.');
  }

  try {
    let chatRoom = await ChatRoom.findOne({ roomId });

    if (!chatRoom) {
      chatRoom = new ChatRoom({
        roomId,
        participants: [req.user.username, 'admin'], // 기본 참여자 추가
        messages: [],
      });
      await chatRoom.save();
    }

    // 사용자 정보를 EJS로 전달
    res.render('chat-room', {
      chatRoom,
      user: req.user,
      title: 'chat room', // 페이지 제목
      currentPage: 'chat room', // 현재 페이지 이름
      referer: req.headers.referer || null, // 이전 페이지 URL 전달 (없을 경우 null)
      token: req.cookies.token, // JWT 토큰 전달
    });
  } catch (error) {
    console.error('Error fetching or creating chat room:', error);
    res.status(500).send('Error fetching or creating chat room');
  }
};

// 메시지 저장 및 처리 (Socket.IO와 연동)
exports.saveMessage = async (roomId, sender, message) => {
  console.log('Attempting to save message:', { roomId, sender, message });

  try {
    const chatRoom = await ChatRoom.findOne({ roomId });
    if (!chatRoom) {
      console.error('Chat room not found:', roomId);
      return;
    }

    chatRoom.messages.push({ sender, message, timestamp: new Date() });
    await chatRoom.save();
    console.log('Message successfully saved:', { roomId, sender, message });
  } catch (error) {
    console.error('Error saving message to database:', error.message);
  }
};

// 메시지 전송 처리 (HTTP POST 요청 처리용)
exports.postMessage = async (req, res) => {
  const roomId = decodeURIComponent(req.params.roomId); // URI 복원
  const { sender, message } = req.body;

  try {
    // 채팅방 조회
    const chatRoom = await ChatRoom.findOne({ roomId });
    if (!chatRoom) {
      return res.status(404).send('Chat room not found'); // 채팅방이 없으면 404 반환
    }

    // 새로운 메시지를 채팅방에 추가
    chatRoom.messages.push({ sender, message });
    await chatRoom.save();

    res.status(200).send('Message sent'); // 성공 응답
  } catch (error) {
    console.error('Error posting message:', error);
    res.status(500).send('Error posting message');
  }
};

// 사용자와 관리자의 채팅방 생성 및 참여
exports.joinOrCreateChatRoom = async (req, res) => {
  const userRoomId = `${req.user.username}_admin`;

  try {
    // 방이 있는지 확인
    let chatRoom = await ChatRoom.findOne({ roomId: userRoomId });

    if (!chatRoom) {
      // 방이 없으면 새로 생성
      chatRoom = new ChatRoom({
        roomId: userRoomId,
        participants: [req.user.username, 'admin'],
        messages: [], // 빈 메시지 배열 초기화
      });
      await chatRoom.save();
    }

    // 채팅방으로 리다이렉트
    res.redirect(`/live-chat/room/${encodeURIComponent(userRoomId)}`);
  } catch (error) {
    console.error('Error joining or creating chat room:', error);
    res.status(500).send('Error joining or creating chat room');
  }
};
