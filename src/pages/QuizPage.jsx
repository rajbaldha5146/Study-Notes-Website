import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  RotateCcw,
  Trophy,
  Clock,
  Target,
  Brain,
  Sparkles,
  Award,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { getNote } from "../services/api";
import aiService from "../services/aiService";
import BookLoader from "../components/BookLoader";
import toast from "react-hot-toast";

export default function QuizPage() {
  const { noteId } = useParams();
  const navigate = useNavigate();

  const [note, setNote] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [timeStarted, setTimeStarted] = useState(null);
  const [timeCompleted, setTimeCompleted] = useState(null);

  useEffect(() => {
    loadNoteAndGenerateQuiz();
  }, [noteId]);

  const loadNoteAndGenerateQuiz = async () => {
    try {
      setLoading(true);
      const noteData = await getNote(noteId);
      setNote(noteData);

      if (noteData.content && noteData.content.length >= 100) {
        setGenerating(true);
        const quizResult = await aiService.generateQuizFromNotes(
          noteData.content,
          5
        );

        if (quizResult.success) {
          console.log("Raw AI Response:", quizResult.data.quiz);
          const parsedQuiz = parseQuizContent(quizResult.data.quiz);
          console.log("Parsed Quiz:", parsedQuiz);

          if (parsedQuiz.length === 0) {
            toast.error("Could not parse quiz questions. Please try again.");
            navigate(-1);
            return;
          }
          setQuiz(parsedQuiz);
          setTimeStarted(new Date());
          toast.success(`Quiz ready! ${parsedQuiz.length} questions generated.`);
        } else {
          toast.error("Failed to generate quiz");
          navigate(-1);
        }
      } else {
        toast.error("Note content is too short for quiz generation (minimum 100 characters)");
        navigate(-1);
      }
    } catch (error) {
      console.error("Error loading quiz:", error);
      toast.error("Failed to load quiz");
      navigate(-1);
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  const parseQuizContent = (quizText) => {
    const questions = [];

    try {
      const patterns = [
        /\*\*(\d+)\.\s*([^:]*?):\*\*\n(.*?)(?=\*\*\d+\.|$)/gs,
        /(\d+)\.\s*([^:]*?):\n(.*?)(?=\d+\.|$)/gs,
        /\*\*(\d+)\.\s*(.*?)(?=\*\*\d+\.|$)/gs,
        /(\d+)\.\s*(.*?)(?=\d+\.|$)/gs,
      ];

      let matches = [];

      for (const pattern of patterns) {
        matches = [...quizText.matchAll(pattern)];
        if (matches.length > 0) break;
      }

      if (matches.length === 0) {
        const lines = quizText
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line);
        let currentQuestion = null;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (/^\*?\*?\d+\./.test(line)) {
            if (currentQuestion && currentQuestion.question) {
              questions.push(currentQuestion);
            }

            const questionText = line
              .replace(/^\*?\*?\d+\.\s*/, "")
              .replace(/\*\*/g, "");
            currentQuestion = {
              id: questions.length + 1,
              question: questionText,
              type: "multiple-choice",
              options: [],
              correctAnswer: "",
              explanation: "",
            };

            if (
              line.toLowerCase().includes("true") &&
              line.toLowerCase().includes("false")
            ) {
              currentQuestion.type = "true-false";
              currentQuestion.options = [
                { letter: "a", text: "True" },
                { letter: "b", text: "False" },
              ];
            } else if (
              questionText.toLowerCase().includes("describe") ||
              questionText.toLowerCase().includes("explain")
            ) {
              currentQuestion.type = "short-answer";
              currentQuestion.options = [];
            }
          } else if (currentQuestion && /^[a-d]\)\s/.test(line)) {
            const optionLetter = line.charAt(0);
            const optionText = line.replace(/^[a-d]\)\s*/, "");
            currentQuestion.options.push({
              letter: optionLetter,
              text: optionText,
            });
          } else if (
            currentQuestion &&
            line.toLowerCase().includes("correct answer")
          ) {
            const answerMatch = line.match(/([a-d])\)/);
            if (answerMatch) {
              currentQuestion.correctAnswer = answerMatch[1];
            } else if (line.toLowerCase().includes("false")) {
              currentQuestion.correctAnswer = "b";
            } else if (line.toLowerCase().includes("true")) {
              currentQuestion.correctAnswer = "a";
            }
          } else if (
            currentQuestion &&
            line.toLowerCase().includes("explanation:")
          ) {
            currentQuestion.explanation = line.replace(/explanation:\s*/i, "");
          } else if (
            currentQuestion &&
            !line.match(/^[a-d]\)/) &&
            !line.toLowerCase().includes("correct") &&
            !line.toLowerCase().includes("explanation") &&
            currentQuestion.options.length === 0
          ) {
            currentQuestion.question += " " + line.replace(/\*\*/g, "");
          }
        }

        if (currentQuestion && currentQuestion.question) {
          questions.push(currentQuestion);
        }
      } else {
        matches.forEach((match, index) => {
          const questionNumber = match[1];
          const questionType = match[2] || "";
          const content = match[3] || match[2] || "";

          const lines = content
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line);

          let question = "";
          let options = [];
          let correctAnswer = "";
          let explanation = "";
          let type = "multiple-choice";

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (i === 0 && !line.match(/^[a-d]\)/)) {
              question = line.replace(/\*\*/g, "");
            } else if (/^[a-d]\)\s/.test(line)) {
              const optionLetter = line.charAt(0);
              const optionText = line.replace(/^[a-d]\)\s*/, "");
              options.push({
                letter: optionLetter,
                text: optionText,
              });
            } else if (line.toLowerCase().includes("correct answer")) {
              const answerMatch = line.match(/([a-d])\)/);
              if (answerMatch) {
                correctAnswer = answerMatch[1];
              }
            } else if (line.toLowerCase().includes("explanation:")) {
              explanation = line.replace(/explanation:\s*/i, "");
            }
          }

          if (
            questionType.toLowerCase().includes("true") ||
            question.toLowerCase().includes("true or false")
          ) {
            type = "true-false";
            if (options.length === 0) {
              options = [
                { letter: "a", text: "True" },
                { letter: "b", text: "False" },
              ];
            }
          } else if (
            questionType.toLowerCase().includes("short") ||
            question.toLowerCase().includes("describe") ||
            question.toLowerCase().includes("explain")
          ) {
            type = "short-answer";
            options = [];
          }

          if (question) {
            questions.push({
              id: parseInt(questionNumber),
              question: question.trim(),
              type: type,
              options: options,
              correctAnswer: correctAnswer,
              explanation: explanation,
            });
          }
        });
      }

      questions.sort((a, b) => a.id - b.id);
    } catch (error) {
      console.error("Error parsing quiz content:", error);
    }

    return questions;
  };

  const handleAnswerSelect = (questionId, answer) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: answer,
    });
  };

  const handleSubmitQuiz = () => {
    const unanswered = quiz.filter(q => !userAnswers[q.id]).length;
    
    if (unanswered > 0) {
      const confirmed = window.confirm(
        `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Submit anyway?`
      );
      if (!confirmed) return;
    }

    setTimeCompleted(new Date());
    setShowResults(true);
  };

  const calculateScore = () => {
    if (!quiz) return { percentage: 0, correct: 0, total: 0 };

    let correct = 0;
    let totalWithAnswers = 0;

    quiz.forEach((question) => {
      if (question.correctAnswer) {
        totalWithAnswers++;
        if (userAnswers[question.id] === question.correctAnswer) {
          correct++;
        }
      }
    });

    const percentage =
      totalWithAnswers > 0 ? Math.round((correct / totalWithAnswers) * 100) : 0;

    return {
      percentage,
      correct,
      total: totalWithAnswers,
      answered: Object.keys(userAnswers).length,
      totalQuestions: quiz.length,
    };
  };

  const getTimeTaken = () => {
    if (!timeStarted || !timeCompleted) return 0;
    return Math.round((timeCompleted - timeStarted) / 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getScoreMessage = (percentage) => {
    if (percentage >= 90) return { text: "Outstanding! 🌟", color: "text-yellow-400" };
    if (percentage >= 80) return { text: "Excellent! 🎉", color: "text-emerald-400" };
    if (percentage >= 70) return { text: "Good Job! 👍", color: "text-blue-400" };
    if (percentage >= 60) return { text: "Not Bad! 😊", color: "text-purple-400" };
    return { text: "Keep Practicing! 💪", color: "text-gray-400" };
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setUserAnswers({});
    setShowResults(false);
    setTimeStarted(new Date());
    setTimeCompleted(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading || generating) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-[70vh]">
          <BookLoader
            message={
              generating
                ? "🧠 Generating quiz questions from your notes..."
                : "📚 Loading quiz..."
            }
          />
        </div>
      </div>
    );
  }

  if (!quiz || quiz.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-3xl flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">
              Quiz Not Available
            </h1>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Unable to generate quiz from this note. The note might be too short or doesn't contain suitable content.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Go Back to Note
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const scoreData = calculateScore();
    const timeTaken = getTimeTaken();
    const scoreMessage = getScoreMessage(scoreData.percentage);

    return (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Note</span>
          </button>
        </div>

        {/* Results Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-3xl border border-blue-500/20 p-8 sm:p-12 text-center mb-8 backdrop-blur-sm">
          {/* Animated background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-500 via-yellow-400 to-yellow-600 rounded-3xl mb-6 shadow-2xl shadow-yellow-500/30 animate-bounce">
              <Trophy className="h-12 w-12 text-white" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
              Quiz Complete!
            </h1>
            <p className={`text-2xl font-bold mb-2 ${scoreMessage.color}`}>
              {scoreMessage.text}
            </p>
            <p className="text-gray-400 max-w-2xl mx-auto">
              You've completed the quiz for: <span className="text-white font-semibold">{note?.title}</span>
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm rounded-2xl border border-blue-500/20 p-6 text-center transform hover:scale-105 transition-all duration-300">
            <div className="w-12 h-12 mx-auto mb-3 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Target className="h-6 w-6 text-blue-400" />
            </div>
            <div className="text-4xl font-bold text-blue-400 mb-2">
              {scoreData.percentage}%
            </div>
            <div className="text-sm text-gray-400 font-medium">Overall Score</div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 backdrop-blur-sm rounded-2xl border border-emerald-500/20 p-6 text-center transform hover:scale-105 transition-all duration-300">
            <div className="w-12 h-12 mx-auto mb-3 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="text-4xl font-bold text-emerald-400 mb-2">
              {scoreData.correct}/{scoreData.total}
            </div>
            <div className="text-sm text-gray-400 font-medium">Correct</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-6 text-center transform hover:scale-105 transition-all duration-300">
            <div className="w-12 h-12 mx-auto mb-3 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-purple-400" />
            </div>
            <div className="text-4xl font-bold text-purple-400 mb-2">
              {scoreData.answered}/{scoreData.totalQuestions}
            </div>
            <div className="text-sm text-gray-400 font-medium">Answered</div>
          </div>

          <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 backdrop-blur-sm rounded-2xl border border-cyan-500/20 p-6 text-center transform hover:scale-105 transition-all duration-300">
            <div className="w-12 h-12 mx-auto mb-3 bg-cyan-500/20 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-cyan-400" />
            </div>
            <div className="text-4xl font-bold text-cyan-400 mb-2">
              {formatTime(timeTaken)}
            </div>
            <div className="text-sm text-gray-400 font-medium">Time Taken</div>
          </div>
        </div>

        {/* Question Review */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl">
              <Award className="h-6 w-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Question Review</h2>
          </div>

          <div className="space-y-6">
            {quiz.map((question, index) => {
              const userAnswer = userAnswers[question.id];
              const isCorrect = question.correctAnswer
                ? userAnswer === question.correctAnswer
                : true;
              const userAnswerText =
                question.options.find((opt) => opt.letter === userAnswer)
                  ?.text || userAnswer;
              const correctAnswerText = question.options.find(
                (opt) => opt.letter === question.correctAnswer
              )?.text;

              return (
                <div
                  key={question.id}
                  className={`group relative bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl ${
                    question.correctAnswer
                      ? isCorrect
                        ? 'border-emerald-500/30 hover:border-emerald-500/50'
                        : 'border-red-500/30 hover:border-red-500/50'
                      : 'border-gray-700/50 hover:border-gray-600/50'
                  }`}
                >
                  {/* Status indicator line */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${
                    question.correctAnswer
                      ? isCorrect
                        ? 'bg-gradient-to-b from-emerald-500 to-emerald-600'
                        : 'bg-gradient-to-b from-red-500 to-red-600'
                      : 'bg-gradient-to-b from-blue-500 to-purple-500'
                  }`} />

                  <div className="flex gap-4">
                    {/* Question number/status icon */}
                    <div className="flex-shrink-0">
                      {question.correctAnswer ? (
                        isCorrect ? (
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <CheckCircle className="h-5 w-5 text-white" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                            <XCircle className="h-5 w-5 text-white" />
                          </div>
                        )
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg text-white font-bold">
                          {index + 1}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-4">
                      {/* Question */}
                      <div>
                        <div className="flex items-start gap-2 mb-2">
                          <h4 className="text-sm font-semibold text-gray-400">
                            Question {index + 1}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            question.type === 'true-false'
                              ? 'bg-blue-500/20 text-blue-400'
                              : question.type === 'short-answer'
                              ? 'bg-purple-500/20 text-purple-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {question.type === 'true-false' ? 'T/F' : question.type === 'short-answer' ? 'Short Answer' : 'Multiple Choice'}
                          </span>
                        </div>
                        <p className="text-lg text-white leading-relaxed font-medium">
                          {question.question}
                        </p>
                      </div>

                      {/* Options */}
                      {question.options.length > 0 && (
                        <div className="bg-gray-900/50 rounded-xl p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {question.options.map((option) => {
                              const isUserAnswer = userAnswer === option.letter;
                              const isCorrectOption = question.correctAnswer === option.letter;
                              
                              return (
                                <div
                                  key={option.letter}
                                  className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                                    isCorrectOption
                                      ? 'bg-emerald-500/10'
                                      : isUserAnswer && !isCorrect
                                      ? 'bg-red-500/10'
                                      : ''
                                  }`}
                                >
                                  <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                                    isCorrectOption
                                      ? 'bg-emerald-500 text-white'
                                      : isUserAnswer && !isCorrect
                                      ? 'bg-red-500 text-white'
                                      : 'bg-gray-700 text-gray-300'
                                  }`}>
                                    {option.letter.toUpperCase()}
                                  </span>
                                  <span className={`text-sm ${
                                    isCorrectOption || (isUserAnswer && !isCorrect)
                                      ? 'text-white font-medium'
                                      : 'text-gray-400'
                                  }`}>
                                    {option.text}
                                  </span>
                                  {isCorrectOption && (
                                    <CheckCircle className="h-4 w-4 text-emerald-400 ml-auto" />
                                  )}
                                  {isUserAnswer && !isCorrect && (
                                    <XCircle className="h-4 w-4 text-red-400 ml-auto" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Answers */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-gray-900/50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-2 h-2 rounded-full ${
                              isCorrect ? 'bg-emerald-400' : 'bg-red-400'
                            }`} />
                            <h5 className="text-sm font-semibold text-gray-400">
                              Your Answer:
                            </h5>
                          </div>
                          <p className={`font-medium ${
                            isCorrect ? "text-emerald-400" : "text-red-400"
                          }`}>
                            {userAnswerText || (
                              <span className="text-gray-500 italic">Not answered</span>
                            )}
                          </p>
                        </div>

                        {question.correctAnswer && (
                          <div className="bg-gray-900/50 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-400" />
                              <h5 className="text-sm font-semibold text-gray-400">
                                Correct Answer:
                              </h5>
                            </div>
                            <p className="text-emerald-400 font-medium">
                              {correctAnswerText ||
                                question.correctAnswer.toUpperCase()}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Explanation */}
                      {question.explanation && (
                        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4">
                          <div className="flex items-start gap-2">
                            <Sparkles className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <h5 className="text-sm font-semibold text-blue-400 mb-1">
                                Explanation
                              </h5>
                              <p className="text-gray-300 leading-relaxed text-sm">
                                {question.explanation}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={resetQuiz}
            className="group flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105"
          >
            <RotateCcw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
            Retake Quiz
          </button>
          <button
            onClick={() => navigate(`/app/note/${noteId}`)}
            className="group flex items-center justify-center gap-2 px-8 py-4 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-xl font-semibold transition-all duration-300 border border-gray-600/50 hover:border-gray-500/50 transform hover:scale-105"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            Back to Note
          </button>
        </div>
      </div>
    );
  }

  const currentQ = quiz[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.length) * 100;
  const isAnswered = userAnswers[currentQ.id] !== undefined;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <button
          onClick={() => {
            if (Object.keys(userAnswers).length > 0) {
              const confirmed = window.confirm('Are you sure you want to leave? Your progress will be lost.');
              if (confirmed) navigate(-1);
            } else {
              navigate(-1);
            }
          }}
          className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Note</span>
        </button>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-xl border border-gray-700/50 backdrop-blur-sm">
            <Clock className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-gray-300">
              Question {currentQuestion + 1} of {quiz.length}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
        <div className="flex justify-between text-sm text-gray-400 mb-3">
          <span className="font-medium">Quiz Progress</span>
          <span className="font-bold text-white">{Math.round(progress)}%</span>
        </div>
        <div className="relative w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-shimmer" />
          </div>
        </div>
        
        {/* Question dots */}
        <div className="flex justify-between mt-4 gap-1">
          {quiz.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                index === currentQuestion
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 scale-110'
                  : userAnswers[quiz[index].id]
                  ? 'bg-emerald-500'
                  : 'bg-gray-700/50 hover:bg-gray-600/50'
              }`}
              title={`Question ${index + 1}${userAnswers[quiz[index].id] ? ' (Answered)' : ''}`}
            />
          ))}
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 sm:p-8 mb-8 animate-in zoom-in duration-300">
        {/* Question header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {currentQuestion + 1}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                currentQ.type === 'true-false'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : currentQ.type === 'short-answer'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {currentQ.type === 'true-false' ? 'True/False' : currentQ.type === 'short-answer' ? 'Short Answer' : 'Multiple Choice'}
              </span>
              {isAnswered && (
                <span className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold border border-emerald-500/30">
                  <CheckCircle className="h-3 w-3" />
                  Answered
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
              {currentQ.question}
            </h2>
          </div>
        </div>

        {/* Answer options */}
        {currentQ.options.length > 0 ? (
          <div className="space-y-3">
            {currentQ.options.map((option, index) => {
              const optionLetter =
                option.letter || String.fromCharCode(97 + index);
              const isSelected = userAnswers[currentQ.id] === optionLetter;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentQ.id, optionLetter)}
                  className={`group w-full text-left p-5 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                    isSelected
                      ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/50 shadow-lg shadow-blue-500/20"
                      : "bg-gray-800/50 border-gray-600/50 hover:bg-gray-700/50 hover:border-gray-500/50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-xl border-2 flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        isSelected
                          ? "border-blue-500 bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-110"
                          : "border-gray-500 text-gray-400 group-hover:border-gray-400"
                      }`}
                    >
                      {optionLetter.toUpperCase()}
                    </div>
                    <span className={`leading-relaxed text-base pt-2 ${
                      isSelected ? 'text-white font-medium' : 'text-gray-300'
                    }`}>
                      {option.text || option}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Type your answer below:
            </label>
            <textarea
              value={userAnswers[currentQ.id] || ""}
              onChange={(e) => handleAnswerSelect(currentQ.id, e.target.value)}
              placeholder="Enter your answer here..."
              className="w-full p-4 bg-gray-900/50 border-2 border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all duration-300 font-medium"
              rows={5}
            />
            <p className="text-xs text-gray-500">
              {(userAnswers[currentQ.id] || '').length} characters
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className="group flex items-center justify-center gap-2 px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-700/50 border border-gray-600/50 hover:border-gray-500/50 transform hover:scale-105 disabled:transform-none"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Previous
        </button>

        {currentQuestion === quiz.length - 1 ? (
          <button
            onClick={handleSubmitQuiz}
            className="group flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-emerald-500/30 transform hover:scale-105"
          >
            <CheckCircle className="h-5 w-5" />
            Submit Quiz
            <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
          </button>
        ) : (
          <button
            onClick={() =>
              setCurrentQuestion(Math.min(quiz.length - 1, currentQuestion + 1))
            }
            className="group flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-blue-500/30 transform hover:scale-105"
          >
            Next Question
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
}