import { db } from "../db";
import { userStats } from "../schema";
import { eq } from "drizzle-orm";
import { getRankTier } from "./elo";
import { getRandomRankedQuestions, toGameQuestions, markQuestionsUsed } from "./ranked-questions";

export interface QueuedPlayer {
  userId: string;
  username: string;
  mmr: number;
  ws: any;
  joinedAt: number;
}

export interface RankedMatch {
  roomId: string;
  player1: QueuedPlayer;
  player2: QueuedPlayer;
  questions: {
    question: string;
    options: string[];
    answer: string;
    explanation?: string;
    category: string;
    difficulty: string;
  }[];
}

// Callback type for when match is created
type MatchCreatedCallback = (match: RankedMatch) => void;

class MatchmakingService {
  private queue: QueuedPlayer[] = [];
  private checkInterval: NodeJS.Timeout | null = null;
  private onMatchCreated: MatchCreatedCallback | null = null;

  start() {
    if (this.checkInterval) return;
    this.checkInterval = setInterval(() => this.processQueue(), 5000);
    console.log("[Matchmaking] Service started");
  }

  // Register callback for when match is created (called from routes.ts)
  setMatchCreatedCallback(callback: MatchCreatedCallback) {
    this.onMatchCreated = callback;
  }

  addPlayer(player: QueuedPlayer) {
    const existingIndex = this.queue.findIndex(p => p.userId === player.userId);
    if (existingIndex !== -1) {
      // Update existing entry with new WS and reset joinedAt
      this.queue[existingIndex] = player;
      console.log(`[Matchmaking] Player ${player.username} re-joined queue (updated WebSocket).`);
      return;
    }
    this.queue.push(player);
    console.log(`[Matchmaking] Player ${player.username} (${player.mmr}) joined queue. Total: ${this.queue.length}`);
  }

  removePlayer(userId: string) {
    this.queue = this.queue.filter(p => p.userId !== userId);
  }

  private async processQueue() {
    // 0. Clean up disconnected players from queue first
    const initialCount = this.queue.length;
    this.queue = this.queue.filter(p => p.ws && p.ws.readyState === 1);
    if (this.queue.length < initialCount) {
      console.log(`[Matchmaking] Cleaned up ${initialCount - this.queue.length} disconnected players from queue.`);
    }

    if (this.queue.length < 2) return;

    // Sort by MMR to match similar players
    this.queue.sort((a, b) => a.mmr - b.mmr);

    for (let i = 0; i < this.queue.length - 1; i++) {
      const p1 = this.queue[i];
      const p2 = this.queue[i + 1];

      // Matchmaking logic: check MMR difference
      // Increase allowed range based on time spent in queue (10 MMR per 5 seconds)
      const timeInQueue = (Date.now() - Math.min(p1.joinedAt, p2.joinedAt)) / 1000;
      const allowedDiff = 50 + (timeInQueue * 2);

      if (Math.abs(p1.mmr - p2.mmr) <= allowedDiff) {
        // MATCH FOUND
        this.queue.splice(i, 2);
        await this.startMatch(p1, p2);
        i--; // Adjust index after splice
      }
    }
  }

  private async startMatch(p1: QueuedPlayer, p2: QueuedPlayer) {
    const roomId = `ranked_${Date.now()}_${p1.userId.slice(0, 4)}`;
    console.log(`[Matchmaking] Match found: ${p1.username} vs ${p2.username} in room ${roomId}`);

    try {
      // Fetch pre-generated questions from database
      const rankedQuestions = await getRandomRankedQuestions(10);
      
      if (rankedQuestions.length < 10) {
        console.error("[Matchmaking] Not enough questions in database!");
        // Notify players of error
        [p1, p2].forEach(p => {
          if (p.ws.readyState === 1) {
            p.ws.send(JSON.stringify({
              type: "error",
              message: "Not enough questions available. Please try again later."
            }));
          }
        });
        return;
      }

      // Mark questions as used for analytics
      const questionIds = rankedQuestions.map(q => q.id);
      markQuestionsUsed(questionIds).catch(err => {
        console.error("[Matchmaking] Failed to mark questions used:", err);
      });

      // Convert to game format
      const gameQuestions = toGameQuestions(rankedQuestions);

      const match: RankedMatch = {
        roomId,
        player1: p1,
        player2: p2,
        questions: gameQuestions
      };

      // Notify callback to create room and start game
      if (this.onMatchCreated) {
        this.onMatchCreated(match);
      }

      // Notify players match found
      const basePayload = {
        type: "match_found",
        roomId
      };

      // Notify P1 about P2 (include P1's playerId so client knows their ID)
      if (p1.ws.readyState === 1) {
        p1.ws.send(JSON.stringify({
          ...basePayload,
          playerId: p1.userId,
          opponent: {
            id: p2.userId,
            username: p2.username,
            mmr: p2.mmr,
            tier: getRankTier(p2.mmr)
          }
        }));
      }

      // Notify P2 about P1 (include P2's playerId so client knows their ID)
      if (p2.ws.readyState === 1) {
        p2.ws.send(JSON.stringify({
          ...basePayload,
          playerId: p2.userId,
          opponent: {
            id: p1.userId,
            username: p1.username,
            mmr: p1.mmr,
            tier: getRankTier(p1.mmr)
          }
        }));
      }
    } catch (error) {
      console.error("[Matchmaking] Error starting match:", error);
      [p1, p2].forEach(p => {
        if (p.ws.readyState === 1) {
          p.ws.send(JSON.stringify({
            type: "error",
            message: "Failed to start match. Please try again."
          }));
        }
      });
    }
  }
}

export const matchmakingService = new MatchmakingService();
