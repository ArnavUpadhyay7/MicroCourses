import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Play } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import InlineVideoPlayer from '../components/InlineVideoPlayer';

const CourseLessons = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    videoUrl: '',
    duration: ''
  });
  const [videoPlayer, setVideoPlayer] = useState({
    isOpen: false,
    src: '',
    title: '',
    description: ''
  });

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/creator/courses/${id}`);
      setCourse(response.data.course);
      
      // Fetch lessons for this course
      const lessonsResponse = await api.get(`/creator/courses/${id}/lessons`);
      setLessons(lessonsResponse.data.lessons || []);
    } catch (error) {
      toast.error('Failed to load course data');
      navigate('/creator/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/creator/courses/${id}/lessons`, newLesson);
      toast.success('Lesson added successfully!');
      setNewLesson({ title: '', description: '', videoUrl: '', duration: '' });
      setShowAddForm(false);
      fetchCourseData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add lesson');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    const confirmed = await new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      modal.innerHTML = `
        <div class="bg-white dark:bg-dark-800 rounded-lg p-6 max-w-md w-full mx-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Delete Lesson</h3>
          <p class="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to delete this lesson? This action cannot be undone.</p>
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
        await api.delete(`/creator/lessons/${lessonId}`);
        toast.success('Lesson deleted successfully!');
        fetchCourseData();
      } catch (error) {
        toast.error('Failed to delete lesson');
      }
    }
  };

  const handleSubmitForReview = async () => {
    if (lessons.length === 0) {
      toast.error('Please add at least one lesson before submitting for review');
      return;
    }

    const confirmed = await new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      modal.innerHTML = `
        <div class="bg-white dark:bg-dark-800 rounded-lg p-6 max-w-md w-full mx-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Submit for Review</h3>
          <p class="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to submit this course for review? You won't be able to edit it until it's approved or rejected.</p>
          <div class="flex justify-end space-x-2">
            <button id="cancel" class="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">Cancel</button>
            <button id="confirm" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Submit</button>
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
        await api.post(`/creator/courses/${id}/submit`);
        toast.success('Course submitted for review successfully!');
        fetchCourseData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to submit course for review');
      }
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{course?.title}</h1>
              <p className="text-gray-600 dark:text-gray-300">Manage lessons for this course</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                course?.status === 'draft' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                course?.status === 'pending' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                course?.status === 'published' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              }`}>
                {course?.status?.charAt(0).toUpperCase() + course?.status?.slice(1)}
              </div>
              {course?.status === 'draft' && lessons.length > 0 && (
                <button
                  onClick={handleSubmitForReview}
                  className="bg-green-600 dark:bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                >
                  Submit for Review
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6 mb-6 transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Lessons</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Lesson
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddLesson} className="mb-6 p-4 border border-gray-200 dark:border-dark-600 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Lesson</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    value={newLesson.title}
                    onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    value={newLesson.duration}
                    onChange={(e) => setNewLesson({...newLesson, duration: e.target.value})}
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  value={newLesson.description}
                  onChange={(e) => setNewLesson({...newLesson, description: e.target.value})}
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Video URL</label>
                <input
                  type="url"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="https://example.com/video.mp4"
                  value={newLesson.videoUrl}
                  onChange={(e) => setNewLesson({...newLesson, videoUrl: e.target.value})}
                />
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-700 rounded-md hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                >
                  Add Lesson
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {lessons.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No lessons added yet</p>
            ) : (
              lessons.map((lesson, index) => (
                <div key={lesson._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-dark-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{lesson.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{formatDuration(lesson.duration)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setVideoPlayer({
                          isOpen: true,
                          src: lesson.videoUrl,
                          title: lesson.title,
                          description: lesson.description
                        });
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-2 transition-colors"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteLesson(lesson._id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-2 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => navigate('/creator/dashboard')}
            className="px-6 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Inline Video Player */}
      <InlineVideoPlayer
        src={videoPlayer.src}
        title={videoPlayer.title}
        description={videoPlayer.description}
        isOpen={videoPlayer.isOpen}
        onClose={() => setVideoPlayer({ isOpen: false, src: '', title: '', description: '' })}
      />
    </div>
  );
};

export default CourseLessons;
