const express = require('express');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');
const { auth, requireRole } = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');

const router = express.Router();

// Get all published courses (for learners)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, level, search, page = 1, limit = 12 } = req.query;
    
    const filter = { status: 'published' };
    
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let courses = await Course.find(filter)
      .populate('creator', 'name')
      .select('-lessons -enrolledStudents')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // If logged in, include an isEnrolled flag for each course
    if (req.user) {
      const enrollments = await Enrollment.find({ student: req.user._id })
        .select('course');
      const enrolledIds = new Set(enrollments.map(e => String(e.course)));
      courses = courses.map(c => ({
        ...c.toObject(),
        isEnrolled: enrolledIds.has(String(c._id))
      }));
    }

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

// Get course details
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const course = await Course.findOne({ 
      _id: req.params.id, 
      status: 'published' 
    })
      .populate('creator', 'name email')
      .populate({
        path: 'lessons',
        options: { sort: { order: 1 } },
        select: 'title description duration order isPublished'
      });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is enrolled (if authenticated)
    let enrollment = null;
    if (req.user) {
      enrollment = await Enrollment.findOne({
        student: req.user._id,
        course: course._id
      }).populate('completedLessons', 'title duration');
    }

    res.json({ course, enrollment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Enroll in course
router.post('/:id/enroll', auth, requireRole(['learner']), async (req, res) => {
  try {
    const course = await Course.findOne({ 
      _id: req.params.id, 
      status: 'published' 
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: course._id
    });

    if (existingEnrollment) {
      // 🎯 CRITICAL CHANGE: Return 200 OK and the existing enrollment object.
      return res.status(200).json({ 
          message: 'Already enrolled in this course', 
          enrollment: existingEnrollment // <-- Send the enrollment object
      });
    }

    // Create enrollment
    const enrollment = new Enrollment({
      student: req.user._id,
      course: course._id
    });

    await enrollment.save();

    // Add student to course
    course.enrolledStudents.push(req.user._id);
    await course.save();

    res.status(201).json({ message: 'Enrolled successfully', enrollment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get lesson by ID (for enrolled users)
router.get('/lessons/:lessonId', auth, async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId).populate('course', 'title status');
    
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: lesson.course._id
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    res.json({ lesson });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get lesson details
router.get('/:courseId/lessons/:lessonId', auth, async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;

    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    const lesson = await Lesson.findOne({
      _id: lessonId,
      course: courseId
    });

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    res.json({ lesson });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark lesson as completed by lesson ID
router.post('/lessons/:lessonId/complete', auth, requireRole(['learner']), async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // 1. Fetch Enrollment
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: lesson.course
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }
    
    // Check if already completed
    const completedLessonIds = enrollment.completedLessons.map(l => String(l.lesson || l));
    if (completedLessonIds.includes(lessonId)) {
      return res.status(200).json({ 
        message: 'Lesson already completed', 
        enrollment: enrollment 
      });
    }
    
    // Add to completed lessons (using the complex object structure to match likely schema)
    enrollment.completedLessons.push({
        lesson: lessonId,       
        completedAt: new Date() 
    });

    // 2. Update course progress
    const course = await Course.findById(lesson.course).select('lessons');
    
    if (!course || !course.lessons || course.lessons.length === 0) { 
        enrollment.progress = 100; 
    } else {
        const totalLessons = course.lessons.length;
        // Count based on the array length
        const completedCount = enrollment.completedLessons.length;
        const progress = Math.min(100, Math.round((completedCount / totalLessons) * 100));
        enrollment.progress = progress;
    }
    
    // 3. Check for course completion and certificate logic
    if (enrollment.progress === 100) {
      enrollment.isCompleted = true;
      enrollment.completedAt = new Date();

      if (!enrollment.certificate) {
        // 🎯 CRITICAL FIX: Generate the required serialNumber field
        const base = String(req.user._id).slice(-4) + String(course._id).slice(-4);
        const serialNumber = `${base}-${Date.now().toString(36)}`.toUpperCase();

        const certificate = new Certificate({
          student: req.user._id,
          course: course._id,
          enrollment: enrollment._id,
          serialNumber: serialNumber, // <-- ADDED REQUIRED FIELD
          verificationUrl: `${process.env.CLIENT_URL || 'http://localhost:5174'}/certificate/${course._id}`
        });
        
        // This save operation caused the 500 error. It should now pass validation.
        await certificate.save(); 
        enrollment.certificate = certificate._id;
      }
    }

    await enrollment.save();

    // 4. Return the fully updated enrollment object
    res.json({ 
      message: 'Lesson completed successfully', 
      enrollment: enrollment 
    });
  } catch (error) {
    // This block is what caused your error log. 
    // We re-log it to see if the fix worked or if a new error surfaced.
    console.error('SERVER 500 ERROR in /lessons/:lessonId/complete:', error);
    res.status(500).json({ message: 'Server error during completion.', error: error.message });
  }
});

// Mark lesson as completed
router.post('/:courseId/lessons/:lessonId/complete', auth, requireRole(['learner']), async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;

    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    // Check if lesson exists
    const lesson = await Lesson.findOne({
      _id: lessonId,
      course: courseId
    });

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check if already completed
    const alreadyCompleted = enrollment.completedLessons.some(
      completed => completed.lesson.toString() === lessonId
    );

    if (alreadyCompleted) {
      return res.status(400).json({ message: 'Lesson already completed' });
    }

    // Add to completed lessons
    enrollment.completedLessons.push({
      lesson: lessonId,
      completedAt: new Date()
    });

    // Calculate progress
    const course = await Course.findById(courseId);
    const totalLessons = course.lessons.length;
    const completedCount = enrollment.completedLessons.length;
    enrollment.progress = Math.round((completedCount / totalLessons) * 100);

    // Check if course is completed
    if (enrollment.progress === 100) {
      enrollment.isCompleted = true;
      enrollment.completedAt = new Date();

      // Generate certificate
      const certificate = new Certificate({
        student: req.user._id,
        course: courseId,
        enrollment: enrollment._id,
        verificationUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/certificate/${courseId}`
      });

      await certificate.save();
      enrollment.certificate = certificate._id;
    }

    await enrollment.save();

    res.json({ 
      message: 'Lesson completed successfully',
      progress: enrollment.progress,
      isCompleted: enrollment.isCompleted,
      certificate: enrollment.certificate
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's progress
router.get('/:id/progress', auth, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.id
    }).populate('course', 'title thumbnail totalLessons')
      .populate({
        path: 'completedLessons.lesson',
        select: 'title order duration'
      });

    if (!enrollment) {
      return res.status(404).json({ message: 'Not enrolled in this course' });
    }

    res.json({ enrollment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's enrolled courses
router.get('/user/enrolled', auth, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate('course', 'title thumbnail description creator totalLessons')
      .populate('course.creator', 'name')
      .sort({ enrolledAt: -1 });

    res.json({ enrollments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get certificate
router.get('/:courseId/certificate', auth, async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      student: req.user._id,
      course: req.params.courseId
    }).populate('course', 'title creator')
      .populate('course.creator', 'name');

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    res.json({ certificate });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify certificate
router.get('/certificate/verify/:serialNumber', async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      serialNumber: req.params.serialNumber
    }).populate('student', 'name email')
      .populate('course', 'title creator')
      .populate('course.creator', 'name');

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    res.json({ certificate });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
