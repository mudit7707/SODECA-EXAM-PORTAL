// API Base URL
const API_URL = '/api';

// State management
let currentUser = null;
let authToken = null;

// DOM Elements
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const userName = document.getElementById('user-name');
const userRole = document.getElementById('user-role');
const analyticsSection = document.getElementById('analytics-section');
const createScheduleBtn = document.getElementById('create-schedule-btn');
const scheduleModal = document.getElementById('schedule-modal');
const scheduleForm = document.getElementById('schedule-form');
const studentPerformance = document.getElementById('student-performance');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    
    if (createScheduleBtn) {
        createScheduleBtn.addEventListener('click', showScheduleModal);
    }
    
    if (scheduleForm) {
        scheduleForm.addEventListener('submit', handleCreateSchedule);
    }

    // Close modal
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            scheduleModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === scheduleModal) {
            scheduleModal.style.display = 'none';
        }
    });
}

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');

    if (token && user) {
        authToken = token;
        currentUser = JSON.parse(user);
        showDashboard();
    } else {
        showLogin();
    }
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();
        authToken = data.token;
        currentUser = data.user;

        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        showDashboard();
    } catch (error) {
        alert('Login failed. Please check your credentials.');
    }
}

// Handle logout
function handleLogout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    showLogin();
}

// Show login section
function showLogin() {
    loginSection.style.display = 'block';
    dashboardSection.style.display = 'none';
}

// Show dashboard
function showDashboard() {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    
    userName.textContent = currentUser.username;
    userRole.textContent = currentUser.role;

    // Show/hide sections based on role
    if (currentUser.role === 'admin' || currentUser.role === 'teacher') {
        analyticsSection.style.display = 'block';
        createScheduleBtn.style.display = 'inline-block';
        loadAnalytics();
    } else {
        studentPerformance.style.display = 'block';
        loadStudentPerformance();
    }

    loadSchedules();
}

// Load analytics (admin/teacher only)
async function loadAnalytics() {
    try {
        const response = await fetch(`${API_URL}/analytics/dashboard`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) throw new Error('Failed to load analytics');

        const data = await response.json();

        document.getElementById('total-exams').textContent = data.totalExams;
        document.getElementById('total-schedules').textContent = data.totalSchedules;
        document.getElementById('total-students').textContent = data.totalStudents;
        document.getElementById('average-score').textContent = data.averageScore + '%';
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

// Load schedules
async function loadSchedules() {
    try {
        const response = await fetch(`${API_URL}/schedules`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) throw new Error('Failed to load schedules');

        const schedules = await response.json();
        displaySchedules(schedules);
    } catch (error) {
        console.error('Error loading schedules:', error);
        document.getElementById('schedules-list').innerHTML = 
            '<p class="error">Failed to load schedules</p>';
    }
}

// Display schedules
function displaySchedules(schedules) {
    const schedulesList = document.getElementById('schedules-list');
    
    if (schedules.length === 0) {
        schedulesList.innerHTML = '<div class="empty-state"><p>No schedules available</p></div>';
        return;
    }

    schedulesList.innerHTML = schedules.map(schedule => {
        const startTime = new Date(schedule.startTime).toLocaleString();
        const endTime = new Date(schedule.endTime).toLocaleString();
        
        return `
            <div class="schedule-item">
                <h3>${schedule.examTitle || 'Exam #' + schedule.examId}</h3>
                <p><strong>Start:</strong> ${startTime}</p>
                <p><strong>End:</strong> ${endTime}</p>
                <p><strong>Venue:</strong> ${schedule.venue}</p>
                <span class="schedule-status status-${schedule.status}">${schedule.status}</span>
            </div>
        `;
    }).join('');
}

// Load student performance
async function loadStudentPerformance() {
    try {
        const response = await fetch(`${API_URL}/analytics/student`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) throw new Error('Failed to load performance');

        const data = await response.json();
        displayStudentPerformance(data);
    } catch (error) {
        console.error('Error loading performance:', error);
    }
}

// Display student performance
function displayStudentPerformance(data) {
    const performanceStats = document.getElementById('performance-stats');
    
    performanceStats.innerHTML = `
        <div class="performance-stat">
            <h4>Total Exams Taken</h4>
            <p>${data.totalExamsTaken}</p>
        </div>
        <div class="performance-stat">
            <h4>Average Score</h4>
            <p>${data.averageScore}%</p>
        </div>
        ${data.examResults.length > 0 ? `
            <div class="performance-stat">
                <h4>Recent Results</h4>
                ${data.examResults.map(result => `
                    <p>
                        <strong>${result.examTitle}:</strong> ${result.score}% - 
                        <span class="${result.status === 'Passed' ? 'success' : 'error'}">
                            ${result.status}
                        </span>
                    </p>
                `).join('')}
            </div>
        ` : '<p class="empty-state">No exam results yet</p>'}
    `;
}

// Show schedule modal
function showScheduleModal() {
    scheduleModal.style.display = 'block';
}

// Handle create schedule
async function handleCreateSchedule(e) {
    e.preventDefault();
    
    const examId = parseInt(document.getElementById('exam-id').value);
    const startTime = document.getElementById('start-time').value;
    const endTime = document.getElementById('end-time').value;
    const venue = document.getElementById('venue').value;

    try {
        const response = await fetch(`${API_URL}/schedules`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                examId,
                startTime,
                endTime,
                venue
            })
        });

        if (!response.ok) throw new Error('Failed to create schedule');

        scheduleModal.style.display = 'none';
        scheduleForm.reset();
        loadSchedules();
        alert('Schedule created successfully!');
    } catch (error) {
        alert('Error creating schedule: ' + error.message);
    }
}

// Real-time analytics update (polling every 30 seconds)
setInterval(() => {
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'teacher')) {
        loadAnalytics();
    }
}, 30000);
