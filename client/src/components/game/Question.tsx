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
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "hard":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Brain className="w-8 h-8 text-purple-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">
                History Trivia Challenge
              </h1>
              <p className="text-purple-200 text-sm">
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
                )} text-white px-3 py-1`}
              >
                {currentQuestion.difficulty.toUpperCase()}
              </Badge>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Question Card */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl mb-8">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <Badge
                  variant="outline"
                  className="border-purple-400 text-purple-300 bg-purple-400/10"
                >
                  {currentQuestion.category}
                </Badge>
                <div className="flex items-center space-x-2 text-white">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-relaxed">
                {currentQuestion.question}
              </h2>

              {/* Progress Bar */}
              <div className="mb-8">
                <Progress
                  value={((currentQuestionIndex + 1) / questions.length) * 100}
                  className="h-2 bg-white/20"
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
                      className={`relative group transition-all duration-300 ${
                        showAnswer
                          ? isCorrect
                            ? "transform scale-105"
                            : playersWhoSelected.length > 0
                            ? "opacity-60"
                            : "opacity-40"
                          : "hover:scale-105"
                      }`}
                    >
                      <Card
                        className={`cursor-pointer transition-all duration-300 ${
                          showAnswer
                            ? isCorrect
                              ? "bg-green-500/20 border-green-400 shadow-green-400/50"
                              : playersWhoSelected.length > 0
                              ? "bg-red-500/20 border-red-400"
                              : "bg-white/5 border-white/20"
                            : "bg-white/10 hover:bg-white/20 border-white/30 hover:border-white/50"
                        } shadow-xl hover:shadow-2xl`}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-lg font-semibold text-white group-hover:text-purple-200">
                              {option}
                            </span>

                            {showAnswer && isCorrect && (
                              <CheckCircle className="w-6 h-6 text-green-400" />
                            )}
                            {showAnswer &&
                              !isCorrect &&
                              playersWhoSelected.length > 0 && (
                                <XCircle className="w-6 h-6 text-red-400" />
                              )}
                          </div>

                          {/* Player Selection Indicators */}
                          {playersWhoSelected.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {playersWhoSelected.map((player) => (
                                <Badge
                                  key={player.id}
                                  variant="secondary"
                                  className={`text-xs ${
                                    showAnswer && isCorrect
                                      ? "bg-green-600 text-white"
                                      : showAnswer
                                      ? "bg-red-600 text-white"
                                      : "text-white"
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
                                    className={`text-xs transition-all duration-200 ${
                                      selectedThis
                                        ? "shadow-lg transform scale-105"
                                        : "border-white/30 text-white hover:bg-white/10"
                                    }`}
                                    style={{
                                      backgroundColor: selectedThis
                                        ? player.color
                                        : undefined,
                                      borderColor: !selectedThis
                                        ? player.color
                                        : undefined,
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
                    size="lg"
                    className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-semibold px-8 shadow-xl"
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
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
                    <span className="font-semibold text-lg">
                      Correct Answer:
                    </span>
                    <span className="text-green-300 font-medium">
                      {currentQuestion.options[currentQuestion.correctAnswer]}
                    </span>
                  </div>

                  {currentQuestion.explanation && (
                    <div className="bg-blue-500/10 border border-blue-400/30 p-6 rounded-lg">
                      <p className="text-blue-100 leading-relaxed">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  )}

                  <div className="text-center">
                    <Button
                      onClick={handleNextQuestion}
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-4 px-8 text-lg shadow-2xl transform transition-all duration-200 hover:scale-105"
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
