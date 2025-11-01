class AIService {
  constructor() {
    this.groq = null;
    this.initialized = false;
  }

  async _initializeGroq() {
    if (this.initialized) return;
    
    if (!process.env.GROQ_API_KEY) {
      console.warn('⚠️  GROQ_API_KEY not found. AI features will be disabled.');
      this.groq = null;
    } else {
      try {
        const { default: Groq } = await import("groq-sdk");
        this.groq = new Groq({
          apiKey: process.env.GROQ_API_KEY,
        });
        console.log('✅ Groq AI service initialized');
      } catch (error) {
        console.error('❌ Failed to initialize Groq:', error.message);
        this.groq = null;
      }
    }
    this.initialized = true;
  }

  async _checkApiKey() {
    await this._initializeGroq();
    if (!this.groq) {
      throw new Error('AI service not available. Please configure GROQ_API_KEY in environment variables.');
    }
  }

  async generateTopicOutline(topic) {
    await this._checkApiKey();
    try {
      const prompt = `Create a comprehensive markdown outline for the topic: "${topic}"

Please structure it as a detailed study guide with:
- Main headings (##)
- Subheadings (###) 
- Key points as bullet points
- Include placeholders for notes like [Add your notes here]
- Make it educational and well-organized

Format the entire response as valid markdown that can be directly used in a note-taking app.`;

      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an expert educational content creator. Generate well-structured, comprehensive outlines in markdown format."
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 2048,
      });

      return completion.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("AI Service - Topic Outline Error:", error);
      throw new Error("Failed to generate topic outline");
    }
  }



  async generateQuizFromNotes(noteContent, questionCount = 5) {
    await this._checkApiKey();
    try {
      const prompt = `Create exactly ${questionCount} quiz questions based on this content:

${noteContent}

Format each question EXACTLY like these examples:

**1. Multiple Choice:**
What is the main concept discussed?
a) Option one
b) Option two
c) Option three
d) Option four
Correct answer: b)
Explanation: Brief explanation of why this is correct.

**2. True/False:**
True or False: The statement is accurate.
Correct answer: a) (True)
Explanation: Explanation of the concept.

**3. Short Answer:**
Describe the key difference between concept A and concept B.
Explanation: This tests deeper understanding of the material.

STRICT REQUIREMENTS:
- Start each question with **X. Type:** where X is the number
- Use exactly this format for multiple choice: a) b) c) d)
- Always include "Correct answer: X)" line for MC and T/F
- Add "Explanation:" line after each question
- No extra text before or after the questions
- Make ${questionCount} questions total`;

      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an educational assessment expert. Create meaningful quiz questions that test comprehension and application of knowledge."
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.6,
        max_tokens: 2048,
      });

      return completion.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("AI Service - Quiz Generation Error:", error);
      throw new Error("Failed to generate quiz questions");
    }
  }

  // Health check method
  async testConnection() {
    await this._initializeGroq();
    if (!this.groq) {
      return false;
    }
    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: "Say 'AI service is working' if you can read this.",
          },
        ],
        model: "llama-3.1-8b-instant",
        max_tokens: 10,
      });

      return completion.choices[0]?.message?.content?.includes("working") || false;
    } catch (error) {
      console.error("AI Service - Connection Test Error:", error);
      return false;
    }
  }
}

export default new AIService();