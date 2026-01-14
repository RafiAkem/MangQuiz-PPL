import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";
import { useTriviaGame } from "../../lib/stores/useTriviaGame";

export function ScoreBoard() {
  const { players, questions, currentQuestionIndex } = useTriviaGame();

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <Card className="bg-[#F2F0E9] border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] rounded-none">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold font-display text-[#0D0D0D] uppercase flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-[#0D0D0D]" />
            Leaderboard
          </h3>
          <Badge variant="outline" className="bg-[#0022FF] text-white border-2 border-[#0D0D0D] rounded-none shadow-[2px_2px_0px_0px_#0D0D0D]">
            LIVE
          </Badge>
        </div>

        <div className="space-y-4">
          {sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              className={`p-4 border-2 border-[#0D0D0D] shadow-[2px_2px_0px_0px_#0D0D0D] transition-all duration-300 ${
                index === 0
                  ? "bg-[#CCFF00]"
                  : "bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono text-sm border-2 border-[#0D0D0D] ${
                      index === 0
                        ? "bg-[#0D0D0D] text-[#CCFF00]"
                        : "bg-[#0022FF] text-white"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-bold font-display uppercase text-[#0D0D0D]">{player.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold font-mono text-[#0D0D0D] text-lg">
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
