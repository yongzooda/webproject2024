//dietLogController.js

const aws = require('aws-sdk');

// AWS S3 설정
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-2', // S3 버킷 리전
});

const s3 = new aws.S3();


const DietLog = require('../models/DietLog');

// 식단 일지 작성 페이지 렌더링
exports.getAddDietLogPage = (req, res) => {
  res.render('add-diet-log', {
    user: req.user, // 사용자 정보 전달
    title: 'Add Diet Log', // 페이지 제목
    currentPage: 'Add my diet log', // 현재 페이지 이름
    referer: req.headers.referer || null, // 이전 페이지 URL 전달 (없을 경우 null)
  }); // 식단 일지 작성 폼 렌더링
};

// 모든 식단 일지 조회
exports.getDietLogs = async (req, res) => {
  try {
    const logs = await DietLog.find().sort({ mealTime: -1 }); // 최신 식사 시간 순으로 정렬
    console.log('Diet Logs:', logs); // 디버깅: 조회된 데이터 확인
    res.render('diet-logs', {
      logs,
      user: req.user, // 사용자 정보 전달
      title: 'Diet Logs', // 페이지 제목
      currentPage: 'Diet logs', // 현재 페이지 이름
      referer: req.headers.referer || null, // 이전 페이지 URL 전달 (없을 경우 null)
    });
  } catch (error) {
    console.error('Error fetching diet logs:', error);
    res.status(500).send('Error fetching diet logs');
  }
};

// 식단 일지 추가 처리
exports.addDietLog = async (req, res) => {
  const { title, foodName, calories, nutrition, mealTime, description } =
    req.body;
    const imageUrl = req.file ? req.file.location : null; // S3에 저장된 파일의 URL

  try {
    const newLog = await DietLog.create({
      userId: req.user._id,
      username: req.user.username, // JWT에서 가져온 사용자명
      title,
      foodName,
      calories,
      nutrition,
      mealTime: new Date(mealTime), // 문자열을 Date 객체로 변환
      description,
      image: imageUrl, // 이미지 URL을 MongoDB에 저장
    });
    console.log('New Diet Log Created:', newLog); // 디버깅 메시지 추가
    res.redirect('/home/diet-logs');
  } catch (error) {
    console.error('Error saving diet log:', error);
    res.status(500).send('Error saving diet log');
  }
};

// 식단 일지 수정 처리
exports.editDietLog = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    foodName,
    calories,
    nutrition,
    mealTime,
    description,
    redirectTo,
  } = req.body;
  const imageUrl = req.file ? req.file.location : null; // S3에 저장된 파일의 URL

  try {
    const log = await DietLog.findById(id);
    if (!log) {
      return res.status(404).send('Diet log not found');
    }

    // 관리자 또는 작성자만 수정 가능
    if (
      req.user.role !== 'admin' &&
      log.userId.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .send('You do not have permission to edit this log');
    }

    // 업데이트
    log.title = title;
    log.foodName = foodName;
    log.calories = calories;
    log.nutrition = nutrition;
    log.mealTime = new Date(mealTime);
    log.description = description;
    if (imageUrl) {
      log.image = imageUrl; // 새로운 이미지 URL로 업데이트
    }

    await log.save();

    // redirectTo 값을 사용하여 리다이렉트

    if (redirectTo && redirectTo.includes('/home/mypage')) {
      return res.redirect('/home/mypage');
    }

    res.redirect('/home/diet-logs');
  } catch (error) {
    console.error('Error editing diet log:', error);
    res.status(500).send('Error editing diet log');
  }
};

// 식단 일지 수정 페이지 렌더링
exports.getEditDietLogPage = async (req, res) => {
  const { id } = req.params;

  try {
    const log = await DietLog.findById(id);
    if (!log) {
      return res.status(404).send('Diet log not found');
    }

    // 관리자 또는 게시물 작성자만 수정 페이지 접근 가능
    if (
      req.user.role !== 'admin' &&
      log.userId.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .send('You do not have permission to edit this log');
    }

    res.render('edit-diet-log', {
      log, // 수정할 데이터 전달
      user: req.user, // 사용자 정보 전달
      title: 'Edit Diet Log', // 페이지 제목
      currentPage: 'Edit Diet Log', // 현재 페이지 이름
      referer: req.headers.referer || null, // 이전 페이지 URL 전달 (없을 경우 null)
    });
  } catch (error) {
    console.error('Error fetching diet log for editing:', error);
    res.status(500).send('Error fetching diet log for editing');
  }
};

// 식단 일지 삭제 처리
exports.deleteDietLog = async (req, res) => {
  const { id } = req.params;

  try {
    // MongoDB에서 삭제할 로그 찾기
    const log = await DietLog.findById(id);
    if (!log) {
      console.error('Diet log not found for deletion');
      return res.status(404).send('Diet log not found');
    }

    // 관리자 또는 작성자만 삭제 가능
    if (req.user.role !== 'admin' && log.username !== req.user.username) {
      return res.status(403).send('You do not have permission to delete this log');
    }

    // S3에서 이미지 삭제
    if (log.image) {
      const s3Key = log.image.split('/').slice(-2).join('/'); // S3 객체 키 추출
      const params = {
        Bucket: 'fitconnect-images', // S3 버킷 이름
        Key: s3Key,
      };

      try {
        await s3.deleteObject(params).promise();
        console.log('Image deleted from S3:', log.image);
      } catch (error) {
        console.error('Error deleting image from S3:', error); // 디버깅 로그 추가
      }
    }

    // MongoDB에서 로그 삭제
    try {
      await log.deleteOne();
      console.log('Diet log deleted from database:', log._id);
    } catch (error) {
      console.error('Error deleting diet log from database:', error);
      return res.status(500).send('Error deleting diet log');
    }

    // 이전 페이지 확인 후 리다이렉트
    const referer = req.headers.referer;
    if (referer && referer.includes('/home/mypage')) {
      return res.redirect('/home/mypage');
    }

    res.redirect('/home/diet-logs');
  } catch (error) {
    console.error('Unexpected error during diet log deletion:', error);
    res.status(500).send('Unexpected error during diet log deletion');
  }
};

// 댓글 추가, 수정, 삭제 (운동일지와 동일한 로직 사용)
exports.addComment = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  // req.user가 유효한지 확인
  if (!req.user || !req.user._id) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const log = await DietLog.findById(id);
    if (!log) return res.status(404).json({ error: 'Diet log not found' });

    const newComment = {
      userId: req.user._id,
      username: req.user.username,
      text,
      date: new Date(),
    };
    log.comments.push(newComment);
    await log.save();

    res.status(200).json({
      success: true,
      comment: {
        ...newComment,
        _id: log.comments[log.comments.length - 1]._id,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error adding comment' });
  }
};

exports.editComment = async (req, res) => {
  const { id, commentId } = req.params;
  const { text } = req.body;

  try {
    const log = await DietLog.findById(id);
    if (!log) return res.status(404).json({ error: 'Diet log not found' });

    const comment = log.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    if (req.user.role !== 'admin' && comment.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    comment.text = text;
    comment.date = new Date();
    await log.save();

    res.status(200).json({ success: true, comment });
  } catch (error) {
    res.status(500).json({ error: 'Error editing comment' });
  }
};

exports.deleteComment = async (req, res) => {
  const { id, commentId } = req.params;

  try {
    const log = await DietLog.findById(id);
    if (!log) return res.status(404).json({ error: 'Diet log not found' });

    const commentIndex = log.comments.findIndex(
      (c) => c._id.toString() === commentId
    );
    if (commentIndex === -1) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (
      req.user.role !== 'admin' &&
      log.comments[commentIndex].userId !== req.user.userId
    ) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    log.comments.splice(commentIndex, 1);
    await log.save();

    res.status(200).json({ success: true, commentId });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting comment' });
  }
};
