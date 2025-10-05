import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Learning from './pages/Learning';
import Progress from './pages/Progress';
import CreatorApply from './pages/CreatorApply';
import CreatorDashboard from './pages/CreatorDashboard';
import CreateCourse from './pages/CreateCourse';
import EditCourse from './pages/EditCourse';
import CourseLessons from './pages/CourseLessons';
import AdminReview from './pages/AdminReview';
import AdminDashboard from './pages/AdminDashboard';
import Certificate from './pages/Certificate';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminReviewCreators from './pages/AdminReviewCreators';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-300">
            <Navbar />
            <Toaster position="top-right" />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/certificate/:courseId" element={<Certificate />} />
            
            {/* Protected Routes */}
            <Route path="/learn/:lessonId" element={
              <ProtectedRoute>
                <Learning />
              </ProtectedRoute>
            } />
            <Route path="/progress" element={
              <ProtectedRoute>
                <Progress />
              </ProtectedRoute>
            } />
            
            {/* Creator Routes */}
            <Route path="/creator/apply" element={
              <ProtectedRoute allowedRoles={['learner']}>
                <CreatorApply />
              </ProtectedRoute>
            } />
            <Route path="/creator/dashboard" element={
              <ProtectedRoute allowedRoles={['creator', 'admin']}>
                <CreatorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/creator/courses/new" element={
              <ProtectedRoute allowedRoles={['creator', 'admin']}>
                <CreateCourse />
              </ProtectedRoute>
            } />
            <Route path="/creator/courses/:id/edit" element={
              <ProtectedRoute allowedRoles={['creator', 'admin']}>
                <EditCourse />
              </ProtectedRoute>
            } />
            <Route path="/creator/courses/:id/lessons" element={
              <ProtectedRoute allowedRoles={['creator', 'admin']}>
                <CourseLessons />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/review/courses" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminReview />
              </ProtectedRoute>
            } />
            <Route path="/admin/review-creators" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminReviewCreators />
              </ProtectedRoute>
            } />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
