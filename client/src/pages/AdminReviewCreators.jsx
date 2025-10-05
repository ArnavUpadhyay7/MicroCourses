import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, UserCheck, UserX, BookOpen } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AdminReviewCreators = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/applications');
      setApplications(res.data.applications || []);
    } catch (err) {
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (userId, status, feedback = '') => {
    try {
      await api.put(`/admin/applications/${userId}`, { status, feedback });
      
      const statusMessage = status === 'approved' ? 'Approved' : 'Rejected';
      toast.success(`Application ${statusMessage} successfully!`);
      
      // Update state to remove the processed application immediately
      setApplications(prev => prev.filter(app => app._id !== userId));

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update application');
    }
  };
  
  // FIX: Simplified function to directly reject without prompting for feedback
  const handleRejectClick = (appId) => {
    // Call handleReview directly with 'rejected' status and empty feedback
    handleReview(appId, 'rejected', ''); 
    // The success toast is now handled inside handleReview after the API call succeeds.
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 border-b pb-4 border-gray-300 dark:border-gray-700 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Creator Applications
          </h1>
          <div className="text-xl font-semibold text-gray-600 dark:text-gray-400">
            {applications.length} Pending
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <UserCheck className="h-12 w-12 mx-auto text-green-500 dark:text-green-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">All Clear!</h3>
            <p className="text-gray-600 dark:text-gray-400">No pending creator applications found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map(app => (
              <div 
                key={app._id} 
                className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 transition-colors duration-300 border border-gray-200 dark:border-gray-700"
              >
                
                {/* User Info and Metadata */}
                <div className="flex items-start justify-between border-b pb-4 mb-4 dark:border-gray-700">
                  <div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {app.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {app.email}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-500 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Applied: {new Date(app.creatorApplication.appliedAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Application Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
                    <DetailCard 
                        title="Bio/Background" 
                        content={app.creatorApplication.bio} 
                        Icon={UserCheck}
                    />
                    <DetailCard 
                        title="Teaching Experience" 
                        content={app.creatorApplication.experience} 
                        Icon={BookOpen}
                    />
                </div>

                {/* Portfolio Link (Full width) */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Portfolio/Links</h4>
                    <a 
                        href={app.creatorApplication.portfolio} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline break-all text-sm"
                    >
                        {app.creatorApplication.portfolio || 'None provided'}
                    </a>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-6 pt-4 border-t dark:border-gray-700">
                  <button
                    className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md dark:bg-green-500 dark:hover:bg-green-600"
                    onClick={() => handleReview(app._id, 'approved')}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Approve
                  </button>
                  <button
                    className="flex items-center px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-md dark:bg-red-500 dark:hover:bg-red-600"
                    // FIX: Changed to call the simplified handler
                    onClick={() => handleRejectClick(app._id)}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper component for application details
const DetailCard = ({ title, content, Icon }) => (
    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
            <Icon className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" />
            {title}
        </h4>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
            {content}
        </p>
    </div>
);

export default AdminReviewCreators;