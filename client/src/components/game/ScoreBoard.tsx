import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";
import { useTriviaGame } from "../../lib/stores/useTriviaGame";

export function ScoreBoard() {
  const { players, questions, currentQuestionIndex } = useTriviaGame();

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
            Leaderboard
          </h3>
          <Badge variant="outline" className="border-blue-400 text-blue-300">
            Live
          </Badge>
        </div>

        <div className="space-y-4">
          {sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              className={`p-4 rounded-lg transition-all duration-300 ${
                index === 0
                  ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30"
                  : "bg-white/5 border border-white/10"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0
                        ? "bg-yellow-500 text-black"
                        : index === 1
                        ? "bg-gray-400 text-black"
                        : index === 2
                        ? "bg-orange-600 text-white"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{player.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white text-lg">
                    {player.score.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Game Progress */}
        {/* <div className="mt-6 pt-6 border-t border-white/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Progress</span>
            <span className="text-sm text-white font-mono">
              {currentQuestionIndex + 1}/{questions.length}
            </span>
          </div>
          <Progress
            value={((currentQuestionIndex + 1) / questions.length) * 100}
            className="h-2 bg-white/20"
          />
        </div> */}
      </CardContent>
    </Card>
  );
}
