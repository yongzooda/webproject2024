const DietLog = require('../models/DietLog');
const WorkoutLog = require('../models/WorkoutLog');
const User = require('../models/user');
const bcrypt = require('bcrypt');

// 마이페이지 렌더링
exports.renderMyPage = async (req, res) => {
  try {
    const userId = req.user._id; // 현재 로그인된 사용자 ID 가져오기

    // 사용자가 작성한 운동일지, 식단일지, 댓글 가져오기

    const workoutLogs = await WorkoutLog.find({ userId }).populate('comments');
    const dietLogs = await DietLog.find({ userId }).populate('comments');
    const userInfo = await User.findById(userId);

    res.render('mypage', {
      username: userInfo.username,
      email: userInfo.email,
      workoutLogs,
      dietLogs,
      user: req.user, // 사용자 정보 전달
      title: 'Nearby Gyms', // 페이지 제목
      currentPage: 'Nearby Gyms', // 현재 페이지 이름
      referer: req.headers.referer || null, // 이전 페이지 URL 전달 (없을 경우 null)
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('서버 오류가 발생했습니다.');
  }
};

// 비밀번호 변경
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user._id; // 현재 로그인된 사용자
    const { oldPassword, newPassword } = req.body;

    // 사용자 검색
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send('사용자를 찾을 수 없습니다.');
    }

    // 기존 비밀번호 비교
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).send('기존 비밀번호가 일치하지 않습니다.');
    }

    // 새 비밀번호 해싱
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 비밀번호 업데이트
    user.password = hashedPassword;
    await user.save();

    // 마이페이지로 리다이렉트
    req.flash('success', '비밀번호가 성공적으로 변경되었습니다.');
    res.redirect('/home/mypage');
  } catch (error) {
    console.error(error);
    res.status(500).send('서버 오류가 발생했습니다.');
  }
};
