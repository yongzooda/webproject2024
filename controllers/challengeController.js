const mongoose = require('mongoose');
const WorkoutLog = require('../models/WorkoutLog');
const DietLog = require('../models/DietLog');
const User = require('../models/user'); // User 모델 임포트

exports.getChallenges = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    // 모든 월별 목표를 가져옴
    const allGoals = user.monthlyGoals || [];

    // 쿼리 파라미터로 선택된 월 가져오기 (없으면 현재 월 사용)
    let selectedMonth = req.query.month;

    if (!selectedMonth) {
      const now = new Date();
      selectedMonth = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, '0')}`; // 현재 월 (YYYY-MM 형식)
    }

    // 선택된 월과 일치하는 목표 가져오기
    const currentGoal =
      allGoals.find((goal) => goal.month === selectedMonth) || {};

    // 선택된 월의 데이터 필터링
    const monthStart = new Date(selectedMonth + '-01');
    const monthEnd = new Date(selectedMonth + '-31');

    // 운동 데이터 합산
    const workoutLogs = await WorkoutLog.find({
      userId,
      date: { $gte: monthStart, $lte: monthEnd },
    });
    const totalWorkoutTime = workoutLogs.reduce(
      (sum, log) => sum + log.duration,
      0
    );

    // **운동 일지 개수 계산**
    const totalWorkoutLogs = workoutLogs.length; // 총 운동 일지 개수

    // **운동 일지 진행률 계산**
    const workoutLogProgress = Math.min(
      (
        (totalWorkoutLogs / (currentGoal.monthlyWorkoutGoal || 1)) *
        100
      ).toFixed(2),
      100
    );

    // 식단 데이터 합산
    const dietLogs = await DietLog.find({
      userId,
      mealTime: { $gte: monthStart, $lte: monthEnd },
    });
    const totalNutrition = dietLogs.reduce(
      (acc, log) => {
        acc.protein += log.nutrition.protein;
        acc.carbohydrate += log.nutrition.carbs;
        acc.fat += log.nutrition.fat;
        acc.sugar += log.nutrition.sugar;
        return acc;
      },
      { protein: 0, carbohydrate: 0, fat: 0, sugar: 0 }
    );

    // 운동시간 진행률 계산
    const workoutTimeProgress = Math.min(
      (
        (totalWorkoutTime / (currentGoal.monthlyWorkoutTimeGoal || 1)) *
        100
      ).toFixed(2),
      100
    );

    const nutritionProgress = {
      protein: Math.min(
        (
          (totalNutrition.protein /
            (currentGoal.nutritionGoals?.protein || 1)) *
          100
        ).toFixed(2),
        100
      ),
      carbohydrate: Math.min(
        (
          (totalNutrition.carbohydrate /
            (currentGoal.nutritionGoals?.carbohydrate || 1)) *
          100
        ).toFixed(2),
        100
      ),
      fat: Math.min(
        (
          (totalNutrition.fat / (currentGoal.nutritionGoals?.fat || 1)) *
          100
        ).toFixed(2),
        100
      ),
      sugar: Math.min(
        (
          (totalNutrition.sugar / (currentGoal.nutritionGoals?.sugar || 1)) *
          100
        ).toFixed(2),
        100
      ),
    };

    res.render('challenges', {
      user: req.user || null,
      allGoals, // 모든 목표 전달
      currentGoal,
      selectedMonth, // 선택된 월 전달
      workoutTimeProgress, // 추가된 진행률
      workoutLogProgress, // 일지 기반 진행률
      nutritionProgress,
      title: 'Challenges',
      currentPage: 'Challenges',
      referer: req.headers.referer || null,
    });
  } catch (error) {
    console.error('Error fetching challenges data:', error);
    res.status(500).send('Error fetching challenges data');
  }
};

exports.getSetGoalsPage = (req, res) => {
  res.render('set-goals', {
    user: req.user,
    title: 'set goals', // 페이지 제목
    currentPage: 'set goals', // 현재 페이지 이름
    referer: req.headers.referer || null, // 이전 페이지 URL 전달 (없을 경우 null)
  });
};

exports.setGoals = async (req, res) => {
  try {
    const userId = req.user._id; // 현재 사용자 ID
    const {
      month,
      workoutGoal,
      workoutTimeGoal,
      proteinGoal,
      carbGoal,
      fatGoal,
      sugarGoal,
    } = req.body;

    const goalData = {
      month, // 월
      monthlyWorkoutGoal: workoutGoal,
      monthlyWorkoutTimeGoal: workoutTimeGoal, // 추가된 필드
      nutritionGoals: {
        protein: proteinGoal,
        carbohydrate: carbGoal,
        fat: fatGoal,
        sugar: sugarGoal,
      },
    };

    // 사용자의 월별 목표 업데이트
    const user = await User.findById(userId);
    const existingGoal = user.monthlyGoals.find((goal) => goal.month === month);

    if (existingGoal) {
      // 목표 업데이트
      existingGoal.monthlyWorkoutGoal = goalData.monthlyWorkoutGoal;
      existingGoal.monthlyWorkoutTimeGoal = goalData.monthlyWorkoutTimeGoal; // 업데이트
      existingGoal.nutritionGoals = goalData.nutritionGoals;
    } else {
      // 목표 추가
      user.monthlyGoals.push(goalData);
    }

    await user.save();
    res.redirect('/home/challenges');
  } catch (error) {
    console.error('Error saving goals:', error);
    res.status(500).send('Error saving goals');
  }
};

exports.getGroupChallenges = async (req, res) => {
  try {
    const selectedMonth =
      req.query.month || new Date().toISOString().slice(0, 7); // 쿼리에서 선택된 월

    const monthStart = new Date(selectedMonth + '-01'); // 선택한 월의 시작
    const monthEnd = new Date(selectedMonth + '-31'); // 선택한 월의 끝

    // WorkoutLog에서 선택한 월에 대한 데이터 집계
    const workoutLogs = await WorkoutLog.aggregate([
      {
        $match: {
          date: { $gte: monthStart, $lte: monthEnd }, // 월별 필터링
        },
      },
      {
        $group: {
          _id: '$userId',
          totalWorkoutTime: { $sum: '$duration' }, // 총 운동 시간
          totalWorkoutLogs: { $sum: 1 }, // 운동 로그 개수
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
          userId: '$userInfo.username', // 사용자 이름
          totalWorkoutTime: 1,
          totalWorkoutLogs: 1,
        },
      },
    ]);

    // DietLog에서 선택한 월에 대한 데이터 집계
    const dietLogs = await DietLog.aggregate([
      {
        $match: {
          mealTime: { $gte: monthStart, $lte: monthEnd }, // 월별 필터링
        },
      },
      {
        $group: {
          _id: '$userId',
          totalDietScore: {
            $sum: {
              $add: [
                { $multiply: ['$nutrition.protein', 10] }, // 단백질 점수
                { $multiply: ['$nutrition.fat', -5] }, // 지방 점수
                { $multiply: ['$nutrition.sugar', -10] }, // 당 점수
              ],
            },
          },
          totalDietLogs: { $sum: 1 }, // 식단 로그 개수
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
          userId: '$userInfo.username', // 사용자 이름
          totalDietScore: 1,
          totalDietLogs: 1,
        },
      },
    ]);

    // 성실성 랭킹
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

    // 운동시간 랭킹
    const workoutRanking = workoutLogs.map((workout) => ({
      userId: workout.userId,
      totalWorkoutTime: workout.totalWorkoutTime || 0,
    }));

    // 식단 점수 랭킹
    const dietRanking = dietLogs.map((diet) => ({
      userId: diet.userId,
      totalDietScore: diet.totalDietScore || 0,
    }));

    // 데이터 정렬
    combinedLogs.sort((a, b) => b.totalLogs - a.totalLogs);
    workoutRanking.sort((a, b) => b.totalWorkoutTime - a.totalWorkoutTime);
    dietRanking.sort((a, b) => b.totalDietScore - a.totalDietScore);

    // 페이지 렌더링
    res.render('group-challenges', {
      user: req.user || null,
      selectedMonth, // 선택된 월 전달
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
