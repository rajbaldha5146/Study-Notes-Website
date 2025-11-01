import api from './api';

class AIService {
  // Generate topic outline
  async generateTopicOutline(topic) {
    try {
      const response = await api.post('/ai/generate-outline', { topic });
      return response.data;
    } catch (error) {
      console.error('AI Service - Generate Outline Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate outline');
    }
  }



  // Generate quiz from notes
  async generateQuizFromNotes(noteContent, questionCount = 5) {
    try {
      const response = await api.post('/ai/generate-quiz', {
        noteContent,
        questionCount
      });
      return response.data;
    } catch (error) {
      console.error('AI Service - Generate Quiz Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate quiz');
    }
  }

  // Check AI service health
  async checkHealth() {
    try {
      const response = await api.get('/ai/health');
      return response.data;
    } catch (error) {
      console.error('AI Service - Health Check Error:', error);
      return { success: false, data: { aiServiceStatus: 'disconnected' } };
    }
  }
}

export default new AIService();