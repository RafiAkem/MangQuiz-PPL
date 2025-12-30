import { useState, useEffect } from "react";
import {
  Brain,
  Sparkles,
  Settings,
  Loader2,
  CheckCircle,
  XCircle,
  Info,
  Zap,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTriviaGame } from "../../lib/stores/useTriviaGame";
import {
  GeminiService,
  GeminiQuestionRequest,
  GeminiQuestion,
} from "../../lib/services/geminiService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function CustomQuestionsSetup() {
  const { startGameWithQuestions, players } = useTriviaGame();
  const navigate = useNavigate();

  // Form state
  const [category, setCategory] = useState("General History");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [questionCount, setQuestionCount] = useState(10);
  const [customTopic, setCustomTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  // Test Gemini connection on mount
  useEffect(() => {
    testGeminiConnection();
  }, []);

  const testGeminiConnection = async () => {
    // First check if API key is configured
    if (!GeminiService.isConfigured()) {
      setIsConnected(false);
      return;
    }

    try {
      const connected = await GeminiService.testConnection();
      setIsConnected(connected);
      if (!connected) {
        toast.error("Gemini AI connection failed. Please check your API key.");
      }
    } catch (error) {
      setIsConnected(false);
      toast.error("Failed to connect to Gemini AI");
    }
  };

  const handleGenerateQuestions = async () => {
    if (!GeminiService.isConfigured()) {
      toast.error(
        "Gemini API key not configured. Please set VITE_GEMINI_API_KEY environment variable."
      );
      return;
    }

    if (!isConnected) {
      toast.error("Gemini AI is not connected. Please check your API key.");
      return;
    }

    if (players.length < 2) {
      toast.error("Please add at least 2 players before generating questions");
      return;
    }

    setIsGenerating(true);
    try {
      const request: GeminiQuestionRequest = {
        category,
        difficulty,
        count: questionCount,
        topic: customTopic.trim() || undefined,
      };

      const questions = await GeminiService.generateQuestions(request);

      toast.success(
        `Successfully generated ${questions.length} questions! Starting quiz...`
      );

      // Automatically start the game with the generated questions
      const gameQuestions = questions.map((q) => ({
        id: q.id,
        category: q.category,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        difficulty: q.difficulty,
        explanation: q.explanation,
      }));

      // Start the game with the generated questions
      startGameWithQuestions(gameQuestions);

      // Navigate to the game
      navigate("/game");
    } catch (error) {
      console.error("Error generating questions:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate questions"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-50">
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate("/mode/local")}
          className="bg-white/10 text-white border-white/20"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Lobby
        </Button>
      </div>

      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="w-12 h-12 text-purple-400 mr-3" />
            <h1 className="text-4xl font-bold text-white">
              AI-Generated Questions
            </h1>
          </div>
          <p className="text-xl text-blue-200">
            Create custom trivia questions using Gemini AI
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Connection Status */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isConnected === null ? (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                  ) : isConnected ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className="text-white font-medium">
                    Gemini AI Connection
                  </span>
                </div>
                <Badge
                  variant="secondary"
                  className={
                    isConnected
                      ? "bg-green-500/20 text-green-400 border-green-400/30"
                      : "bg-red-500/20 text-red-400 border-red-400/30"
                  }
                >
                  {isConnected === null
                    ? "Testing..."
                    : isConnected
                    ? "Connected"
                    : "Not Connected"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Configuration Card */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="w-5 h-5 mr-2 text-blue-400" />
                Question Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Category
                  </label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-white/10 border-white/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ancient History">
                        🏛️ Ancient History
                      </SelectItem>
                      <SelectItem value="Medieval History">
                        ⚔️ Medieval History
                      </SelectItem>
                      <SelectItem value="Modern History">
                        🏭 Modern History
                      </SelectItem>
                      <SelectItem value="World Wars">🌍 World Wars</SelectItem>
                      <SelectItem value="American History">
                        🇺🇸 American History
                      </SelectItem>
                      <SelectItem value="European History">
                        🇪🇺 European History
                      </SelectItem>
                      <SelectItem value="Asian History">
                        🌏 Asian History
                      </SelectItem>
                      <SelectItem value="General History">
                        📚 General History
                      </SelectItem>
                      <SelectItem value="Science">🔬 Science</SelectItem>
                      <SelectItem value="Geography">🌍 Geography</SelectItem>
                      <SelectItem value="Literature">📖 Literature</SelectItem>
                      <SelectItem value="Sports">⚽ Sports</SelectItem>
                      <SelectItem value="Entertainment">
                        🎬 Entertainment
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Difficulty
                  </label>
                  <Select
                    value={difficulty}
                    onValueChange={(value: "easy" | "medium" | "hard") =>
                      setDifficulty(value)
                    }
                  >
                    <SelectTrigger className="bg-white/10 border-white/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">🟢 Easy</SelectItem>
                      <SelectItem value="medium">🟡 Medium</SelectItem>
                      <SelectItem value="hard">🔴 Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Number of Questions
                  </label>
                  <Select
                    value={questionCount.toString()}
                    onValueChange={(value) => setQuestionCount(parseInt(value))}
                  >
                    <SelectTrigger className="bg-white/10 border-white/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Questions</SelectItem>
                      <SelectItem value="10">10 Questions</SelectItem>
                      <SelectItem value="15">15 Questions</SelectItem>
                      <SelectItem value="20">20 Questions</SelectItem>
                      <SelectItem value="25">25 Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Custom Topic (Optional)
                  </label>
                  <Input
                    placeholder="e.g., Ancient Rome, World War II, etc."
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    className="bg-white/10 border-white/30 text-white placeholder-white/60"
                  />
                </div>
              </div>

              <Button
                onClick={handleGenerateQuestions}
                disabled={!isConnected || isGenerating}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Questions with AI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* API Key Info */}
          {!GeminiService.isConfigured() && (
            <Card className="bg-yellow-500/10 backdrop-blur-md border-yellow-400/30">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-white font-medium mb-1">
                      API Key Required
                    </h3>
                    <p className="text-yellow-200 text-sm">
                      To use AI-generated questions, you need to set the{" "}
                      <code className="bg-yellow-500/20 px-1 rounded">
                        VITE_GEMINI_API_KEY
                      </code>{" "}
                      environment variable. Get your API key from{" "}
                      <a
                        href="https://makersuite.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-300 hover:text-blue-200 underline"
                      >
                        Google AI Studio
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Connection Error */}
          {GeminiService.isConfigured() && !isConnected && (
            <Card className="bg-red-500/10 backdrop-blur-md border-red-400/30">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-white font-medium mb-1">
                      Connection Failed
                    </h3>
                    <p className="text-red-200 text-sm">
                      Unable to connect to Gemini AI. Please check your API key
                      and internet connection.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
