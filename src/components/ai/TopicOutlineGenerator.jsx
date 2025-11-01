import { useState } from 'react';
import { Lightbulb, Loader2, FileText, Sparkles } from 'lucide-react';
import aiService from '../../services/aiService';
import toast from 'react-hot-toast';

export default function TopicOutlineGenerator({ onOutlineGenerated }) {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    if (topic.length > 200) {
      toast.error('Topic must be less than 200 characters');
      return;
    }

    setIsGenerating(true);
    
    try {
      const result = await aiService.generateTopicOutline(topic);
      
      if (result.success) {
        onOutlineGenerated({
          title: `${topic} - Study Outline`,
          content: result.data.outline,
          topic: result.data.topic
        });
        toast.success('Outline generated successfully!');
        setTopic(''); // Clear input
      } else {
        toast.error(result.message || 'Failed to generate outline');
      }
    } catch (error) {
      console.error('Outline generation error:', error);
      toast.error(error.message || 'Failed to generate outline');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-xl border border-blue-500/20 p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl">
          <Lightbulb className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">AI Topic Outline Generator</h3>
          <p className="text-sm text-gray-400">Generate a structured study outline for any topic</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="topic-input" className="block text-sm font-medium text-gray-300 mb-2">
            Enter your topic
          </label>
          <input
            id="topic-input"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., JavaScript Promises, Machine Learning Basics, World War II..."
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            maxLength={200}
            disabled={isGenerating}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              Press Enter to generate or click the button below
            </p>
            <span className="text-xs text-gray-500">
              {topic.length}/200
            </span>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !topic.trim()}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating Outline...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Generate AI Outline</span>
            </>
          )}
        </button>

        {/* Example topics */}
        <div className="border-t border-gray-700/50 pt-4">
          <p className="text-xs text-gray-400 mb-2">Example topics:</p>
          <div className="flex flex-wrap gap-2">
            {[
              'React Hooks',
              'Data Structures',
              'Climate Change',
              'Financial Planning',
              'Photography Basics'
            ].map((example) => (
              <button
                key={example}
                onClick={() => setTopic(example)}
                disabled={isGenerating}
                className="px-3 py-1 text-xs bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}