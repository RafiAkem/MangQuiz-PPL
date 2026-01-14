import { useState, useEffect } from "react";
import {
  Brain,
  Sparkles,
  Settings,
  Loader2,
  CheckCircle,
  XCircle,
  Info,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTriviaGame } from "../../lib/stores/useTriviaGame";
import {
  GeminiService,
  GeminiQuestionRequest,
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
  const [isApiConfigured, setIsApiConfigured] = useState<boolean>(false);

  // Test Gemini connection on mount
  useEffect(() => {
    testGeminiConnection();
  }, []);

  const testGeminiConnection = async () => {
    // First check if API key is configured
    const configured = await GeminiService.isConfigured();
    setIsApiConfigured(configured);
    
    if (!configured) {
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
    if (!isApiConfigured) {
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
    <div className="min-h-screen bg-[#F2F0E9] relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-50">
        <button
          onClick={() => navigate("/mode/local")}
          className="flex items-center gap-2 bg-white border-2 border-[#0D0D0D] px-4 py-2 font-mono text-sm uppercase tracking-wide shadow-[2px_2px_0px_0px_#0D0D0D] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-[#0D0D0D]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Lobby
        </button>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-[#0022FF] border-2 border-[#0D0D0D] mr-4">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-black text-[#0D0D0D] uppercase tracking-tight font-display">
              AI-Generated Questions
            </h1>
          </div>
          <p className="text-lg text-[#0D0D0D]/70 font-body">
            Create custom trivia questions using Gemini AI
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Connection Status */}
          <div className="bg-white border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isConnected === null ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#0022FF]" />
                ) : isConnected ? (
                  <CheckCircle className="w-5 h-5 text-[#CCFF00]" />
                ) : (
                  <XCircle className="w-5 h-5 text-[#FF4D4D]" />
                )}
                <span className="text-[#0D0D0D] font-bold uppercase tracking-wide font-mono">
                  Gemini AI Connection
                </span>
              </div>
              <div
                className={`px-4 py-2 border-2 border-[#0D0D0D] font-mono font-bold text-sm uppercase ${
                  isConnected
                    ? "bg-[#CCFF00] text-[#0D0D0D]"
                    : "bg-[#FF4D4D] text-white"
                }`}
              >
                {isConnected === null
                  ? "Testing..."
                  : isConnected
                  ? "Connected"
                  : "Not Connected"}
              </div>
            </div>
          </div>

          {/* Configuration Card */}
          <div className="bg-white border-2 border-[#0D0D0D] shadow-[6px_6px_0px_0px_#0D0D0D]">
            <div className="p-4 border-b-2 border-[#0D0D0D] bg-[#0022FF]">
              <h2 className="text-white font-black uppercase tracking-tight font-display flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Question Configuration
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-[#0D0D0D] uppercase tracking-wide font-mono">
                    Category
                  </label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-[#F2F0E9] border-2 border-[#0D0D0D] text-[#0D0D0D] h-12 font-body focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-[#0D0D0D]">
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

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-[#0D0D0D] uppercase tracking-wide font-mono">
                    Difficulty
                  </label>
                  <Select
                    value={difficulty}
                    onValueChange={(value: "easy" | "medium" | "hard") =>
                      setDifficulty(value)
                    }
                  >
                    <SelectTrigger className="bg-[#F2F0E9] border-2 border-[#0D0D0D] text-[#0D0D0D] h-12 font-body focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-[#0D0D0D]">
                      <SelectItem value="easy">🟢 Easy</SelectItem>
                      <SelectItem value="medium">🟡 Medium</SelectItem>
                      <SelectItem value="hard">🔴 Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-[#0D0D0D] uppercase tracking-wide font-mono">
                    Number of Questions
                  </label>
                  <Select
                    value={questionCount.toString()}
                    onValueChange={(value) => setQuestionCount(parseInt(value))}
                  >
                    <SelectTrigger className="bg-[#F2F0E9] border-2 border-[#0D0D0D] text-[#0D0D0D] h-12 font-body focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-[#0D0D0D]">
                      <SelectItem value="5">5 Questions</SelectItem>
                      <SelectItem value="10">10 Questions</SelectItem>
                      <SelectItem value="15">15 Questions</SelectItem>
                      <SelectItem value="20">20 Questions</SelectItem>
                      <SelectItem value="25">25 Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-[#0D0D0D] uppercase tracking-wide font-mono">
                    Custom Topic (Optional)
                  </label>
                  <Input
                    placeholder="e.g., Ancient Rome, World War II, etc."
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    className="bg-[#F2F0E9] border-2 border-[#0D0D0D] text-[#0D0D0D] h-12 placeholder:text-[#0D0D0D]/40 font-body focus:ring-0"
                  />
                </div>
              </div>

              <Button
                onClick={handleGenerateQuestions}
                disabled={!isConnected || isGenerating}
                className="w-full h-14 text-lg font-black uppercase tracking-wide bg-[#CCFF00] text-[#0D0D0D] hover:bg-[#CCFF00]/90 border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Questions with AI
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* API Key Info */}
          {!isApiConfigured && (
            <div className="bg-[#CCFF00] border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] p-6">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-[#0D0D0D] mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-[#0D0D0D] font-black mb-1 uppercase font-display">
                    API Key Required
                  </h3>
                  <p className="text-[#0D0D0D]/80 text-sm font-body">
                    To use AI-generated questions, you need to set the{" "}
                    <code className="bg-[#0D0D0D]/10 px-2 py-0.5 font-mono">
                      VITE_GEMINI_API_KEY
                    </code>{" "}
                    environment variable. Get your API key from{" "}
                    <a
                      href="https://makersuite.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0022FF] hover:underline font-bold"
                    >
                      Google AI Studio
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Connection Error */}
          {isApiConfigured && isConnected === false && (
            <div className="bg-[#FF4D4D] border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] p-6">
              <div className="flex items-start space-x-3">
                <XCircle className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-black mb-1 uppercase font-display">
                    Connection Failed
                  </h3>
                  <p className="text-white/90 text-sm font-body">
                    Unable to connect to Gemini AI. Please check your API key
                    and internet connection.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
