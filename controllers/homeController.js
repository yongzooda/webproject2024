// controllers/homeController.js

// home 페이지 렌더링
exports.getMenuPage = (req, res) => {
  res.render('home');
};

// 운동 일지 페이지 렌더링
exports.getWorkoutLog = (req, res) => {
  res.render('workout-log');
};

// 식단 일지 페이지 렌더링
exports.getDietLog = (req, res) => {
  res.render('diet-log');
};

// 그룹 챌린지 페이지 렌더링
exports.getGroupChallenges = (req, res) => {
  res.render('group-challenges');
};

// 실시간 상담 페이지 렌더링
exports.getLiveChat = (req, res) => {
  res.render('live-chat');
};
