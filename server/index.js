// Load environment variables immediately
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/microcourses';

// --- 1. Middleware Setup ---
app.use(cors({
    // Allow requests from your React frontend URL
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'], 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
}));
app.use(express.json({ limit: '50mb' })); // To parse JSON bodies from incoming requests
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --- 2. Database Connection ---
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected successfully!'))
    .catch(err => console.error('MongoDB connection error:', err));


// Basic health check route
app.get('/', (req, res) => {
    res.status(200).send({ message: 'MicroCourses API is running!' });
});

// --- 3. Routes ---

// ** A. Authentication Routes **
app.use('/api/auth', require('./routes/auth'));

// ** B. Creator Routes (Apply, Dashboard, Course CRUD) **
app.use('/api/creator', require('./routes/creator'));

// ** C. Admin Routes (Review/Approval) **
app.use('/api/admin', require('./routes/admin'));

// ** D. Learner/Course Routes (Enroll, Progress, Browse) **
app.use('/api/courses', require('./routes/courses'));


// --- 4. Transcript Generation Routes ---

const transcriptService = require('./services/transcriptService');

// Trigger transcript generation for a lesson
app.post('/api/transcript/generate/:lessonId', async (req, res) => {
    try {
        const { lessonId } = req.params;
        const result = await transcriptService.triggerTranscriptGeneration(lessonId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error generating transcript', error: error.message });
    }
});

// Webhook for external transcript service (if using external service)
app.post('/api/webhooks/transcript-receive', async (req, res) => {
    const { lessonId, transcriptText, securityKey } = req.body;

    // Check security key
    if (securityKey !== process.env.WHISPER_SECRET_KEY) {
        console.warn('Unauthorized webhook call received.');
        return res.status(401).send('Unauthorized');
    }

    if (!lessonId || !transcriptText) {
        return res.status(400).send('Missing lessonId or transcriptText.');
    }

    try {
        const Lesson = require('./models/Lesson');
        await Lesson.findByIdAndUpdate(lessonId, { 
            transcript: transcriptText, 
            transcriptStatus: 'completed' 
        });
        
        console.log(`Transcript saved successfully for lesson ${lessonId}`);
        res.status(202).send('Transcript received and acknowledged.');
    } catch (error) {
        console.error('Error saving transcript:', error);
        res.status(500).send('Error saving transcript');
    }
});


// --- 5. Start the Server ---
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Environment:', process.env.NODE_ENV || 'development');
});