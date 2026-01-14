import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log('Creating ranked_questions table...');
  
  try {
    // Check if table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'ranked_questions'
      );
    `;
    
    if (tableExists[0].exists) {
      console.log('Table ranked_questions already exists');
      return;
    }
    
    // Create the table
    await sql`
      CREATE TABLE ranked_questions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        question TEXT NOT NULL,
        options TEXT NOT NULL,
        correct_answer INTEGER NOT NULL,
        explanation TEXT,
        category VARCHAR(50) NOT NULL,
        difficulty VARCHAR(20) NOT NULL,
        times_used INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    console.log('Table ranked_questions created successfully!');
    
    // Create index for random selection performance
    await sql`CREATE INDEX idx_ranked_questions_difficulty ON ranked_questions(difficulty);`;
    console.log('Index created on difficulty column');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
