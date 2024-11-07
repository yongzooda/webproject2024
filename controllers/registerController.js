// controllers/registerController.js

const User = require('../models/User');

// 회원가입 페이지 렌더링
exports.getRegisterPage = (req, res) => {
  res.render('register');
};

// 회원가입 처리
exports.registerUser = async (req, res) => {
  const { username, password, email, age, gender, interests } = req.body;

  try {
    // 새로운 사용자 생성
    const newUser = new User({
      username,
      password,
      email,
      age,
      gender,
      interests,
    });
    await newUser.save();
    res.redirect('/login'); // 회원가입 성공 시 로그인 페이지로 이동
  } catch (err) {
    console.error(err);
    res.status(500).send('Error registering new user.'); // 오류 발생 시 메시지 출력
  }
};
