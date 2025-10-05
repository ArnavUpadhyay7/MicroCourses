import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, Users, BookOpen, Play } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const CreatorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/creator/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    const confirmed = await new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      modal.innerHTML = `
        <div class="bg-white dark:bg-dark-800 rounded-lg p-6 max-w-md w-full mx-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Delete Course</h3>
          <p class="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to delete this course? This action cannot be undone.</p>
          <div class="flex justify-end space-x-2">
            <button id="cancel" class="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">Cancel</button>
            <button id="confirm" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      const cancelBtn = modal.querySelector('#cancel');
      const confirmBtn = modal.querySelector('#confirm');
      
      cancelBtn.onclick = () => {
        document.body.removeChild(modal);
        resolve(false);
      };
      
      confirmBtn.onclick = () => {
        document.body.removeChild(modal);
        resolve(true);
      };
    });
    
    if (confirmed) {
      try {
        await api.delete(`/creator/courses/${courseId}`);
        toast.success('Course deleted successfully');
        fetchDashboardData();
      } catch (error) {
        toast.error('Failed to delete course');
        console.error('Error deleting course:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Creator Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Manage your courses and track performance</p>
            </div>
            <Link
              to="/creator/courses/new"
              className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6 transition-colors duration-300">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData?.stats.totalCourses || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6 transition-colors duration-300">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Published</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData?.stats.publishedCourses || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6 transition-colors duration-300">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Students</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData?.stats.totalStudents || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6 transition-colors duration-300">
            <div className="flex items-center">
              <Edit className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData?.stats.pendingCourses || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Courses */}
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm transition-colors duration-300">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-600">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Courses</h2>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-dark-600">
            {dashboardData?.courses?.map((course) => (
              <div key={course._id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={course.thumbnail || '/api/placeholder/100/60'}
                      alt={course.title}
                      className="w-16 h-12 object-cover rounded mr-4"
                    />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{course.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{course.description}</p>
                      <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          course.status === 'draft' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                          course.status === 'pending' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                          course.status === 'published' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                          'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        }`}>
                          {course.status?.charAt(0).toUpperCase() + course.status?.slice(1)}
                        </span>
                        <span>{course.enrolledStudents.length} students</span>
                        <span>{course.totalLessons} lessons</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* <Link
                      to={`/courses/${course._id}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-2 transition-colors"
                      title="View Course"
                    >
                      <Eye className="h-4 w-4" />
                    </Link> */}
                    <Link
                      to={`/creator/courses/${course._id}/lessons`}
                      className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 p-2 transition-colors"
                      title="Manage Lessons"
                    >
                      <Play className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/creator/courses/${course._id}/edit`}
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-2 transition-colors"
                      title="Edit Course"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteCourse(course._id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-2 transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;
