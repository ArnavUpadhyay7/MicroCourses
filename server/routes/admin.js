const express = require('express');
const Course = require('../models/Course');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all pending creator applications
router.get('/applications', auth, requireRole(['admin']), async (req, res) => {
  try {
    const applications = await User.find({
      'creatorApplication.status': 'pending',
      'role': 'learner'
    }).select('name email creatorApplication createdAt');

    res.json({ applications });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve/reject creator application
router.put('/applications/:userId', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { status, feedback } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.creatorApplication.status !== 'pending') {
      return res.status(400).json({ message: 'Application already processed' });
    }

    user.creatorApplication.status = status;
    if (feedback) {
      user.creatorApplication.feedback = feedback;
    }

    if (status === 'approved') {
      user.role = 'creator';
      user.isCreatorApproved = true;
    }

    await user.save();

    res.json({ 
      message: `Creator application ${status} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isCreatorApproved: user.isCreatorApproved
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all courses pending review
router.get('/courses/pending', auth, requireRole(['admin']), async (req, res) => {
  try {
    // Get courses that are either pending or have lessons but haven't been submitted for review
    const courses = await Course.find({ 
      $or: [
        { status: 'pending' },
        { status: 'draft', lessons: { $exists: true, $not: { $size: 0 } } }
      ]
    })
      .populate('creator', 'name email')
      .populate('lessons', 'title duration order')
      .sort({ createdAt: -1 });

    res.json({ courses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Review course (approve/reject)
router.put('/courses/:id/review', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { status, feedback } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.status !== 'pending') {
      return res.status(400).json({ message: 'Course is not pending review' });
    }

    course.adminReview = {
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
      feedback,
      status
    };

    if (status === 'approved') {
      course.status = 'published';
    } else {
      course.status = 'rejected';
    }

    await course.save();

    res.json({ 
      message: `Course ${status} successfully`,
      course
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all courses (for admin dashboard)
router.get('/courses', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = status ? { status } : {};
    
    const courses = await Course.find(filter)
      .populate('creator', 'name email')
      .populate('enrolledStudents', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Course.countDocuments(filter);

    res.json({
      courses,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get course details for review
router.get('/courses/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('creator', 'name email creatorApplication')
      .populate({
        path: 'lessons',
        options: { sort: { order: 1 } }
      });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ course });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get admin dashboard stats
router.get('/dashboard', auth, requireRole(['admin']), async (req, res) => {
  try {
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ status: 'published' });
    const pendingCourses = await Course.countDocuments({ status: 'pending' });
    const rejectedCourses = await Course.countDocuments({ status: 'rejected' });
    
    const pendingApplications = await User.countDocuments({
      'creatorApplication.status': 'pending'
    });
    
    const totalCreators = await User.countDocuments({ role: 'creator' });
    const totalLearners = await User.countDocuments({ role: 'learner' });

    res.json({
      stats: {
        totalCourses,
        publishedCourses,
        pendingCourses,
        rejectedCourses,
        pendingApplications,
        totalCreators,
        totalLearners
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
