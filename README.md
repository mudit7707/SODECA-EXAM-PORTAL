# SODECA EXAM PORTAL

The Sodeca Exam Portal is a comprehensive online examination system built to streamline exam management and delivery. This client-focused project features exam scheduling, timer management, secure role-based authentication, and real-time analytics.

## 🎯 Features

### Core Functionality
- **Exam Scheduling Module**: Create and manage exam schedules with flexible timing and venue options
- **Timer Module**: Robust exam duration tracking with pause/resume capabilities
- **Role-Based Authentication**: Secure JWT-based authentication for Admin, Teacher, and Student roles
- **Responsive Design**: Mobile-first UI that works across all devices
- **Real-Time Analytics**: Live dashboard with exam statistics and performance metrics

### User Roles

#### Admin
- Full system access
- Manage exams, schedules, and users
- View comprehensive analytics dashboard
- Delete schedules and exams

#### Teacher
- Create and manage exams
- Schedule exams for students
- View analytics and student performance
- Update exam schedules

#### Student
- View assigned exam schedules
- Take exams with timer functionality
- Track personal performance and results
- Access exam history

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mudit7707/SODECA-EXAM-PORTAL.git
cd SODECA-EXAM-PORTAL
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
SODECA-EXAM-PORTAL/
├── src/
│   ├── models/          # Data models (User, Exam, Schedule, Result)
│   ├── routes/          # API endpoints
│   │   ├── auth.js      # Authentication routes
│   │   ├── exams.js     # Exam management
│   │   ├── schedules.js # Scheduling module
│   │   └── analytics.js # Analytics and reporting
│   ├── middleware/      # Authentication & authorization
│   ├── controllers/     # Business logic
│   ├── utils/          # Utility functions (Timer)
│   └── server.js       # Main application server
├── public/
│   ├── css/            # Stylesheets
│   └── js/             # Frontend JavaScript
├── views/
│   └── index.html      # Main UI
├── package.json
└── README.md
```

## 🔐 Demo Credentials

### Admin Access
- Username: `admin`
- Password: `admin123`

### Teacher Access
- Username: `teacher1`
- Password: `teacher123`

### Student Access
- Username: `student1`
- Password: `student123`

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Exams
- `GET /api/exams` - List all exams
- `GET /api/exams/:id` - Get exam details
- `POST /api/exams` - Create exam (Admin/Teacher)
- `PUT /api/exams/:id` - Update exam (Admin/Teacher)
- `DELETE /api/exams/:id` - Delete exam (Admin)

### Schedules
- `GET /api/schedules` - List schedules
- `GET /api/schedules/:id` - Get schedule details
- `POST /api/schedules` - Create schedule (Admin/Teacher)
- `PUT /api/schedules/:id` - Update schedule (Admin/Teacher)
- `DELETE /api/schedules/:id` - Delete schedule (Admin)
- `GET /api/schedules/exam/:examId` - Get schedules by exam

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics (Admin/Teacher)
- `GET /api/analytics/exam/:examId` - Exam-specific analytics (Admin/Teacher)
- `GET /api/analytics/student/:studentId?` - Student performance
- `POST /api/analytics/submit` - Submit exam results

## 🔒 Security Features

- JWT-based authentication with token expiration
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Secure API endpoints with middleware protection
- Input validation and sanitization

## 📊 Real-Time Analytics

The system provides real-time analytics including:
- Total exams and schedules
- Student enrollment statistics
- Average scores and performance metrics
- Pass/fail ratios
- Individual student performance tracking

Analytics are automatically refreshed every 30 seconds for admin and teacher dashboards.

## 🎨 Responsive Design

The UI is built with mobile-first principles ensuring:
- Seamless experience across desktop, tablet, and mobile devices
- Adaptive layouts using CSS Grid and Flexbox
- Touch-friendly interfaces
- Optimized performance for all screen sizes

## 🧪 Testing

Integration testing was conducted to ensure:
- API endpoint functionality
- Authentication and authorization flows
- Data integrity and validation
- Timer accuracy and reliability
- Cross-browser compatibility

## 🤝 Development Approach

This project was developed using:
- **Agile Methodology**: Iterative development with regular sprints
- **Version Control**: Git/GitHub for collaboration
- **Code Reviews**: Peer reviews for quality assurance
- **Documentation**: Comprehensive API and code documentation

## 📝 License

ISC

## 👥 Contributors

Developed by a dedicated team focused on delivering a reliable, error-free examination system that meets client requirements and enhances the online examination experience.
