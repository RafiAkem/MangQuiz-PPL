import { db } from "../db";
import { matches, matchParticipants, userStats, users } from "../schema";
import { eq, desc, sql } from "drizzle-orm";
import { calculateELO, getRankTier } from "./elo";

export interface MatchResult {
  matchId: string;
  winnerId: string | null;
  participants: {
    odId: string;
    score: number;
    mmrChange: number;
    newMmr: number;
    newTier: string;
  }[];
}

/**
 * Saves ranked match result and updates player MMR/stats
 */
export async function saveRankedMatchResult(
  player1Id: string,
  player2Id: string,
  player1Score: number,
  player2Score: number,
  durationSeconds: number
): Promise<MatchResult> {
  // Determine winner (null if draw)
  let winnerId: string | null = null;
  if (player1Score > player2Score) {
    winnerId = player1Id;
  } else if (player2Score > player1Score) {
    winnerId = player2Id;
  }

  // Get current MMRs
  const p1StatsResult = await db.select().from(userStats).where(eq(userStats.userId, player1Id));
  const p2StatsResult = await db.select().from(userStats).where(eq(userStats.userId, player2Id));
  const p1Stats = p1StatsResult[0];
  const p2Stats = p2StatsResult[0];

  const p1MMR = p1Stats?.mmr || 1000;
  const p2MMR = p2Stats?.mmr || 1000;

  let p1NewMMR = p1MMR;
  let p2NewMMR = p2MMR;
  let p1Change = 0;
  let p2Change = 0;

  // Calculate ELO changes if there's a winner
  if (winnerId) {
    if (winnerId === player1Id) {
      const elo = calculateELO(p1MMR, p2MMR);
      p1NewMMR = elo.winnerNewMMR;
      p2NewMMR = elo.loserNewMMR;
      p1Change = elo.change;
      p2Change = -elo.change;
    } else {
      const elo = calculateELO(p2MMR, p1MMR);
      p2NewMMR = elo.winnerNewMMR;
      p1NewMMR = elo.loserNewMMR;
      p2Change = elo.change;
      p1Change = -elo.change;
    }
  }

  // Create match record
  const matchResult = await db.insert(matches).values({
    type: "ranked",
    winnerId,
    durationSeconds
  }).returning();
  const match = matchResult[0];

  // Create participant records using raw SQL to avoid type issues
  await db.execute(sql`
    INSERT INTO match_participants (match_id, user_id, score, mmr_change)
    VALUES (${match.id}, ${player1Id}, ${player1Score}, ${p1Change}),
           (${match.id}, ${player2Id}, ${player2Score}, ${p2Change})
  `);

  // Update player 1 stats
  const p1Tier = getRankTier(p1NewMMR);
  const p1IsWinner = winnerId === player1Id;
  
  if (p1IsWinner) {
    await db.execute(sql`
      UPDATE user_stats 
      SET mmr = ${p1NewMMR}, 
          rank_tier = ${p1Tier}, 
          wins = wins + 1, 
          win_streak = win_streak + 1,
          last_played_at = NOW()
      WHERE user_id = ${player1Id}
    `);
  } else if (winnerId) {
    await db.execute(sql`
      UPDATE user_stats 
      SET mmr = ${p1NewMMR}, 
          rank_tier = ${p1Tier}, 
          losses = losses + 1, 
          win_streak = 0,
          last_played_at = NOW()
      WHERE user_id = ${player1Id}
    `);
  } else {
    await db.execute(sql`
      UPDATE user_stats 
      SET last_played_at = NOW()
      WHERE user_id = ${player1Id}
    `);
  }

  // Update player 2 stats
  const p2Tier = getRankTier(p2NewMMR);
  const p2IsWinner = winnerId === player2Id;
  
  if (p2IsWinner) {
    await db.execute(sql`
      UPDATE user_stats 
      SET mmr = ${p2NewMMR}, 
          rank_tier = ${p2Tier}, 
          wins = wins + 1, 
          win_streak = win_streak + 1,
          last_played_at = NOW()
      WHERE user_id = ${player2Id}
    `);
  } else if (winnerId) {
    await db.execute(sql`
      UPDATE user_stats 
      SET mmr = ${p2NewMMR}, 
          rank_tier = ${p2Tier}, 
          losses = losses + 1, 
          win_streak = 0,
          last_played_at = NOW()
      WHERE user_id = ${player2Id}
    `);
  } else {
    await db.execute(sql`
      UPDATE user_stats 
      SET last_played_at = NOW()
      WHERE user_id = ${player2Id}
    `);
  }

  console.log(`[Match] Saved ranked match ${match.id}: ${player1Id}(${p1Change > 0 ? '+' : ''}${p1Change}) vs ${player2Id}(${p2Change > 0 ? '+' : ''}${p2Change})`);

  return {
    matchId: match.id,
    winnerId,
    participants: [
      { odId: player1Id, score: player1Score, mmrChange: p1Change, newMmr: p1NewMMR, newTier: p1Tier },
      { odId: player2Id, score: player2Score, mmrChange: p2Change, newMmr: p2NewMMR, newTier: p2Tier }
    ]
  };
}

/**
 * Get leaderboard - top players by MMR
 */
export async function getLeaderboard(limit: number = 50) {
  const result = await db.execute(sql`
    SELECT 
      ROW_NUMBER() OVER (ORDER BY us.mmr DESC) as rank,
      us.user_id as "userId",
      u.username,
      us.mmr,
      us.rank_tier as tier,
      us.wins,
      us.losses,
      us.win_streak as "winStreak"
    FROM user_stats us
    JOIN users u ON u.id = us.user_id
    ORDER BY us.mmr DESC
    LIMIT ${limit}
  `);

  return result.rows;
}

/**
 * Get match history for a player
 */
export async function getMatchHistory(odId: string, limit: number = 20) {
  const result = await db.execute(sql`
    SELECT 
      m.id as "matchId",
      m.winner_id as "winnerId",
      m.duration_seconds as "durationSeconds",
      m.created_at as "createdAt",
      mp.score,
      mp.mmr_change as "mmrChange"
    FROM match_participants mp
    JOIN matches m ON m.id = mp.match_id
    WHERE mp.user_id = ${odId}
    ORDER BY m.created_at DESC
    LIMIT ${limit}
  `);

  return result.rows;
}
