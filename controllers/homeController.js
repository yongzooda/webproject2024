// controllers/homeController.js

// home 페이지 렌더링
exports.getMenuPage = (req, res) => {
  // 현재 로그인된 사용자의 정보를 EJS에 전달
  res.render('home', { user: req.user });
};

// nearby-gyms.ejs 템플릿 렌더링
exports.getNearbyGymsPage = (req, res) => {
  res.render('nearby-gyms'); // EJS 파일 이름
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
  if (req.user && req.user.role === 'admin') {
    // 관리자인 경우
    res.redirect('/live-chat/rooms'); // 채팅방 목록 페이지로 이동
  } else if (req.user) {
    // 일반 사용자인 경우
    const userRoomId = `${req.user.username}_admin`; // 고정된 roomId 생성
    res.redirect(`/live-chat/room/${userRoomId}`); // 관리자와의 채팅방으로 이동
  } else {
    // 로그인하지 않은 경우
    res.status(403).send('Access denied. Please log in first.');
  }
};
