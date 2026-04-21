import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { StartScreen } from "./components/StartScreen";
import { GameScreen } from "./components/GameScreen";
import { GameOverScreen } from "./components/GameOverScreen";
import { QuestionGenerator } from "./utils/questionGenerator";
import {
  GameState,
  Difficulty,
  Question,
  GameStats,
  PowerUp,
} from "./utils/gameTypes";
const MAX_LIVES = 3;
const getBaseTime = (difficulty: Difficulty): number => {
  switch (difficulty) {
    case "easy":
      return 8;
    case "medium":
      return 6;
    case "hard":
      return 5;
  }
};
export function App() {
  const [gameState, setGameState] = useState<GameState>("start");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [question, setQuestion] = useState<Question | null>(null);
  const [questionGenerator, setQuestionGenerator] =
    useState<QuestionGenerator | null>(null);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    lives: MAX_LIVES,
    combo: 0,
    maxCombo: 0,
    problemsSolved: 0,
    totalProblems: 0,
    correctAnswers: 0,
    difficulty: "easy",
    timePerQuestion: 8,
  });
  const [highScores, setHighScores] = useState<Record<Difficulty, number>>({
    easy: 0,
    medium: 0,
    hard: 0,
  });
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [powerUp, setPowerUp] = useState<PowerUp | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  // Load high scores from localStorage
  useEffect(() => {
    const savedScores = localStorage.getItem("speedMathHighScores");
    if (savedScores) {
      setHighScores(JSON.parse(savedScores));
    }
  }, []);
  const saveHighScore = useCallback((difficulty: Difficulty, score: number) => {
    setHighScores((prev) => {
      const newScores = {
        ...prev,
      };
      if (score > newScores[difficulty]) {
        newScores[difficulty] = score;
        localStorage.setItem("speedMathHighScores", JSON.stringify(newScores));
      }
      return newScores;
    });
  }, []);
  const startGame = useCallback((selectedDifficulty: Difficulty) => {
    const generator = new QuestionGenerator(selectedDifficulty);
    const firstQuestion = generator.generateQuestion();
    const baseTime = getBaseTime(selectedDifficulty);
    setDifficulty(selectedDifficulty);
    setQuestionGenerator(generator);
    setQuestion(firstQuestion);
    setStats({
      score: 0,
      lives: MAX_LIVES,
      combo: 0,
      maxCombo: 0,
      problemsSolved: 0,
      totalProblems: 0,
      correctAnswers: 0,
      difficulty: selectedDifficulty,
      timePerQuestion: baseTime,
    });
    setPowerUp(null);
    setIsNewHighScore(false);
    setStartTime(Date.now());
    setGameState("playing");
  }, []);
  const generateNextQuestion = useCallback(() => {
    if (!questionGenerator) return;
    const newQuestion = questionGenerator.generateQuestion();
    const baseTime = getBaseTime(difficulty);
    const adjustedTime = questionGenerator.getAdjustedTime(baseTime);
    setQuestion(newQuestion);
    setStats((prev) => ({
      ...prev,
      timePerQuestion: adjustedTime,
    }));
    setStartTime(Date.now());
    // Random power-up generation (10% chance every question after 5 problems)
    if (stats.problemsSolved >= 5 && Math.random() < 0.1 && !powerUp) {
      const powerUpType = Math.random() < 0.5 ? "extraTime" : "doubleScore";
      setPowerUp({
        type: powerUpType,
        active: false,
      });
    }
  }, [questionGenerator, difficulty, stats.problemsSolved, powerUp]);
  const handleAnswer = useCallback(
    (answer: number) => {
      if (!question) return;
      const isCorrect = answer === question.answer;
      const timeElapsed = (Date.now() - startTime) / 1000;
      const speedBonus = Math.floor(
        (1 - timeElapsed / stats.timePerQuestion) * 10,
      );
      const basePoints = 10 + Math.max(0, speedBonus);
      const multiplier = Math.min(stats.combo + 1, 10);
      const doubleMultiplier =
        powerUp?.type === "doubleScore" && powerUp.active ? 2 : 1;
      const points = basePoints * multiplier * doubleMultiplier;
      setStats((prev) => {
        const newCombo = isCorrect ? prev.combo + 1 : 0;
        const newStats = {
          ...prev,
          score: isCorrect ? prev.score + points : prev.score,
          lives: isCorrect ? prev.lives : prev.lives - 1,
          combo: newCombo,
          maxCombo: Math.max(prev.maxCombo, newCombo),
          problemsSolved: isCorrect
            ? prev.problemsSolved + 1
            : prev.problemsSolved,
          totalProblems: prev.totalProblems + 1,
          correctAnswers: isCorrect
            ? prev.correctAnswers + 1
            : prev.correctAnswers,
        };
        if (newStats.lives <= 0) {
          const achievedNewHighScore = newStats.score > highScores[difficulty];
          setIsNewHighScore(achievedNewHighScore);
          saveHighScore(difficulty, newStats.score);
          setTimeout(() => setGameState("gameover"), 500);
        }
        return newStats;
      });
      // Clear power-up after use
      if (powerUp?.active) {
        setPowerUp(null);
      }
      if (stats.lives > 1 || isCorrect) {
        setTimeout(generateNextQuestion, 300);
      }
    },
    [
      question,
      startTime,
      stats,
      powerUp,
      highScores,
      difficulty,
      saveHighScore,
      generateNextQuestion,
    ],
  );
  const handleTimeout = useCallback(() => {
    handleAnswer(-1); // Treat timeout as wrong answer
  }, [handleAnswer]);
  const handleCollectPowerUp = useCallback(() => {
    if (!powerUp || powerUp.active) return;
    setPowerUp((prev) =>
      prev
        ? {
            ...prev,
            active: true,
          }
        : null,
    );
    if (powerUp.type === "extraTime") {
      setStats((prev) => ({
        ...prev,
        timePerQuestion: prev.timePerQuestion + 3,
      }));
      // Reset timer by generating a new question with extra time
      setTimeout(() => {
        if (question) {
          setStartTime(Date.now());
        }
      }, 100);
    }
  }, [powerUp, question]);
  const handleRestart = useCallback(() => {
    startGame(difficulty);
  }, [difficulty, startGame]);
  const handleMenu = useCallback(() => {
    setGameState("start");
    setQuestion(null);
    setQuestionGenerator(null);
    setIsNewHighScore(false);
  }, []);
  const accuracy =
    stats.totalProblems > 0
      ? Math.round((stats.correctAnswers / stats.totalProblems) * 100)
      : 0;
  return (
    <div className="w-full min-h-screen">
      <AnimatePresence mode="wait">
        {gameState === "start" && (
          <StartScreen
            key="start"
            onStart={startGame}
            highScores={highScores}
          />
        )}
        {gameState === "playing" && question && (
          <GameScreen
            key="game"
            question={question}
            stats={stats}
            onAnswer={handleAnswer}
            onTimeout={handleTimeout}
            powerUp={powerUp}
            onCollectPowerUp={handleCollectPowerUp}
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
