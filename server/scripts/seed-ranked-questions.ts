import { neon } from '@neondatabase/serverless';
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL!);
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error('GEMINI_API_KEY or VITE_GEMINI_API_KEY must be set');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const CATEGORIES = [
  'History',
  'Science', 
  'Geography',
  'Literature',
  'Sports',
  'Entertainment',
  'Technology',
  'Arts'
];

const DIFFICULTIES: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];
const QUESTIONS_PER_BATCH = 15;
const TOTAL_TARGET = 500;

interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: string;
}

async function generateBatch(category: string, difficulty: string, count: number): Promise<GeneratedQuestion[]> {
  const difficultyDesc = {
    easy: 'Basic knowledge, suitable for casual players',
    medium: 'Intermediate knowledge, requires some study',
    hard: 'Expert level, challenging trivia for enthusiasts'
  }[difficulty] || 'Mixed difficulty';

  const prompt = `Generate ${count} multiple choice trivia questions about ${category}.

Requirements:
- Difficulty level: ${difficultyDesc}
- Each question should have exactly 4 options
- Only one correct answer per question (index 0-3)
- Questions should be engaging, factual, and educational
- Include a brief explanation for the correct answer
- Avoid ambiguous questions or subjective topics
- Make sure options are plausible but only one is definitively correct

Format as JSON array:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of why this is correct"
  }
]

Return ONLY valid JSON array, no markdown formatting, no additional text.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }
    
    const questions = JSON.parse(jsonMatch[0]);
    
    return questions
      .filter((q: any) => 
        q.question && 
        Array.isArray(q.options) && 
        q.options.length === 4 &&
        typeof q.correctAnswer === 'number' &&
        q.correctAnswer >= 0 &&
        q.correctAnswer <= 3
      )
      .map((q: any) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        category,
        difficulty
      }));
  } catch (error) {
    console.error(`Failed to generate batch for ${category}/${difficulty}:`, error);
    return [];
  }
}

async function insertQuestions(questions: GeneratedQuestion[]) {
  if (questions.length === 0) return 0;
  
  let inserted = 0;
  for (const q of questions) {
    try {
      await sql`
        INSERT INTO ranked_questions (question, options, correct_answer, explanation, category, difficulty)
        VALUES (${q.question}, ${JSON.stringify(q.options)}, ${q.correctAnswer}, ${q.explanation}, ${q.category}, ${q.difficulty})
      `;
      inserted++;
    } catch (error) {
      // Skip duplicates or invalid entries
      console.error(`Failed to insert question: ${q.question.substring(0, 50)}...`);
    }
  }
  return inserted;
}

async function getExistingCount(): Promise<number> {
  const result = await sql`SELECT COUNT(*) as count FROM ranked_questions`;
  return parseInt(result[0].count as string, 10);
}

async function seed() {
  console.log('Starting ranked questions seeding...\n');
  
  const existingCount = await getExistingCount();
  console.log(`Existing questions in database: ${existingCount}`);
  
  if (existingCount >= TOTAL_TARGET) {
    console.log(`Already have ${existingCount} questions. Target: ${TOTAL_TARGET}. Skipping seeding.`);
    return;
  }
  
  const remaining = TOTAL_TARGET - existingCount;
  console.log(`Need to generate ~${remaining} more questions\n`);
  
  // Calculate distribution: 40% medium, 30% easy, 30% hard
  const distribution = {
    easy: Math.floor(remaining * 0.3 / CATEGORIES.length),
    medium: Math.floor(remaining * 0.4 / CATEGORIES.length),
    hard: Math.floor(remaining * 0.3 / CATEGORIES.length)
  };
  
  let totalInserted = 0;
  
  for (const category of CATEGORIES) {
    console.log(`\n📚 Generating questions for ${category}...`);
    
    for (const difficulty of DIFFICULTIES) {
      const targetCount = distribution[difficulty];
      const batchCount = Math.ceil(targetCount / QUESTIONS_PER_BATCH);
      
      for (let batch = 0; batch < batchCount && totalInserted < remaining; batch++) {
        const count = Math.min(QUESTIONS_PER_BATCH, remaining - totalInserted);
        
        console.log(`  Generating ${count} ${difficulty} questions (batch ${batch + 1}/${batchCount})...`);
        
        const questions = await generateBatch(category, difficulty, count);
        const inserted = await insertQuestions(questions);
        totalInserted += inserted;
        
        console.log(`  ✓ Inserted ${inserted} questions (Total: ${existingCount + totalInserted})`);
        
        // Rate limiting - wait between batches
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
  }
  
  const finalCount = await getExistingCount();
  console.log(`\n✅ Seeding complete! Total questions in database: ${finalCount}`);
}

seed().catch(console.error);
