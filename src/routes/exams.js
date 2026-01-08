const express = require('express');
const { Exam } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all exams
router.get('/', authenticate, (req, res) => {
  try {
    const exams = Exam.getAll();
    res.json(exams);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get exam by ID
router.get('/:id', authenticate, (req, res) => {
  try {
    const exam = Exam.getById(parseInt(req.params.id));
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }
    res.json(exam);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create exam (admin/teacher only)
router.post('/', authenticate, authorize('admin', 'teacher'), (req, res) => {
  try {
    const { title, description, duration, questions, passingScore } = req.body;

    if (!title || !duration) {
      return res.status(400).json({ error: 'Title and duration are required' });
    }

    const newExam = Exam.create({
      title,
      description,
      duration, // in minutes
      questions: questions || [],
      passingScore: passingScore || 60,
      createdBy: req.user.id
    });

    res.status(201).json(newExam);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update exam (admin/teacher only)
router.put('/:id', authenticate, authorize('admin', 'teacher'), (req, res) => {
  try {
    const { title, description, duration, questions, passingScore } = req.body;
    
    const updatedExam = Exam.update(parseInt(req.params.id), {
      title,
      description,
      duration,
      questions,
      passingScore
    });

    if (!updatedExam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    res.json(updatedExam);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete exam (admin only)
router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  try {
    const deletedExam = Exam.delete(parseInt(req.params.id));
    
    if (!deletedExam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
