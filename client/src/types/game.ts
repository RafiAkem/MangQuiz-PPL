export interface Player {
  id: string;
  name: string;
  score: number;
  color: string;
}

export interface Question {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation?: string;
}

export interface GameState {
  phase: 'lobby' | 'playing' | 'question' | 'results' | 'final';
  players: Player[];
  currentQuestionIndex: number;
  questions: Question[];
  timeRemaining: number;
  questionTimeRemaining: number;
  selectedAnswers: Record<string, number | null>;
  showAnswer: boolean;
  gameStartTime: number;
}

export type GamePhase = GameState['phase'];

export interface GameSettings {
  gameDuration: number; // 5 minutes in milliseconds
  questionTime: number; // time per question in seconds
  numberOfQuestions: number;
  categories: string[];
}
