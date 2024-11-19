const WorkoutLog = require('../models/WorkoutLog');

const logs = []; // 임시 데이터베이스 (나중에 실제 DB로 대체)

// 운동 일지 작성 페이지 렌더링
exports.getAddWorkoutLogPage = (req, res) => {
  res.render('add-workout-log'); // 운동 일지 작성 폼 렌더링
};

// 운동 일지 추가 처리
exports.addWorkoutLog = async (req, res) => {
  const { username, title, exercise, duration, date, description } = req.body;
  const image = req.file ? req.file.filename : null;

  try {
    const newLog = await WorkoutLog.create({
      username,
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

exports.getWorkoutLogs = async (req, res) => {
  try {
    const logs = await WorkoutLog.find().sort({ date: -1 }); // 최신 날짜순으로 정렬
    console.log('Workout Logs:', logs); // 디버깅: 조회된 데이터 확인
    res.render('workout-logs', { logs });
  } catch (error) {
    console.error('Error fetching workout logs:', error);
    res.status(500).send('Error fetching workout logs');
  }
};

// 운동 일지 삭제 처리
exports.deleteWorkoutLog = async (req, res) => {
  const { id } = req.params;

  try {
    await WorkoutLog.findByIdAndDelete(id); // MongoDB에서 해당 운동 일지 삭제
    res.redirect('/home/workout-logs');
  } catch (error) {
    console.error('Error deleting workout log:', error);
    res.status(500).send('Error deleting workout log');
  }
};
