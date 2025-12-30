import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Settings,
  MessageCircle,
  Crown,
  CheckCircle,
  Circle,
  Play,
  Plus,
  Search,
  Lock,
  Copy,
  ArrowLeft,
  RefreshCw,
  Loader2,
  Sparkles,
  XCircle,
  Info,
  Send,
  Globe,
  Gamepad2,
  LogOut
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useWebSocket } from "../../lib/contexts/WebSocketContext";
import {
  GeminiService,
  GeminiQuestionRequest,
} from "../../lib/services/geminiService";

interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  score: number;
}

interface Room {
  id: string;
  name: string;
  playerCount: number;
  maxPlayers: number;
  hostName: string;
  isPrivate: boolean;
  settings: {
    difficulty: string;
    category: string;
    questionCount: number;
  };
  createdAt: string;
}

interface ChatMessage {
  playerId: string;
  playerName: string;
  message: string;
  timestamp: string;
}

export function MultiplayerLobby() {
  const navigate = useNavigate();
  const { wsRef, isConnected } = useWebSocket();

  // State
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [allPlayersReady, setAllPlayersReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // UI State
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [joinPassword, setJoinPassword] = useState("");

  // Form states
  const [roomName, setRoomName] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [roomSettings, setRoomSettings] = useState({
    difficulty: "medium",
    category: "all",
    questionCount: 10,
  });

  // AI Question Generation State
  const [aiCategory, setAiCategory] = useState("General History");
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [aiQuestionCount, setAiQuestionCount] = useState(10);
  const [aiCustomTopic, setAiCustomTopic] = useState("");
  const [aiQuestions, setAiQuestions] = useState<any[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccess, setAiSuccess] = useState(false);

  // Room settings state
  const [roomMaxPlayers, setRoomMaxPlayers] = useState(4);

  // Initialize WebSocket message handler
  useEffect(() => {
    if (!wsRef.current) return;

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    wsRef.current.addEventListener("message", handleMessage);

    // Fetch rooms when connected
    if (isConnected) {
      fetchRooms();
    }

    return () => {
      wsRef.current?.removeEventListener("message", handleMessage);
    };
  }, [isConnected, wsRef]);

  const handleWebSocketMessage = (data: any) => {
    console.log("WebSocket message received:", data);

    switch (data.type) {
      case "room_joined":
        console.log("Room joined:", data);
        setCurrentRoom(data.room);
        setPlayers(data.players);
        setRoomMaxPlayers(data.room.maxPlayers);
        setCurrentPlayer(
          data.players.find((p: Player) => p.id === data.playerId) || null
        );
        setIsHost(
          data.players.find((p: Player) => p.id === data.playerId)?.isHost ||
          false
        );
        if (data.playerId) {
          localStorage.setItem("quizRushPlayerId", data.playerId);
        }
        toast.success(`Successfully joined ${data.room.name}`);
        break;

      case "player_joined":
        console.log("Player joined:", data);
        setPlayers((prev) => [...prev, data.player]);
        setCurrentRoom(data.room);
        toast.info(`${data.player.name} joined the room`);
        break;

      case "player_left":
        console.log("Player left:", data);
        setPlayers((prev) => prev.filter((p) => p.id !== data.playerId));
        setCurrentRoom(data.room);
        if (data.newHostId === currentPlayer?.id) {
          setIsHost(true);
          toast.info("You are now the host");
        }
        break;

      case "player_ready_changed":
        console.log("Player ready changed:", data);
        setPlayers((prev) =>
          prev.map((p) =>
            p.id === data.playerId ? { ...p, isReady: data.isReady } : p
          )
        );
        break;

      case "all_players_ready":
        console.log("All players ready:", data);
        setAllPlayersReady(data.canStart);
        if (data.canStart && isHost) {
          toast.success("All players are ready! You can now start the game.");
        }
        break;

      case "game_starting":
        console.log("Game starting:", data);
        setCountdown(data.countdown);
        toast.info(`Game will start in ${data.countdown} seconds`);
        break;

      case "countdown":
        console.log("Countdown:", data);
        setCountdown(data.countdown);
        break;

      case "game_started":
        console.log("Game started:", data);
        setCountdown(null);

        if (!currentPlayer) {
          const myPlayer = data.players.find(
            (p: Player) => p.name === playerName
          );
          if (myPlayer) {
            setCurrentPlayer(myPlayer);
          }
        }

        const navigationState = {
          isMultiplayer: true,
          settings: data.settings,
          players: data.players,
          roomId: currentRoom?.id,
          playerId: localStorage.getItem("quizRushPlayerId"),
        };

        navigate("/multiplayer-game", {
          state: navigationState,
        });
        break;

      case "chat_message":
        console.log("Chat message:", data);
        setChatMessages((prev) => [...prev, data]);
        break;

      case "settings_updated":
        console.log("Settings updated:", data);
        if (data.settings) {
          setRoomSettings(data.settings);
        }
        if (data.maxPlayers !== undefined) {
          setRoomMaxPlayers(data.maxPlayers);
          setCurrentRoom((prev: any) =>
            prev ? { ...prev, maxPlayers: data.maxPlayers } : null
          );
        }
        toast.success("Room settings updated");
        break;

      case "error":
        console.log("Error:", data);
        toast.error(data.message);
        break;

      default:
        console.log("Unknown message type:", data.type);
        break;
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/rooms");
      const data = await response.json();
      setRooms(data.rooms);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    }
  };

  const createRoom = async () => {
    if (!roomName.trim() || !playerName.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    localStorage.setItem("quizRushPlayerName", playerName);

    setIsLoading(true);
    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: roomName,
          hostName: playerName,
          isPrivate,
          password: isPrivate ? roomPassword : undefined,
          maxPlayers: maxPlayers,
          settings: roomSettings,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        wsRef.current?.send(
          JSON.stringify({
            type: "join_room",
            roomId: data.roomId,
            playerName: playerName,
            password: isPrivate ? roomPassword : undefined,
          })
        );

        setCurrentPlayer({
          id: data.hostId,
          name: playerName,
          isHost: true,
          isReady: false,
          score: 0,
        });

        setShowCreateRoom(false);
        setRoomName("");
        setPlayerName("");
        setRoomPassword("");
        setIsPrivate(false);
        setMaxPlayers(4);
      } else {
        toast.error(data.error || "Failed to create room");
      }
    } catch (error) {
      toast.error("Failed to create room");
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoom = async (room: Room, password?: string) => {
    if (!playerName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    localStorage.setItem("quizRushPlayerName", playerName);

    wsRef.current?.send(
      JSON.stringify({
        type: "join_room",
        roomId: room.id,
        playerName: playerName,
        password: password,
      })
    );

    setSelectedRoom(room);
  };

  const leaveRoom = () => {
    wsRef.current?.send(
      JSON.stringify({
        type: "leave_room",
      })
    );

    setCurrentRoom(null);
    setPlayers([]);
    setCurrentPlayer(null);
    setIsHost(false);
    setAllPlayersReady(false);
    setCountdown(null);
    setChatMessages([]);
  };

  const toggleReady = () => {
    if (!currentPlayer) return;

    wsRef.current?.send(
      JSON.stringify({
        type: "player_ready",
        ready: !currentPlayer.isReady,
      })
    );
  };

  const startGame = () => {
    if (aiQuestions && aiQuestions.length > 0) {
      wsRef.current?.send(
        JSON.stringify({
          type: "start_game",
          questions: aiQuestions,
        })
      );
    } else {
      wsRef.current?.send(
        JSON.stringify({
          type: "start_game",
        })
      );
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    wsRef.current?.send(
      JSON.stringify({
        type: "chat_message",
        message: newMessage.trim(),
      })
    );

    setNewMessage("");
  };

  const copyRoomCode = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom.id);
      toast.success("Room code copied to clipboard");
    }
  };

  const updateMaxPlayers = (newMaxPlayers: number) => {
    if (!isHost) return;

    wsRef.current?.send(
      JSON.stringify({
        type: "update_settings",
        maxPlayers: newMaxPlayers,
      })
    );
  };

  const handleGenerateAIQuestions = async () => {
    setIsGeneratingAI(true);
    setAiError(null);
    setAiSuccess(false);
    try {
      const request: GeminiQuestionRequest = {
        category: aiCategory,
        difficulty: aiDifficulty,
        count: aiQuestionCount,
        topic: aiCustomTopic.trim() || undefined,
      };
      const questions = await GeminiService.generateQuestions(request);
      setAiQuestions(questions);
      setAiSuccess(true);
    } catch (error) {
      setAiError(
        error instanceof Error ? error.message : "Failed to generate questions"
      );
      setAiQuestions([]);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  if (currentRoom) {
    // In-Room View (Lobby)
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gold-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-slate-500/5 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4"
          >
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={leaveRoom}
                className="text-slate-400 hover:text-white hover:bg-white/5"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Leave Room
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  {currentRoom.name}
                  <Badge variant="outline" className="bg-white/5 border-white/10 text-gold-400">
                    {currentRoom.isPrivate ? <Lock className="w-3 h-3 mr-1" /> : <Globe className="w-3 h-3 mr-1" />}
                    {currentRoom.isPrivate ? "Private" : "Public"}
                  </Badge>
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <code className="bg-black/30 px-2 py-1 rounded text-sm text-slate-300 font-mono border border-white/5">
                    {currentRoom.id}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={copyRoomCode}
                    className="h-6 w-6 text-slate-400 hover:text-white"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isConnected ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-red-500"}`} />
                <span className="text-sm font-medium">{isConnected ? "Connected" : "Disconnected"}</span>
              </div>

              {countdown !== null && (
                <div className="bg-gold-500/20 text-gold-400 border border-gold-500/30 px-4 py-2 rounded-lg font-bold animate-pulse">
                  Starting in {countdown}...
                </div>
              )}
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Left Column: Players & Chat (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Players List */}
              <Card className="bg-slate-900/50 backdrop-blur-md border-white/5 shadow-xl overflow-hidden">
                <CardHeader className="border-b border-white/5 bg-white/5 pb-4">
                  <CardTitle className="text-lg font-medium text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-slate-400" />
                      Players
                    </div>
                    <Badge variant="secondary" className="bg-white/10 text-slate-200">
                      {players.length}/{roomMaxPlayers}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-white/5">
                    <AnimatePresence>
                      {players.map((player) => (
                        <motion.div
                          key={player.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-white font-bold shadow-sm">
                              {player.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-white">{player.name}</span>
                                {player.isHost && <Crown className="w-3 h-3 text-gold-400" />}
                                {player.id === currentPlayer?.id && (
                                  <span className="text-xs bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">You</span>
                                )}
                              </div>
                              <div className="text-xs text-slate-400">
                                {player.isReady ? "Ready to play" : "Not ready"}
                              </div>
                            </div>
                          </div>
                          {player.isReady ? (
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-600" />
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Ready Button for Non-Host */}
                  <div className="p-4 border-t border-white/5 bg-white/5">
                    {isHost ? (
                      <Button
                        className="w-full bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold shadow-lg shadow-gold-500/10"
                        size="lg"
                        onClick={startGame}
                        disabled={!allPlayersReady || players.length < 2}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Game
                      </Button>
                    ) : (
                      <Button
                        className={`w-full font-bold ${currentPlayer?.isReady
                            ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                            : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                          }`}
                        size="lg"
                        onClick={toggleReady}
                      >
                        {currentPlayer?.isReady ? "Cancel Ready" : "I'm Ready!"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Chat */}
              <Card className="bg-slate-900/50 backdrop-blur-md border-white/5 shadow-xl flex flex-col h-[400px]">
                <CardHeader className="border-b border-white/5 bg-white/5 py-3">
                  <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-slate-400" />
                    Live Chat
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-4 flex flex-col min-h-0">
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {chatMessages.map((msg, index) => (
                      <div key={index} className={`flex flex-col ${msg.playerName === currentPlayer?.name ? "items-end" : "items-start"}`}>
                        <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${msg.playerName === currentPlayer?.name
                            ? "bg-slate-700 text-white rounded-tr-none"
                            : "bg-white/10 text-slate-200 rounded-tl-none"
                          }`}>
                          {msg.message}
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 px-1">
                          {msg.playerName}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Type a message..."
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-slate-500"
                    />
                    <Button size="icon" onClick={sendMessage} className="bg-slate-700 hover:bg-slate-600 text-white">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Settings & AI (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* AI Generation Panel */}
              <Card className="bg-slate-900/50 backdrop-blur-md border-white/5 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-gold-400" />
                    AI Question Generator
                  </CardTitle>
                  <p className="text-slate-400 text-sm">
                    Generate unique questions tailored to your group using Gemini AI.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6 relative z-10">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Topic Category</label>
                      <Select
                        value={aiCategory}
                        onValueChange={isHost ? setAiCategory : undefined}
                        disabled={!isHost}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="General History">📚 General History</SelectItem>
                          <SelectItem value="Ancient History">🏛️ Ancient History</SelectItem>
                          <SelectItem value="Medieval History">⚔️ Medieval History</SelectItem>
                          <SelectItem value="Modern History">🏭 Modern History</SelectItem>
                          <SelectItem value="World Wars">🌍 World Wars</SelectItem>
                          <SelectItem value="Science">🔬 Science</SelectItem>
                          <SelectItem value="Geography">🌍 Geography</SelectItem>
                          <SelectItem value="Entertainment">🎬 Entertainment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Difficulty Level</label>
                      <div className="grid grid-cols-3 gap-2">
                        {["easy", "medium", "hard"].map((level) => (
                          <button
                            key={level}
                            onClick={() => isHost && setAiDifficulty(level as any)}
                            disabled={!isHost}
                            className={`
                              h-12 rounded-lg border text-sm font-medium capitalize transition-all
                              ${aiDifficulty === level
                                ? "bg-slate-700 border-slate-600 text-white shadow-lg"
                                : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"}
                            `}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Question Count</label>
                      <Select
                        value={aiQuestionCount.toString()}
                        onValueChange={isHost ? (v) => setAiQuestionCount(parseInt(v)) : undefined}
                        disabled={!isHost}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 Questions</SelectItem>
                          <SelectItem value="10">10 Questions</SelectItem>
                          <SelectItem value="15">15 Questions</SelectItem>
                          <SelectItem value="20">20 Questions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Custom Topic (Optional)</label>
                      <Input
                        placeholder="e.g., The Roman Empire, 80s Pop Music..."
                        value={aiCustomTopic}
                        onChange={isHost ? (e) => setAiCustomTopic(e.target.value) : undefined}
                        className="bg-white/5 border-white/10 text-white h-12 placeholder:text-slate-500"
                        disabled={!isHost}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={isHost ? handleGenerateAIQuestions : undefined}
                    disabled={!isHost || isGeneratingAI}
                    className="w-full h-14 text-lg bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-bold shadow-lg border border-white/10 transition-all hover:scale-[1.01]"
                  >
                    {isGeneratingAI ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating Questions...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2 text-gold-400" />
                        Generate Questions with AI
                      </>
                    )}
                  </Button>

                  <AnimatePresence>
                    {aiSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3 text-emerald-400"
                      >
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Questions Generated Successfully!</p>
                          <p className="text-sm opacity-80">{aiQuestions.length} questions are ready for the game.</p>
                        </div>
                      </motion.div>
                    )}
                    {aiError && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400"
                      >
                        <XCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{aiError}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>

              {/* Room Settings (Host Only) */}
              {isHost && (
                <Card className="bg-slate-900/50 backdrop-blur-md border-white/5">
                  <CardHeader>
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <Settings className="w-5 h-5 text-slate-400" />
                      Room Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Max Players</label>
                        <Select
                          value={roomMaxPlayers.toString()}
                          onValueChange={(value) => updateMaxPlayers(parseInt(value))}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2 Players</SelectItem>
                            <SelectItem value="3">3 Players</SelectItem>
                            <SelectItem value="4">4 Players</SelectItem>
                            <SelectItem value="6">6 Players</SelectItem>
                            <SelectItem value="8">8 Players</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Lobby Selection Screen (Join/Create) - UPDATED LAYOUT
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-slate-500/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/mode")} className="text-slate-400 hover:text-white hover:bg-white/5">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-white">Multiplayer Lobby</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={fetchRooms} className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 flex-1">
          {/* Left Column: Create Room (4 cols) */}
          <div className="lg:col-span-4">
            <Card className="bg-slate-900/50 backdrop-blur-md border-white/5 shadow-xl h-full">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-gold-400" />
                  Create Room
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Room Name</label>
                  <Input
                    placeholder="e.g. Friday Night Trivia"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Your Name</label>
                  <Input
                    placeholder="Enter your nickname"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                  />
                </div>
                <div className="flex items-center justify-between py-2 border-t border-white/5 mt-4 pt-4">
                  <label className="text-sm font-medium text-slate-300">Private Room</label>
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-gold-500 focus:ring-gold-500"
                  />
                </div>
                {isPrivate && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Password</label>
                    <Input
                      type="password"
                      placeholder="Set a room password"
                      value={roomPassword}
                      onChange={(e) => setRoomPassword(e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                )}
                <Button
                  onClick={createRoom}
                  disabled={isLoading}
                  className="w-full bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold mt-4 shadow-lg shadow-gold-500/10"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create & Join Room"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Available Rooms (8 cols) */}
          <div className="lg:col-span-8">
            <Card className="bg-slate-900/50 backdrop-blur-md border-white/5 shadow-xl h-full flex flex-col">
              <CardHeader className="border-b border-white/5">
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-400" />
                  Available Rooms
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                {rooms.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
                    <Search className="w-12 h-12 mb-4 opacity-20" />
                    <p>No active rooms found.</p>
                    <p className="text-sm opacity-60">Create one to get started!</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                    {rooms.map((room) => (
                      <motion.div
                        key={room.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 group"
                      >
                        <div>
                          <div className="font-bold text-white text-lg flex items-center gap-2 group-hover:text-gold-400 transition-colors">
                            {room.name}
                            {room.isPrivate && <Lock className="w-4 h-4 text-gold-500/70" />}
                          </div>
                          <div className="text-sm text-slate-400 flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" /> {room.playerCount}/{room.maxPlayers}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-600" />
                            <span>Host: {room.hostName}</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            if (room.isPrivate) {
                              setSelectedRoom(room);
                            } else {
                              // For public rooms, we need a name first
                              setSelectedRoom(room);
                            }
                          }}
                          disabled={room.playerCount >= room.maxPlayers}
                          className={`
                            ${room.playerCount >= room.maxPlayers
                              ? "bg-slate-800 text-slate-500"
                              : "bg-slate-700 hover:bg-slate-600 text-white"}
                          `}
                        >
                          {room.playerCount >= room.maxPlayers ? "Full" : "Join"}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Join Room Dialog (Name Input) */}
      <Dialog open={!!selectedRoom} onOpenChange={(open) => !open && setSelectedRoom(null)}>
        <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Join {selectedRoom?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Your Name</label>
              <Input
                placeholder="Enter your nickname"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-600"
              />
            </div>

            {selectedRoom?.isPrivate && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Room Password</label>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            )}

            <Button
              onClick={() => selectedRoom && joinRoom(selectedRoom, selectedRoom.isPrivate ? joinPassword : undefined)}
              className="w-full bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold mt-2"
            >
              Join Game
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
