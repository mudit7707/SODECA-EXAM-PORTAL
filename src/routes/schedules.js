const express = require('express');
const { Schedule, Exam } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all schedules
router.get('/', authenticate, (req, res) => {
  try {
    let schedules = Schedule.getAll();
    
    // Students only see their assigned schedules
    if (req.user.role === 'student') {
      schedules = schedules.filter(s => 
        s.assignedStudents && s.assignedStudents.includes(req.user.id)
      );
    }
    
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get schedule by ID
router.get('/:id', authenticate, (req, res) => {
  try {
    const schedule = Schedule.getById(parseInt(req.params.id));
    
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    // Check if student is authorized to view this schedule
    if (req.user.role === 'student' && 
        schedule.assignedStudents && 
        !schedule.assignedStudents.includes(req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create schedule (admin/teacher only)
router.post('/', authenticate, authorize('admin', 'teacher'), (req, res) => {
  try {
    const { examId, startTime, endTime, assignedStudents, venue } = req.body;

    if (!examId || !startTime || !endTime) {
      return res.status(400).json({ error: 'Exam ID, start time, and end time are required' });
    }

    const exam = Exam.getById(examId);
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    // Validate time
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (start >= end) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    const newSchedule = Schedule.create({
      examId,
      examTitle: exam.title,
      startTime: start,
      endTime: end,
      assignedStudents: assignedStudents || [],
      venue: venue || 'Online',
      status: 'scheduled',
      createdBy: req.user.id
    });

    res.status(201).json(newSchedule);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update schedule (admin/teacher only)
router.put('/:id', authenticate, authorize('admin', 'teacher'), (req, res) => {
  try {
    const { startTime, endTime, assignedStudents, venue, status } = req.body;
    
    const updateData = {};
    if (startTime) updateData.startTime = new Date(startTime);
    if (endTime) updateData.endTime = new Date(endTime);
    if (assignedStudents) updateData.assignedStudents = assignedStudents;
    if (venue) updateData.venue = venue;
    if (status) updateData.status = status;

    const updatedSchedule = Schedule.update(parseInt(req.params.id), updateData);

    if (!updatedSchedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json(updatedSchedule);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete schedule (admin only)
router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  try {
    const deletedSchedule = Schedule.delete(parseInt(req.params.id));
    
    if (!deletedSchedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get schedules by exam ID
router.get('/exam/:examId', authenticate, (req, res) => {
  try {
    const schedules = Schedule.getByExamId(parseInt(req.params.examId));
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
