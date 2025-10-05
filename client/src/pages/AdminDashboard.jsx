import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, CheckCircle, Clock, TrendingUp, Eye, Settings } from 'lucide-react';
import api from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Overview of platform statistics and management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6 transition-colors duration-300 hover:shadow-md">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalCourses || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6 transition-colors duration-300 hover:shadow-md">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Published</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.publishedCourses || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6 transition-colors duration-300 hover:shadow-md">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.pendingCourses || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6 transition-colors duration-300 hover:shadow-md">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(stats?.totalLearners || 0) + (stats?.totalCreators || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6 transition-colors duration-300 hover:shadow-md">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Learners</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalLearners || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6 transition-colors duration-300 hover:shadow-md">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Creators</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalCreators || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6 transition-colors duration-300 hover:shadow-md">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending Applications</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.pendingApplications || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/admin/review/courses"
              className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-dark-600 hover:border-blue-300 dark:hover:border-blue-600"
            >
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Review Courses</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Approve or reject course submissions</p>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/review/courses"
              className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-dark-600 hover:border-green-300 dark:hover:border-green-600"
            >
              <div className="flex items-center">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Manage Users</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Review creator applications</p>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/dashboard"
              className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-dark-600 hover:border-purple-300 dark:hover:border-purple-600"
            >
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Settings className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Platform Settings</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Configure platform settings</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
