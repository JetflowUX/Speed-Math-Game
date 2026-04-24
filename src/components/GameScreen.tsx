import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Question, GameStats, PowerUp, PowerUpType } from "../utils/gameTypes";
import { TimerBar } from "./TimerBar";
import { LivesDisplay } from "./LivesDisplay";
import { ComboCounter } from "./ComboCounter";
import { FloatingScore } from "./FloatingScore";
import { ClockIcon, Zap } from "lucide-react";

interface GameScreenProps {
  question: Question;
  stats: GameStats;
  onAnswer: (answer: number) => void;
  onTimeout: () => void;
  powerUp: PowerUp | null;
  onCollectPowerUp: () => void;
}

interface FloatingScoreData {
  id: number;
  points: number;
  x: number;
  y: number;
}

export function GameScreen({
  question,
  stats,
  onAnswer,
  onTimeout,
  powerUp,
  onCollectPowerUp,
}: GameScreenProps) {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [floatingScores, setFloatingScores] = useState<FloatingScoreData[]>([]);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextScoreId = useRef(0);

  useEffect(() => {
    setAnswer("");
    setFeedback(null);
    inputRef.current?.focus();
  }, [question]);

  useEffect(() => {
    if (feedback === "wrong") {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }, [feedback]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAnswer = parseInt(answer);
    if (isNaN(numAnswer)) return;

    const isCorrect = numAnswer === question.answer;
    setFeedback(isCorrect ? "correct" : "wrong");

    if (isCorrect && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const points = Math.floor(10 + (stats.timePerQuestion / 8) * 10);
      const totalPoints = points * Math.min(stats.combo + 1, 10);

      setFloatingScores((prev) => [
        ...prev,
        {
          id: nextScoreId.current++,
          points: totalPoints,
          x: rect.left + rect.width / 2,
          y: rect.top,
        },
      ]);
    }

    setTimeout(
      () => {
        setFeedback(null);
        onAnswer(numAnswer);
      },
      isCorrect ? 300 : 1000,
    );
  };

  const removeFloatingScore = (id: number) => {
    setFloatingScores((prev) => prev.filter((score) => score.id !== id));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " && powerUp && !powerUp.active) {
        e.preventDefault();
        onCollectPowerUp();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [powerUp, onCollectPowerUp]);

  const getPowerUpIcon = (type: PowerUpType) => {
    if (type === "extraTime") return <ClockIcon className="w-6 h-6" />;
    if (type === "doubleScore") return <Zap className="w-6 h-6" />;
    return null;
  };

  const getPowerUpLabel = (type: PowerUpType) => {
    if (type === "extraTime") return "Extra Time";
    if (type === "doubleScore") return "Double Score";
    return "";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, x: shake ? [-10, 10, -10, 10, 0] : 0 }}
      transition={{ x: { duration: 0.5 } }}
      className={`screen-shell flex flex-col min-h-screen bg-[#0a0a1a] text-white p-4 xs:p-6 game-surface ${feedback === "correct" ? "bg-[#00ff88]/8" : feedback === "wrong" ? "bg-[#ff3355]/8" : ""}`}
    >
      <div className="w-full max-w-5xl mx-auto px-2 sm:px-0">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 xs:mb-6">
          <span className="ui-chip">Difficulty {stats.difficulty}</span>
          <span className="text-xs xs:text-sm text-slate-300 text-right max-w-md">
            Type your answer and press Enter. Faster answers earn more points.
          </span>
        </div>

        <div className="flex flex-col xs:flex-row xs:justify-between xs:items-start gap-4 xs:gap-0 mb-4 xs:mb-8 p-3 xs:p-4 rounded-2xl screen-card border border-slate-700/60">
          <div>
            <div className="text-3xl xs:text-4xl sm:text-5xl font-bold mb-1 xs:mb-2 orbitron-text score-display-soft">
              {stats.score.toLocaleString()}
            </div>
            <div className="text-[0.65rem] xs:text-sm tracking-[0.22em] text-gray-400 uppercase">
              Score
            </div>
          </div>
          <LivesDisplay lives={stats.lives} maxLives={3} />
        </div>

        <div className="mb-6 xs:mb-8">
          <TimerBar duration={stats.timePerQuestion} onTimeout={onTimeout} />
        </div>

        <div className="flex justify-center mb-6 xs:mb-8">
          <ComboCounter combo={stats.combo} />
        </div>

        <AnimatePresence>
          {powerUp && !powerUp.active && (
            <motion.div
              initial={{ scale: 0, y: -50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              className="flex justify-center mb-4 xs:mb-6"
            >
              <div className="flex flex-col xs:flex-row items-center gap-2 xs:gap-3 px-4 xs:px-6 py-2 xs:py-3 text-xs xs:text-sm bg-[#ffaa00]/12 border border-[#ffaa00]/60 rounded-xl powerup-banner-soft">
                <span className="text-[#ffaa00]">
                  {getPowerUpIcon(powerUp.type)}
                </span>
                <span className="text-[#ffaa00] font-bold">
                  {getPowerUpLabel(powerUp.type)}
                </span>
                <span className="text-xs text-gray-300">
                  Press Space to use it
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col items-center justify-center rounded-2xl bg-slate-900/35 border border-slate-700/60 p-4 xs:p-6 sm:p-10 my-4 xs:my-6 screen-card">
          <motion.div
            key={question.displayText}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="text-center mb-5 xs:mb-8 sm:mb-12 w-full"
          >
            <div className="text-4xl xs:text-6xl sm:text-7xl md:text-8xl font-bold mb-2 xs:mb-4 orbitron-text question-display-soft break-words leading-none">
              {question.displayText}
            </div>
            <div className="text-sm xs:text-lg sm:text-2xl text-gray-400 tracking-[0.2em] uppercase">
              Answer below
            </div>
          </motion.div>

          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md px-2 xs:px-0"
          >
            <input
              ref={inputRef}
              type="number"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full px-4 xs:px-6 py-3 xs:py-4 text-2xl xs:text-4xl text-center font-bold bg-slate-900/60 border border-cyan-300/45 rounded-lg xs:rounded-xl focus:outline-none focus:border-emerald-300 transition-all orbitron-text answer-input-soft"
              placeholder="?"
              autoComplete="off"
              disabled={feedback !== null}
            />
          </form>

          <div className="mt-4 text-center text-[0.65rem] xs:text-xs tracking-[0.18em] uppercase text-slate-400">
            Tip: keep streaks alive for bigger totals
          </div>

          {feedback === "wrong" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 xs:mt-6 text-lg xs:text-2xl text-[#ff3355] font-bold wrong-answer-soft text-center"
            >
              Correct answer: {question.answer}
            </motion.div>
          )}
        </div>

        <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2 xs:gap-4 mt-4 xs:mt-6 text-xs xs:text-sm text-gray-400 px-1">
          <div>Problems: {stats.problemsSolved}</div>
          <div>
            Accuracy:{" "}
            {stats.totalProblems > 0
              ? Math.round((stats.correctAnswers / stats.totalProblems) * 100)
              : 0}
            %
          </div>
        </div>

        <AnimatePresence>
          {floatingScores.map((score) => (
            <FloatingScore
              key={score.id}
              points={score.points}
              x={score.x}
              y={score.y}
              onComplete={() => removeFloatingScore(score.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
Accuracy: {
  (" ");
}
