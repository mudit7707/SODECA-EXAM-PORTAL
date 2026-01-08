const request = require('supertest');
const app = require('../src/server');

describe('Sodeca Exam Portal API Tests', () => {
  let authToken;
  let examId;
  let scheduleId;

  // Test authentication
  describe('Authentication', () => {
    test('POST /api/auth/login - should login successfully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'admin123'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('role', 'admin');
      
      authToken = response.body.token;
    });

    test('POST /api/auth/login - should fail with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'invalid',
          password: 'wrong'
        });
      
      expect(response.status).toBe(401);
    });
  });

  // Test exams
  describe('Exams', () => {
    test('POST /api/exams - should create an exam', async () => {
      const response = await request(app)
        .post('/api/exams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Exam',
          description: 'A test examination',
          duration: 60,
          passingScore: 70
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Exam');
      
      examId = response.body.id;
    });

    test('GET /api/exams - should list all exams', async () => {
      const response = await request(app)
        .get('/api/exams')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('GET /api/exams/:id - should get exam by ID', async () => {
      const response = await request(app)
        .get(`/api/exams/${examId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(examId);
    });
  });

  // Test schedules
  describe('Schedules', () => {
    test('POST /api/schedules - should create a schedule', async () => {
      const startTime = new Date(Date.now() + 86400000); // Tomorrow
      const endTime = new Date(Date.now() + 90000000);   // Tomorrow + 1 hour
      
      const response = await request(app)
        .post('/api/schedules')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          examId: examId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          venue: 'Online'
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.examId).toBe(examId);
      
      scheduleId = response.body.id;
    });

    test('GET /api/schedules - should list all schedules', async () => {
      const response = await request(app)
        .get('/api/schedules')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('GET /api/schedules/:id - should get schedule by ID', async () => {
      const response = await request(app)
        .get(`/api/schedules/${scheduleId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(scheduleId);
    });
  });

  // Test analytics
  describe('Analytics', () => {
    test('GET /api/analytics/dashboard - should get dashboard analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalExams');
      expect(response.body).toHaveProperty('totalSchedules');
      expect(response.body).toHaveProperty('totalStudents');
    });

    test('GET /api/analytics/exam/:examId - should get exam analytics', async () => {
      const response = await request(app)
        .get(`/api/analytics/exam/${examId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('examTitle');
      expect(response.body).toHaveProperty('averageScore');
    });
  });

  // Test authorization
  describe('Authorization', () => {
    test('Should deny access without token', async () => {
      const response = await request(app)
        .get('/api/exams');
      
      expect(response.status).toBe(401);
    });

    test('Should deny access with invalid token', async () => {
      const response = await request(app)
        .get('/api/exams')
        .set('Authorization', 'Bearer invalid-token');
      
      expect(response.status).toBe(401);
    });
  });
});
