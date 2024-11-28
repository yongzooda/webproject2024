//dietLogController.js

const DietLog = require('../models/DietLog');

// 식단 일지 작성 페이지 렌더링
exports.getAddDietLogPage = (req, res) => {
  res.render('add-diet-log', {
    user: req.user, // 사용자 정보 전달
    title: 'Add Diet Log', // 페이지 제목
    currentPage: 'Add my diet log', // 현재 페이지 이름
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
    });
  } catch (error) {
    console.error('Error fetching diet logs:', error);
    res.status(500).send('Error fetching diet logs');
  }
};

// 식단 일지 추가 처리
exports.addDietLog = async (req, res) => {
  const { foodName, calories, nutrition, mealTime, description } = req.body;
  const image = req.file ? req.file.filename : null;

  try {
    const newLog = await DietLog.create({
      username: req.user.username, // JWT에서 가져온 사용자명
      title: `${req.user.username}'s Meal`, // 자동 생성된 제목
      foodName,
      calories,
      nutrition,
      mealTime: new Date(mealTime), // 문자열을 Date 객체로 변환
      description,
      image,
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
  const { foodName, calories, nutrition, mealTime, description } = req.body;
  const image = req.file ? req.file.filename : null;

  try {
    const log = await DietLog.findById(id);
    if (!log) {
      return res.status(404).send('Diet log not found');
    }

    // 관리자 또는 작성자만 수정 가능
    if (req.user.role !== 'admin' && log.username !== req.user.username) {
      return res
        .status(403)
        .send('You do not have permission to edit this log');
    }

    // 업데이트
    log.foodName = foodName;
    log.calories = calories;
    log.nutrition = nutrition;
    log.mealTime = new Date(mealTime);
    log.description = description;
    if (image) {
      log.image = image;
    }

    await log.save();
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
    if (req.user.role !== 'admin' && log.username !== req.user.username) {
      return res
        .status(403)
        .send('You do not have permission to edit this log');
    }

    res.render('edit-diet-log', {
      log, // 수정할 데이터 전달
      user: req.user, // 사용자 정보 전달
      title: 'Edit Diet Log', // 페이지 제목
      currentPage: 'Edit Diet Log', // 현재 페이지 이름
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
    const log = await DietLog.findById(id);
    if (!log) {
      return res.status(404).send('Diet log not found');
    }

    // 관리자 또는 게시물 작성자만 삭제 가능
    if (req.user.role !== 'admin' && log.username !== req.user.username) {
      return res
        .status(403)
        .send('You do not have permission to delete this log');
    }

    await log.deleteOne(); // MongoDB에서 해당 식단 일지 삭제
    res.redirect('/home/diet-logs');
  } catch (error) {
    console.error('Error deleting diet log:', error);
    res.status(500).send('Error deleting diet log');
  }
};

// 댓글 추가, 수정, 삭제 (운동일지와 동일한 로직 사용)
exports.addComment = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  try {
    const log = await DietLog.findById(id);
    if (!log) return res.status(404).json({ error: 'Diet log not found' });

    const newComment = { username: req.user.username, text, date: new Date() };
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

    if (req.user.role !== 'admin' && comment.username !== req.user.username) {
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
      log.comments[commentIndex].username !== req.user.username
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
