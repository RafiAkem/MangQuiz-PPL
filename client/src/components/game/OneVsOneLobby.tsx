import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { VSStartupAnimation } from "./VSStartupAnimation";

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
    const location = useLocation();
    const { wsRef, isConnected } = useWebSocket();
    const quickMatchTriggered = useRef(false);

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
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [joinPassword, setJoinPassword] = useState("");

    // Form states
    const [roomName, setRoomName] = useState("");
    const [playerName, setPlayerName] = useState(() => {
        // Initialize from localStorage if available
        if (typeof window !== 'undefined') {
            return localStorage.getItem("quizRushPlayerName") || "";
        }
        return "";
    });
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
    const [indonesiaMode, setIndonesiaMode] = useState(false);

    // VS Animation State
    const [showVSAnimation, setShowVSAnimation] = useState(false);
    const [vsCountdown, setVsCountdown] = useState(3);
    const [vsPlayers, setVsPlayers] = useState<Player[]>([]);

    // Handle quickMatch from result screen "Play Again" button
    useEffect(() => {
        if (location.state?.quickMatch && playerName && isConnected && !quickMatchTriggered.current) {
            quickMatchTriggered.current = true;
            // Small delay to ensure rooms are fetched
            const timer = setTimeout(() => {
                quickMatch();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [location.state, playerName, isConnected]);

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

    // Auto-scroll chat to latest message
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatMessages]);

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

            case "countdown_started":
                setVsPlayers(data.players);
                setVsCountdown(data.countdown);
                setShowVSAnimation(true);
                break;

            case "countdown_tick":
                setVsCountdown(data.countdown);
                break;

            case "game_started":
                setCountdown(null);
                if (!currentPlayer) {
                    const myPlayer = data.players.find((p: Player) => p.name === playerName);
                    if (myPlayer) {
                        setCurrentPlayer(myPlayer);
                    }
                }

                // Small delay to show "GO!" before navigating
                setTimeout(() => {
                    setShowVSAnimation(false);
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
                }, 500);
                break;

            case "chat_message":
                setChatMessages((prev) => [...prev, data]);
                break;

            case "room_disbanded":
                toast.error(data.message || "Room has been disbanded");
                // Clear room state
                setCurrentRoom(null);
                setPlayers([]);
                setCurrentPlayer(null);
                setIsHost(false);
                setAllPlayersReady(false);
                setCountdown(null);
                setChatMessages([]);
                setAiQuestions([]);
                setAiSuccess(false);
                setShowVSAnimation(false);
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
                category: indonesiaMode ? "Indonesia" : aiCategory,
                difficulty: aiDifficulty,
                count: aiQuestionCount,
                topic: aiCustomTopic.trim() || undefined,
                indonesiaMode,
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

    // Get player objects for VS animation
    const vsPlayer1 = vsPlayers.find(p => p.isHost) || vsPlayers[0] || null;
    const vsPlayer2 = vsPlayers.find(p => !p.isHost) || vsPlayers[1] || null;

    if (currentRoom) {
        // In-Room View (1v1 Battle Lobby)
        return (
            <div className="min-h-screen bg-[#F2F0E9] text-[#0D0D0D] p-6 relative overflow-hidden font-body">
                {/* VS Startup Animation */}
                <AnimatePresence>
                    {showVSAnimation && (
                        <VSStartupAnimation
                            player1={vsPlayer1}
                            player2={vsPlayer2}
                            countdown={vsCountdown}
                        />
                    )}
                </AnimatePresence>

                {/* Background Effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:4rem_4rem]" />
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
                                className="text-[#0D0D0D] hover:bg-[#FF4D4D] hover:text-white pl-2 pr-4 gap-2 border-2 border-[#0D0D0D] rounded-none hover:shadow-[4px_4px_0px_0px_#0D0D0D] transition-all"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Leave Battle
                            </Button>
                            <div className="h-8 w-0.5 bg-[#0D0D0D]" />
                            <div>
                                <h1 className="text-xl font-black text-[#0D0D0D] tracking-tighter uppercase font-display">
                                    {currentRoom.name}
                                </h1>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-[#0D0D0D]/70 font-mono tracking-wide uppercase bg-white border border-[#0D0D0D] px-1">ID: {currentRoom.id.slice(0, 8)}...</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={copyRoomCode}
                                        className="h-6 w-6 text-[#0D0D0D] hover:bg-[#CCFF00] border border-[#0D0D0D] rounded-none"
                                    >
                                        <Copy className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className={`flex items-center gap-2 px-3 py-1 text-xs font-bold border-2 border-[#0D0D0D] uppercase tracking-wider ${isConnected ? "bg-[#CCFF00] text-[#0D0D0D]" : "bg-[#FF4D4D] text-white"}`}>
                            <div className={`w-2 h-2 ${isConnected ? "bg-[#0D0D0D]" : "bg-white"} animate-pulse`} />
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
                                    <div className={`w-32 h-32 md:w-40 md:h-40 mx-auto bg-white border-4 transition-all duration-500 flex items-center justify-center text-5xl font-black text-[#0D0D0D] shadow-[8px_8px_0px_0px_#0D0D0D] relative z-10 ${currentPlayer?.isReady ? "border-[#0D0D0D] bg-[#CCFF00]" : "border-[#0D0D0D]"}`}>
                                        {currentPlayer?.name?.charAt(0).toUpperCase() || "?"}
                                        {isHost && (
                                            <div className="absolute -top-4 -right-4 bg-[#FF4D4D] text-white p-2 border-2 border-[#0D0D0D]">
                                                <Crown className="w-5 h-5 fill-current" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Status Badge */}
                                    <div className={`absolute -bottom-5 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider border-2 border-[#0D0D0D] transition-colors duration-300 shadow-[4px_4px_0px_0px_#0D0D0D] ${currentPlayer?.isReady
                                        ? "bg-[#CCFF00] text-[#0D0D0D]"
                                        : "bg-white text-[#0D0D0D]/50"
                                        }`}>
                                        {currentPlayer?.isReady ? "Ready" : "Not Ready"}
                                    </div>
                                </motion.div>
                                <h3 className="mt-10 text-2xl font-black text-[#0D0D0D] tracking-tighter uppercase font-display bg-white inline-block px-3 border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D]">
                                    {currentPlayer?.name || "Waiting..."}
                                </h3>
                            </div>

                            {/* VS Badge */}
                            <div className="flex-shrink-0 relative">
                                <span className="text-6xl md:text-8xl font-black text-[#0D0D0D]/10 select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display">VS</span>
                                <span className="text-4xl md:text-6xl font-black text-[#0D0D0D] select-none relative z-10 font-display italic">VS</span>
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
                                            <div className={`w-32 h-32 md:w-40 md:h-40 mx-auto bg-white border-4 transition-all duration-500 flex items-center justify-center text-5xl font-black text-[#0D0D0D] shadow-[8px_8px_0px_0px_#0D0D0D] relative z-10 ${opponent.isReady ? "border-[#0D0D0D] bg-[#CCFF00]" : "border-[#0D0D0D]"}`}>
                                                {opponent.name.charAt(0).toUpperCase()}
                                                {opponent.isHost && (
                                                    <div className="absolute -top-4 -right-4 bg-[#FF4D4D] text-white p-2 border-2 border-[#0D0D0D]">
                                                        <Crown className="w-5 h-5 fill-current" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className={`absolute -bottom-5 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider border-2 border-[#0D0D0D] transition-colors duration-300 shadow-[4px_4px_0px_0px_#0D0D0D] ${opponent.isReady
                                                ? "bg-[#CCFF00] text-[#0D0D0D]"
                                                : "bg-white text-[#0D0D0D]/50"
                                                }`}>
                                                {opponent.isReady ? "Ready" : "Not Ready"}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-32 h-32 md:w-40 md:h-40 mx-auto bg-[#F2F0E9] border-4 border-dashed border-[#0D0D0D]/30 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="animate-pulse bg-[#0D0D0D]/10 w-12 h-12 rounded-none mx-auto mb-2" />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                                <h3 className="mt-10 text-2xl font-black text-[#0D0D0D] tracking-tighter uppercase font-display bg-white inline-block px-3 border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D]">
                                    {opponent?.name || "Searching..."}
                                </h3>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-20 flex justify-center">
                            {isHost ? (
                                <Button
                                    size="lg"
                                    className="min-w-[240px] h-16 text-xl font-black uppercase tracking-tight bg-[#0022FF] text-white hover:bg-[#0022FF] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all rounded-none border-2 border-[#0D0D0D] shadow-[6px_6px_0px_0px_#0D0D0D]"
                                    onClick={startGame}
                                    disabled={!allPlayersReady || players.length < 2}
                                >
                                    Start Battle
                                </Button>
                            ) : (
                                <Button
                                    size="lg"
                                    className={`min-w-[240px] h-16 text-xl font-black uppercase tracking-tight rounded-none border-2 border-[#0D0D0D] shadow-[6px_6px_0px_0px_#0D0D0D] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all ${currentPlayer?.isReady
                                        ? "bg-white text-[#0D0D0D] hover:bg-slate-100"
                                        : "bg-[#0022FF] text-white hover:bg-[#0022FF]"
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
                        <div className="border-t-2 border-[#0D0D0D] pt-8 mb-8">
                            <h3 className="text-lg font-black text-[#0D0D0D] uppercase tracking-tighter mb-6 px-1 flex items-center gap-2">
                                <Zap className="w-5 h-5 fill-current" /> Game Settings
                            </h3>
                            <Card className="bg-white border-2 border-[#0D0D0D] shadow-[6px_6px_0px_0px_#0D0D0D] rounded-none">
                                <CardContent className="p-6 space-y-6">
                                    {/* Indonesia Mode Toggle */}
                                    <div className="flex items-center justify-between p-4 bg-[#FF4D4D]/10 border-2 border-[#FF4D4D] rounded-none">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">🇮🇩</span>
                                            <div>
                                                <label className="text-sm font-bold text-[#0D0D0D] uppercase">Indonesia Mode</label>
                                                <p className="text-xs text-[#0D0D0D]/70 font-mono">Questions about Indonesia in Bahasa Indonesia</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={indonesiaMode}
                                            onClick={() => setIndonesiaMode(!indonesiaMode)}
                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer border-2 border-[#0D0D0D] transition-colors duration-200 ease-in-out focus:outline-none ${
                                                indonesiaMode ? 'bg-[#FF4D4D]' : 'bg-gray-200'
                                            }`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-5 w-5 transform border-r-2 border-[#0D0D0D] bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                    indonesiaMode ? 'translate-x-5' : 'translate-x-0'
                                                }`}
                                            />
                                        </button>
                                    </div>

                                    <div className="grid md:grid-cols-4 gap-4 items-end">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-[#0D0D0D]">Topic</label>
                                            <Select value={aiCategory} onValueChange={setAiCategory} disabled={indonesiaMode}>
                                                <SelectTrigger className={`bg-white border-2 border-[#0D0D0D] text-[#0D0D0D] h-12 focus:ring-0 rounded-none shadow-[4px_4px_0px_0px_#0D0D0D] ${indonesiaMode ? "opacity-50" : ""}`}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white border-2 border-[#0D0D0D] rounded-none">
                                                    <SelectItem value="General History" className="text-[#0D0D0D] focus:bg-[#CCFF00] focus:text-[#0D0D0D]">History</SelectItem>
                                                    <SelectItem value="Science" className="text-[#0D0D0D] focus:bg-[#CCFF00] focus:text-[#0D0D0D]">Science</SelectItem>
                                                    <SelectItem value="Geography" className="text-[#0D0D0D] focus:bg-[#CCFF00] focus:text-[#0D0D0D]">Geography</SelectItem>
                                                    <SelectItem value="Entertainment" className="text-[#0D0D0D] focus:bg-[#CCFF00] focus:text-[#0D0D0D]">Entertainment</SelectItem>
                                                    <SelectItem value="Sports" className="text-[#0D0D0D] focus:bg-[#CCFF00] focus:text-[#0D0D0D]">Sports</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-[#0D0D0D]">Difficulty</label>
                                            <Select value={aiDifficulty} onValueChange={(v) => setAiDifficulty(v as any)}>
                                                <SelectTrigger className="bg-white border-2 border-[#0D0D0D] text-[#0D0D0D] h-12 focus:ring-0 rounded-none shadow-[4px_4px_0px_0px_#0D0D0D]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white border-2 border-[#0D0D0D] rounded-none">
                                                    <SelectItem value="easy" className="text-[#0D0D0D] focus:bg-[#CCFF00] focus:text-[#0D0D0D]">Easy</SelectItem>
                                                    <SelectItem value="medium" className="text-[#0D0D0D] focus:bg-[#CCFF00] focus:text-[#0D0D0D]">Medium</SelectItem>
                                                    <SelectItem value="hard" className="text-[#0D0D0D] focus:bg-[#FF4D4D] focus:text-white">Hard</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-[#0D0D0D]">Length</label>
                                            <Select value={aiQuestionCount.toString()} onValueChange={(v) => setAiQuestionCount(parseInt(v))}>
                                                <SelectTrigger className="bg-white border-2 border-[#0D0D0D] text-[#0D0D0D] h-12 focus:ring-0 rounded-none shadow-[4px_4px_0px_0px_#0D0D0D]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white border-2 border-[#0D0D0D] rounded-none">
                                                    <SelectItem value="5" className="text-[#0D0D0D] focus:bg-[#CCFF00] focus:text-[#0D0D0D]">5 Questions</SelectItem>
                                                    <SelectItem value="10" className="text-[#0D0D0D] focus:bg-[#CCFF00] focus:text-[#0D0D0D]">10 Questions</SelectItem>
                                                    <SelectItem value="15" className="text-[#0D0D0D] focus:bg-[#CCFF00] focus:text-[#0D0D0D]">15 Questions</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <Button
                                            onClick={handleGenerateAIQuestions}
                                            disabled={isGeneratingAI}
                                            className="w-full h-12 bg-[#CCFF00] hover:bg-[#b3ff00] text-[#0D0D0D] font-black uppercase border-2 border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-none"
                                        >
                                            {isGeneratingAI ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-5 h-5 mr-2" />
                                                    Generate
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    {aiSuccess && (
                                        <div className="bg-[#CCFF00] border-2 border-[#0D0D0D] p-3 flex items-center gap-2 text-[#0D0D0D] font-bold shadow-[4px_4px_0px_0px_#0D0D0D]">
                                            <CheckCircle className="w-5 h-5" />
                                            <span>{aiQuestions.length} questions ready!</span>
                                        </div>
                                    )}

                                    {aiError && (
                                        <div className="bg-[#FF4D4D] border-2 border-[#0D0D0D] p-3 flex items-center gap-2 text-white font-bold shadow-[4px_4px_0px_0px_#0D0D0D]">
                                            <XCircle className="w-5 h-5 text-white" />
                                            <span>{aiError}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Chat Room */}
                    <Card className="bg-white border-2 border-[#0D0D0D] shadow-[8px_8px_0px_0px_#0D0D0D] mt-6 rounded-none">
                        <CardHeader className="py-3 border-b-2 border-[#0D0D0D] bg-[#F2F0E9]">
                            <CardTitle className="text-sm font-black uppercase tracking-wider text-[#0D0D0D] flex items-center gap-2">
                                <Send className="w-4 h-4" />
                                Battle Chat
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div ref={chatContainerRef} className="h-32 overflow-y-auto space-y-3 mb-3 pr-2">
                                {chatMessages.length === 0 ? (
                                    <p className="text-[#0D0D0D]/40 text-sm text-center py-4 font-mono uppercase">No messages yet. Say hi! 👋</p>
                                ) : (
                                    chatMessages.map((msg, index) => (
                                        <div key={index} className={`flex flex-col ${msg.playerName === currentPlayer?.name ? "items-end" : "items-start"}`}>
                                            <div className={`max-w-[80%] px-4 py-2 text-sm font-medium border-2 border-[#0D0D0D] shadow-[2px_2px_0px_0px_#0D0D0D] ${msg.playerName === currentPlayer?.name
                                                ? "bg-[#CCFF00] text-[#0D0D0D]"
                                                : "bg-white text-[#0D0D0D]"
                                                }`}>
                                                {msg.message}
                                            </div>
                                            <span className="text-[10px] text-[#0D0D0D]/60 mt-1 px-1 font-mono uppercase">{msg.playerName}</span>
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
                                    className="bg-white border-2 border-[#0D0D0D] text-[#0D0D0D] placeholder:text-[#0D0D0D]/40 h-10 text-sm rounded-none focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_#0D0D0D] transition-all"
                                />
                                <Button size="sm" onClick={sendMessage} className="bg-[#0D0D0D] hover:bg-[#333] text-white h-10 px-4 rounded-none border-2 border-[#0D0D0D]">
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
        <div className="min-h-screen bg-[#F2F0E9] text-[#0D0D0D] p-6 relative overflow-hidden font-body">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:4rem_4rem]" />
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
                        className="text-[#0D0D0D] hover:bg-white hover:shadow-[4px_4px_0px_0px_#0D0D0D] border-2 border-transparent hover:border-[#0D0D0D] pl-2 gap-2 mb-6 transition-all rounded-none"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Modes
                    </Button>

                    <div className="text-center space-y-4">
                        <h1 className="text-6xl font-black text-[#0D0D0D] tracking-tighter uppercase font-display">
                            1v1 <span className="text-[#FF4D4D]">Battle</span>
                        </h1>
                        <p className="text-[#0D0D0D]/70 text-lg max-w-lg mx-auto font-medium">
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
                        <label className="text-xs font-bold text-[#0D0D0D] uppercase tracking-widest ml-1 bg-[#CCFF00] px-2 py-0.5 inline-block border border-[#0D0D0D]">
                            Your Display Name
                        </label>
                        <Input
                            value={playerName}
                            onChange={(e) => {
                                const name = e.target.value;
                                setPlayerName(name);
                                localStorage.setItem("quizRushPlayerName", name);
                            }}
                            placeholder="ENTER YOUR NAME..."
                            className="bg-white border-2 border-[#0D0D0D] text-[#0D0D0D] placeholder:text-[#0D0D0D]/30 h-16 text-xl text-center font-black uppercase rounded-none focus-visible:ring-0 shadow-[6px_6px_0px_0px_#0D0D0D] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[4px_4px_0px_0px_#0D0D0D] transition-all"
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
                        className="group relative h-32 bg-[#FF4D4D] border-2 border-[#0D0D0D] p-1 transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_#0D0D0D] shadow-[6px_6px_0px_0px_#0D0D0D] disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:shadow-[6px_6px_0px_0px_#0D0D0D]"
                    >
                        <div className="flex h-full w-full flex-col items-center justify-center bg-[#FF4D4D] group-hover:bg-[#ff3333] transition-colors">
                            <Zap className="w-8 h-8 mb-2 text-white fill-current" />
                            <span className="text-2xl font-black text-white uppercase tracking-tight">Quick Match</span>
                            <span className="text-sm text-white/80 font-mono uppercase">Join any open room</span>
                        </div>
                    </button>

                    <button
                        onClick={() => setShowCreateRoom(true)}
                        disabled={!playerName.trim()}
                        className="group relative h-32 bg-[#0022FF] border-2 border-[#0D0D0D] p-1 transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_#0D0D0D] shadow-[6px_6px_0px_0px_#0D0D0D] disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:shadow-[6px_6px_0px_0px_#0D0D0D]"
                    >
                        <div className="flex h-full w-full flex-col items-center justify-center bg-[#0022FF] group-hover:bg-[#0011ee] transition-colors">
                            <Plus className="w-8 h-8 mb-2 text-white" />
                            <span className="text-2xl font-black text-white uppercase tracking-tight">Create Room</span>
                            <span className="text-sm text-white/80 font-mono uppercase">Host your own battle</span>
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
                        <h2 className="text-sm font-bold text-[#0D0D0D] uppercase tracking-widest border-b-2 border-[#0D0D0D] pb-1">Available Battles</h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={fetchRooms}
                            className="text-[#0D0D0D] hover:bg-[#CCFF00] h-8 text-xs font-bold uppercase border border-[#0D0D0D] rounded-none shadow-[2px_2px_0px_0px_#0D0D0D] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                        >
                            <RefreshCw className="w-3 h-3 mr-2" />
                            Refresh
                        </Button>
                    </div>

                    {rooms.length === 0 ? (
                        <div className="text-center py-16 bg-white border-2 border-dashed border-[#0D0D0D] shadow-[4px_4px_0px_0px_#0D0D0D]">
                            <div className="w-16 h-16 bg-[#F2F0E9] border-2 border-[#0D0D0D] flex items-center justify-center mx-auto mb-4">
                                <Swords className="w-8 h-8 text-[#0D0D0D]" />
                            </div>
                            <p className="text-[#0D0D0D] font-black uppercase text-xl">No battles available</p>
                            <p className="text-sm text-[#0D0D0D]/60 mt-1 font-mono">Create a room to start a battle</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {rooms.map((room) => (
                                <motion.div
                                    key={room.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <button
                                        onClick={() => joinRoom(room)}
                                        disabled={!playerName.trim() || room.playerCount >= 2}
                                        className="w-full text-left bg-white hover:bg-[#F2F0E9] border-2 border-[#0D0D0D] p-4 transition-all group relative overflow-hidden shadow-[4px_4px_0px_0px_#0D0D0D] hover:shadow-[6px_6px_0px_0px_#0D0D0D] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                                    >
                                        <div className="flex items-center justify-between relative z-10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-[#0D0D0D] flex items-center justify-center text-xl font-black text-white group-hover:bg-[#FF4D4D] transition-colors border-2 border-[#0D0D0D]">
                                                    {room.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-[#0D0D0D] text-lg uppercase tracking-tight flex items-center gap-2">
                                                        {room.name}
                                                        {room.isPrivate && <Lock className="w-4 h-4 text-[#FF4D4D]" />}
                                                    </h3>
                                                    <p className="text-sm text-[#0D0D0D]/60 font-medium">
                                                        HOST: <span className="font-bold">{room.hostName}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <span className="text-[10px] text-[#0D0D0D]/50 uppercase font-bold block">Players</span>
                                                    <span className={`font-mono font-black text-lg ${room.playerCount >= 2 ? "text-[#FF4D4D]" : "text-[#0022FF]"}`}>
                                                        {room.playerCount}/2
                                                    </span>
                                                </div>
                                                <div className="w-10 h-10 bg-[#CCFF00] border-2 border-[#0D0D0D] flex items-center justify-center group-hover:bg-[#0D0D0D] group-hover:text-white transition-all shadow-[2px_2px_0px_0px_#0D0D0D]">
                                                    <ArrowRight className="w-5 h-5" />
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
                        className="fixed inset-0 bg-[#0D0D0D]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowCreateRoom(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white border-2 border-[#0D0D0D] shadow-[8px_8px_0px_0px_#CCFF00] p-6 w-full max-w-md relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button 
                                onClick={() => setShowCreateRoom(false)}
                                className="absolute top-4 right-4 text-[#0D0D0D] hover:bg-[#FF4D4D] hover:text-white border-2 border-transparent hover:border-[#0D0D0D] p-1 transition-all"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>

                            <h2 className="text-2xl font-black text-[#0D0D0D] uppercase tracking-tighter mb-6">Create Battle</h2>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#0D0D0D] uppercase">Room Name</label>
                                    <Input
                                        value={roomName}
                                        onChange={(e) => setRoomName(e.target.value)}
                                        placeholder="Enter room name..."
                                        className="bg-white border-2 border-[#0D0D0D] text-[#0D0D0D] placeholder:text-[#0D0D0D]/30 h-12 rounded-none focus-visible:ring-0 shadow-[4px_4px_0px_0px_#0D0D0D] focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-[#0D0D0D] uppercase">Private Room</label>
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={isPrivate}
                                            onClick={() => setIsPrivate(!isPrivate)}
                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer border-2 border-[#0D0D0D] transition-colors duration-200 ease-in-out focus:outline-none ${
                                                isPrivate ? 'bg-[#0022FF]' : 'bg-gray-200'
                                            }`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-5 w-5 transform border-r-2 border-[#0D0D0D] bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                    isPrivate ? 'translate-x-5' : 'translate-x-0'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                    {isPrivate && (
                                        <Input
                                            type="password"
                                            value={roomPassword}
                                            onChange={(e) => setRoomPassword(e.target.value)}
                                            placeholder="Set a password..."
                                            className="bg-white border-2 border-[#0D0D0D] text-[#0D0D0D] placeholder:text-[#0D0D0D]/30 h-12 rounded-none focus-visible:ring-0 shadow-[4px_4px_0px_0px_#0D0D0D] mt-2"
                                        />
                                    )}
                                </div>

                                {/* AI Settings Preview */}
                                <div className="bg-[#F2F0E9] border-2 border-[#0D0D0D] p-4 mt-4 space-y-3">
                                    <h3 className="text-xs font-black uppercase text-[#0D0D0D]/50 border-b border-[#0D0D0D]/20 pb-2">Game Settings</h3>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-xs text-[#0D0D0D]/60 block uppercase">Topic</span>
                                            <span className="font-bold text-[#0D0D0D]">{aiCategory}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-[#0D0D0D]/60 block uppercase">Difficulty</span>
                                            <span className={`font-bold uppercase ${aiDifficulty === 'hard' ? 'text-[#FF4D4D]' : aiDifficulty === 'medium' ? 'text-[#0022FF]' : 'text-[#0D0D0D]'}`}>{aiDifficulty}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-[#0D0D0D]/60 block uppercase">Questions</span>
                                            <span className="font-bold text-[#0D0D0D]">{aiQuestionCount}</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-[#0D0D0D]/50 italic">
                                        * You can change these settings after creating the room
                                    </p>
                                </div>

                                <Button
                                    onClick={createRoom}
                                    disabled={isLoading}
                                    className="w-full h-14 bg-[#0022FF] text-white font-black uppercase tracking-tight text-lg rounded-none border-2 border-[#0D0D0D] shadow-[6px_6px_0px_0px_#0D0D0D] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-[#0022FF] transition-all mt-4"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create & Join"
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
