import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    Crown,
    CheckCircle,
    Circle,
    Play,
    Plus,
    Lock,
    Copy,
    ArrowLeft,
    RefreshCw,
    Loader2,
    Sparkles,
    XCircle,
    Send,
    Globe,
    LogOut,
    Swords,
    Zap,
    ArrowRight,
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

export function OneVsOneLobby() {
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
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [joinPassword, setJoinPassword] = useState("");

    // Form states
    const [roomName, setRoomName] = useState("");
    const [playerName, setPlayerName] = useState("");
    const [roomPassword, setRoomPassword] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);

    // AI Question Generation State
    const [aiCategory, setAiCategory] = useState("General History");
    const [aiDifficulty, setAiDifficulty] = useState<"easy" | "medium" | "hard">("medium");
    const [aiQuestionCount, setAiQuestionCount] = useState(10);
    const [aiCustomTopic, setAiCustomTopic] = useState("");
    const [aiQuestions, setAiQuestions] = useState<any[]>([]);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [aiSuccess, setAiSuccess] = useState(false);

    // Initialize WebSocket message handler
    useEffect(() => {
        if (!wsRef.current) return;

        const handleMessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
        };

        wsRef.current.addEventListener("message", handleMessage);

        // Fetch 1v1 rooms when connected
        if (isConnected) {
            fetchRooms();
        }

        return () => {
            wsRef.current?.removeEventListener("message", handleMessage);
        };
    }, [isConnected, wsRef]);

    // Auto-refresh room list when not in a room
    useEffect(() => {
        if (currentRoom) return; // Don't poll when in a room

        const interval = setInterval(() => {
            fetchRooms();
        }, 5000); // Refresh every 5 seconds

        return () => clearInterval(interval);
    }, [currentRoom]);

    // Derive allPlayersReady from players array (only non-host players need to be ready)
    useEffect(() => {
        const nonHostPlayers = players.filter((p) => !p.isHost);
        const ready = players.length >= 2 && nonHostPlayers.every((p) => p.isReady);
        setAllPlayersReady(ready);
    }, [players]);

    const handleWebSocketMessage = (data: any) => {
        console.log("WebSocket message received:", data);

        switch (data.type) {
            case "room_joined":
                setCurrentRoom(data.room);
                setPlayers(data.players);
                setCurrentPlayer(
                    data.players.find((p: Player) => p.id === data.playerId) || null
                );
                setIsHost(
                    data.players.find((p: Player) => p.id === data.playerId)?.isHost || false
                );
                if (data.playerId) {
                    localStorage.setItem("quizRushPlayerId", data.playerId);
                }
                toast.success(`Joined 1v1 Battle: ${data.room.name}`);
                break;

            case "player_joined":
                setPlayers((prev) => [...prev, data.player]);
                setCurrentRoom(data.room);
                toast.info(`${data.player.name} joined the battle!`);
                break;

            case "player_left":
                setPlayers((prev) => prev.filter((p) => p.id !== data.playerId));
                setCurrentRoom(data.room);
                if (data.newHostId === currentPlayer?.id) {
                    setIsHost(true);
                    toast.info("You are now the host");
                }
                break;

            case "player_ready_changed":
                setPlayers((prev) =>
                    prev.map((p) =>
                        p.id === data.playerId ? { ...p, isReady: data.isReady } : p
                    )
                );
                // Also update currentPlayer if it's the same player
                setCurrentPlayer((prev) =>
                    prev && prev.id === data.playerId ? { ...prev, isReady: data.isReady } : prev
                );
                break;

            case "all_players_ready":
                setAllPlayersReady(data.canStart);
                if (data.canStart && isHost) {
                    toast.success("Opponent is ready! Start the battle!");
                }
                break;

            case "game_started":
                setCountdown(null);
                if (!currentPlayer) {
                    const myPlayer = data.players.find((p: Player) => p.name === playerName);
                    if (myPlayer) {
                        setCurrentPlayer(myPlayer);
                    }
                }

                navigate("/multiplayer-game", {
                    state: {
                        isMultiplayer: true,
                        is1v1: true,
                        settings: data.settings,
                        players: data.players,
                        roomId: currentRoom?.id,
                        playerId: localStorage.getItem("quizRushPlayerId"),
                    },
                });
                break;

            case "chat_message":
                setChatMessages((prev) => [...prev, data]);
                break;

            case "error":
                toast.error(data.message);
                break;

            default:
                break;
        }
    };

    const fetchRooms = async () => {
        try {
            // Fetch only 1v1 rooms (maxPlayers = 2)
            const response = await fetch("/api/rooms/1v1");
            const data = await response.json();
            setRooms(data.rooms || []);
        } catch (error) {
            console.error("Failed to fetch 1v1 rooms:", error);
            // Fallback to regular rooms filtered by maxPlayers = 2
            try {
                const response = await fetch("/api/rooms");
                const data = await response.json();
                setRooms((data.rooms || []).filter((r: Room) => r.maxPlayers === 2));
            } catch (e) {
                console.error("Fallback also failed:", e);
            }
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
                    name: `⚔️ ${roomName}`,
                    hostName: playerName,
                    isPrivate,
                    password: isPrivate ? roomPassword : undefined,
                    maxPlayers: 2, // Fixed to 2 for 1v1
                    settings: {
                        difficulty: aiDifficulty,
                        category: aiCategory,
                        questionCount: aiQuestionCount,
                    },
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Send join_room message via WebSocket
                wsRef.current?.send(
                    JSON.stringify({
                        type: "join_room",
                        roomId: data.roomId,
                        playerName: playerName,
                        password: isPrivate ? roomPassword : undefined,
                    })
                );

                // The WebSocket response will set currentPlayer, currentRoom, etc.
                // Just close the modal and reset form
                setShowCreateRoom(false);
                setRoomName("");
                setRoomPassword("");
                setIsPrivate(false);
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
    };

    const quickMatch = () => {
        if (!playerName.trim()) {
            toast.error("Please enter your name first");
            return;
        }

        // Find an available public 1v1 room
        const availableRoom = rooms.find((r) => !r.isPrivate && r.playerCount < 2);
        if (availableRoom) {
            joinRoom(availableRoom);
        } else {
            // Create a new room if none available
            setRoomName(`Battle #${Math.floor(Math.random() * 1000)}`);
            setTimeout(() => createRoom(), 100);
        }
    };

    const leaveRoom = () => {
        wsRef.current?.send(JSON.stringify({ type: "leave_room" }));
        setCurrentRoom(null);
        setPlayers([]);
        setCurrentPlayer(null);
        setIsHost(false);
        setAllPlayersReady(false);
        setCountdown(null);
        setChatMessages([]);
        setAiQuestions([]);
        setAiSuccess(false);
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
            wsRef.current?.send(JSON.stringify({ type: "start_game" }));
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
            toast.success("Room code copied!");
        }
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
            setAiError(error instanceof Error ? error.message : "Failed to generate questions");
            setAiQuestions([]);
        } finally {
            setIsGeneratingAI(false);
        }
    };

    // Get opponent
    const opponent = players.find((p) => p.id !== currentPlayer?.id);

    if (currentRoom) {
        // In-Room View (1v1 Battle Lobby)
        return (
            <div className="min-h-screen bg-slate-950 text-white p-6 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px]" />
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
                </div>

                <div className="container mx-auto max-w-5xl relative z-10">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between mb-12"
                    >
                        <div className="flex items-center gap-6">
                            <Button
                                variant="ghost"
                                onClick={leaveRoom}
                                className="text-slate-400 hover:text-white hover:bg-white/5 pl-0 gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Leave Battle
                            </Button>
                            <div className="h-6 w-px bg-white/10" />
                            <div>
                                <h1 className="text-xl font-bold text-white tracking-tight">
                                    {currentRoom.name}
                                </h1>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-slate-500 font-mono tracking-wide uppercase">ID: {currentRoom.id.slice(0, 8)}...</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={copyRoomCode}
                                        className="h-4 w-4 text-slate-500 hover:text-white"
                                    >
                                        <Copy className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${isConnected ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-emerald-500" : "bg-red-500"}`} />
                            {isConnected ? "ONLINE" : "OFFLINE"}
                        </div>
                    </motion.div>

                    {/* VS Battle Display */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-12"
                    >
                        <div className="flex items-center justify-center gap-12 md:gap-24">
                            {/* Player 1 (You) */}
                            <div className="flex-1 text-center relative group">
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="relative inline-block"
                                >
                                    <div className={`w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full bg-slate-800 border-4 transition-all duration-500 flex items-center justify-center text-5xl font-bold text-white shadow-2xl relative z-10 ${currentPlayer?.isReady ? "border-emerald-500 shadow-emerald-500/20" : "border-slate-700"}`}>
                                        {currentPlayer?.name?.charAt(0).toUpperCase() || "?"}
                                        {isHost && (
                                            <div className="absolute -top-2 -right-2 bg-amber-500 text-white p-1.5 rounded-full border-4 border-slate-950">
                                                <Crown className="w-4 h-4 fill-current" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Status Badge */}
                                    <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-colors duration-300 ${currentPlayer?.isReady
                                        ? "bg-emerald-500 text-white border-emerald-400"
                                        : "bg-slate-800 text-slate-400 border-slate-700"
                                        }`}>
                                        {currentPlayer?.isReady ? "Ready" : "Not Ready"}
                                    </div>
                                </motion.div>
                                <h3 className="mt-8 text-2xl font-bold text-white tracking-tight">
                                    {currentPlayer?.name || "Waiting..."}
                                </h3>
                            </div>

                            {/* VS Badge */}
                            <div className="flex-shrink-0 relative">
                                <span className="text-6xl md:text-8xl font-black text-slate-800 select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-[2px] opacity-50">VS</span>
                                <span className="text-4xl md:text-6xl font-black text-white/10 select-none relative z-10">VS</span>
                            </div>

                            {/* Player 2 (Opponent) */}
                            <div className="flex-1 text-center relative">
                                <motion.div
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="relative inline-block"
                                >
                                    {opponent ? (
                                        <>
                                            <div className={`w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full bg-slate-800 border-4 transition-all duration-500 flex items-center justify-center text-5xl font-bold text-white shadow-2xl relative z-10 ${opponent.isReady ? "border-emerald-500 shadow-emerald-500/20" : "border-slate-700"}`}>
                                                {opponent.name.charAt(0).toUpperCase()}
                                                {opponent.isHost && (
                                                    <div className="absolute -top-2 -right-2 bg-amber-500 text-white p-1.5 rounded-full border-4 border-slate-950">
                                                        <Crown className="w-4 h-4 fill-current" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-colors duration-300 ${opponent.isReady
                                                ? "bg-emerald-500 text-white border-emerald-400"
                                                : "bg-slate-800 text-slate-400 border-slate-700"
                                                }`}>
                                                {opponent.isReady ? "Ready" : "Not Ready"}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full bg-slate-900/50 border-4 border-dashed border-slate-800 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="animate-pulse bg-slate-800 w-12 h-12 rounded-full mx-auto mb-2" />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                                <h3 className="mt-8 text-2xl font-bold text-slate-500 tracking-tight">
                                    {opponent?.name || "Searching..."}
                                </h3>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-16 flex justify-center">
                            {isHost ? (
                                <Button
                                    size="lg"
                                    className="min-w-[200px] h-14 text-base font-bold bg-white text-black hover:bg-slate-200 transition-all rounded-full"
                                    onClick={startGame}
                                    disabled={!allPlayersReady || players.length < 2}
                                >
                                    Start Battle
                                </Button>
                            ) : (
                                <Button
                                    size="lg"
                                    className={`min-w-[200px] h-14 text-base font-bold rounded-full transition-all ${currentPlayer?.isReady
                                        ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                        : "bg-white text-black hover:bg-slate-200"
                                        }`}
                                    onClick={toggleReady}
                                >
                                    {currentPlayer?.isReady ? "Cancel Ready" : "I'm Ready"}
                                </Button>
                            )}
                        </div>
                    </motion.div>

                    {/* Controls Section */}
                    {isHost && (
                        <div className="border-t border-white/5 pt-8 mb-8">
                            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-6 px-1">Game Settings</h3>
                            <Card className="bg-slate-900/50 border-white/5">
                                <CardContent className="p-6 space-y-6">
                                    <div className="grid md:grid-cols-4 gap-4 items-end">
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-400">Topic</label>
                                            <Select value={aiCategory} onValueChange={setAiCategory}>
                                                <SelectTrigger className="bg-slate-900 border-slate-800 text-slate-200 h-11 focus:ring-0">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-950 border-slate-800">
                                                    <SelectItem value="General History" className="text-slate-200">History</SelectItem>
                                                    <SelectItem value="Science" className="text-slate-200">Science</SelectItem>
                                                    <SelectItem value="Geography" className="text-slate-200">Geography</SelectItem>
                                                    <SelectItem value="Entertainment" className="text-slate-200">Entertainment</SelectItem>
                                                    <SelectItem value="Sports" className="text-slate-200">Sports</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-400">Difficulty</label>
                                            <Select value={aiDifficulty} onValueChange={(v) => setAiDifficulty(v as any)}>
                                                <SelectTrigger className="bg-slate-900 border-slate-800 text-slate-200 h-11 focus:ring-0">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-950 border-slate-800">
                                                    <SelectItem value="easy" className="text-emerald-400">Easy</SelectItem>
                                                    <SelectItem value="medium" className="text-amber-400">Medium</SelectItem>
                                                    <SelectItem value="hard" className="text-red-400">Hard</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-400">Length</label>
                                            <Select value={aiQuestionCount.toString()} onValueChange={(v) => setAiQuestionCount(parseInt(v))}>
                                                <SelectTrigger className="bg-slate-900 border-slate-800 text-slate-200 h-11 focus:ring-0">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-950 border-slate-800">
                                                    <SelectItem value="5" className="text-slate-200">5 Questions</SelectItem>
                                                    <SelectItem value="10" className="text-slate-200">10 Questions</SelectItem>
                                                    <SelectItem value="15" className="text-slate-200">15 Questions</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <Button
                                            onClick={handleGenerateAIQuestions}
                                            disabled={isGeneratingAI}
                                            className="w-full h-11 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold shadow-lg shadow-amber-500/20 transition-all duration-200"
                                        >
                                            {isGeneratingAI ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-5 h-5 mr-2" />
                                                    Generate questions
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    {aiSuccess && (
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-center gap-2 text-emerald-400">
                                            <CheckCircle className="w-4 h-4" />
                                            <span>{aiQuestions.length} questions ready!</span>
                                        </div>
                                    )}

                                    {aiError && (
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2 text-red-400">
                                            <XCircle className="w-4 h-4" />
                                            <span>{aiError}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Chat Room */}
                    <Card className="bg-slate-900/50 backdrop-blur-md border-white/5 shadow-xl mt-6">
                        <CardHeader className="py-3 border-b border-white/5">
                            <CardTitle className="text-sm text-white flex items-center gap-2">
                                <Send className="w-4 h-4 text-slate-400" />
                                Battle Chat
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="h-32 overflow-y-auto space-y-2 mb-3 pr-2">
                                {chatMessages.length === 0 ? (
                                    <p className="text-slate-500 text-sm text-center py-4">No messages yet. Say hi! 👋</p>
                                ) : (
                                    chatMessages.map((msg, index) => (
                                        <div key={index} className={`flex flex-col ${msg.playerName === currentPlayer?.name ? "items-end" : "items-start"}`}>
                                            <div className={`max-w-[80%] rounded-xl px-3 py-1.5 text-sm ${msg.playerName === currentPlayer?.name
                                                ? "bg-slate-700 text-white rounded-tr-none"
                                                : "bg-white/10 text-slate-200 rounded-tl-none"
                                                }`}>
                                                {msg.message}
                                            </div>
                                            <span className="text-[10px] text-slate-500 mt-0.5 px-1">{msg.playerName}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                    placeholder="Type a message..."
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-9 text-sm"
                                />
                                <Button size="sm" onClick={sendMessage} className="bg-slate-700 hover:bg-slate-600 text-white h-9 px-3">
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Room Browser View
    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
            </div>

            <div className="container mx-auto max-w-4xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/")}
                        className="text-slate-400 hover:text-white hover:bg-white/5 pl-0 gap-2 mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Modes
                    </Button>

                    <div className="text-center space-y-4">
                        <h1 className="text-5xl font-black text-white tracking-tight">
                            1v1 Battle
                        </h1>
                        <p className="text-slate-400 text-lg max-w-lg mx-auto">
                            Challenge a friend to a head-to-head trivia duel. Test your knowledge in real-time.
                        </p>
                    </div>
                </motion.div>

                {/* Player Name Input */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-12 max-w-md mx-auto"
                >
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-widest ml-1">
                            Your Display Name
                        </label>
                        <Input
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder="Enter your name..."
                            className="bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-600 h-14 text-lg text-center rounded-2xl focus:ring-red-500/20 focus:border-red-500/50 transition-all"
                        />
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid md:grid-cols-2 gap-6 mb-16 max-w-2xl mx-auto"
                >
                    <button
                        onClick={quickMatch}
                        disabled={!playerName.trim()}
                        className="group relative h-32 rounded-3xl bg-gradient-to-br from-red-600 to-orange-600 p-1 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                    >
                        <div className="flex h-full w-full flex-col items-center justify-center rounded-[22px] bg-slate-950/20 backdrop-blur-sm group-hover:bg-transparent transition-colors">
                            <span className="text-2xl font-bold text-white">Quick Match</span>
                            <span className="text-sm text-white/60 mt-1">Join any open room</span>
                        </div>
                    </button>

                    <button
                        onClick={() => setShowCreateRoom(true)}
                        disabled={!playerName.trim()}
                        className="group relative h-32 rounded-3xl bg-slate-800 p-1 transition-all hover:bg-slate-700 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                    >
                        <div className="flex h-full w-full flex-col items-center justify-center rounded-[22px] border border-white/5">
                            <span className="text-2xl font-bold text-white">Create Room</span>
                            <span className="text-sm text-slate-400 mt-1">Host your own battle</span>
                        </div>
                    </button>
                </motion.div>

                {/* Available Rooms */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="max-w-3xl mx-auto"
                >
                    <div className="flex items-center justify-between mb-6 px-1">
                        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-widest">Available Battles</h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={fetchRooms}
                            className="text-slate-400 hover:text-white h-8 text-xs font-medium"
                        >
                            <RefreshCw className="w-3 h-3 mr-2" />
                            Refresh
                        </Button>
                    </div>

                    {rooms.length === 0 ? (
                        <div className="text-center py-12 bg-slate-900/30 rounded-3xl border border-white/5 border-dashed">
                            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Swords className="w-6 h-6 text-slate-600" />
                            </div>
                            <p className="text-slate-400 font-medium">No battles available</p>
                            <p className="text-sm text-slate-500 mt-1">Create a room to start a battle</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {rooms.map((room) => (
                                <motion.div
                                    key={room.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <button
                                        onClick={() => joinRoom(room)}
                                        disabled={!playerName.trim() || room.playerCount >= 2}
                                        className="w-full text-left bg-slate-900/50 hover:bg-slate-800 border border-white/5 hover:border-white/10 p-4 rounded-2xl transition-all group relative overflow-hidden"
                                    >
                                        <div className="flex items-center justify-between relative z-10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-lg font-bold text-slate-300 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                                    {room.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white group-hover:text-red-400 transition-colors flex items-center gap-2">
                                                        {room.name}
                                                        {room.isPrivate && <Lock className="w-3 h-3 text-slate-500" />}
                                                    </h3>
                                                    <p className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors">
                                                        Hosted by {room.hostName}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <span className="text-xs text-slate-500 block">Players</span>
                                                    <span className={`font-mono font-medium ${room.playerCount >= 2 ? "text-red-500" : "text-emerald-500"}`}>
                                                        {room.playerCount}/2
                                                    </span>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 group-hover:scale-110 transition-all">
                                                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Create Room Modal */}
            <AnimatePresence>
                {showCreateRoom && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowCreateRoom(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <Swords className="w-6 h-6 text-red-400" />
                                Create Battle Room
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-300 mb-2 block">
                                        Room Name
                                    </label>
                                    <Input
                                        value={roomName}
                                        onChange={(e) => setRoomName(e.target.value)}
                                        placeholder="Epic Battle #1"
                                        className="bg-white/5 border-white/10 text-white"
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="private"
                                        checked={isPrivate}
                                        onChange={(e) => setIsPrivate(e.target.checked)}
                                        className="rounded border-white/20"
                                    />
                                    <label htmlFor="private" className="text-sm text-slate-300">
                                        Private room (requires password)
                                    </label>
                                </div>

                                {isPrivate && (
                                    <Input
                                        value={roomPassword}
                                        onChange={(e) => setRoomPassword(e.target.value)}
                                        placeholder="Password"
                                        type="password"
                                        className="bg-white/5 border-white/10 text-white"
                                    />
                                )}

                                <div className="flex gap-3 mt-6">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setShowCreateRoom(false)}
                                        className="flex-1 text-slate-400"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={createRoom}
                                        disabled={isLoading || !roomName.trim()}
                                        className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold"
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Room"}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
