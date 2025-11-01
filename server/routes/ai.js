import express from "express";
import aiService from "../services/aiService.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// All AI routes require authentication
router.use(authenticateToken);

// Generate topic outline
router.post("/generate-outline", async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic || topic.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Topic is required"
      });
    }

    if (topic.length > 200) {
      return res.status(400).json({
        success: false,
        message: "Topic must be less than 200 characters"
      });
    }

    const outline = await aiService.generateTopicOutline(topic.trim());

    res.json({
      success: true,
      data: {
        topic,
        outline,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Generate outline error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate outline"
    });
  }
});



// Generate quiz from notes
router.post("/generate-quiz", async (req, res) => {
  try {
    const { noteContent, questionCount = 5 } = req.body;

    if (!noteContent || noteContent.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Note content is required"
      });
    }

    if (noteContent.length < 100) {
      return res.status(400).json({
        success: false,
        message: "Note content must be at least 100 characters long"
      });
    }

    if (questionCount < 1 || questionCount > 10) {
      return res.status(400).json({
        success: false,
        message: "Question count must be between 1 and 10"
      });
    }

    const quiz = await aiService.generateQuizFromNotes(noteContent, questionCount);

    res.json({
      success: true,
      data: {
        quiz,
        requestedQuestionCount: questionCount,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Generate quiz error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate quiz"
    });
  }
});

// Health check endpoint
router.get("/health", async (req, res) => {
  try {
    const isWorking = await aiService.testConnection();
    
    res.json({
      success: true,
      data: {
        aiServiceStatus: isWorking ? "connected" : "disconnected",
        timestamp: new Date().toISOString(),
        hasApiKey: !!process.env.GROQ_API_KEY
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "AI service health check failed",
      hasApiKey: !!process.env.GROQ_API_KEY
    });
  }
});

// Test endpoint for quick AI functionality check
router.post("/test", async (req, res) => {
  try {
    const outline = await aiService.generateTopicOutline("JavaScript Basics");
    
    res.json({
      success: true,
      message: "AI service is working correctly",
      data: {
        testOutline: outline.substring(0, 200) + "...", // First 200 chars
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "AI service test failed"
    });
  }
});

export default router;