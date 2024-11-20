const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true }, // 채팅방 ID
  participants: [{ type: String, required: true }], // 참가자 목록 (username)
  messages: [
    {
      sender: { type: String, required: true }, // 보낸 사람
      message: { type: String, required: true }, // 메시지 내용
      timestamp: { type: Date, default: Date.now }, // 전송 시간
    },
  ],
});

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);
module.exports = ChatRoom;
