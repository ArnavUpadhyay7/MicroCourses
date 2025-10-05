const dotenv = require("dotenv");
dotenv.config();

const express = require('express');
const cors = require("cors");
const compression = require('compression');
const cookieParser = require("cookie-parser");
const mongoose = require('mongoose');
const path = require("path");

// --- Configuration & Setup ---

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI; 
const CLIENT_URL = (process.env.CLIENT_URL || 'http://localhost:5174').replace(/\/$/, ''); 
const isProduction = process.env.NODE_ENV === 'production';

const __dirname = path.resolve();


// --- Database Connection ---
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


// --- CORS Options (Based on your provided example) ---
const corsOptions = {
    // In production, allow ONLY the designated client URL. Otherwise, allow localhost.
    origin: isProduction
        ? CLIENT_URL 
        : "http://localhost:5174", // Your default local FE port
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};


// --- Middleware Setup ---
app.use(compression()); // Uses Gzip compression
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// --- Health Check / Root Endpoint ---
app.get('/', (req, res) => {
    res.status(200).json({ message: 'MicroCourses API is running!', environment: process.env.NODE_ENV || 'development' });
});


// ** A. Authentication Routes **
app.use('/api/auth', require('./routes/auth'));

// ** B. Creator Routes (Apply, Dashboard, Course CRUD) **
app.use('/api/creator', require('./routes/creator'));

// ** C. Admin Routes (Review/Approval) **
app.use('/api/admin', require('./routes/admin'));

// ** D. Learner/Course Routes (Enroll, Progress, Browse) **
app.use('/api/courses', require('./routes/courses'));


// --- Transcript Generation Routes ---
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

// Webhook for external transcript service
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

if(process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
    });
}

app.listen(PORT, '0.0.0.0', ()=> {
    console.log(`Server is listening on port: ${PORT}`);
    console.log(`CORS allowed origin: ${isProduction ? CLIENT_URL : 'http://localhost:5174'}`);
});
