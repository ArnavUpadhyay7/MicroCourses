import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, XCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    category: '',
    level: 'beginner',
    duration: '',
    price: 0
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const categories = ['Technology', 'Business', 'Design', 'Marketing', 'Health', 'Language', 'Other'];
  const levels = ['beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      setLoadingData(true);
      // NOTE: Assuming your API returns the course data structured as course.title, etc.
      const response = await api.get(`/creator/courses/${id}`);
      const course = response.data.course;
      setFormData({
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
        category: course.category || '', // Ensure category is not null/undefined
        level: course.level,
        duration: course.duration,
        price: course.price
      });
    } catch (error) {
      toast.error('Failed to load course data');
      navigate('/creator/dashboard');
    } finally {
      setLoadingData(false);
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

    // Minor validation check for price/duration input types if needed
    const dataToSend = {
      ...formData,
      duration: Number(formData.duration),
      price: Number(formData.price)
    };

    try {
      await api.put(`/creator/courses/${id}`, dataToSend);
      toast.success('Course updated successfully!');
      navigate('/creator/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update course');
    } finally {
      setLoading(false);
    }
  };

  // --- UI Components ---
  
  const InputStyles = "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm";
  const LabelStyles = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2";

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header and Status */}
        <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                Edit Course: {formData.title || 'Untitled'}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
                Refine and update your course details
            </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 md:p-10 transition-colors duration-300 border border-gray-200 dark:border-gray-700">
          
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* General Info Section */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 border-b pb-3 mb-6 border-gray-200 dark:border-gray-700">
                    General Information
                </h2>
                
                <div>
                  <label htmlFor="title" className={LabelStyles}>Course Title</label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    className={InputStyles}
                    placeholder="Enter course title (e.g., Advanced JavaScript)"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="description" className={LabelStyles}>Description</label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    required
                    className={InputStyles}
                    placeholder="Describe what students will learn and why they should enroll"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="thumbnail" className={LabelStyles}>
                    Thumbnail URL 
                    <span className="text-gray-500 dark:text-gray-400 font-normal ml-2 text-xs">
                        (Needs to be a public image link)
                    </span>
                  </label>
                  <input
                    id="thumbnail"
                    name="thumbnail"
                    type="url"
                    required
                    className={InputStyles}
                    placeholder="https://example.com/course_thumbnail.jpg"
                    value={formData.thumbnail}
                    onChange={handleChange}
                  />
                  {formData.thumbnail && (
                    <div className="mt-4 w-full h-80 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center border border-gray-300 dark:border-gray-600">
                        <img src={formData.thumbnail} alt="Current Thumbnail Preview" className="h-full w-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                    </div>
                  )}
                </div>
            </div>

            {/* Classification and Pricing Section */}
            <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 border-b pb-3 mb-6 border-gray-200 dark:border-gray-700">
                    Classification & Pricing
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="category" className={LabelStyles}>Category</label>
                        <select
                        id="category"
                        name="category"
                        required
                        className={InputStyles}
                        value={formData.category}
                        onChange={handleChange}
                        >
                            <option value="" disabled>Select category</option>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="level" className={LabelStyles}>Level</label>
                        <select
                        id="level"
                        name="level"
                        required
                        className={InputStyles + " capitalize"}
                        value={formData.level}
                        onChange={handleChange}
                        >
                            {levels.map(level => (
                                <option key={level} value={level}>{level}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label htmlFor="duration" className={LabelStyles}>Duration (minutes)</label>
                        <input
                          id="duration"
                          name="duration"
                          type="number"
                          required
                          min="1"
                          className={InputStyles}
                          placeholder="e.g., 120"
                          value={formData.duration}
                          onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="max-w-xs">
                    <label htmlFor="price" className={LabelStyles}>Price ($)</label>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      className={InputStyles}
                      placeholder="0.00 (Enter 0 for Free)"
                      value={formData.price}
                      onChange={handleChange}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              
              <button
                type="button"
                onClick={() => navigate('/creator/dashboard')}
                className="flex items-center px-6 py-2 border border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 font-medium"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Updating...' : 'Update Course'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCourse;