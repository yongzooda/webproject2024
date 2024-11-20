const ChatRoom = require('../models/ChatRoom');

// 채팅방 목록 렌더링 (관리자만 접근 가능)
exports.getChatRooms = async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).send('Access denied'); // 일반 사용자는 접근 불가
  }

  try {
    const chatRooms = await ChatRoom.find(); // 모든 채팅방 조회
    res.render('chat-rooms', { chatRooms }); // chat-rooms.ejs 렌더링
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).send('Error fetching chat rooms');
  }
};

// 특정 채팅방 렌더링
exports.getChatRoom = async (req, res) => {
  const roomId = decodeURIComponent(req.params.roomId); // URI 복원
  try {
    // 채팅방 조회
    const chatRoom = await ChatRoom.findOne({ roomId });
    if (!chatRoom) {
      return res.status(404).send('Chat room not found'); // 채팅방이 없으면 404 반환
    }

    res.render('chat-room', { chatRoom }); // chat-room.ejs 렌더링
  } catch (error) {
    console.error('Error fetching chat room:', error);
    res.status(500).send('Error fetching chat room');
  }
};

// 메시지 전송 처리
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

// 일반 사용자가 관리자와의 채팅방 생성 및 참여
exports.joinOrCreateChatRoom = async (req, res) => {
  const userRoomId = encodeURIComponent(`${req.user.username}_admin`); // 고유한 채팅방 ID 생성 (URI 인코딩)

  try {
    // 기존 채팅방이 있는지 확인
    let chatRoom = await ChatRoom.findOne({ roomId: userRoomId });
    if (!chatRoom) {
      // 채팅방이 없으면 새로 생성
      chatRoom = new ChatRoom({
        roomId: userRoomId,
        participants: [req.user.username, 'admin'], // 사용자와 관리자 추가
        messages: [], // 메시지 초기화
      });
      await chatRoom.save();
    }

    res.redirect(`/live-chat/room/${userRoomId}`); // 해당 채팅방으로 리다이렉션
  } catch (error) {
    console.error('Error joining or creating chat room:', error);
    res.status(500).send('Error joining or creating chat room');
  }
};
