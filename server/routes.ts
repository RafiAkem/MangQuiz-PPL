import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";
import { geminiService, type GeminiQuestionRequest } from "./services/gemini";
import { geminiLimiter, roomsLimiter, createRoomLimiter } from "./middleware/rateLimiter";
import { registerAuthRoutes } from "./auth-routes";
import { matchmakingService, type RankedMatch } from "./services/matchmaking";
import { db } from "./db";
import { userStats } from "./schema";
import { eq } from "drizzle-orm";
import { saveRankedMatchResult, getLeaderboard, getMatchHistory } from "./services/match-result";

// Types for multiplayer lobby

interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  score: number;
  ws: any;
  odId?: string; // Database user ID for ranked matches
}

// Add game state to GameRoom
type GamePhase = "waiting" | "countdown" | "starting" | "playing" | "final" | "reveal";
interface GameState {
  questions: {
    question: string;
    options: string[];
    answer: string;
    explanation?: string;
    category?: string;
    difficulty?: string;
  }[];
  questionIndex: number;
  answers: Record<string, string>; // playerId -> answer
  scores: Record<string, number>;
  phase: GamePhase;
}

interface GameRoom {
  id: string;
  name: string;
  hostId: string;
  players: Player[];
  maxPlayers: number;
  isPrivate: boolean;
  password?: string;
  status: GamePhase;
  settings: {
    difficulty: string;
    category: string;
    questionCount: number;
  };
  createdAt: Date;
  gameState?: GameState;
  isRanked?: boolean; // Flag for ranked matches
  startTime?: number; // Track match duration
}

// Add timer fields to GameRoom
type GameRoomWithTimers = GameRoom & {
  questionTimer?: NodeJS.Timeout;
  revealTimer?: NodeJS.Timeout;
  countdownTimer?: NodeJS.Timeout;
  timeLeft?: number;
  revealTimeLeft?: number;
  countdownLeft?: number;
};

// Helper to get timer duration
const QUESTION_TIME = 20; // seconds
const REVEAL_TIME = 2; // seconds
const PRESSURE_TIME = 5; // seconds - timer drops to this when opponent answers
const COUNTDOWN_TIME = 3; // seconds - pre-battle countdown

const rooms = new Map<string, GameRoomWithTimers>();
const playerToRoom = new Map<string, string>();

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Register authentication routes
  registerAuthRoutes(app);

  // Start matchmaking service
  matchmakingService.start();

  // Register callback for ranked matches
  matchmakingService.setMatchCreatedCallback((match: RankedMatch) => {
    createRankedRoom(match);
  });

  // Helper function to create ranked room with pre-generated questions
  function createRankedRoom(match: RankedMatch) {
    const { roomId, player1, player2, questions } = match;

    // Create the room server-side
    const room: GameRoomWithTimers = {
      id: roomId,
      name: `Ranked: ${player1.username} vs ${player2.username}`,
      hostId: player1.userId,
      players: [
        {
          id: player1.userId,
          name: player1.username,
          isHost: true,
          isReady: true,
          score: 0,
          ws: player1.ws,
          odId: player1.userId
        },
        {
          id: player2.userId,
          name: player2.username,
          isHost: false,
          isReady: true,
          score: 0,
          ws: player2.ws,
          odId: player2.userId
        }
      ],
      maxPlayers: 2,
      isPrivate: true,
      status: "starting",
      settings: {
        difficulty: "mixed",
        category: "mixed",
        questionCount: questions.length
      },
      createdAt: new Date(),
      isRanked: true,
      startTime: Date.now(),
      gameState: {
        questions,
        questionIndex: 0,
        answers: {},
        scores: {
          [player1.userId]: 0,
          [player2.userId]: 0
        },
        phase: "starting"
      }
    };

    rooms.set(roomId, room);
    playerToRoom.set(player1.userId, roomId);
    playerToRoom.set(player2.userId, roomId);

    console.log(`[Ranked] Created room ${roomId} with ${questions.length} pre-generated questions`);

    // Start countdown after a short delay (let clients receive match_found first)
    setTimeout(() => {
      startRankedCountdown(room);
    }, 500);
  }

  // Helper for ranked countdown (separate from regular countdown to avoid closure issues)
  function startRankedCountdown(room: GameRoomWithTimers) {
    if (room.countdownTimer) {
      clearInterval(room.countdownTimer);
    }
    room.countdownLeft = 3; // 3 second countdown

    // Notify all players that countdown has started
    broadcastToRoomGlobal(room, {
      type: "countdown_started",
      countdown: room.countdownLeft,
      players: room.players.map((p) => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        isReady: p.isReady,
        score: p.score,
      })),
    });

    room.countdownTimer = setInterval(() => {
      room.countdownLeft!--;

      broadcastToRoomGlobal(room, {
        type: "countdown_tick",
        countdown: room.countdownLeft,
      });

      if (room.countdownLeft! <= 0) {
        clearInterval(room.countdownTimer!);
        room.countdownTimer = undefined;

        // Start the game
        room.status = "playing";
        room.gameState!.phase = "playing";

        broadcastToRoomGlobal(room, {
          type: "game_started",
          settings: room.settings,
          players: room.players.map((p) => ({
            id: p.id,
            name: p.name,
            isHost: p.isHost,
            isReady: p.isReady,
            score: p.score,
          })),
        });

        // Broadcast game state and start timer
        broadcastGameStateGlobal(room);
        startQuestionTimerGlobal(room);
      }
    }, 1000);
  }

  // Global versions of broadcast functions (for use outside WebSocket handler)
  function broadcastToRoomGlobal(room: GameRoomWithTimers, message: any) {
    room.players.forEach((player) => {
      if (player.ws.readyState === 1) {
        player.ws.send(JSON.stringify(message));
      }
    });
  }

  function broadcastGameStateGlobal(room: GameRoomWithTimers) {
    const state = {
      ...room.gameState,
      questionTimeRemaining: room.timeLeft,
      revealTimeRemaining: room.revealTimeLeft,
    };
    broadcastToRoomGlobal(room, { type: "game_state", state });
  }

  function startQuestionTimerGlobal(room: GameRoomWithTimers) {
    if (room.questionTimer) {
      clearInterval(room.questionTimer);
    }
    room.timeLeft = 20; // QUESTION_TIME

    room.questionTimer = setInterval(() => {
      room.timeLeft!--;
      broadcastGameStateGlobal(room);

      if (room.timeLeft! <= 0) {
        clearInterval(room.questionTimer!);
        room.questionTimer = undefined;
        revealAndScoreGlobal(room);
      }
    }, 1000);
  }

  function revealAndScoreGlobal(room: GameRoomWithTimers) {
    const gs = room.gameState!;
    const currentQ = gs.questions[gs.questionIndex];
    for (const pid in gs.answers) {
      if (gs.answers[pid] === currentQ.answer) {
        gs.scores[pid] = (gs.scores[pid] || 0) + 1;
      }
    }
    gs.phase = "reveal";
    broadcastGameStateGlobal(room);

    // Start reveal timer
    if (room.revealTimer) {
      clearTimeout(room.revealTimer);
    }
    room.revealTimeLeft = 2; // REVEAL_TIME

    room.revealTimer = setTimeout(() => {
      room.revealTimer = undefined;
      nextQuestionOrEndGlobal(room);
    }, 2000);
  }

  function nextQuestionOrEndGlobal(room: GameRoomWithTimers) {
    const gs = room.gameState!;
    if (gs.questionIndex + 1 < gs.questions.length) {
      gs.questionIndex++;
      gs.answers = {};
      gs.phase = "playing";
      broadcastGameStateGlobal(room);
      startQuestionTimerGlobal(room);
    } else {
      gs.phase = "final";
      broadcastGameStateGlobal(room);

      // Save ranked match results
      if (room.isRanked && room.players.length === 2) {
        const p1 = room.players[0];
        const p2 = room.players[1];

        if (p1.odId && p2.odId) {
          const durationSeconds = room.startTime
            ? Math.round((Date.now() - room.startTime) / 1000)
            : 0;

          saveRankedMatchResult(
            p1.odId,
            p2.odId,
            gs.scores[p1.id] || 0,
            gs.scores[p2.id] || 0,
            durationSeconds
          ).then((result) => {
            room.players.forEach((player) => {
              const playerResult = result.participants.find(p => p.odId === player.odId);
              if (playerResult && player.ws.readyState === 1) {
                player.ws.send(JSON.stringify({
                  type: "ranked_result",
                  matchId: result.matchId,
                  winnerId: result.winnerId,
                  mmrChange: playerResult.mmrChange,
                  newMmr: playerResult.newMmr,
                  newTier: playerResult.newTier,
                  isWinner: result.winnerId === player.odId
                }));
              }
            });
          }).catch(err => {
            console.error("[Match] Failed to save ranked result:", err);
          });
        }
      }

      broadcastToRoomGlobal(room, { type: "game_end" });
    }
  }

  // WebSocket server for real-time multiplayer

  const wss = new WebSocketServer({
    server: httpServer,
    path: "/ws/multiplayer", // Specific path for multiplayer WebSocket
  });

  // ===========================================
  // GEMINI AI ENDPOINT (Protected with rate limiting)
  // ===========================================
  app.post("/api/generate-questions", geminiLimiter, async (req, res) => {
    try {
      const { category, difficulty, count, topic, indonesiaMode } = req.body as GeminiQuestionRequest;

      // Validate input
      if (!category || !difficulty || !count) {
        return res.status(400).json({
          error: "Missing required fields: category, difficulty, count"
        });
      }

      if (count < 1 || count > 20) {
        return res.status(400).json({
          error: "Question count must be between 1 and 20"
        });
      }

      if (!["easy", "medium", "hard"].includes(difficulty)) {
        return res.status(400).json({
          error: "Difficulty must be: easy, medium, or hard"
        });
      }

      // Check if Gemini is configured
      if (!geminiService.isConfigured()) {
        return res.status(503).json({
          error: "AI service is not configured. Please set GEMINI_API_KEY."
        });
      }

      // Generate questions
      const questions = await geminiService.generateQuestions({
        category,
        difficulty,
        count,
        topic,
        indonesiaMode,
      });

      res.json({ questions });
    } catch (error: any) {
      console.error("[API] Error generating questions:", error);
      res.status(500).json({
        error: error.message || "Failed to generate questions"
      });
    }
  });

  // Health check for Gemini service
  app.get("/api/gemini/status", async (req, res) => {
    const isConfigured = geminiService.isConfigured();
    res.json({
      configured: isConfigured,
      message: isConfigured ? "Gemini API is configured" : "Gemini API key not set"
    });
  });

  // ===========================================
  // ROOM MANAGEMENT ENDPOINTS (with rate limiting)
  // ===========================================

  // API routes for room management
  app.get("/api/rooms", roomsLimiter, (req, res) => {
    const publicRooms = Array.from(rooms.values())
      .filter((room) => room.status === "waiting")
      .map((room) => ({
        id: room.id,
        name: room.name,
        playerCount: room.players.length,
        maxPlayers: room.maxPlayers,
        hostName:
          room.players.find((p) => p.id === room.hostId)?.name || "Unknown",
        settings: room.settings,
        createdAt: room.createdAt,
        isPrivate: room.isPrivate,
      }));

    res.json({ rooms: publicRooms });
  });

  // Get only 1v1 rooms (maxPlayers = 2)
  app.get("/api/rooms/1v1", roomsLimiter, (req, res) => {
    const oneVsOneRooms = Array.from(rooms.values())
      .filter((room) => room.maxPlayers === 2 && room.status === "waiting")
      .map((room) => ({
        id: room.id,
        name: room.name,
        playerCount: room.players.length,
        maxPlayers: room.maxPlayers,
        hostName:
          room.players.find((p) => p.id === room.hostId)?.name || "Unknown",
        settings: room.settings,
        createdAt: room.createdAt,
        isPrivate: room.isPrivate,
      }));

    res.json({ rooms: oneVsOneRooms });
  });

  app.post("/api/rooms", createRoomLimiter, (req, res) => {
    const { name, hostName, isPrivate, password, maxPlayers, settings } =
      req.body;

    if (!name || !hostName) {
      return res
        .status(400)
        .json({ error: "Room name and host name are required" });
    }

    const roomId = uuidv4();
    const hostId = uuidv4();

    const room: GameRoomWithTimers = {
      id: roomId,
      name,
      hostId,
      players: [],
      maxPlayers: maxPlayers || 4,
      isPrivate: isPrivate || false,
      password,
      status: "waiting",
      settings: {
        difficulty: settings?.difficulty || "medium",
        category: settings?.category || "all",
        questionCount: settings?.questionCount || 10,
      },
      createdAt: new Date(),
    };

    rooms.set(roomId, room);

    res.json({
      roomId,
      hostId,
      room: {
        id: room.id,
        name: room.name,
        playerCount: room.players.length,
        maxPlayers: room.maxPlayers,
        settings: room.settings,
      },
    });
  });

  app.get("/api/rooms/:roomId", (req, res) => {
    const { roomId } = req.params;
    const room = rooms.get(roomId);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json({
      id: room.id,
      name: room.name,
      playerCount: room.players.length,
      maxPlayers: room.maxPlayers,
      isPrivate: room.isPrivate,
      status: room.status,
      settings: room.settings,
      players: room.players.map((p) => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        isReady: p.isReady,
        score: p.score,
      })),
    });
  });

  // ===========================================
  // LEADERBOARD & MATCH HISTORY ENDPOINTS
  // ===========================================

  app.get("/api/leaderboard", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const leaderboard = await getLeaderboard(Math.min(limit, 100));
      res.json({ leaderboard });
    } catch (error) {
      console.error("[API] Leaderboard error:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  app.get("/api/user/:userId/history", async (req, res) => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;
      const history = await getMatchHistory(userId, Math.min(limit, 50));
      res.json({ history });
    } catch (error) {
      console.error("[API] Match history error:", error);
      res.status(500).json({ error: "Failed to fetch match history" });
    }
  });

  // WebSocket connection handling
  wss.on("connection", (ws) => {
    console.log("Multiplayer WebSocket client connected");
    let currentPlayer: Player | null = null;
    let currentRoom: GameRoomWithTimers | null = null;

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());

        switch (data.type) {
          case "join_room":
            handleJoinRoom(ws, data, currentPlayer, currentRoom);
            break;
          case "leave_room":
            handleLeaveRoom(ws, currentPlayer, currentRoom);
            break;
          case "player_ready":
            handlePlayerReady(ws, data, currentPlayer, currentRoom);
            break;
          case "start_game":
            handleStartGame(ws, currentPlayer, currentRoom, data);
            break;
          case "chat_message":
            handleChatMessage(ws, data, currentPlayer, currentRoom);
            break;
          case "update_settings":
            handleUpdateSettings(ws, data, currentPlayer, currentRoom);
            break;
          case "answer":
            handlePlayerAnswer(ws, data, currentPlayer, currentRoom);
            break;
          case "join_ranked_queue":
            handleJoinRankedQueue(ws, data);
            break;
          case "leave_ranked_queue":
            handleLeaveRankedQueue(ws, data);
            break;
        }
      } catch (error) {

        console.error("WebSocket message error:", error);
        ws.send(
          JSON.stringify({ type: "error", message: "Invalid message format" })
        );
      }
    });

    ws.on("close", () => {
      console.log("Multiplayer WebSocket client disconnected");
      if (currentPlayer && currentRoom) {
        handleLeaveRoom(ws, currentPlayer, currentRoom);
      }
    });

    function handleJoinRoom(
      ws: any,
      data: any,
      player: Player | null,
      room: GameRoomWithTimers | null
    ) {
      const { roomId, playerName, password } = data;
      const targetRoom = rooms.get(roomId);

      if (!targetRoom) {
        ws.send(JSON.stringify({ type: "error", message: "Room not found" }));
        return;
      }

      if (targetRoom.isPrivate && targetRoom.password !== password) {
        ws.send(
          JSON.stringify({ type: "error", message: "Incorrect password" })
        );
        return;
      }

      if (targetRoom.players.length >= targetRoom.maxPlayers) {
        ws.send(JSON.stringify({ type: "error", message: "Room is full" }));
        return;
      }

      // Check if player is already in the room (by name) - handles refresh/rejoin
      const existingPlayer = targetRoom.players.find(
        (p) => p.name === playerName
      );
      if (existingPlayer) {
        // Update their ws reference
        existingPlayer.ws = ws;
        currentPlayer = existingPlayer;
        currentRoom = targetRoom;
        playerToRoom.set(existingPlayer.id, roomId);

        // Send them the current room info
        ws.send(
          JSON.stringify({
            type: "room_joined",
            room: {
              id: targetRoom.id,
              name: targetRoom.name,
              playerCount: targetRoom.players.length,
              maxPlayers: targetRoom.maxPlayers,
              settings: targetRoom.settings,
            },
            players: targetRoom.players.map((p) => ({
              id: p.id,
              name: p.name,
              isHost: p.isHost,
              isReady: p.isReady,
              score: p.score,
            })),
            playerId: existingPlayer.id,
          })
        );
        // Also send the current game state if game is in progress
        if (targetRoom.gameState) {
          ws.send(
            JSON.stringify({
              type: "game_state",
              state: targetRoom.gameState,
            })
          );
        }
        return;
      }

      // If game is in progress and player is not already in room, reject
      if (targetRoom.status !== "waiting") {
        ws.send(
          JSON.stringify({ type: "error", message: "Game already in progress" })
        );
        return;
      }

      // Create new player
      const newPlayer: Player = {
        id: uuidv4(),
        name: playerName,
        isHost: targetRoom.players.length === 0,
        isReady: false,
        score: 0,
        ws,
      };

      // Update room
      targetRoom.players.push(newPlayer);
      if (targetRoom.players.length === 1) {
        targetRoom.hostId = newPlayer.id;
      }

      // Update references
      currentPlayer = newPlayer;
      currentRoom = targetRoom;
      playerToRoom.set(newPlayer.id, roomId);

      // Notify all players in room
      broadcastToRoom(targetRoom, {
        type: "player_joined",
        player: {
          id: newPlayer.id,
          name: newPlayer.name,
          isHost: newPlayer.isHost,
          isReady: newPlayer.isReady,
          score: newPlayer.score,
        },
        room: {
          id: targetRoom.id,
          name: targetRoom.name,
          playerCount: targetRoom.players.length,
          maxPlayers: targetRoom.maxPlayers,
          settings: targetRoom.settings,
        },
      });

      // Send confirmation to joining player
      ws.send(
        JSON.stringify({
          type: "room_joined",
          room: {
            id: targetRoom.id,
            name: targetRoom.name,
            playerCount: targetRoom.players.length,
            maxPlayers: targetRoom.maxPlayers,
            settings: targetRoom.settings,
          },
          players: targetRoom.players.map((p) => ({
            id: p.id,
            name: p.name,
            isHost: p.isHost,
            isReady: p.isReady,
            score: p.score,
          })),
          playerId: newPlayer.id,
        })
      );
    }

    function handleLeaveRoom(
      ws: any,
      player: Player | null,
      room: GameRoomWithTimers | null
    ) {
      if (!player || !room) return;

      const playerIndex = room.players.findIndex((p) => p.id === player.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        playerToRoom.delete(player.id);

        // For 1v1/Ranked rooms: If any player leaves, disband the room
        if (room.maxPlayers === 2 && room.players.length > 0) {
          // Notify remaining players that room is being disbanded
          broadcastToRoomGlobal(room, {
            type: "room_disbanded",
            reason: player.isHost ? "Host left the battle" : "Opponent left the battle",
            message: "A player has left. Battle ended.",
          });

          // Clean up all remaining players
          room.players.forEach((p) => {
            playerToRoom.delete(p.id);
          });

          // Clear timers and delete room
          clearQuestionTimer(room);
          clearRevealTimer(room);
          clearCountdownTimer(room);
          rooms.delete(room.id);
        }
        // For regular multiplayer rooms: transfer host
        else if (player.isHost && room.players.length > 0) {

          room.players[0].isHost = true;
          room.hostId = room.players[0].id;

          // Notify remaining players
          broadcastToRoom(room, {
            type: "player_left",
            playerId: player.id,
            newHostId: room.hostId,
            room: {
              id: room.id,
              name: room.name,
              playerCount: room.players.length,
              maxPlayers: room.maxPlayers,
              settings: room.settings,
            },
          });
        }
        // If room is empty, delete it
        else if (room.players.length === 0) {
          clearQuestionTimer(room);
          clearRevealTimer(room);
          clearCountdownTimer(room);
          rooms.delete(room.id);
        } else {
          // Non-host player left
          broadcastToRoom(room, {
            type: "player_left",
            playerId: player.id,
            newHostId: room.hostId,
            room: {
              id: room.id,
              name: room.name,
              playerCount: room.players.length,
              maxPlayers: room.maxPlayers,
              settings: room.settings,
            },
          });
        }
      }

      currentPlayer = null;
      currentRoom = null;
    }

    function handlePlayerReady(
      ws: any,
      data: any,
      player: Player | null,
      room: GameRoomWithTimers | null
    ) {
      if (!player || !room) return;

      player.isReady = data.ready;

      broadcastToRoom(room, {
        type: "player_ready_changed",
        playerId: player.id,
        isReady: player.isReady,
      });

      // Check if all players are ready
      const allReady =
        room.players.length >= 2 && room.players.every((p) => p.isReady);
      if (allReady) {
        broadcastToRoom(room, {
          type: "all_players_ready",
          canStart: true,
        });
      }
    }

    function handleStartGame(
      ws: any,
      player: Player | null,
      room: GameRoomWithTimers | null,
      data?: any // Accept data for custom questions
    ) {
      if (!player || !room) {
        return;
      }
      if (!player.isHost) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Only host can start the game",
          })
        );
        return;
      }
      if (room.players.length < 2) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Need at least 2 players to start",
          })
        );
        return;
      }
      // Only non-host players need to be ready
      const nonHostPlayers = room.players.filter((p) => !p.isHost);
      if (!nonHostPlayers.every((p) => p.isReady)) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "All players must be ready",
          })
        );
        return;
      }

      // Only allow game to start if AI questions are provided
      let questions = undefined;
      if (
        data &&
        data.questions &&
        Array.isArray(data.questions) &&
        data.questions.length > 0
      ) {
        questions = data.questions.map((q: any) => {
          // Convert correctAnswer index to actual answer text
          // Use !== undefined to handle correctAnswer being 0
          const correctAnswerIndex = q.correctAnswer !== undefined ? q.correctAnswer : q.answer;
          const answerText =
            typeof correctAnswerIndex === "number"
              ? q.options[correctAnswerIndex]
              : correctAnswerIndex;

          return {
            question: q.question,
            options: q.options,
            answer: answerText,
            explanation: q.explanation,
            category: q.category,
            difficulty: q.difficulty,
          };
        });
      } else {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Please generate AI questions before starting the game.",
          })
        );
        return;
      }

      room.status = "starting";

      // Initialize game state
      room.gameState = {
        questions,
        questionIndex: 0,
        answers: {},
        scores: Object.fromEntries(room.players.map((p) => [p.id, 0])),
        phase: "starting",
      };

      // Start pre-battle countdown
      startCountdown(room);
    }

    function startCountdown(room: GameRoomWithTimers) {
      clearCountdownTimer(room);
      room.countdownLeft = COUNTDOWN_TIME;

      // Notify all players that countdown has started
      broadcastToRoom(room, {
        type: "countdown_started",
        countdown: room.countdownLeft,
        players: room.players.map((p) => ({
          id: p.id,
          name: p.name,
          isHost: p.isHost,
          isReady: p.isReady,
          score: p.score,
        })),
      });

      room.countdownTimer = setInterval(() => {
        room.countdownLeft!--;

        broadcastToRoom(room, {
          type: "countdown_tick",
          countdown: room.countdownLeft,
        });

        if (room.countdownLeft! <= 0) {
          clearCountdownTimer(room);
          // Now actually start the game
          room.status = "playing";
          room.gameState!.phase = "playing";

          // Send game_started message to all players
          broadcastToRoom(room, {
            type: "game_started",
            settings: room.settings,
            players: room.players.map((p) => ({
              id: p.id,
              name: p.name,
              isHost: p.isHost,
              isReady: p.isReady,
              score: p.score,
            })),
          });

          // Also broadcast the initial game state
          broadcastGameState(room);
          startQuestionTimer(room);
        }
      }, 1000);
    }

    function clearCountdownTimer(room: GameRoomWithTimers) {
      if (room.countdownTimer) {
        clearInterval(room.countdownTimer);
        room.countdownTimer = undefined;
      }
    }

    function handleChatMessage(
      ws: any,
      data: any,
      player: Player | null,
      room: GameRoomWithTimers | null
    ) {
      if (!player || !room) return;

      broadcastToRoom(room, {
        type: "chat_message",
        playerId: player.id,
        playerName: player.name,
        message: data.message,
        timestamp: new Date().toISOString(),
      });
    }

    function handleUpdateSettings(
      ws: any,
      data: any,
      player: Player | null,
      room: GameRoomWithTimers | null
    ) {
      if (!player || !room) return;

      if (!player.isHost) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Only host can update settings",
          })
        );
        return;
      }

      if (room.status !== "waiting") {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Cannot update settings during game",
          })
        );
        return;
      }

      // Handle maxPlayers update
      if (data.maxPlayers !== undefined) {
        const newMaxPlayers = parseInt(data.maxPlayers);
        if (newMaxPlayers < room.players.length) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: `Cannot set max players to ${newMaxPlayers} when there are ${room.players.length} players in the room`,
            })
          );
          return;
        }
        if (newMaxPlayers < 2 || newMaxPlayers > 8) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Max players must be between 2 and 8",
            })
          );
          return;
        }
        room.maxPlayers = newMaxPlayers;
      }

      // Handle other settings
      if (data.settings) {
        room.settings = { ...room.settings, ...data.settings };
      }

      broadcastToRoom(room, {
        type: "settings_updated",
        settings: room.settings,
        maxPlayers: room.maxPlayers,
      });
    }

    function handlePlayerAnswer(
      ws: any,
      data: any,
      player: Player | null,
      room: GameRoomWithTimers | null
    ) {
      if (!player || !room || !room.gameState) {
        return;
      }

      const { answer, playerId } = data;

      if (room.gameState.answers[playerId]) {
        return;
      }

      room.gameState.answers[playerId] = answer;

      const totalAnswers = Object.keys(room.gameState.answers).length;
      const totalPlayers = room.players.length;

      // If all players have answered, reveal and score
      if (totalAnswers === totalPlayers) {
        clearQuestionTimer(room);
        revealAndScore(room);
      } else {
        // Pressure Timer: In 1v1 mode, when first player answers, reduce opponent's timer
        if (room.maxPlayers === 2 && totalAnswers === 1) {
          // Broadcast player_answered to opponents
          room.players.forEach((p) => {
            if (p.id !== playerId && p.ws.readyState === 1) {
              p.ws.send(JSON.stringify({
                type: "player_answered",
                playerId: playerId,
                playerName: player.name,
              }));
            }
          });

          // Reduce timer to PRESSURE_TIME if more time remaining
          if (room.timeLeft && room.timeLeft > PRESSURE_TIME) {
            room.timeLeft = PRESSURE_TIME;
          }
        }
        broadcastGameState(room);
      }
    }

    async function handleJoinRankedQueue(ws: any, data: any) {
      const { userId, username } = data;
      if (!userId || !username) return;

      try {
        const [stats] = await db.select().from(userStats).where(eq(userStats.userId, userId));
        const mmr = stats?.mmr || 1000;

        matchmakingService.addPlayer({
          userId,
          username,
          mmr,
          ws,
          joinedAt: Date.now()
        });

        ws.send(JSON.stringify({ type: "ranked_queue_joined" }));
      } catch (err) {
        console.error("[Matchmaking] Error joining queue:", err);
      }
    }

    function handleLeaveRankedQueue(ws: any, data: any) {
      const { userId } = data;
      if (!userId) return;
      matchmakingService.removePlayer(userId);
      ws.send(JSON.stringify({ type: "ranked_queue_left" }));
    }

    function scoreAndNext(room: GameRoomWithTimers) {

      const gs = room.gameState!;
      const currentQ = gs.questions[gs.questionIndex];
      // Score answers
      for (const pid in gs.answers) {
        if (gs.answers[pid] === currentQ.answer) {
          gs.scores[pid] = (gs.scores[pid] || 0) + 1;
        }
      }
      // Next question or end
      if (gs.questionIndex + 1 < gs.questions.length) {
        gs.questionIndex++;
        gs.answers = {};
        broadcastGameState(room);
      } else {
        gs.phase = "final";
        broadcastGameState(room);
        broadcastToRoom(room, { type: "game_end" });
      }
    }

    function broadcastGameState(room: GameRoomWithTimers) {
      const state = {
        ...room.gameState,
        questionTimeRemaining: room.timeLeft,
        revealTimeRemaining: room.revealTimeLeft,
      };
      broadcastToRoom(room, {
        type: "game_state",
        state,
      });
    }

    // Helper to start a question timer
    function startQuestionTimer(room: GameRoomWithTimers) {
      clearQuestionTimer(room);
      room.timeLeft = QUESTION_TIME;

      room.questionTimer = setInterval(() => {
        room.timeLeft!--;

        // Broadcast time left every second
        broadcastGameState(room);

        if (room.timeLeft! <= 0) {
          clearQuestionTimer(room);
          revealAndScore(room);
        }
      }, 1000);
    }

    function clearQuestionTimer(room: GameRoomWithTimers) {
      if (room.questionTimer) {
        clearInterval(room.questionTimer);
        room.questionTimer = undefined;
      }
    }

    function startRevealTimer(room: GameRoomWithTimers) {
      clearRevealTimer(room);
      room.revealTimeLeft = REVEAL_TIME;

      room.revealTimer = setTimeout(() => {
        clearRevealTimer(room);
        nextQuestionOrEnd(room);
      }, REVEAL_TIME * 1000);
    }

    function clearRevealTimer(room: GameRoomWithTimers) {
      if (room.revealTimer) {
        clearTimeout(room.revealTimer);
        room.revealTimer = undefined;
      }
    }

    function revealAndScore(room: GameRoomWithTimers) {
      const gs = room.gameState!;
      const currentQ = gs.questions[gs.questionIndex];
      for (const pid in gs.answers) {
        if (gs.answers[pid] === currentQ.answer) {
          gs.scores[pid] = (gs.scores[pid] || 0) + 1;
        }
      }
      // Set phase to 'reveal' for UI
      gs.phase = "reveal";
      broadcastGameState(room);
      startRevealTimer(room);
    }

    function nextQuestionOrEnd(room: GameRoomWithTimers) {
      const gs = room.gameState!;
      if (gs.questionIndex + 1 < gs.questions.length) {
        gs.questionIndex++;
        gs.answers = {};
        gs.phase = "playing";
        broadcastGameState(room);
        startQuestionTimer(room);
      } else {
        gs.phase = "final";
        broadcastGameState(room);

        // Save ranked match results
        if (room.isRanked && room.players.length === 2) {
          const p1 = room.players[0];
          const p2 = room.players[1];

          if (p1.odId && p2.odId) {
            const durationSeconds = room.startTime
              ? Math.round((Date.now() - room.startTime) / 1000)
              : 0;

            saveRankedMatchResult(
              p1.odId,
              p2.odId,
              gs.scores[p1.id] || 0,
              gs.scores[p2.id] || 0,
              durationSeconds
            ).then((result) => {
              // Send match result with MMR changes to each player
              room.players.forEach((player) => {
                const playerResult = result.participants.find(p => p.odId === player.odId);
                if (playerResult && player.ws.readyState === 1) {
                  player.ws.send(JSON.stringify({
                    type: "ranked_result",
                    matchId: result.matchId,
                    winnerId: result.winnerId,
                    mmrChange: playerResult.mmrChange,
                    newMmr: playerResult.newMmr,
                    newTier: playerResult.newTier,
                    isWinner: result.winnerId === player.odId
                  }));
                }
              });
            }).catch(err => {
              console.error("[Match] Failed to save ranked result:", err);
            });
          }
        }

        broadcastToRoom(room, { type: "game_end" });
      }
    }
  });

  function broadcastToRoom(room: GameRoomWithTimers, message: any) {
    room.players.forEach((player) => {
      if (player.ws.readyState === 1) {
        // WebSocket.OPEN
        player.ws.send(JSON.stringify(message));
      }
    });
  }

  return httpServer;
}
