import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, Users, Star, Play, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  // Check if user has any enrollments (for helpful messaging)
  const checkUserEnrollments = async () => {
    if (!user) return;
    
    try {
      const response = await api.get('/enrollments');
      if (response.data.enrollments && response.data.enrollments.length > 0) {
        console.log('User has enrollments in other courses:', response.data.enrollments.length);
      }
    } catch (error) {
      console.log('Could not fetch user enrollments:', error);
    }
  };

  useEffect(() => {
    checkUserEnrollments();
  }, [user]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/courses/${id}`);
      setCourse(response.data.course);
      setEnrollment(response.data.enrollment);
      
      if (response.data.enrollment) {
        toast.success('You are enrolled in this course! You can access all lessons.');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('Course not found. You might be looking for a different course.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to load course details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setEnrolling(true);
      const response = await api.post(`/courses/${id}/enroll`);
      
      // Successfully setting enrollment state due to the backend fix (200/201 status)
      setEnrollment(response.data.enrollment); 

      if (response.data.message.includes('Already enrolled')) {
         toast.success("You are already enrolled. Content unlocked!");
      } else {
         toast.success('Successfully enrolled in course!');
      }

    } catch (error) {
      // Only generic enrollment failure should reach here 
      toast.error(error.response?.data?.message || 'Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  const startLearning = () => {
    if (!enrollment || !course?.lessons || course.lessons.length === 0) {
      toast.error('No lessons available or you are not enrolled.');
      return;
    }

    // Navigates to the first lesson, used by the main sidebar button
    const firstLesson = course.lessons[0];
    navigate(`/learn/${firstLesson._id}`);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Course not found</h2>
          <p className="text-gray-600 dark:text-gray-300">The course you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6 mb-6 transition-colors duration-300">
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{course.title}</h1>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{course.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {course.enrolledStudents?.length || 0} students
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDuration(course.duration)}
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                  {course.rating?.toFixed(1) || '0.0'} ({course.totalRatings || 0} ratings)
                </div>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded text-xs font-medium">
                  {course.category}
                </span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-gray-300 rounded text-xs font-medium capitalize">
                  {course.level}
                </span>
              </div>
            </div>

            {/* Learning Section for Enrolled Users */}
            {enrollment && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 mb-6 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      ✅ You're Enrolled! Ready to Learn?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Great! You have full access to all video lessons in this course. Click below to start or continue your learning journey.
                    </p>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={startLearning}
                        className="bg-green-600 dark:bg-green-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                      >
                        {enrollment.progress === 0 ? 'Start Learning' : 'Continue Learning'}
                      </button>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        Progress: {enrollment.progress}% Complete
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-green-700 dark:text-green-300">
                      💡 You can also click on any individual lesson below to jump directly to it!
                    </div>
                  </div>
                  <div className="text-4xl">🎓</div>
                </div>
              </div>
            )}

            {/* Course Content */}
            <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6 transition-colors duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Course Content</h2>
                {enrollment && (
                  <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                    ✓ Enrolled
                  </div>
                )}
              </div>
              
              {enrollment && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <div className="text-green-600 dark:text-green-400 mr-3">🎯</div>
                    <div>
                      <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                        ✅ You're enrolled! All lessons are unlocked. Click on any lesson below to start learning.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                {course.lessons?.map((lesson, index) => {
                  const isCompleted = enrollment?.completedLessons?.some((completed) => {
                    const id = completed?._id || completed?.lesson || completed; 
                    return String(id) === String(lesson._id);
                  });

                  // Define the static content of the lesson row
                  const LessonRowContent = (
                    // The content itself should not have the hover effect, the Link wrapper will.
                    <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-dark-600 rounded-lg transition-colors">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-dark-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{lesson.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{formatDuration(lesson.duration)}</p>
                          {/* This text is now part of the link/row */}
                          {enrollment && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">✅ Click to start lesson</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {isCompleted ? (
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span className="text-xs text-green-600 dark:text-green-400 font-medium">Completed</span>
                          </div>
                        ) : enrollment ? (
                          // FIX: This entire block is now just visual indicator inside the Link
                          <span className="text-green-600 dark:text-green-400 flex items-center space-x-1 text-xs font-medium">
                            <Play className="h-5 w-5" />
                            <span>Start</span>
                          </span>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">Locked</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );

                  if (enrollment) {
                    // Make the entire row clickable via onClick to navigate
                    return (
                      <div
                        key={lesson._id}
                        onClick={() => navigate(`/learn/${lesson._id}`)}
                        role="button"
                        className="block cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-700 rounded-lg"
                      >
                        {LessonRowContent}
                      </div>
                    );
                  }

                  // If not enrolled, show the static, disabled look
                  return (
                    <div key={lesson._id} className="opacity-60 cursor-not-allowed">
                      {LessonRowContent}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6 sticky top-8 transition-colors duration-300">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  ${course.price || 0}
                </div>
                <p className="text-gray-600 dark:text-gray-300">One-time payment</p>
              </div>

              {enrollment ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">Progress</div>
                    <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2 mb-2">
                      <div
                        className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${enrollment.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {enrollment.progress}% Complete
                    </div>
                  </div>

                  <button
                    onClick={startLearning}
                    className="w-full bg-blue-600 dark:bg-blue-700 text-white py-3 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                  >
                    {enrollment.progress === 0 ? 'Start Learning' : 'Continue Learning'}
                  </button>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      Or click on any lesson below to start learning
                    </p>
                  </div>

                  {enrollment.isCompleted && (
                    <button
                      onClick={() => navigate(`/certificate/${course._id}`)}
                      className="w-full bg-green-600 dark:bg-green-700 text-white py-3 rounded-lg font-medium hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                    >
                      View Certificate
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {!user ? (
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full bg-blue-600 dark:bg-blue-700 text-white py-3 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                    >
                      Login to Enroll
                    </button>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="w-full bg-blue-600 dark:bg-blue-700 text-white py-3 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {enrolling ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                  )}
                  
                  <div className="text-center text-sm text-gray-600 dark:text-gray-300">
                    <p>✓ Lifetime access</p>
                    <p>✓ Certificate of completion</p>
                    <p>✓ Auto-generated transcripts</p>
                  </div>
                </div>
              )}

              {/* Instructor Info */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-600">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Instructor</h3>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-dark-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {course.creator?.name?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{course.creator?.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{course.creator?.email}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;