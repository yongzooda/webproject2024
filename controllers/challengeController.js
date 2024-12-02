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
      referer: req.headers.referer || null, // 이전 페이지 URL 전달 (없을 경우 null)
    });
  } catch (error) {
    console.error('Error fetching challenges data:', error);
    res.status(500).send('Error fetching challenges data');
  }
};

exports.getGroupChallenges = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id); // 현재 사용자 ID
    console.log('Current User ID:', userId);

    // WorkoutLog에서 데이터 집계 및 User와 조인
    const workoutLogs = await WorkoutLog.aggregate([
      {
        $group: {
          _id: '$userId',
          totalWorkoutTime: { $sum: '$duration' }, // 총 운동 시간
          totalWorkoutLogs: { $sum: 1 }, // 운동일지 개수
        },
      },
      {
        $lookup: {
          from: 'users', // User 컬렉션과 조인
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      {
        $unwind: '$userInfo', // 배열 형태의 userInfo를 평탄화
      },
      {
        $project: {
          _id: 0,
          userId: '$userInfo.username', // username 필드를 가져옴
          totalWorkoutTime: 1,
          totalWorkoutLogs: 1,
        },
      },
    ]);
    console.log('Workout Aggregation Result:', workoutLogs);

    // DietLog에서 데이터 집계 및 User와 조인
    const dietLogs = await DietLog.aggregate([
      {
        $group: {
          _id: '$userId',
          totalDietScore: {
            $sum: {
              $add: [
                { $multiply: ['$nutrition.protein', 10] }, // 단백질 플러스 점수
                { $multiply: ['$nutrition.fat', -5] }, // 지방 마이너스 점수
                { $multiply: ['$nutrition.sugar', -10] }, // 당 마이너스 점수
              ],
            },
          },
          totalDietLogs: { $sum: 1 }, // 식단일지 개수
        },
      },
      {
        $lookup: {
          from: 'users', // User 컬렉션과 조인
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      {
        $unwind: '$userInfo', // 배열 형태의 userInfo를 평탄화
      },
      {
        $project: {
          _id: 0,
          userId: '$userInfo.username', // username 필드를 가져옴
          totalDietScore: 1,
          totalDietLogs: 1,
        },
      },
    ]);
    console.log('Diet Aggregation Result:', dietLogs);

    // 성실성 랭킹 계산 (WorkoutLog + DietLog)
    const combinedLogs = workoutLogs.map((workout) => {
      const matchingDietLog = dietLogs.find(
        (diet) => diet.userId === workout.userId
      ) || { totalDietLogs: 0 };
      return {
        userId: workout.userId,
        totalLogs:
          (workout.totalWorkoutLogs || 0) +
          (matchingDietLog.totalDietLogs || 0),
      };
    });

    // 운동시간 랭킹 계산
    const workoutRanking = workoutLogs.map((workout) => ({
      userId: workout.userId,
      totalWorkoutTime: workout.totalWorkoutTime || 0,
    }));

    // 식단 점수 랭킹 계산
    const dietRanking = dietLogs.map((diet) => ({
      userId: diet.userId,
      totalDietScore: diet.totalDietScore || 0,
    }));

    // 데이터 정렬
    combinedLogs.sort((a, b) => b.totalLogs - a.totalLogs); // 성실성 랭킹
    workoutRanking.sort((a, b) => b.totalWorkoutTime - a.totalWorkoutTime); // 운동시간 랭킹
    dietRanking.sort((a, b) => b.totalDietScore - a.totalDietScore); // 식단 점수 랭킹

    console.log('Combined Logs:', combinedLogs);
    console.log('Workout Ranking:', workoutRanking);
    console.log('Diet Ranking:', dietRanking);

    // 그룹 챌린지 페이지 렌더링
    res.render('group-challenges', {
      user: req.user || null,
      rankings: {
        combined: combinedLogs,
        workoutTime: workoutRanking,
        dietScore: dietRanking,
      },
      title: 'Group Challenges',
      currentPage: 'Group Challenges',
      referer: req.headers.referer || null, // 이전 페이지 URL 전달 (없을 경우 null)
    });
  } catch (error) {
    console.error('Error fetching group challenges data:', error);
    res.status(500).send('Error fetching group challenges data');
  }
};
