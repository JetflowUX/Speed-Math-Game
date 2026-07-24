export type Difficulty = 'easy' | 'medium' | 'hard';

export type GameState = 'start' | 'playing' | 'gameover';

export type Operation = '+' | '-' | '×' | '÷';

export interface Question {
  num1: number;
  num2: number;
  operation: Operation;
  answer: number;
  displayText: string;
}

export interface GameStats {
  score: number;
  lives: number;
  combo: number;
  maxCombo: number;
  problemsSolved: number;
  totalProblems: number;
  correctAnswers: number;
  difficulty: Difficulty;
  timePerQuestion: number;
}

export type PowerUpType = 'extraTime' | 'doubleScore';

export interface PowerUp {
  type: PowerUpType;
  active: boolean;
}

/** Result of committing a single answer, returned synchronously so the UI can
 *  show feedback (including the exact points earned) that matches the score. */
export interface AnswerResult {
  isCorrect: boolean;
  pointsEarned: number;
  correctAnswer: number;
  comboAfter: number;
  isGameOver: boolean;
}