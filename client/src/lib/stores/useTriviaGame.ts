import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { GameState, Player, Question, GameSettings } from "../../types/game";
import { getRandomQuestions } from "../../data/questions";

const LOCAL_STORAGE_KEY = "quizrush-localgame";

const DEFAULT_SETTINGS: GameSettings = {
  gameDuration: 5 * 60 * 1000, // 5 minutes
  questionTime: 15, // 15 seconds per question
  numberOfQuestions: 20,
  categories: [],
};

const PLAYER_COLORS = [
  "#ef4444", // red
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // yellow
];

function loadStateFromStorage() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    // Optionally validate structure here
    return parsed;
  } catch {
    return undefined;
  }
}

function saveStateToStorage(state: any) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

interface TriviaGameState extends GameState {
  settings: GameSettings;

  // Actions
  addPlayer: (name: string) => void;
  removePlayer: (playerId: string) => void;
  startGame: () => void;
  startGameWithQuestions: (customQuestions: Question[]) => void;
  submitAnswer: (playerId: string, answerIndex: number) => void;
  nextQuestion: () => void;
  showQuestionAnswer: () => void;
  endGame: () => void;
  resetGame: () => void;
  updateTimer: () => void;
  updateQuestionTimer: () => void;
}

const initialState = loadStateFromStorage() || {
  phase: "lobby",
  players: [],
  currentQuestionIndex: 0,
  questions: [],
  timeRemaining: DEFAULT_SETTINGS.gameDuration,
  questionTimeRemaining: DEFAULT_SETTINGS.questionTime,
  selectedAnswers: {},
  showAnswer: false,
  gameStartTime: 0,
  settings: DEFAULT_SETTINGS,
};

export const useTriviaGame = create<TriviaGameState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,
    addPlayer: (name: string) => {
      const { players } = get();
      if (players.length >= 4) return;

      const newPlayer: Player = {
        id: `player-${Date.now()}`,
        name: name.trim(),
        score: 0,
        color: PLAYER_COLORS[players.length],
      };

      set({ players: [...players, newPlayer] });
    },

    removePlayer: (playerId: string) => {
      const { players } = get();
      set({
        players: players.filter((p) => p.id !== playerId),
      });
    },

    startGame: () => {
      const { settings } = get();
      const questions = getRandomQuestions(
        settings.numberOfQuestions,
        settings.categories
      );

      set({
        phase: "playing",
        questions,
        currentQuestionIndex: 0,
        timeRemaining: settings.gameDuration,
        questionTimeRemaining: settings.questionTime,
        gameStartTime: Date.now(),
        selectedAnswers: {},
        showAnswer: false,
        players: get().players.map((p) => ({ ...p, score: 0 })),
      });
    },

    startGameWithQuestions: (customQuestions: Question[]) => {
      set({
        phase: "playing",
        questions: customQuestions,
        currentQuestionIndex: 0,
        timeRemaining: DEFAULT_SETTINGS.gameDuration,
        questionTimeRemaining: DEFAULT_SETTINGS.questionTime,
        gameStartTime: Date.now(),
        selectedAnswers: {},
        showAnswer: false,
        players: get().players.map((p) => ({ ...p, score: 0 })),
      });
    },

    submitAnswer: (playerId: string, answerIndex: number) => {
      const { selectedAnswers, showAnswer } = get();
      if (showAnswer) return; // No more answers after showing the answer

      set({
        selectedAnswers: {
          ...selectedAnswers,
          [playerId]: answerIndex,
        },
      });
    },

    showQuestionAnswer: () => {
      const { questions, currentQuestionIndex, selectedAnswers, players } =
        get();
      const currentQuestion = questions[currentQuestionIndex];

      if (!currentQuestion) return;

      // Calculate scores
      const updatedPlayers = players.map((player) => {
        const playerAnswer = selectedAnswers[player.id];
        if (playerAnswer === currentQuestion.correctAnswer) {
          return { ...player, score: player.score + 1 };
        }
        return player;
      });

      set({
        showAnswer: true,
        players: updatedPlayers,
      });
    },

    nextQuestion: () => {
      const { questions, currentQuestionIndex, settings, timeRemaining } =
        get();

      if (currentQuestionIndex >= questions.length - 1 || timeRemaining <= 0) {
        set({ phase: "final" });
        return;
      }

      set({
        currentQuestionIndex: currentQuestionIndex + 1,
        questionTimeRemaining: settings.questionTime,
        selectedAnswers: {},
        showAnswer: false,
      });
    },

    endGame: () => {
      set({ phase: "final" });
    },

    resetGame: () => {
      set({
        phase: "lobby",
        currentQuestionIndex: 0,
        questions: [],
        timeRemaining: DEFAULT_SETTINGS.gameDuration,
        questionTimeRemaining: DEFAULT_SETTINGS.questionTime,
        selectedAnswers: {},
        showAnswer: false,
        gameStartTime: 0,
        players: get().players.map((p) => ({ ...p, score: 0 })),
      });
    },

    updateTimer: () => {
      const { gameStartTime, settings, timeRemaining } = get();
      if (gameStartTime === 0) return;

      const elapsed = Date.now() - gameStartTime;
      const remaining = Math.max(0, settings.gameDuration - elapsed);

      if (remaining === 0 && timeRemaining > 0) {
        set({ timeRemaining: 0, phase: "final" });
      } else {
        set({ timeRemaining: remaining });
      }
    },

    updateQuestionTimer: () => {
      const { questionTimeRemaining, showAnswer } = get();
      if (showAnswer) return;

      const newTime = Math.max(0, questionTimeRemaining - 1);
      set({ questionTimeRemaining: newTime });

      if (newTime === 0) {
        get().showQuestionAnswer();
      }
    },
  }))
);

// Subscribe to all state changes and persist to localStorage
useTriviaGame.subscribe((state) => {
  const {
    addPlayer,
    removePlayer,
    startGame,
    startGameWithQuestions,
    submitAnswer,
    nextQuestion,
    showQuestionAnswer,
    endGame,
    resetGame,
    updateTimer,
    updateQuestionTimer,
    ...persisted
  } = state;
  saveStateToStorage(persisted);
});
