import { useState, useRef } from "react";
import { Sparkles, Loader2, Lightbulb } from "lucide-react";
import aiService from "../../services/aiService";
import toast from "react-hot-toast";

export default function AITopicGenerator({ onContentGenerated, isVisible }) {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const topicInputRef = useRef(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    if (topic.length > 200) {
      toast.error("Topic must be less than 200 characters");
      return;
    }

    setIsGenerating(true);

    try {
      const result = await aiService.generateTopicOutline(topic);

      if (result.success) {
        onContentGenerated({
          title: topic,
          content: result.data.outline,
        });
        toast.success("AI content generated successfully!");
        setTopic(""); // Clear input
      } else {
        toast.error(result.message || "Failed to generate content");
      }
    } catch (error) {
      console.error("Content generation error:", error);
      toast.error(error.message || "Failed to generate content");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleExampleClick = (example) => {
    setTopic(example);
    // Immediately focus back to the input to prevent cursor jumping
    if (topicInputRef.current) {
      topicInputRef.current.focus();
      // Set cursor to end of text
      setTimeout(() => {
        if (topicInputRef.current) {
          topicInputRef.current.setSelectionRange(
            example.length,
            example.length
          );
        }
      }, 0);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-purple-500/10 rounded-xl border border-purple-500/20 p-4 mb-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl">
          <Lightbulb className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">
            Create Note with AI
          </h3>
          <p className="text-sm text-gray-400">
            Enter a topic and AI will generate structured content
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="ai-topic-input"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            What would you like to learn about?
          </label>
          <input
            ref={topicInputRef}
            id="ai-topic-input"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., JavaScript Promises, Machine Learning Basics, World War II..."
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            maxLength={200}
            disabled={isGenerating}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              AI will create a comprehensive outline for your topic
            </p>
            <span className="text-xs text-gray-500">{topic.length}/200</span>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !topic.trim()}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating Content...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Generate with AI</span>
            </>
          )}
        </button>

        {/* Example topics */}
        <div className="border-t border-gray-700/50 pt-4">
          <p className="text-xs text-gray-400 mb-2">Quick examples:</p>
          <div className="flex flex-wrap gap-2">
            {[
              "React Hooks",
              "Data Structures",
              "Climate Change",
              "Financial Planning",
              "Photography Basics",
            ].map((example) => (
              <button
                key={example}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleExampleClick(example);
                }}
                disabled={isGenerating}
                type="button"
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
