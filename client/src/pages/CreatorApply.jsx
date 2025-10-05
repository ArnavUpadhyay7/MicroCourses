import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const CreatorApply = () => {
  const [formData, setFormData] = useState({
    bio: '',
    experience: '',
    portfolio: ''
  });
  const [loading, setLoading] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplicationStatus();
  }, []);

  const fetchApplicationStatus = async () => {
    try {
      setLoadingStatus(true);
      const response = await api.get('/creator/application-status');
      setApplicationStatus(response.data);
      
      // Pre-fill form if application exists
      if (response.data.application) {
        setFormData({
          bio: response.data.application.bio || '',
          experience: response.data.application.experience || '',
          portfolio: response.data.application.portfolio || ''
        });
      }
    } catch (error) {
      console.error('Error fetching application status:', error);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/creator/apply', formData);
      toast.success('Application submitted successfully!');
      fetchApplicationStatus();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (loadingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-8 transition-colors duration-300">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-8 transition-colors duration-300">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Become a Creator</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Share your knowledge and expertise with learners worldwide
            </p>
          </div>

          {/* Application Status */}
          {applicationStatus?.application && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg transition-colors duration-300">
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">Application Status</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-700 dark:text-blue-300">
                    Status: <span className="font-semibold capitalize">{applicationStatus.application.status}</span>
                  </p>
                  {applicationStatus.application.appliedAt && (
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Applied on: {new Date(applicationStatus.application.appliedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {applicationStatus.application.status === 'pending' && (
                    <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-sm font-medium">
                      Under Review
                    </span>
                  )}
                  {applicationStatus.application.status === 'approved' && (
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                      Approved
                    </span>
                  )}
                  {applicationStatus.application.status === 'rejected' && (
                    <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-sm font-medium">
                      Rejected
                    </span>
                  )}
                </div>
              </div>
              {applicationStatus.application.feedback && (
                <div className="mt-3 p-3 bg-white dark:bg-dark-700 rounded border border-gray-200 dark:border-dark-600 transition-colors duration-300">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Feedback:</strong> {applicationStatus.application.feedback}
                  </p>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Tell us about yourself and your background..."
                value={formData.bio}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Teaching Experience
              </label>
              <textarea
                id="experience"
                name="experience"
                rows={4}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Describe your teaching experience and expertise..."
                value={formData.experience}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Portfolio/Links
              </label>
              <textarea
                id="portfolio"
                name="portfolio"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Share links to your work, courses, or portfolio..."
                value={formData.portfolio}
                onChange={handleChange}
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-md p-4 transition-colors duration-300">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">What happens next?</h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Your application will be reviewed by our admin team</li>
                <li>• You'll receive an email notification about the decision</li>
                <li>• If approved, you can start creating and publishing courses</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-2 border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-700 rounded-md hover:bg-gray-50 dark:hover:bg-dark-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading 
                  ? 'Submitting...' 
                  : applicationStatus?.application 
                    ? 'Update Application' 
                    : 'Submit Application'
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatorApply;
