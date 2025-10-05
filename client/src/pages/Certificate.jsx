import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Share2, CheckCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast'; // Assuming toast is available for the fallback share logic

const Certificate = () => {
  const { courseId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificate();
  }, [courseId]);

  const fetchCertificate = async () => {
    try {
      setLoading(true);
      // NOTE: The endpoint is /courses/:courseId/certificate. The authentication should be handled server-side.
      const response = await api.get(`/courses/${courseId}/certificate`);
      setCertificate(response.data.certificate);
    } catch (error) {
      console.error('Error fetching certificate:', error);
      // Added a more user-friendly error toast
      toast.error("Failed to load certificate. Check enrollment or login status."); 
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    // In a real app, this would download the PDF
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Certificate',
          text: `I completed the ${certificate.course.title} course!`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      toast.success('Certificate URL copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Certificate not found</h2>
          <p className="text-gray-600 dark:text-gray-300">This certificate doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  return (
    // Page background adapts to dark mode
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Certificate Display (STAYS WHITE for printability) */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center print:shadow-none print:p-12">
          <div className="mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Certificate of Completion</h1>
            <p className="text-gray-600">This certifies that</p>
          </div>

          <div className="mb-8">
            <h2 className="text-4xl font-bold text-blue-600 mb-4 print:text-5xl">{certificate.student.name}</h2>
            <p className="text-lg text-gray-700 mb-2">has successfully completed the course</p>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2 print:text-3xl">{certificate.course.title}</h3>
            <p className="text-gray-600">by {certificate.course.creator.name}</p>
          </div>

          <div className="border-t border-b border-gray-200 py-6 mb-8">
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <p className="text-gray-600">Completed on</p>
                <p className="font-semibold text-gray-900">
                  {new Date(certificate.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Certificate ID</p>
                <p className="font-mono text-gray-900 print:text-base">{certificate.serialNumber}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons - Hide in print view */}
          <div className="flex justify-center space-x-4 print:hidden">
            <button
              onClick={handleDownload}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-md"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </button>
            <button
              onClick={handleShare}
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center shadow-sm"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </button>
          </div>
        </div>

        {/* Verification Info - Adapts to dark mode */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-300 print:hidden">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Verify Certificate</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            This certificate can be verified using the Certificate ID: <span className="font-mono text-gray-900 dark:text-white font-semibold">{certificate.serialNumber}</span>
          </p>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 break-all">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Verification URL:</strong> <a href={certificate.verificationUrl} className="text-blue-600 dark:text-blue-400 hover:underline">{certificate.verificationUrl}</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;