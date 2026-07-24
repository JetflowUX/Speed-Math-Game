import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { StartScreen } from "./components/StartScreen";
import { GameScreen } from "./components/GameScreen";
import { GameOverScreen } from "./components/GameOverScreen";
import { QuestionGenerator } from "./utils/questionGenerator";
import { computePoints } from "./utils/scoring";
import { isMuted, setMuted, sounds, unlockAudio } from "./utils/sound";
import {
  GameState,
  Difficulty,
  Question,
  GameStats,
  PowerUp,
  AnswerResult,
} from "./utils/gameTypes";

const MAX_LIVES = 3;
const POWERUP_MIN_SOLVED = 4;
const POWERUP_CHANCE = 0.14;
const EXTRA_TIME_SECONDS = 4;

const getBaseTime = (difficulty: Difficulty): number => {
  switch (difficulty) {
    case "easy":
      return 12;
    case "medium":
      return 10;
    case "hard":
      return 8;
  }
};

const createStats = (difficulty: Difficulty): GameStats => ({
  score: 0,
  lives: MAX_LIVES,
  combo: 0,
  maxCombo: 0,
  problemsSolved: 0,
  totalProblems: 0,
  correctAnswers: 0,
  difficulty,
  timePerQuestion: getBaseTime(difficulty),
});

export function App() {
  const [gameState, setGameState] = useState<GameState>("start");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [question, setQuestion] = useState<Question | null>(null);
  const [questionId, setQuestionId] = useState(0);
  const [stats, setStats] = useState<GameStats>(() => createStats("easy"));
  const [highScores, setHighScores] = useState<Record<Difficulty, number>>({
    easy: 0,
    medium: 0,
    hard: 0,
  });
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [powerUp, setPowerUp] = useState<PowerUp | null>(null);
  const [muted, setMutedState] = useState(isMuted());

  // Refs mirror state so the answer/advance callbacks read fresh values without
  // stale closures and without needing to re-create themselves every render.
  const generatorRef = useRef<QuestionGenerator | null>(null);
  const questionRef = useRef<Question | null>(null);
  const statsRef = useRef<GameStats>(stats);
  const powerUpRef = useRef<PowerUp | null>(null);
  const difficultyRef = useRef<Difficulty>("easy");
  const highScoresRef = useRef(highScores);
  const pendingGameOverRef = useRef(false);

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);
  useEffect(() => {
    highScoresRef.current = highScores;
  }, [highScores]);
  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);

  // Load high scores from localStorage.
  useEffect(() => {
    const saved = localStorage.getItem("speedMathHighScores");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      setHighScores({
        easy: Number(parsed.easy) || 0,
        medium: Number(parsed.medium) || 0,
        hard: Number(parsed.hard) || 0,
      });
    } catch {
      /* ignore corrupt data */
    }
  }, []);

  const saveHighScore = useCallback((diff: Difficulty, score: number) => {
    setHighScores((prev) => {
      if (score <= prev[diff]) return prev;
      const next = { ...prev, [diff]: score };
      try {
        localStorage.setItem("speedMathHighScores", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const toggleMute = useCallback(() => {
    setMutedState((prev) => {
      const next = !prev;
      setMuted(next);
      return next;
    });
  }, []);

  const startGame = useCallback((selectedDifficulty: Difficulty) => {
    unlockAudio(); // Called from a click, so audio can start.
    const generator = new QuestionGenerator(selectedDifficulty);
    const firstQuestion = generator.generateQuestion();
    const freshStats = createStats(selectedDifficulty);

    generatorRef.current = generator;
    questionRef.current = firstQuestion;
    statsRef.current = freshStats;
    powerUpRef.current = null;
    difficultyRef.current = selectedDifficulty;
    pendingGameOverRef.current = false;

    setDifficulty(selectedDifficulty);
    setQuestion(firstQuestion);
    setQuestionId(0);
    setStats(freshStats);
    setPowerUp(null);
    setIsNewHighScore(false);
    setGameState("playing");
  }, []);

  const maybeSpawnPowerUp = useCallback(() => {
    if (powerUpRef.current) return;
    if (statsRef.current.problemsSolved < POWERUP_MIN_SOLVED) return;
    if (Math.random() >= POWERUP_CHANCE) return;
    const type = Math.random() < 0.5 ? "extraTime" : "doubleScore";
    const next: PowerUp = { type, active: false };
    powerUpRef.current = next;
    setPowerUp(next);
  }, []);

  /** Commit an answer (or a timeout when answer === null). Returns the outcome
   *  synchronously so the game screen can show matching feedback. */
  const commitAnswer = useCallback(
    (answer: number | null, timeElapsedSec: number): AnswerResult => {
      const cur = statsRef.current;
      const q = questionRef.current;
      const isCorrect = q !== null && answer !== null && answer === q.answer;

      const pu = powerUpRef.current;
      const doubleScore = !!(pu && pu.type === "doubleScore" && pu.active);

      const pointsEarned = isCorrect
        ? computePoints({
            timeElapsedSec,
            timeLimitSec: cur.timePerQuestion,
            combo: cur.combo,
            doubleScore,
          })
        : 0;

      const comboAfter = isCorrect ? cur.combo + 1 : 0;
      const nextLives = isCorrect ? cur.lives : cur.lives - 1;
      const isGameOver = nextLives <= 0;

      const next: GameStats = {
        ...cur,
        score: cur.score + pointsEarned,
        lives: nextLives,
        combo: comboAfter,
        maxCombo: Math.max(cur.maxCombo, comboAfter),
        problemsSolved: cur.problemsSolved + (isCorrect ? 1 : 0),
        totalProblems: cur.totalProblems + 1,
        correctAnswers: cur.correctAnswers + (isCorrect ? 1 : 0),
      };
      statsRef.current = next;
      setStats(next);

      // A used double-score power-up is consumed.
      if (doubleScore) {
        powerUpRef.current = null;
        setPowerUp(null);
      }

      pendingGameOverRef.current = isGameOver;

      if (isCorrect) {
        if (comboAfter >= 2) sounds.combo(comboAfter);
        else sounds.correct();
      } else {
        sounds.wrong();
      }

      return {
        isCorrect,
        pointsEarned,
        correctAnswer: q ? q.answer : 0,
        comboAfter,
        isGameOver,
      };
    },
    [],
  );

  /** Advance past the reveal: either end the game or present the next question. */
  const advance = useCallback(() => {
    if (pendingGameOverRef.current) {
      const finalScore = statsRef.current.score;
      const diff = difficultyRef.current;
      const beatBest = finalScore > highScoresRef.current[diff];
      setIsNewHighScore(beatBest);
      saveHighScore(diff, finalScore);
      if (beatBest && finalScore > 0) sounds.highScore();
      else sounds.gameOver();
      setGameState("gameover");
      return;
    }

    const generator = generatorRef.current;
    if (!generator) return;

    const newQuestion = generator.generateQuestion();
    const adjustedTime = generator.getAdjustedTime(getBaseTime(difficultyRef.current));

    questionRef.current = newQuestion;
    statsRef.current = { ...statsRef.current, timePerQuestion: adjustedTime };
    setQuestion(newQuestion);
    setStats((prev) => ({ ...prev, timePerQuestion: adjustedTime }));
    setQuestionId((id) => id + 1);

    maybeSpawnPowerUp();
  }, [saveHighScore, maybeSpawnPowerUp]);

  const collectPowerUp = useCallback(() => {
    const pu = powerUpRef.current;
    if (!pu || pu.active) return;
    sounds.powerup();

    if (pu.type === "extraTime") {
      // Extend the current question's timer (same questionId → TimerBar extends).
      const nextTime = statsRef.current.timePerQuestion + EXTRA_TIME_SECONDS;
      statsRef.current = { ...statsRef.current, timePerQuestion: nextTime };
      setStats((prev) => ({ ...prev, timePerQuestion: nextTime }));
      powerUpRef.current = null;
      setPowerUp(null);
    } else {
      // Double score arms for the next answer.
      const active = { ...pu, active: true };
      powerUpRef.current = active;
      setPowerUp(active);
    }
  }, []);

  const handleRestart = useCallback(() => {
    startGame(difficultyRef.current);
  }, [startGame]);

  const handleMenu = useCallback(() => {
    generatorRef.current = null;
    questionRef.current = null;
    powerUpRef.current = null;
    setGameState("start");
    setQuestion(null);
    setPowerUp(null);
    setIsNewHighScore(false);
  }, []);

  const accuracy =
    stats.totalProblems > 0
      ? Math.round((stats.correctAnswers / stats.totalProblems) * 100)
      : 0;

  return (
    <div className="w-full min-h-[100dvh]">
      <AnimatePresence mode="wait">
        {gameState === "start" && (
          <StartScreen
            key="start"
            onStart={startGame}
            highScores={highScores}
            muted={muted}
            onToggleMute={toggleMute}
          />
        )}
        {gameState === "playing" && question && (
          <GameScreen
            key="game"
            question={question}
            questionId={questionId}
            stats={stats}
            powerUp={powerUp}
            muted={muted}
            onCommit={commitAnswer}
            onAdvance={advance}
            onCollectPowerUp={collectPowerUp}
            onToggleMute={toggleMute}
            onQuit={handleMenu}
          />
        )}
        {gameState === "gameover" && (
          <GameOverScreen
            key="gameover"
            score={stats.score}
            highScore={highScores[difficulty]}
            accuracy={accuracy}
            problemsSolved={stats.problemsSolved}
            maxCombo={stats.maxCombo}
            difficulty={difficulty}
            isNewHighScore={isNewHighScore}
            onRestart={handleRestart}
            onMenu={handleMenu}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
