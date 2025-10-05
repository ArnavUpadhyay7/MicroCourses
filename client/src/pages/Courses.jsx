import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, Users, Star, Filter, UserPlus } from 'lucide-react'; // Added UserPlus icon
import api from '../services/api';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    level: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  const categories = ['Technology', 'Business', 'Design', 'Marketing', 'Health', 'Language'];
  const levels = ['beginner', 'intermediate', 'advanced'];

  // Debounced Effect: Triggers API call only after a delay in typing.
  useEffect(() => {
    // 1. Set up a timer to call fetchCourses after a delay (e.g., 500ms)
    const delayDebounceFn = setTimeout(() => {
      fetchCourses();
    }, 500); // Wait for 500ms of inactivity before calling the API

    // 2. Cleanup function: If the user types again, clear the previous timer
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, filters, pagination.current]); // Dependencies: Triggered on search, filter, or page change

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current,
        limit: 12,
        ...(searchTerm && { search: searchTerm }),
        ...(filters.category && { category: filters.category }),
        ...(filters.level && { level: filters.level })
      });

      const response = await api.get(`/courses?${params}`);
      setCourses(response.data.courses);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    // Update the state instantly, which triggers the useEffect hook
    setSearchTerm(e.target.value); 
    // Always reset to page 1 on new search term
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const clearFilters = () => {
    setFilters({ category: '', level: '' });
    setSearchTerm('');
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-gray-300 dark:bg-dark-700 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-300 dark:bg-dark-700 rounded w-96 animate-pulse"></div>
          </div>

          {/* Search Skeleton */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6 mb-8">
            <div className="h-12 bg-gray-300 dark:bg-dark-700 rounded animate-pulse"></div>
          </div>

          {/* Course Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-dark-800 rounded-xl shadow-sm overflow-hidden">
                <div className="h-64 bg-gray-300 dark:bg-dark-700 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-300 dark:bg-dark-700 rounded mb-3 animate-pulse"></div>
                  <div className="h-4 bg-gray-300 dark:bg-dark-700 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-300 dark:bg-dark-700 rounded mb-4 animate-pulse"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-300 dark:bg-dark-700 rounded w-16 animate-pulse"></div>
                    <div className="h-8 bg-gray-300 dark:bg-dark-700 rounded w-24 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">All Courses</h1>
          <p className="text-gray-600 dark:text-gray-300">Discover courses to advance your skills</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6 mb-8 transition-colors duration-300 border border-gray-200 dark:border-dark-600">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search courses by title, description, or instructor..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-48">
              <select
                className="w-full px-3 py-3 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div className="lg:w-48">
              <select
                className="w-full px-3 py-3 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
              >
                <option value="">All Levels</option>
                {levels.map(level => (
                  <option key={level} value={level} className="capitalize">
                    {level}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors duration-200 font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results Count and Stats */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <p className="text-gray-600 dark:text-gray-300 mb-2 sm:mb-0">
            Showing {courses.length} of {pagination.total} courses
          </p>
          {(searchTerm || filters.category || filters.level) && (
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  Search: "{searchTerm}"
                </span>
              )}
              {filters.category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  Category: {filters.category}
                </span>
              )}
              {filters.level && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                  Level: {filters.level}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          // === CRITICAL FIX: Custom Empty/Call-to-Action State ===
          <div className="text-center py-16 bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-200 dark:border-dark-600">
            <div className="text-blue-600 dark:text-blue-400 mb-4">
              <UserPlus className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              Discover Your Next Skill!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              If you don't see courses here, it may be due to your filters. 
              Ready to start learning? Create a free account now.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center bg-blue-600 dark:bg-blue-700 text-white px-8 py-3 rounded-lg text-base font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-md"
            >
              Sign up to Start Learning
            </Link>
          </div>
          // === END CRITICAL FIX ===
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div key={course._id} className="bg-white dark:bg-dark-800 rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                {/* Course Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop&crop=center'}
                    alt={course.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                      {course.category}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-white dark:bg-dark-700 text-gray-700 dark:text-gray-300 text-xs font-medium px-3 py-1 rounded-full capitalize">
                      {course.level}
                    </span>
                  </div>
                </div>
                
                {/* Course Content */}
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-lg line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {course.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm line-clamp-3">
                    {course.description}
                  </p>
                  
                  {/* Course Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDuration(course.duration)}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {course.enrolledStudents?.length || 0} students
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      {course.rating?.toFixed(1) || '0.0'}
                    </div>
                  </div>
                  
                  {/* Price and Button */}
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      ${course.price || 0}
                    </div>
                    <Link
                      to={`/courses/${course._id}`}
                      className={`px-6 py-2 rounded-lg transition-colors font-medium ${
                        course.isEnrolled
                          ? 'bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-600'
                          : 'bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
                      }`}
                    >
                      {course.isEnrolled ? 'Continue' : 'View Course'}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                disabled={pagination.current === 1}
                className="px-4 py-2 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors font-medium"
              >
                Previous
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const page = pagination.current <= 3 
                    ? i + 1 
                    : pagination.current >= pagination.pages - 2
                    ? pagination.pages - 4 + i
                    : pagination.current - 2 + i;
                  
                  if (page < 1 || page > pagination.pages) return null;
                  
                  return (
                    <button
                      key={page}
                      onClick={() => setPagination(prev => ({ ...prev, current: page }))}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        page === pagination.current
                          ? 'bg-blue-600 dark:bg-blue-700 text-white'
                          : 'border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-600'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                disabled={pagination.current === pagination.pages}
                className="px-4 py-2 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;