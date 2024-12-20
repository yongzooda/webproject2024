//workoutLogController.js

const aws = require('aws-sdk');

// AWS S3 설정
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-2', // S3 버킷 리전
});

const s3 = new aws.S3();

const WorkoutLog = require('../models/WorkoutLog');

// 운동 일지 작성 페이지 렌더링
exports.getAddWorkoutLogPage = (req, res) => {
  res.render('add-workout-log', {
    user: req.user, // 사용자 정보 전달
    title: 'add-workout-log', // 페이지 제목
    currentPage: 'Add my workout log', // 현재 페이지 이름
    referer: req.headers.referer || null, // 이전 페이지 URL 전달 (없을 경우 null)
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
      referer: req.headers.referer || null, // 이전 페이지 URL 전달 (없을 경우 null)
    });
  } catch (error) {
    console.error('Error fetching workout logs:', error);
    res.status(500).send('Error fetching workout logs');
  }
};

// 운동 일지 추가 처리
exports.addWorkoutLog = async (req, res) => {
  const { username, title, exercise, duration, date, description } = req.body;
  const image = req.file ? req.file.location : null; // S3 URL 가져오기

  console.log('Request Body:', req.body); // 요청 본문 확인
  console.log('Uploaded File Info:', req.file); // 업로드된 파일 정보 확인


  console.log('User Info:', req.user._id);
  try {
    const newLog = await WorkoutLog.create({
      userId: req.user._id,
      username: req.user.username, // JWT에서 가져온 사용자명
      title,
      exercise,
      duration,
      date: new Date(date), // 문자열을 Date 객체로 변환
      description,
      image, // S3 URL 저장
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
  const { title, exercise, duration, date, description, redirectTo } = req.body;
  const image = req.file ? req.file.location : null; // S3 URL 가져오기

  try {
    const log = await WorkoutLog.findById(id);
    if (!log) {
      return res.status(404).send('Workout log not found');
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
    log.exercise = exercise;
    log.duration = duration;
    log.date = new Date(date);
    log.description = description;
    if (image) {
      log.image = image; // S3 URL로 업데이트
    }

    await log.save();

    // redirectTo 값을 사용하여 리다이렉트

    if (redirectTo && redirectTo.includes('/home/mypage')) {
      return res.redirect('/home/mypage');
    }

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
    if (
      req.user.role !== 'admin' &&
      log.userId.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .send('You do not have permission to edit this log');
    }

    res.render('edit-workout-log', {
      log, // 수정할 데이터 전달
      user: req.user, // 사용자 정보 전달
      title: 'Edit Workout Log', // 페이지 제목
      currentPage: 'Edit Workout Log', // 현재 페이지 이름
      referer: req.headers.referer || null, // 이전 페이지 URL 전달 (없을 경우 null)
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
    // MongoDB에서 로그 찾기
    const log = await WorkoutLog.findById(id);
    if (!log) {
      console.error('Workout log not found for deletion');
      return res.status(404).send('Workout log not found');
    }

    // 관리자 또는 게시물 작성자만 삭제 가능
    if (req.user.role !== 'admin' && log.username !== req.user.username) {
      return res.status(403).send('You do not have permission to delete this log');
    }

    // S3에서 이미지 삭제
    if (log.image) {
      const s3Key = log.image.split('/').slice(-2).join('/');
      const params = {
        Bucket: 'fitconnect-images',
        Key: s3Key,
      };

      try {
        await s3.deleteObject(params).promise();
        console.log('Image deleted from S3:', log.image);
      } catch (error) {
        console.error('Error deleting image from S3:', error); // 디버깅 메시지 추가
      }
    }

    // MongoDB에서 로그 삭제
    try {
      await log.deleteOne();
      console.log('Workout log deleted from database:', log._id);
    } catch (error) {
      console.error('Error deleting workout log from database:', error);
      return res.status(500).send('Error deleting workout log');
    }

    // 이전 페이지 확인 후 리다이렉트
    const referer = req.headers.referer;
    if (referer && referer.includes('/home/mypage')) {
      return res.redirect('/home/mypage');
    }
    res.redirect('/home/workout-logs');
  } catch (error) {
    console.error('Unexpected error during workout log deletion:', error);
    res.status(500).send('Unexpected error during workout log deletion');
  }
};


// 댓글 작성 (AJAX 대응)
exports.addComment = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  try {
    const log = await WorkoutLog.findById(id);
    if (!log) return res.status(404).json({ error: 'Workout log not found' });

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

// 댓글 수정 (AJAX 대응)
exports.editComment = async (req, res) => {
  const { id, commentId } = req.params;
  const { text } = req.body;

  try {
    console.log('Incoming Params:', req.params);
    console.log('Incoming Body:', req.body);

    const log = await WorkoutLog.findById(id);
    if (!log) {
      console.error('Workout log not found');
      return res.status(404).json({ error: 'Workout log not found' });
    }

    const comment = log.comments.id(commentId);
    if (!comment) {
      console.error('Comment not found');
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (req.user.role !== 'admin' && comment.userId !== req.user.userId) {
      console.error('Unauthorized access');
      return res.status(403).json({ error: 'Unauthorized' });
    }

    comment.text = text;
    comment.date = new Date();
    await log.save();

    console.log('Updated Comment:', comment);

    res.status(200).json({ success: true, comment });
  } catch (error) {
    console.error('Error editing comment:', error);
    res.status(500).json({ error: 'Error editing comment' });
  }
};

// 댓글 삭제 (AJAX 대응)
exports.deleteComment = async (req, res) => {
  const { id, commentId } = req.params;

  console.log('Delete Comment Params:', req.params);

  try {
    const log = await WorkoutLog.findById(id);
    if (!log) {
      console.error('Workout log not found');
      return res.status(404).json({ error: 'Workout log not found' });
    }

    // comments 배열에서 해당 commentId 삭제
    const commentIndex = log.comments.findIndex(
      (c) => c._id.toString() === commentId
    );
    if (commentIndex === -1) {
      console.error('Comment not found');
      return res.status(404).json({ error: 'Comment not found' });
    }

    // 배열에서 제거
    log.comments.splice(commentIndex, 1);

    await log.save(); // 변경 사항 저장

    console.log('Deleted Comment ID:', commentId);

    res.status(200).json({ success: true, commentId });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Error deleting comment' });
  }
};
