import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Users,
  Trophy,
  Settings,
  Clock,
  Brain,
  Plus,
  X,
  Sparkles,
  ChevronLeft,
  Gamepad2
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
import { useNavigate } from "react-router-dom";

export function GameLobby() {
  const {
    players,
    addPlayer,
    removePlayer,
    startGame,
  } = useTriviaGame();

  const [newPlayerName, setNewPlayerName] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [category, setCategory] = useState("all");
  const navigate = useNavigate();

  const handleAddPlayer = () => {
    if (newPlayerName.trim() && players.length < 4) {
      addPlayer(newPlayerName.trim());
      setNewPlayerName("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddPlayer();
    }
  };

  const handleStartGame = () => {
    startGame();
    navigate("/game");
  };

  return (
    <div className="min-h-screen bg-[#F2F0E9] relative overflow-hidden p-4 md:p-8">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12"
        >
          <button
            onClick={() => navigate("/mode")}
            className="flex items-center gap-2 bg-white border-2 border-[#0D0D0D] px-4 py-2 font-mono text-sm uppercase tracking-wide shadow-[2px_2px_0px_0px_#0D0D0D] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-[#0D0D0D]"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0022FF] border-2 border-[#0D0D0D]">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-[#0D0D0D] font-display uppercase">
              Mang<span className="text-[#0022FF]">Quiz</span>
            </span>
          </div>

          <div className="w-[88px]" /> {/* Spacer for centering */}
        </motion.header>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Content - Player Setup */}
          <div className="lg:col-span-8 space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="bg-white border-2 border-[#0D0D0D] shadow-[6px_6px_0px_0px_#0D0D0D] overflow-hidden">
                <div className="border-b-2 border-[#0D0D0D] p-6 bg-[#CCFF00]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black uppercase tracking-tight text-[#0D0D0D] font-display flex items-center gap-3">
                        <Users className="w-6 h-6" />
                        Assemble Your Team
                      </h2>
                      <p className="text-[#0D0D0D]/70 mt-2 font-body">Add 2-4 players to begin the challenge</p>
                    </div>
                    <div className="bg-[#0D0D0D] text-[#CCFF00] px-4 py-2 font-mono font-bold border-2 border-[#0D0D0D]">
                      {players.length}/4 Players
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-8">
                  {/* Add Player Input */}
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <Gamepad2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0D0D0D]/50" />
                      <Input
                        placeholder="Enter player name..."
                        value={newPlayerName}
                        onChange={(e) => setNewPlayerName(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="pl-10 h-12 bg-[#F2F0E9] border-2 border-[#0D0D0D] text-[#0D0D0D] placeholder:text-[#0D0D0D]/40 focus:ring-0 focus:border-[#0022FF] font-body"
                        disabled={players.length >= 4}
                      />
                    </div>
                    <Button
                      onClick={handleAddPlayer}
                      disabled={!newPlayerName.trim() || players.length >= 4}
                      className="h-12 px-8 bg-[#0022FF] text-white hover:bg-[#0022FF]/90 font-bold uppercase tracking-wide border-2 border-[#0D0D0D] shadow-[2px_2px_0px_0px_#0D0D0D] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add
                    </Button>
                  </div>

                  {/* Player List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <AnimatePresence mode="popLayout">
                      {players.map((player, index) => (
                        <motion.div
                          key={player.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          layout
                        >
                          <div className="group relative flex items-center p-4 bg-[#F2F0E9] border-2 border-[#0D0D0D] hover:border-[#0022FF] transition-colors">
                            <div className="w-10 h-10 bg-[#0022FF] border-2 border-[#0D0D0D] flex items-center justify-center text-white font-bold text-lg mr-4">
                              {player.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-[#0D0D0D] font-bold font-display uppercase">{player.name}</h3>
                              <p className="text-xs text-[#0D0D0D]/50 font-mono">Ready to play</p>
                            </div>
                            <button
                              onClick={() => removePlayer(player.id)}
                              className="opacity-0 group-hover:opacity-100 p-2 text-[#FF4D4D] hover:bg-[#FF4D4D]/10 transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                      {players.length === 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="col-span-full py-12 text-center border-2 border-dashed border-[#0D0D0D]/20"
                        >
                          <Users className="w-12 h-12 text-[#0D0D0D]/20 mx-auto mb-4" />
                          <p className="text-[#0D0D0D]/50 font-body">No players added yet</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Settings & Info */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-white border-2 border-[#0D0D0D] shadow-[6px_6px_0px_0px_#0D0D0D]">
                <div className="p-4 border-b-2 border-[#0D0D0D] bg-[#0022FF]">
                  <h3 className="text-white font-black uppercase tracking-tight font-display flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Game Settings
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#0D0D0D] uppercase tracking-wide font-mono">Difficulty</label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger className="bg-[#F2F0E9] border-2 border-[#0D0D0D] text-[#0D0D0D] h-11 font-body focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-[#0D0D0D] text-[#0D0D0D]">
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#0D0D0D] uppercase tracking-wide font-mono">Category</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="bg-[#F2F0E9] border-2 border-[#0D0D0D] text-[#0D0D0D] h-11 font-body focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-[#0D0D0D] text-[#0D0D0D]">
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="history">History</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="geography">Geography</SelectItem>
                        <SelectItem value="literature">Literature</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4 border-t-2 border-[#0D0D0D]/10 space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#0D0D0D]/70 flex items-center gap-2 font-body">
                        <Clock className="w-4 h-4" /> Duration
                      </span>
                      <span className="text-[#0D0D0D] font-bold font-mono">5 Minutes</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#0D0D0D]/70 flex items-center gap-2 font-body">
                        <Trophy className="w-4 h-4" /> Mode
                      </span>
                      <span className="text-[#0D0D0D] font-bold font-mono">Competitive</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleStartGame}
                    disabled={players.length < 2}
                    className="w-full h-14 text-lg font-black uppercase tracking-wide bg-[#CCFF00] text-[#0D0D0D] hover:bg-[#CCFF00]/90 border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                  >
                    <Play className="w-5 h-5 mr-2 fill-current" />
                    Start Game
                  </Button>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-[#0022FF] border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white border-2 border-[#0D0D0D]">
                    <Sparkles className="w-5 h-5 text-[#0022FF]" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1 font-display uppercase">Pro Tip</h3>
                    <p className="text-sm text-white/80 leading-relaxed font-body">
                      Answer quickly to earn bonus points! Streaks multiply your score.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
