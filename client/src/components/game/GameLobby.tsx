import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Users,
  Trophy,
  Settings,
  Clock,
  Brain,
  Star,
  Plus,
  X,
  Sparkles,
  ChevronLeft,
  Gamepad2
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
    <div className="min-h-screen bg-background relative overflow-hidden p-4 md:p-8">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/mode")}
            className="text-muted-foreground hover:text-white hover:bg-white/5"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Mang<span className="text-primary">Quiz</span></span>
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
              <Card className="bg-navy-800/50 border-white/5 backdrop-blur-xl overflow-hidden">
                <CardHeader className="border-b border-white/5 pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl text-white flex items-center gap-3">
                        <Users className="w-6 h-6 text-primary" />
                        Assemble Your Team
                      </CardTitle>
                      <p className="text-muted-foreground mt-2">Add 2-4 players to begin the challenge</p>
                    </div>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-4 py-1">
                      {players.length}/4 Players
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-8">
                  {/* Add Player Input */}
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <Gamepad2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        placeholder="Enter player name..."
                        value={newPlayerName}
                        onChange={(e) => setNewPlayerName(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="pl-10 h-12 bg-navy-950/50 border-white/10 text-white placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20"
                        disabled={players.length >= 4}
                      />
                    </div>
                    <Button
                      onClick={handleAddPlayer}
                      disabled={!newPlayerName.trim() || players.length >= 4}
                      className="h-12 px-8 bg-primary text-navy-950 hover:bg-primary/90 font-semibold"
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
                          <div className="group relative flex items-center p-4 rounded-xl bg-navy-900/50 border border-white/5 hover:border-primary/20 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-navy-950 font-bold text-lg mr-4 shadow-lg">
                              {player.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-white font-medium">{player.name}</h3>
                              <p className="text-xs text-muted-foreground">Ready to play</p>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removePlayer(player.id)}
                              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                      {players.length === 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="col-span-full py-12 text-center border-2 border-dashed border-white/5 rounded-xl"
                        >
                          <Users className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                          <p className="text-muted-foreground">No players added yet</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar - Settings & Info */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-navy-800/50 border-white/5 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    Game Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Difficulty</label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger className="bg-navy-950/50 border-white/10 text-white h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-navy-900 border-white/10 text-white">
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="bg-navy-950/50 border-white/10 text-white h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-navy-900 border-white/10 text-white">
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

                  <div className="pt-4 border-t border-white/5 space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Duration
                      </span>
                      <span className="text-white font-medium">5 Minutes</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Trophy className="w-4 h-4" /> Mode
                      </span>
                      <span className="text-white font-medium">Competitive</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleStartGame}
                    disabled={players.length < 2}
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-orange-500 text-navy-950 hover:opacity-90 shadow-lg shadow-primary/20 mt-4"
                  >
                    <Play className="w-5 h-5 mr-2 fill-current" />
                    Start Game
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/10">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Pro Tip</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Answer quickly to earn bonus points! Streaks multiply your score.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
