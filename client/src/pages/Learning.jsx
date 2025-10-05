import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Clock, BookOpen, Download } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import VideoPlayer from '../components/VideoPlayer';

const Learning = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Helper to extract lesson IDs from various enrollment structures
  const extractCompletedLessonIds = (enrollmentData) => {
      // Handles both array of IDs and array of objects { lesson: ID }
      return (enrollmentData?.completedLessons || []).map(l => 
          String(l._id || l.lesson?._id || l.lesson || l) 
      );
  };

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      
      const lessonResponse = await api.get(`/courses/lessons/${lessonId}`);
      const fetchedLesson = lessonResponse.data.lesson;
      setLesson(fetchedLesson);

      const courseId = fetchedLesson?.course?._id || fetchedLesson?.course;
      
      if (courseId) {
        const courseResp = await api.get(`/courses/${courseId}`);
        const fetchedCourse = courseResp.data.course;
        const fetchedEnrollment = courseResp.data.enrollment;

        setCourse(fetchedCourse);
        setLessons(fetchedCourse?.lessons || []);
        setEnrollment(fetchedEnrollment || null);

        if (fetchedEnrollment) {
            const completedIds = extractCompletedLessonIds(fetchedEnrollment);
            setIsCompleted(completedIds.includes(String(fetchedLesson._id)));
        } else {
            setIsCompleted(false);
        }
      }
    } catch (error) {
      console.error('Error fetching lesson:', error);
      toast.error(error.response?.data?.message || 'Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };


const handleCompleteLesson = async () => {
    if (!lesson || !enrollment) return;

    try {
      setCompleting(true);
      
      // 1. Send completion request. 
      const completeResponse = await api.post(`/courses/lessons/${lessonId}/complete`);
      
      const updatedEnrollment = completeResponse.data.enrollment;

      // 2. CRITICAL FIX: Update state directly from the successful response.
      setEnrollment(updatedEnrollment); // Updates progress bar instantly
      setIsCompleted(true); // Updates the local checkbox/button state instantly
      
      toast.success('Lesson completed!');

      if (updatedEnrollment?.isCompleted) {
        toast.success('Course completed! Certificate unlocked.');
      }
      
    } catch (error) {
      console.error('Error completing lesson:', error);
      const errorMessage = error.response?.data?.message || 'Failed to complete lesson';
      
      // We hit this block because the BE response was likely non-200 (even if success happened)
      // or the 'already completed' check failed. We MUST resync all data.
      
      // Check for 'Already completed' specifically
      if (errorMessage.includes('Lesson already completed')) {
          toast.info('Lesson was already marked complete. Syncing state...');
      } else {
          // Show the original error toast if it's not a known status
          toast.error(errorMessage);
      }
      
      // FIX: Force a full state resync to update the progress bar and sidebar list immediately
      await fetchLesson(); 
      
    } finally {
      setCompleting(false);
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

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Lesson not found</h2>
          <p className="text-gray-600 dark:text-gray-300">The lesson you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Determine course ID for navigation (safe fallback)
  const courseIdForNav = course?._id || lesson.course?._id || lesson.course;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm overflow-hidden transition-colors duration-300">
              {/* Video Header */}
              <div className="p-4 border-b border-gray-200 dark:border-dark-600">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{lesson.title}</h1>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatDuration(lesson.duration)}
                  </div>
                </div>
              </div>

              {/* Enhanced Video Player */}
              <div className="w-full" style={{ aspectRatio: '16 / 9' }}>
                <VideoPlayer
                  src={lesson.videoUrl}
                  title={lesson.title}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              </div>

              {/* Video Controls */}
              <div className="p-4 border-t border-gray-200 dark:border-dark-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => navigate(`/courses/${courseIdForNav}`)} // Navigate back to course detail
                      className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back to Course
                    </button>
                  </div>
                  
                  {!isCompleted && (
                    <button
                      onClick={handleCompleteLesson}
                      disabled={completing}
                      className="flex items-center bg-green-600 dark:bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      {completing ? (
                        'Marking Complete...'
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Complete
                        </>
                      )}
                    </button>
                  )}
                  
                  {isCompleted && (
                    <div className="flex items-center text-green-600 dark:text-green-400">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Completed
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Lesson Description */}
            <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6 mt-6 transition-colors duration-300">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About this lesson</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{lesson.description}</p>
            </div>

            {/* Resources */}
            {lesson.resources && lesson.resources.length > 0 && (
              <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6 mt-6 transition-colors duration-300">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resources</h2>
                <div className="space-y-2">
                  {lesson.resources.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 border border-gray-200 dark:border-dark-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">{resource.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{resource.type}</div>
                      </div>
                      <Download className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Lessons List */}
            <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6 mb-6 transition-colors duration-300">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lessons</h2>
              <div className="space-y-2 max-h-[28rem] overflow-y-auto">
                {lessons.map((l) => {
                  const isActive = String(l._id) === String(lesson._id);
                  // Check if the lesson is in the updated enrollment state
                  const isDone = extractCompletedLessonIds(enrollment).includes(String(l._id));
                  
                  return (
                    <button
                      key={l._id}
                      onClick={() => !isActive && navigate(`/learn/${l._id}`)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        isActive
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`font-medium ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>{l.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{formatDuration(l.duration)}</div>
                        </div>
                        {isDone && (
                          <div className="flex items-center text-green-600 dark:text-green-400 text-xs font-medium">
                            <CheckCircle className="h-4 w-4 mr-1" /> Done
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Transcript */}
            <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6 mb-6 transition-colors duration-300">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transcript</h2>
              {lesson.transcript ? (
                <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-h-96 overflow-y-auto">
                  {lesson.transcript}
                </div>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {lesson.transcriptStatus === 'processing' ? (
                    'Transcript is being generated...'
                  ) : lesson.transcriptStatus === 'failed' ? (
                    'Failed to generate transcript'
                  ) : (
                    'Transcript not available'
                  )}
                </div>
              )}
            </div>

            {/* Course Progress */}
            <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6 transition-colors duration-300">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Course Progress</h2>
              <div className="space-y-4">
                {enrollment && (
                  <>
                    <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                      <div className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" style={{ width: `${enrollment.progress || 0}%` }}></div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{enrollment.progress || 0}% Complete</div>
                  </>
                )}
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={async (e) => {
                      // Only call handler if marking complete, not un-completing
                      if (e.target.checked && !isCompleted) {
                        await handleCompleteLesson();
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">I finished watching this lesson</span>
                </label>
                {(enrollment?.isCompleted || (enrollment?.progress || 0) === 100) && (
                  <button
                    onClick={() => {
                      if (courseIdForNav) navigate(`/certificate/${courseIdForNav}`);
                    }}
                    className="w-full bg-green-600 dark:bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                  >
                    View Certificate
                  </button>
                )}
                <button
                  onClick={() => navigate(`/courses/${courseIdForNav}`)}
                  className="w-full text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  View course
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learning;