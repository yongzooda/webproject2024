// controllers/registerController.js

const User = require('../models/User');
const bcrypt = require('bcrypt');

// 회원가입 페이지 렌더링
exports.getRegisterPage = (req, res) => {
  res.render('register');
};

// 회원가입 처리
exports.registerUser = async (req, res) => {
  const { username, password, email, age, gender, interests } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('회원가입 해싱된 비밀번호:', hashedPassword);

    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      age,
      gender,
      interests,
    });
    console.log('DB 저장 직전의 비밀번호:', newUser.password);
    await newUser.save();
    console.log('데이터베이스에 저장된 비밀번호:', newUser.password);
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error registering new user.');
  }
};
