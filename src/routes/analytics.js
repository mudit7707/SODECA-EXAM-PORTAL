const express = require('express');
const { Result, Exam, Schedule, User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get dashboard analytics (admin/teacher only)
router.get('/dashboard', authenticate, authorize('admin', 'teacher'), (req, res) => {
  try {
    const exams = Exam.getAll();
    const schedules = Schedule.getAll();
    const results = Result.getAll();
    const users = User.getAll();

    const analytics = {
      totalExams: exams.length,
      totalSchedules: schedules.length,
      totalStudents: users.filter(u => u.role === 'student').length,
      totalTeachers: users.filter(u => u.role === 'teacher').length,
      completedExams: results.length,
      upcomingSchedules: schedules.filter(s => 
        new Date(s.startTime) > new Date() && s.status === 'scheduled'
      ).length,
      inProgressSchedules: schedules.filter(s => {
        const now = new Date();
        return new Date(s.startTime) <= now && 
               new Date(s.endTime) >= now && 
               s.status === 'scheduled';
      }).length,
      averageScore: results.length > 0 
        ? (results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(2)
        : 0
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get exam-specific analytics
router.get('/exam/:examId', authenticate, authorize('admin', 'teacher'), (req, res) => {
  try {
    const examId = parseInt(req.params.examId);
    const exam = Exam.getById(examId);

    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    const results = Result.getByExamId(examId);
    const schedules = Schedule.getByExamId(examId);

    const analytics = {
      examTitle: exam.title,
      totalAttempts: results.length,
      averageScore: results.length > 0 
        ? (results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(2)
        : 0,
      highestScore: results.length > 0 
        ? Math.max(...results.map(r => r.score))
        : 0,
      lowestScore: results.length > 0 
        ? Math.min(...results.map(r => r.score))
        : 0,
      passedCount: results.filter(r => r.score >= exam.passingScore).length,
      failedCount: results.filter(r => r.score < exam.passingScore).length,
      scheduledCount: schedules.length
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get student performance (students can view their own, admin/teachers can view all)
router.get('/student/:studentId', authenticate, (req, res) => {
  try {
    let studentId = parseInt(req.params.studentId);

    // Students can only view their own results
    if (req.user.role === 'student' && studentId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const results = Result.getByStudentId(studentId);
    const student = User.getById(studentId);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const performance = {
      studentName: student.username,
      totalExamsTaken: results.length,
      averageScore: results.length > 0 
        ? (results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(2)
        : 0,
      examResults: results.map(r => {
        const exam = Exam.getById(r.examId);
        return {
          examTitle: exam ? exam.title : 'Unknown',
          score: r.score,
          status: exam && r.score >= exam.passingScore ? 'Passed' : 'Failed',
          completedAt: r.createdAt
        };
      })
    };

    res.json(performance);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current student's own performance
router.get('/student', authenticate, (req, res) => {
  try {
    const studentId = req.user.id;
    const results = Result.getByStudentId(studentId);
    const student = User.getById(studentId);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const performance = {
      studentName: student.username,
      totalExamsTaken: results.length,
      averageScore: results.length > 0 
        ? (results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(2)
        : 0,
      examResults: results.map(r => {
        const exam = Exam.getById(r.examId);
        return {
          examTitle: exam ? exam.title : 'Unknown',
          score: r.score,
          status: exam && r.score >= exam.passingScore ? 'Passed' : 'Failed',
          completedAt: r.createdAt
        };
      })
    };

    res.json(performance);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit exam result
router.post('/submit', authenticate, (req, res) => {
  try {
    const { examId, answers, timeSpent } = req.body;

    if (!examId || !answers) {
      return res.status(400).json({ error: 'Exam ID and answers are required' });
    }

    const exam = Exam.getById(examId);
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    // Calculate score (simplified - in real app, compare with correct answers)
    let score = 0;
    if (exam.questions && exam.questions.length > 0) {
      const correctAnswers = answers.filter((ans, idx) => 
        exam.questions[idx] && exam.questions[idx].correctAnswer === ans
      ).length;
      score = (correctAnswers / exam.questions.length) * 100;
    }

    const result = Result.create({
      examId,
      studentId: req.user.id,
      score: Math.round(score),
      answers,
      timeSpent,
      submittedAt: new Date()
    });

    res.status(201).json({
      ...result,
      passed: score >= exam.passingScore
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
