export interface ELOResult {
  winnerNewMMR: number;
  loserNewMMR: number;
  change: number;
}

const K_FACTOR = 32;

/**
 * Calculates new MMR ratings based on ELO algorithm
 * @param winnerMMR Current MMR of the winner
 * @param loserMMR Current MMR of the loser
 */
export function calculateELO(winnerMMR: number, loserMMR: number): ELOResult {
  // Expected scores
  const expectedWinner = 1 / (1 + Math.pow(10, (loserMMR - winnerMMR) / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerMMR - loserMMR) / 400));

  // Actual scores: winner = 1, loser = 0
  const change = Math.round(K_FACTOR * (1 - expectedWinner));
  
  // Ensure at least 10 MMR change to keep it interesting
  const finalChange = Math.max(change, 10);

  return {
    winnerNewMMR: winnerMMR + finalChange,
    loserNewMMR: Math.max(0, loserMMR - finalChange), // Prevent negative MMR
    change: finalChange
  };
}

export type RankTier = 'PLASTIC' | 'CONCRETE' | 'ALUMINUM' | 'CHROME' | 'NEON' | 'ETHER';

export function getRankTier(mmr: number): RankTier {
  if (mmr < 1000) return 'PLASTIC';
  if (mmr < 1500) return 'CONCRETE';
  if (mmr < 2000) return 'ALUMINUM';
  if (mmr < 2500) return 'CHROME';
  if (mmr < 3000) return 'NEON';
  return 'ETHER';
}
