import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, Award, Play, ChevronRight } from 'lucide-react';

import api from '../services/api';

const Progress = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/courses/user/enrolled');
      setEnrollments(response.data.enrollments);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 border-b pb-4 border-gray-200 dark:border-gray-800">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">My Learning Progress</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Keep track of your enrolled courses and achievements.
          </p>
        </div>

        {enrollments.length === 0 ? (
          /* Empty State (Improved) */
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-blue-500 dark:text-blue-400 mb-4">
              <Play className="h-16 w-16 mx-auto stroke-1" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">No Active Courses Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              You haven't enrolled in any courses yet. Start your journey to mastering new skills!
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center bg-blue-600 dark:bg-blue-700 text-white px-8 py-3 rounded-lg text-base font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-md"
            >
              Browse Course Catalog
            </Link>
          </div>
        ) : (
          /* Course List Grid */
          <div className="grid gap-6">
            {enrollments.map((enrollment) => {
              const { course } = enrollment;
              const statusClass = enrollment.isCompleted 
                ? 'bg-green-600/10 text-green-500 border-green-500' 
                : 'bg-blue-600/10 text-blue-500 border-blue-500';

              return (
                <div 
                  key={enrollment._id} 
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 transition-all duration-300 transform hover:scale-[1.01] border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center">
                    
                    {/* Course Thumbnail */}
                    <img
                      src={course.thumbnail || '/api/placeholder/100/60'}
                      alt={course.title}
                      className="w-24 h-16 object-cover rounded-lg mr-6 shadow-md"
                    />

                    <div className="flex-1">
                      {/* Title & Creator */}
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Instructor: <span className="font-medium text-gray-700 dark:text-gray-300">{course.creator.name}</span>
                      </p>
                      
                      {/* Meta Stats */}
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-500 mb-4">
                        <Clock className="h-3 w-3 mr-1" />
                        Total Duration: {formatDuration(course.duration)}
                        <span className="mx-2">•</span>
                        Total Lessons: {course.totalLessons}
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${enrollment.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Progress Percentage & Status */}
                    <div className="ml-8 text-right flex flex-col justify-between h-full min-w-[150px]">
                      
                      {/* Status Tag */}
                      <div className={`inline-flex items-center justify-center mb-4 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${statusClass}`}>
                        {enrollment.isCompleted ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" /> Completed
                          </>
                        ) : (
                          `Progress: ${enrollment.progress}%`
                        )}
                      </div>

                      {/* Action Button */}
                      <Link
                        to={enrollment.isCompleted ? `/certificate/${course._id}` : `/courses/${course._id}`}
                        className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-md ${
                          enrollment.isCompleted 
                            ? 'bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-600'
                            : 'bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
                        }`}
                      >
                        {enrollment.isCompleted ? 'View Certificate' : 'Continue'}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>

                      {enrollment.isCompleted && (
                        <div className="mt-2 flex justify-end items-center text-xs text-green-600 dark:text-green-400">
                          <Award className="h-3 w-3 mr-1" />
                          Certificate Ready
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;