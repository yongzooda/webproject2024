const mongoose = require('mongoose');
const WorkoutLog = require('../models/WorkoutLog');
const DietLog = require('../models/DietLog');

exports.getChallenges = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id); // ObjectId 변환

    // 운동일지 개수 조회
    const workoutCounts = await WorkoutLog.aggregate([
      { $match: { userId } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]);

    // 식단일지 개수 조회
    const dietCounts = await DietLog.aggregate([
      { $match: { userId } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]);

    console.log('Workout Counts:', workoutCounts);
    console.log('Diet Counts:', dietCounts);

    // 사용자 데이터 매핑
    const userStats = [
      {
        userId: req.user.username, // 사용자명
        workouts: workoutCounts.length > 0 ? workoutCounts[0].count : 0,
        diets: dietCounts.length > 0 ? dietCounts[0].count : 0,
      },
    ];

    console.log('Final User Stats:', userStats);

    // 페이지 렌더링
    res.render('challenges', {
      user: req.user || null,
      userStats,
      title: 'Challenges',
      currentPage: 'Challenges',
    });
  } catch (error) {
    console.error('Error fetching challenges data:', error);
    res.status(500).send('Error fetching challenges data');
  }
};
