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

exports.getGroupChallenges = async (req, res) => {
  try {
    // 모든 회원 정보 가져오기
    const users = await WorkoutLog.aggregate([
      {
        $group: {
          _id: '$userId',
          totalWorkoutTime: { $sum: '$duration' }, // 총 운동 시간
          totalWorkoutLogs: { $sum: 1 }, // 운동일지 개수
        },
      },
    ]);

    const dietLogs = await DietLog.aggregate([
      {
        $group: {
          _id: '$userId',
          totalDietScore: {
            $sum: {
              $add: [
                { $multiply: ['$nutrition.protein', 10] },
                { $multiply: ['$nutrition.fat', -5] },
              ],
            },
          },
          totalDietLogs: { $sum: 1 }, // 식단일지 개수
        },
      },
    ]);

    // 성실성: 일지 합계 랭킹
    const combinedLogs = users.map((user) => {
      const dietLog = dietLogs.find((log) => log._id.equals(user._id)) || {};
      return {
        username: user.username,
        totalLogs: (user.totalWorkoutLogs || 0) + (dietLog.totalDietLogs || 0),
      };
    });

    // 운동시간 랭킹
    const workoutTimeRanking = users.map((user) => ({
      username: user.username,
      totalWorkoutTime: user.totalWorkoutTime,
    }));

    // 식단 점수 랭킹
    const dietScoreRanking = dietLogs.map((log) => ({
      username: log.username,
      totalDietScore: log.totalDietScore,
    }));

    // 정렬
    combinedLogs.sort((a, b) => b.totalLogs - a.totalLogs);
    workoutTimeRanking.sort((a, b) => b.totalWorkoutTime - a.totalWorkoutTime);
    dietScoreRanking.sort((a, b) => b.totalDietScore - a.totalDietScore);

    // 페이지 렌더링
    res.render('group-challenges', {
      user: req.user || null,
      rankings: {
        combined: combinedLogs,
        workoutTime: workoutTimeRanking,
        dietScore: dietScoreRanking,
      },
      title: 'Group Challenges',
      currentPage: 'Group Challenges',
    });
  } catch (error) {
    console.error('Error fetching group challenges data:', error);
    res.status(500).send('Error fetching group challenges data');
  }
};
