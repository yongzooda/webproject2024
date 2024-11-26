const WorkoutLog = require('../models/WorkoutLog');

const logs = []; // 임시 데이터베이스 (나중에 실제 DB로 대체)

// 운동 일지 작성 페이지 렌더링
exports.getAddWorkoutLogPage = (req, res) => {
  res.render('add-workout-log', {
    user: req.user, // 사용자 정보 전달
    title: 'add-workout-log', // 페이지 제목
    currentPage: 'Add my workout log', // 현재 페이지 이름
  }); // 운동 일지 작성 폼 렌더링
};

//모든 운동일지들 조회
exports.getWorkoutLogs = async (req, res) => {
  try {
    const logs = await WorkoutLog.find().sort({ date: -1 }); // 최신 날짜순으로 정렬
    console.log('Workout Logs:', logs); // 디버깅: 조회된 데이터 확인
    res.render('workout-logs', {
      logs,
      user: req.user, // 사용자 정보 전달
      title: 'workout-log', // 페이지 제목
      currentPage: 'workout logs', // 현재 페이지 이름
    });
  } catch (error) {
    console.error('Error fetching workout logs:', error);
    res.status(500).send('Error fetching workout logs');
  }
};

// 운동 일지 추가 처리
exports.addWorkoutLog = async (req, res) => {
  const { username, title, exercise, duration, date, description } = req.body;
  const image = req.file ? req.file.filename : null;

  try {
    const newLog = await WorkoutLog.create({
      username: req.user.username, // JWT에서 가져온 사용자명
      title,
      exercise,
      duration,
      date: new Date(date), // 문자열을 Date 객체로 변환
      description,
      image,
    });
    console.log('New Workout Log Created:', newLog); // 디버깅 메시지 추가
    res.redirect('/home/workout-logs');
  } catch (error) {
    console.error('Error saving workout log:', error);
    res.status(500).send('Error saving workout log');
  }
};

//운동 일지 수정 처리
exports.editWorkoutLog = async (req, res) => {
  const { id } = req.params;
  const { title, exercise, duration, date, description } = req.body;
  const image = req.file ? req.file.filename : null;

  try {
    const log = await WorkoutLog.findById(id);
    if (!log) {
      return res.status(404).send('Workout log not found');
    }

    // 관리자 또는 작성자만 수정 가능
    if (req.user.role !== 'admin' && log.username !== req.user.username) {
      return res
        .status(403)
        .send('You do not have permission to edit this log');
    }

    // 업데이트
    log.title = title;
    log.exercise = exercise;
    log.duration = duration;
    log.date = new Date(date);
    log.description = description;
    if (image) {
      log.image = image;
    }

    await log.save();
    res.redirect('/home/workout-logs');
  } catch (error) {
    console.error('Error editing workout log:', error);
    res.status(500).send('Error editing workout log');
  }
};

// 운동 일지 수정 페이지 렌더링
exports.getEditWorkoutLogPage = async (req, res) => {
  const { id } = req.params;

  try {
    const log = await WorkoutLog.findById(id);
    if (!log) {
      return res.status(404).send('Workout log not found');
    }

    // 관리자 또는 게시물 작성자만 수정 페이지 접근 가능
    if (req.user.role !== 'admin' && log.username !== req.user.username) {
      return res
        .status(403)
        .send('You do not have permission to edit this log');
    }

    res.render('edit-workout-log', {
      log, // 수정할 데이터 전달
      user: req.user, // 사용자 정보 전달
      title: 'Edit Workout Log', // 페이지 제목
      currentPage: 'Edit Workout Log', // 현재 페이지 이름
    });
  } catch (error) {
    console.error('Error fetching workout log for editing:', error);
    res.status(500).send('Error fetching workout log for editing');
  }
};

// 운동 일지 삭제 처리
exports.deleteWorkoutLog = async (req, res) => {
  const { id } = req.params;

  try {
    const log = await WorkoutLog.findById(id);
    if (!log) {
      return res.status(404).send('Workout log not found');
    }

    // 관리자 또는 게시물 작성자만 삭제 가능
    if (req.user.role !== 'admin' && log.username !== req.user.username) {
      return res
        .status(403)
        .send('You do not have permission to delete this log');
    }

    await log.deleteOne(); // MongoDB에서 해당 운동 일지 삭제
    res.redirect('/home/workout-logs');
  } catch (error) {
    console.error('Error deleting workout log:', error);
    res.status(500).send('Error deleting workout log');
  }
};
