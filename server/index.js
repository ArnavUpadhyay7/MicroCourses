// Load environment variables immediately
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
// CRITICAL FIX 1: Use Render's assigned port via process.env.PORT
const PORT = process.env.PORT || 5000;
// CRITICAL FIX 2: Always use the secure MONGO_URI from the environment variables
const MONGO_URI = process.env.MONGO_URI; 
// CRITICAL FIX 3: Get the CLIENT_URL and ensure no trailing slash for the origin list
const CLIENT_URL = (process.env.CLIENT_URL || 'http://localhost:5174').replace(/\/$/, ''); 


// --- 1. Middleware Setup ---

// CRITICAL FIX 4: Use an array of trusted origins for the CORS middleware.
// This is more declarative and less prone to custom function errors.
const TRUSTED_ORIGINS = [
    // Local development origins
    'http://localhost:3000', 
    'http://localhost:5173', 
    'http://localhost:5174',
    // Production origin (from Render environment variable)
    CLIENT_URL 
];

// Reverting to the simpler, standard CORS configuration using the origins array.
app.use(cors({
    origin: TRUSTED_ORIGINS,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
}));

app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


// --- 2. Database Connection ---
if (!MONGO_URI) {
    console.error("FATAL ERROR: MONGO_URI is not defined.");
    process.exit(1); 
}

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected successfully!'))
    .catch(err => {
        console.error('FATAL MongoDB connection error:', err);
        process.exit(1); 
    });


// Basic health check route
app.get('/', (req, res) => {
    res.status(200).send({ message: 'MicroCourses API is running!', environment: process.env.NODE_ENV || 'development' });
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
