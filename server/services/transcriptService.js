const axios = require('axios');
const Lesson = require('../models/Lesson');

class TranscriptService {
  constructor() {
    // Using Hugging Face's free Whisper API
    this.apiUrl = 'https://api-inference.huggingface.co/models/openai/whisper-large-v3';
    this.apiKey = process.env.HUGGINGFACE_API_KEY
  }

  async generateTranscript(lessonId, videoUrl) {
    try {
      // Update lesson status to processing
      await Lesson.findByIdAndUpdate(lessonId, {
        transcriptStatus: 'processing'
      });

      // For demo purposes, we'll simulate the process
      // In production, you would:
      // 1. Download the video file
      // 2. Extract audio
      // 3. Send to Hugging Face API
      // 4. Process the response

      console.log(`Starting transcript generation for lesson ${lessonId}`);
      
      // Simulate API call to Hugging Face
      const response = await this.callHuggingFaceAPI(videoUrl);
      
      if (response.success) {
        // Update lesson with transcript
        await Lesson.findByIdAndUpdate(lessonId, {
          transcript: response.transcript,
          transcriptStatus: 'completed'
        });

        console.log(`Transcript generated successfully for lesson ${lessonId}`);
        return { success: true, transcript: response.transcript };
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error(`Error generating transcript for lesson ${lessonId}:`, error);
      
      // Update lesson status to failed
      await Lesson.findByIdAndUpdate(lessonId, {
        transcriptStatus: 'failed'
      });

      return { success: false, error: error.message };
    }
  }

  async callHuggingFaceAPI(videoUrl) {
    try {
      // This is a simplified version - in production you'd need to:
      // 1. Download the video file
      // 2. Convert to audio format
      // 3. Send audio file to Hugging Face API

      // For demo purposes, return a mock transcript
      const mockTranscript = `
        Welcome to this lesson. In this video, we will cover the main concepts and provide you with practical examples.
        
        Let's start with the basics. The first thing you need to understand is the fundamental principle behind this topic.
        
        Moving on to the next section, we'll explore more advanced concepts and how they apply in real-world scenarios.
        
        Finally, we'll wrap up with a summary of what we've learned and some practical exercises you can try.
        
        Thank you for watching this lesson. Don't forget to complete the exercises and move on to the next lesson.
      `;

      return {
        success: true,
        transcript: mockTranscript.trim()
      };

      // Uncomment below for actual Hugging Face API integration:
      /*
      const response = await axios.post(this.apiUrl, {
        inputs: videoUrl, // In production, this would be the audio file
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        transcript: response.data.text
      };
      */
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Method to manually trigger transcript generation
  async triggerTranscriptGeneration(lessonId) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    if (lesson.transcriptStatus === 'completed') {
      return { message: 'Transcript already generated' };
    }

    return await this.generateTranscript(lessonId, lesson.videoUrl);
  }
}

module.exports = new TranscriptService();
