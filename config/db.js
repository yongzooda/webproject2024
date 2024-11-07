// config/db.js

const mongoose = require('mongoose');
require('dotenv').config(); // .env 파일 불러오기

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // 옵션 제거
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // 연결 실패 시 애플리케이션 종료
  }
};

module.exports = connectDB;
