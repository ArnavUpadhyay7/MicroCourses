import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Clock, Users, Star, Play } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import InlineVideoPlayer from '../components/InlineVideoPlayer';

const AdminReview = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewCourse, setPreviewCourse] = useState({
    isOpen: false,
    course: null
  });

  useEffect(() => {
    fetchPendingCourses();
  }, []);

  const fetchPendingCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/courses/pending');
      setCourses(response.data.courses);
    } catch (error) {
      console.error('Error fetching pending courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewCourse = async (courseId, status, feedback = '') => {
    try {
      await api.put(`/admin/courses/${courseId}/review`, { status, feedback });
      toast.success(`Course ${status} successfully`);
      fetchPendingCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to review course');
    }
  };

  const handlePreviewCourse = (course) => {
    setPreviewCourse({
      isOpen: true,
      course: course
    });
  };

  const handleRejectCourse = async (courseId) => {
    const feedback = await new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      modal.innerHTML = `
        <div class="bg-white dark:bg-dark-800 rounded-lg p-6 max-w-md w-full mx-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reject Course</h3>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Feedback</label>
            <input type="text" placeholder="Please provide feedback for rejection:" 
                   class="w-full p-2 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div class="flex justify-end space-x-2">
            <button id="cancel" class="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">Cancel</button>
            <button id="confirm" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Reject</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      const inputField = modal.querySelector('input');
      const cancelBtn = modal.querySelector('#cancel');
      const confirmBtn = modal.querySelector('#confirm');
      
      cancelBtn.onclick = () => {
        document.body.removeChild(modal);
        resolve(null);
      };
      
      confirmBtn.onclick = () => {
        const feedbackValue = inputField.value.trim();
        document.body.removeChild(modal);
        resolve(feedbackValue);
      };
    });
    
    if (feedback) {
      handleReviewCourse(courseId, 'rejected', feedback);
    }
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Course Review</h1>
          <p className="text-gray-600 dark:text-gray-300">Review and approve courses submitted by creators</p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <CheckCircle className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No pending courses</h3>
            <p className="text-gray-600 dark:text-gray-300">All courses have been reviewed</p>
          </div>
        ) : (
          <div className="space-y-6">
            {courses.map((course) => (
              <div key={course._id} className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6 transition-colors duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="w-20 h-20 bg-gray-200 dark:bg-dark-700 rounded-lg flex items-center justify-center mr-4 overflow-hidden">
                      {course.thumbnail ? (
                        <img 
                          src={course.thumbnail} 
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Play className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{course.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{course.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDuration(course.duration)}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {course.lessons?.length || 0} lessons
                        </div>
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded text-xs font-medium">
                          {course.category}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-gray-300 rounded text-xs font-medium capitalize">
                          {course.level}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Created by {course.creator?.name} on {new Date(course.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePreviewCourse(course)}
                      className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </button>
                    <button
                      onClick={() => handleReviewCourse(course._id, 'approved')}
                      className="bg-green-600 dark:bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors flex items-center"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectCourse(course._id)}
                      className="bg-red-600 dark:bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors flex items-center"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Course Preview Modal */}
        {previewCourse.isOpen && previewCourse.course && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-dark-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-600">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{previewCourse.course.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Course Preview</p>
                </div>
                <button
                  onClick={() => setPreviewCourse({ isOpen: false, course: null })}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {/* Course Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Course Info */}
                  <div>
                    <div className="mb-4">
                      <img
                        src={previewCourse.course.thumbnail || '/api/placeholder/400/200'}
                        alt={previewCourse.course.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Description</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{previewCourse.course.description}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded text-xs font-medium">
                          {previewCourse.course.category}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-gray-300 rounded text-xs font-medium capitalize">
                          {previewCourse.course.level}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDuration(previewCourse.course.duration)}
                        <span className="mx-2">•</span>
                        <Users className="h-4 w-4 mr-1" />
                        {previewCourse.course.lessons?.length || 0} lessons
                      </div>
                    </div>
                  </div>

                  {/* Lessons List */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Lessons</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {previewCourse.course.lessons?.map((lesson, index) => (
                        <div key={lesson._id} className="flex items-center p-2 border border-gray-200 dark:border-dark-600 rounded-lg">
                          <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h5 className="text-sm font-medium text-gray-900 dark:text-white">{lesson.title}</h5>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{formatDuration(lesson.duration)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 p-4 border-t border-gray-200 dark:border-dark-600">
                <button
                  onClick={() => setPreviewCourse({ isOpen: false, course: null })}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setPreviewCourse({ isOpen: false, course: null });
                    handleReviewCourse(previewCourse.course._id, 'approved');
                  }}
                  className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                >
                  Approve Course
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReview;
