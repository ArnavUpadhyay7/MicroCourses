const express = require('express');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Apply to become a creator
router.post('/apply', auth, async (req, res) => {
  try {
    const { bio, experience, portfolio } = req.body;

    if (req.user.role !== 'learner') {
      return res.status(400).json({ message: 'Only learners can apply to become creators' });
    }

    if (req.user.creatorApplication.status === 'approved') {
      return res.status(400).json({ message: 'You are already an approved creator' });
    }

    req.user.creatorApplication = {
      bio,
      experience,
      portfolio,
      appliedAt: new Date(),
      status: 'pending'
    };
    
    if (req.user.isModified('creatorApplication')) { 
        req.user.markModified('creatorApplication');
    }
    await req.user.save();

    res.json({ message: 'Creator application submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get creator application status
router.get('/application-status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'learner') {
      return res.status(400).json({ message: 'Only learners can check application status' });
    }

    res.json({ 
      application: req.user.creatorApplication || null,
      isCreatorApproved: req.user.isCreatorApproved
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single course for editing
router.get('/courses/:id', auth, requireRole(['creator', 'admin']), async (req, res) => {
  try {
    const course = await Course.findOne({ 
      _id: req.params.id, 
      creator: req.user._id 
    });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ course });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get creator dashboard data
router.get('/dashboard', auth, requireRole(['creator', 'admin']), async (req, res) => {
  try {
    const courses = await Course.find({ creator: req.user._id })
      .populate('enrolledStudents', 'name email')
      .sort({ createdAt: -1 });

    const totalStudents = courses.reduce((acc, course) => acc + course.enrolledStudents.length, 0);
    const publishedCourses = courses.filter(course => course.status === 'published').length;
    const pendingCourses = courses.filter(course => course.status === 'pending').length;

    res.json({
      courses,
      stats: {
        totalCourses: courses.length,
        publishedCourses,
        pendingCourses,
        totalStudents
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create course
router.post('/courses', auth, requireRole(['creator', 'admin']), async (req, res) => {
  try {
    const { title, description, thumbnail, category, level, duration, price } = req.body;

    const course = new Course({
      title,
      description,
      thumbnail,
      creator: req.user._id,
      category,
      level,
      duration,
      price,
      status: 'draft' // Set initial status as draft
    });

    await course.save();
    res.status(201).json({ message: 'Course created successfully', course });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update course
router.put('/courses/:id', auth, requireRole(['creator', 'admin']), async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, creator: req.user._id });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.status === 'published') {
      return res.status(400).json({ message: 'Cannot edit published course' });
    }

    const { title, description, thumbnail, category, level, duration, price } = req.body;
    
    Object.assign(course, { title, description, thumbnail, category, level, duration, price });
    await course.save();

    res.json({ message: 'Course updated successfully', course });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete course
router.delete('/courses/:id', auth, requireRole(['creator', 'admin']), async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, creator: req.user._id });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.status === 'published') {
      return res.status(400).json({ message: 'Cannot delete published course' });
    }

    // Delete associated lessons
    await Lesson.deleteMany({ course: course._id });
    await Course.findByIdAndDelete(course._id);

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit course for review
router.post('/courses/:id/submit', auth, requireRole(['creator', 'admin']), async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, creator: req.user._id });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.lessons.length === 0) {
      return res.status(400).json({ message: 'Course must have at least one lesson' });
    }

    course.status = 'pending';
    await course.save();

    res.json({ message: 'Course submitted for review' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get lessons for a course
router.get('/courses/:id/lessons', auth, requireRole(['creator', 'admin']), async (req, res) => {
  try {
    const course = await Course.findOne({ 
      _id: req.params.id, 
      creator: req.user._id 
    });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const lessons = await Lesson.find({ course: req.params.id }).sort({ order: 1 });
    res.json({ lessons });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add lesson to course
router.post('/courses/:id/lessons', auth, requireRole(['creator', 'admin']), async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, creator: req.user._id });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.status === 'published') {
      return res.status(400).json({ message: 'Cannot add lessons to published course' });
    }

    const { title, description, videoUrl, duration, resources } = req.body;
    const order = course.lessons.length + 1;

    const lesson = new Lesson({
      title,
      description,
      course: course._id,
      order,
      videoUrl,
      duration,
      resources: resources || []
    });

    await lesson.save();

    course.lessons.push(lesson._id);
    course.totalLessons = course.lessons.length;
    await course.save();

    res.status(201).json({ message: 'Lesson added successfully', lesson });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update lesson
router.put('/lessons/:id', auth, requireRole(['creator', 'admin']), async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('course');
    
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    if (lesson.course.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this lesson' });
    }

    if (lesson.course.status === 'published') {
      return res.status(400).json({ message: 'Cannot edit lesson in published course' });
    }

    const { title, description, videoUrl, duration, resources } = req.body;
    
    Object.assign(lesson, { title, description, videoUrl, duration, resources });
    await lesson.save();

    res.json({ message: 'Lesson updated successfully', lesson });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete lesson
router.delete('/lessons/:id', auth, requireRole(['creator', 'admin']), async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('course');
    
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    if (lesson.course.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this lesson' });
    }

    if (lesson.course.status === 'published') {
      return res.status(400).json({ message: 'Cannot delete lesson in published course' });
    }

    await Lesson.findByIdAndDelete(lesson._id);

    // Update course lessons array and total count
    const course = await Course.findById(lesson.course._id);
    course.lessons = course.lessons.filter(id => id.toString() !== lesson._id.toString());
    course.totalLessons = course.lessons.length;
    await course.save();

    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
