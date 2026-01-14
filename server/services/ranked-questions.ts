import { db } from "../db";
import { rankedQuestions } from "../schema";
import { sql } from "drizzle-orm";

export interface RankedQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string | null;
  category: string;
  difficulty: string;
}

/**
 * Get random questions for a ranked match
 * @param count Number of questions to fetch
 * @param difficulty Optional difficulty filter
 */
export async function getRandomRankedQuestions(
  count: number = 10,
  difficulty?: string
): Promise<RankedQuestion[]> {
  let query = sql`
    SELECT id, question, options, correct_answer as "correctAnswer", 
           explanation, category, difficulty
    FROM ranked_questions
  `;

  if (difficulty) {
    query = sql`
      SELECT id, question, options, correct_answer as "correctAnswer", 
             explanation, category, difficulty
      FROM ranked_questions
      WHERE difficulty = ${difficulty}
    `;
  }

  query = sql`${query} ORDER BY RANDOM() LIMIT ${count}`;

  const result = await db.execute(query);
  
  return (result.rows as any[]).map(row => ({
    ...row,
    options: JSON.parse(row.options)
  }));
}

/**
 * Convert ranked questions to game state format
 */
export function toGameQuestions(questions: RankedQuestion[]) {
  return questions.map(q => ({
    question: q.question,
    options: q.options,
    answer: q.options[q.correctAnswer],
    explanation: q.explanation ?? undefined, // Convert null to undefined
    category: q.category,
    difficulty: q.difficulty
  }));
}

/**
 * Increment usage counter for questions (for analytics)
 */
export async function markQuestionsUsed(questionIds: string[]) {
  if (questionIds.length === 0) return;
  
  await db.execute(sql`
    UPDATE ranked_questions 
    SET times_used = times_used + 1 
    WHERE id = ANY(${questionIds}::uuid[])
  `);
}
