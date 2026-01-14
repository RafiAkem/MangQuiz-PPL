import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Timer } from "./Timer";
import { useTriviaGame } from "../../lib/stores/useTriviaGame";
import {
  CheckCircle,
  XCircle,
  Clock,
  Brain,
  ArrowRight,
  Zap,
} from "lucide-react";

export function Question() {
  const {
    questions,
    currentQuestionIndex,
    players,
    selectedAnswers,
    showAnswer,
    submitAnswer,
    showQuestionAnswer,
    nextQuestion,
  } = useTriviaGame();

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) return null;

  const allPlayersAnswered = players.every(
    (player) => selectedAnswers[player.id] !== undefined
  );

  const handleAnswerSelect = (playerId: string, answerIndex: number) => {
    if (showAnswer) return;
    submitAnswer(playerId, answerIndex);
  };

  const handleNextQuestion = () => {
    nextQuestion();
  };

  const handleShowAnswer = () => {
    showQuestionAnswer();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-[#CCFF00] text-[#0D0D0D] border-[#0D0D0D]";
      case "medium":
        return "bg-[#0022FF] text-white border-[#0D0D0D]";
      case "hard":
        return "bg-[#FF4D4D] text-white border-[#0D0D0D]";
      default:
        return "bg-[#0D0D0D] text-white border-[#0D0D0D]";
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F0E9] text-[#0D0D0D] font-sans relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(90deg,#0D0D0D_1px,transparent_1px),linear-gradient(#0D0D0D_1px,transparent_1px)] bg-[size:20px_20px]" />
      </div>

      <div className="relative z-20 container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-[#0022FF] p-2 border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D]">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-[#0D0D0D] font-display">
                History Trivia Challenge
              </h1>
              <p className="text-[#0D0D0D]/60 text-sm font-mono font-bold">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <Timer type="question" />
            {currentQuestion.difficulty && (
              <Badge
                className={`${getDifficultyColor(
                  currentQuestion.difficulty
                )} px-3 py-1 rounded-none border-2 shadow-[2px_2px_0px_0px_#0D0D0D]`}
              >
                {currentQuestion.difficulty.toUpperCase()}
              </Badge>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Question Card */}
          <Card className="bg-white border-2 border-[#0D0D0D] shadow-[6px_6px_0px_0px_#0D0D0D] rounded-none mb-8">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <Badge
                  variant="outline"
                  className="rounded-none border-2 border-[#0D0D0D] text-[#0D0D0D] bg-[#F2F0E9] font-mono font-bold uppercase"
                >
                  {currentQuestion.category}
                </Badge>
                <div className="flex items-center space-x-2 text-[#0D0D0D]/60 font-mono font-bold">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-[#0D0D0D] mb-6 leading-relaxed font-display uppercase">
                {currentQuestion.question}
              </h2>

              {/* Progress Bar */}
              <div className="mb-8">
                <Progress
                  value={((currentQuestionIndex + 1) / questions.length) * 100}
                  className="h-3 bg-[#0D0D0D]/10 rounded-none border-2 border-[#0D0D0D] [&>div]:bg-[#0022FF] [&>div]:rounded-none"
                />
              </div>

              {/* Answer Options */}
              <div className="grid md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => {
                  const isCorrect = index === currentQuestion.correctAnswer;
                  const playersWhoSelected = players.filter(
                    (p) => selectedAnswers[p.id] === index
                  );

                  return (
                    <div
                      key={index}
                      className={`relative group transition-all duration-300 ${showAnswer
                          ? isCorrect
                            ? ""
                            : playersWhoSelected.length > 0
                              ? "opacity-100"
                              : "opacity-40"
                          : ""
                        }`}
                    >
                      <Card
                        className={`cursor-pointer transition-all duration-300 rounded-none border-2 border-[#0D0D0D] ${showAnswer
                            ? isCorrect
                              ? "bg-[#CCFF00] shadow-[4px_4px_0px_0px_#0D0D0D]"
                              : playersWhoSelected.length > 0
                                ? "bg-[#FF4D4D] shadow-[4px_4px_0px_0px_#0D0D0D]"
                                : "bg-white opacity-50"
                            : "bg-white shadow-[4px_4px_0px_0px_#0D0D0D] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] hover:bg-[#F2F0E9]"
                          }`}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-lg font-bold font-body text-[#0D0D0D]">
                              {option}
                            </span>

                            {showAnswer && isCorrect && (
                              <CheckCircle className="w-6 h-6 text-[#0D0D0D]" />
                            )}
                            {showAnswer &&
                              !isCorrect &&
                              playersWhoSelected.length > 0 && (
                                <XCircle className="w-6 h-6 text-[#0D0D0D]" />
                              )}
                          </div>

                          {/* Player Selection Indicators */}
                          {playersWhoSelected.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {playersWhoSelected.map((player) => (
                                <Badge
                                  key={player.id}
                                  variant="secondary"
                                  className={`text-xs rounded-none border-2 border-[#0D0D0D] font-mono font-bold ${showAnswer && isCorrect
                                      ? "bg-white text-[#0D0D0D]"
                                      : showAnswer
                                        ? "bg-white text-[#0D0D0D]"
                                        : "bg-[#0D0D0D] text-white"
                                    }`}
                                  style={{
                                    backgroundColor: !showAnswer
                                      ? player.color
                                      : undefined,
                                  }}
                                >
                                  {player.name}
                                  {showAnswer && (
                                    <>
                                      {isCorrect && (
                                        <CheckCircle className="w-3 h-3 ml-1" />
                                      )}
                                      {!isCorrect && (
                                        <XCircle className="w-3 h-3 ml-1" />
                                      )}
                                    </>
                                  )}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Player Action Buttons */}
                          {!showAnswer && (
                            <div className="flex flex-wrap gap-2">
                              {players.map((player) => {
                                const hasAnswered =
                                  selectedAnswers[player.id] !== undefined;
                                const selectedThis =
                                  selectedAnswers[player.id] === index;

                                return (
                                  <Button
                                    key={player.id}
                                    size="sm"
                                    variant={
                                      selectedThis ? "default" : "outline"
                                    }
                                    onClick={() =>
                                      handleAnswerSelect(player.id, index)
                                    }
                                    disabled={hasAnswered}
                                    className={`text-xs transition-all duration-200 rounded-none border-2 border-[#0D0D0D] font-bold ${selectedThis
                                        ? "shadow-none translate-x-[2px] translate-y-[2px]"
                                        : "hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] shadow-[2px_2px_0px_0px_#0D0D0D]"
                                      }`}
                                    style={{
                                      backgroundColor: selectedThis
                                        ? player.color
                                        : "white",
                                      borderColor: "#0D0D0D",
                                      color: selectedThis
                                        ? "white"
                                        : player.color,
                                    }}
                                  >
                                    {player.name}
                                    {selectedThis && (
                                      <Zap className="w-3 h-3 ml-1" />
                                    )}
                                  </Button>
                                );
                              })}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>

              {/* Show Answer Button */}
              {!showAnswer && (allPlayersAnswered || players.length === 0) && (
                <div className="text-center mt-8">
                  <Button
                    onClick={handleShowAnswer}
                    variant="gold"
                    size="lg"
                    className="bg-[#0022FF] hover:bg-[#0022FF]/90 text-white font-black uppercase tracking-wide px-8 py-6 text-lg border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all rounded-none"
                  >
                    <Clock className="w-5 h-5 mr-2" />
                    Show Answer
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Explanation and Controls */}
          {showAnswer && (
            <Card className="bg-white border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] rounded-none">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-[#0D0D0D]">
                    <CheckCircle className="h-6 w-6 text-[#CCFF00] fill-black flex-shrink-0" />
                    <span className="font-black text-lg uppercase font-display">
                      Correct Answer:
                    </span>
                    <span className="text-[#0D0D0D] font-bold text-lg bg-[#CCFF00] px-2 border-2 border-[#0D0D0D]">
                      {currentQuestion.options[currentQuestion.correctAnswer]}
                    </span>
                  </div>

                  {currentQuestion.explanation && (
                    <div className="bg-[#F2F0E9] border-2 border-[#0D0D0D] p-6 rounded-none">
                      <p className="text-[#0D0D0D] leading-relaxed font-body font-medium">
                        <span className="text-[#0022FF] font-black uppercase mr-2">Did you know?</span>
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  )}

                  <div className="text-center">
                    <Button
                      onClick={handleNextQuestion}
                      size="lg"
                      className="bg-[#0022FF] hover:bg-[#0022FF]/90 text-white font-black uppercase tracking-wide px-8 py-6 text-lg border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all rounded-none"
                    >
                      {currentQuestionIndex < questions.length - 1 ? (
                        <>
                          Next Question
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      ) : (
                        <>
                          View Results
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
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
