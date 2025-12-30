import { useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { useTriviaGame } from "../../lib/stores/useTriviaGame";
import { Clock } from "lucide-react";

interface TimerProps {
  type: "game" | "question";
}

export function Timer({ type }: TimerProps) {
  const {
    timeRemaining,
    questionTimeRemaining,
    settings,
    updateTimer,
    updateQuestionTimer,
    phase,
  } = useTriviaGame();

  useEffect(() => {
    if (phase !== "playing") return;

    const interval = setInterval(() => {
      if (type === "game") {
        updateTimer();
      } else {
        updateQuestionTimer();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [type, updateTimer, updateQuestionTimer, phase]);

  const time = type === "game" ? timeRemaining : questionTimeRemaining * 1000;
  const maxTime =
    type === "game" ? settings.gameDuration : settings.questionTime * 1000;
  const progress = (time / maxTime) * 100;

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (type === "game") {
      return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    } else {
      return remainingSeconds.toString();
    }
  };

  const getTimerColor = () => {
    if (progress <= 25) return "bg-red-500";
    if (progress <= 60) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-1">
        <Clock className="w-5 h-5 text-blue-400" />
        <span className="text-blue-200 text-xs font-semibold">
          {type === "game" ? "Game Time" : "Question Time"}
        </span>
        <span className="text-white font-mono text-lg font-bold">
          {formatTime(time)}
        </span>
      </div>
      <div className="relative w-full">
        <Progress value={progress} className="h-3 bg-white/20" />
        <div
          className={`h-3 rounded-full absolute top-0 left-0 transition-all duration-1000 ${getTimerColor()}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}
