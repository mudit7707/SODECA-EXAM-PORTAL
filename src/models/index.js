// In-memory database simulation
const users = [
  {
    id: 1,
    username: 'admin',
    password: '$2b$10$rZ5qZ8qZ8qZ8qZ8qZ8qZ8.', // 'admin123'
    role: 'admin',
    email: 'admin@sodeca.com'
  },
  {
    id: 2,
    username: 'teacher1',
    password: '$2b$10$rZ5qZ8qZ8qZ8qZ8qZ8qZ8.', // 'teacher123'
    role: 'teacher',
    email: 'teacher1@sodeca.com'
  },
  {
    id: 3,
    username: 'student1',
    password: '$2b$10$rZ5qZ8qZ8qZ8qZ8qZ8qZ8.', // 'student123'
    role: 'student',
    email: 'student1@sodeca.com'
  }
];

const exams = [];
const schedules = [];
const results = [];

// User model
class User {
  static getAll() {
    return users;
  }

  static getById(id) {
    return users.find(u => u.id === id);
  }

  static getByUsername(username) {
    return users.find(u => u.username === username);
  }

  static create(userData) {
    const newUser = {
      id: users.length + 1,
      ...userData
    };
    users.push(newUser);
    return newUser;
  }
}

// Exam model
class Exam {
  static getAll() {
    return exams;
  }

  static getById(id) {
    return exams.find(e => e.id === id);
  }

  static create(examData) {
    const newExam = {
      id: exams.length + 1,
      createdAt: new Date(),
      ...examData
    };
    exams.push(newExam);
    return newExam;
  }

  static update(id, examData) {
    const index = exams.findIndex(e => e.id === id);
    if (index !== -1) {
      exams[index] = { ...exams[index], ...examData };
      return exams[index];
    }
    return null;
  }

  static delete(id) {
    const index = exams.findIndex(e => e.id === id);
    if (index !== -1) {
      return exams.splice(index, 1)[0];
    }
    return null;
  }
}

// Schedule model
class Schedule {
  static getAll() {
    return schedules;
  }

  static getById(id) {
    return schedules.find(s => s.id === id);
  }

  static getByExamId(examId) {
    return schedules.filter(s => s.examId === examId);
  }

  static create(scheduleData) {
    const newSchedule = {
      id: schedules.length + 1,
      createdAt: new Date(),
      ...scheduleData
    };
    schedules.push(newSchedule);
    return newSchedule;
  }

  static update(id, scheduleData) {
    const index = schedules.findIndex(s => s.id === id);
    if (index !== -1) {
      schedules[index] = { ...schedules[index], ...scheduleData };
      return schedules[index];
    }
    return null;
  }

  static delete(id) {
    const index = schedules.findIndex(s => s.id === id);
    if (index !== -1) {
      return schedules.splice(index, 1)[0];
    }
    return null;
  }
}

// Result model
class Result {
  static getAll() {
    return results;
  }

  static getById(id) {
    return results.find(r => r.id === id);
  }

  static getByStudentId(studentId) {
    return results.filter(r => r.studentId === studentId);
  }

  static getByExamId(examId) {
    return results.filter(r => r.examId === examId);
  }

  static create(resultData) {
    const newResult = {
      id: results.length + 1,
      createdAt: new Date(),
      ...resultData
    };
    results.push(newResult);
    return newResult;
  }
}

module.exports = {
  User,
  Exam,
  Schedule,
  Result
};
