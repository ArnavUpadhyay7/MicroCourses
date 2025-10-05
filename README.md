# MicroCourses - Mini LMS Platform

A complete Learning Management System (LMS) built with React, Node.js, and MongoDB. This platform allows creators to upload courses, admins to review them, and learners to enroll and track their progress with auto-generated transcripts and certificates.

## 🚀 Features

### For Learners
- Browse and search published courses
- Enroll in courses and track progress
- Watch video lessons with auto-generated transcripts
- Receive certificates upon course completion
- View learning progress dashboard

### For Creators
- Apply to become a course creator
- Create and manage courses with lessons
- Upload video content with automatic transcript generation
- Track student enrollment and course performance
- Submit courses for admin review

### For Admins
- Review and approve creator applications
- Review and approve courses for publication
- Monitor platform statistics and user activity
- Manage course content and user roles

## 🛠️ Tech Stack

### Frontend
- React 19.1.1
- React Router DOM
- Tailwind CSS 4.1.14
- Axios for API calls
- Lucide React for icons
- React Hot Toast for notifications

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- Multer for file uploads
- Hugging Face API for free transcript generation

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Navigate to the project directory
cd /home/arnav/Desktop/Hackathon

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Environment Setup

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/microcourses
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
HUGGINGFACE_API_KEY=your-huggingface-api-key-here
WHISPER_SECRET_KEY=your-webhook-secret-key-here
CLIENT_URL=http://localhost:3000
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# For Ubuntu/Debian
sudo systemctl start mongod

# For macOS with Homebrew
brew services start mongodb-community

# For Windows
net start MongoDB
```

### 4. Start the Application

```bash
# Terminal 1 - Start Backend Server
cd server
npm start

# Terminal 2 - Start Frontend Server
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📁 Project Structure

```
Hackathon/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts (Auth)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── App.jsx         # Main app component
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── services/           # Business logic services
│   └── index.js            # Server entry point
└── README.md
```

## 🔑 Key Features Implementation

### Authentication System
- JWT-based authentication
- Role-based access control (Learner, Creator, Admin)
- Protected routes and middleware

### Course Management
- Course CRUD operations
- Lesson management with unique ordering
- Video upload and streaming
- Course status workflow (Draft → Pending → Published)

### Auto-Transcript Generation
- Free transcript generation using Hugging Face API
- Webhook support for asynchronous processing
- Fallback mock transcripts for demo purposes

### Certificate System
- Automatic certificate generation upon course completion
- Unique serial number with SHA-256 hash
- Certificate verification system
- PDF generation ready (frontend implementation)

### Progress Tracking
- Real-time progress calculation
- Lesson completion tracking
- Course completion detection
- Enrollment management

## 🎯 User Flows

### Creator Application Flow
1. User registers as learner
2. Applies to become creator via `/creator/apply`
3. Admin reviews application in `/admin/review/courses`
4. Upon approval, user gains creator access

### Course Creation Flow
1. Creator creates course via `/creator/dashboard`
2. Adds lessons with video content
3. Submits course for review
4. Admin reviews and approves/rejects
5. Course becomes visible to learners

### Learning Flow
1. Learner browses courses at `/courses`
2. Enrolls in course
3. Watches lessons at `/learn/:lessonId`
4. Progress is tracked automatically
5. Receives certificate upon 100% completion

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Creator Routes
- `POST /api/creator/apply` - Apply to become creator
- `GET /api/creator/dashboard` - Creator dashboard data
- `POST /api/creator/courses` - Create course
- `PUT /api/creator/courses/:id` - Update course
- `DELETE /api/creator/courses/:id` - Delete course
- `POST /api/creator/courses/:id/lessons` - Add lesson
- `PUT /api/creator/lessons/:id` - Update lesson
- `DELETE /api/creator/lessons/:id` - Delete lesson

### Admin Routes
- `GET /api/admin/applications` - Get creator applications
- `PUT /api/admin/applications/:userId` - Approve/reject application
- `GET /api/admin/courses/pending` - Get pending courses
- `PUT /api/admin/courses/:id/review` - Review course
- `GET /api/admin/dashboard` - Admin dashboard stats

### Course Routes
- `GET /api/courses` - Get published courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses/:id/enroll` - Enroll in course
- `GET /api/courses/:courseId/lessons/:lessonId` - Get lesson
- `POST /api/courses/:courseId/lessons/:lessonId/complete` - Complete lesson
- `GET /api/courses/:id/progress` - Get user progress
- `GET /api/courses/user/enrolled` - Get user's enrolled courses
- `GET /api/courses/:courseId/certificate` - Get certificate

## 🎨 UI/UX Features

- Clean, professional design with Tailwind CSS
- Responsive layout for all devices
- Intuitive navigation with role-based menus
- Loading states and error handling
- Toast notifications for user feedback
- Modern card-based layouts
- Progress indicators and status badges

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## 🚀 Deployment Ready

The application is production-ready with:
- Environment configuration
- Error handling
- Logging
- Database connection management
- CORS setup
- Security middleware

## 📝 Notes

- Transcript generation uses Hugging Face API (free tier)
- Certificate generation includes unique serial numbers
- All course content is protected by enrollment status
- Admin approval required for course publication
- Progress tracking is automatic and real-time

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for the Hackathon**
