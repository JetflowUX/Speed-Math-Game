import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Question,
  GameStats,
  PowerUp,
  PowerUpType,
  AnswerResult,
} from "../utils/gameTypes";
import { TimerBar } from "./TimerBar";
import { LivesDisplay } from "./LivesDisplay";
import { ComboCounter } from "./ComboCounter";
import { FloatingScore } from "./FloatingScore";
import { ClockIcon, Zap, Volume2, VolumeX, LogOut, CornerDownLeft } from "lucide-react";
import { sounds } from "../utils/sound";

interface GameScreenProps {
  question: Question;
  questionId: number;
  stats: GameStats;
  powerUp: PowerUp | null;
  muted: boolean;
  onCommit: (answer: number | null, timeElapsedSec: number) => AnswerResult;
  onAdvance: () => void;
  onCollectPowerUp: () => void;
  onToggleMute: () => void;
  onQuit: () => void;
}

interface FloatingScoreData {
  id: number;
  points: number;
  x: number;
  y: number;
}

type Phase = "countdown" | "active" | "reveal";

const CORRECT_REVEAL_MS = 450;
const WRONG_REVEAL_MS = 1100;

export function GameScreen({
  question,
  questionId,
  stats,
  powerUp,
  muted,
  onCommit,
  onAdvance,
  onCollectPowerUp,
  onToggleMute,
  onQuit,
}: GameScreenProps) {
  const reduceMotion = useReducedMotion();

  const [answer, setAnswer] = useState("");
  const [phase, setPhase] = useState<Phase>("countdown");
  const [countValue, setCountValue] = useState(3);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    correctAnswer: number;
  } | null>(null);
  const [floatingScores, setFloatingScores] = useState<FloatingScoreData[]>([]);
  const [shake, setShake] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const nextScoreId = useRef(0);
  const questionStartRef = useRef(0);
  const hiddenAtRef = useRef(0);
  const firstQuestionRef = useRef(true);
  const advanceTimerRef = useRef<number | null>(null);
  const phaseRef = useRef<Phase>("countdown");

  const setPhaseBoth = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const focusInput = useCallback(() => {
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  // Pre-game "get ready" countdown (once per game). Keeps the timer frozen so
  // players aren't timed out before they can read the first question.
  useEffect(() => {
    setCountValue(3);
    sounds.countTick();
    let value = 3;
    let goTimer = 0;
    const beat = window.setInterval(() => {
      value -= 1;
      if (value > 0) {
        setCountValue(value);
        sounds.countTick();
      } else {
        setCountValue(0); // "GO"
        sounds.go();
        window.clearInterval(beat);
        goTimer = window.setTimeout(() => {
          questionStartRef.current = Date.now();
          firstQuestionRef.current = false;
          setPhaseBoth("active");
          focusInput();
        }, 450);
      }
    }, 550);
    return () => {
      window.clearInterval(beat);
      if (goTimer) window.clearTimeout(goTimer);
    };
  }, [focusInput, setPhaseBoth]);

  // New question (after the first) → reset for the next round.
  useEffect(() => {
    if (firstQuestionRef.current) return;
    setAnswer("");
    setFeedback(null);
    setShake(false);
    questionStartRef.current = Date.now();
    setPhaseBoth("active");
    focusInput();
  }, [questionId, focusInput, setPhaseBoth]);

  // Pause fairly when the tab is hidden, and don't let hidden time count
  // against the player's answer speed.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        hiddenAtRef.current = Date.now();
        setTabHidden(true);
      } else {
        if (hiddenAtRef.current) {
          questionStartRef.current += Date.now() - hiddenAtRef.current;
          hiddenAtRef.current = 0;
        }
        setTabHidden(false);
        if (phaseRef.current === "active") focusInput();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [focusInput]);

  // Clear any pending advance timer on unmount.
  useEffect(
    () => () => {
      if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    },
    [],
  );

  const commit = useCallback(
    (numAnswer: number | null) => {
      if (phaseRef.current !== "active") return;
      phaseRef.current = "reveal";

      const timeElapsedSec = (Date.now() - questionStartRef.current) / 1000;
      const result = onCommit(numAnswer, timeElapsedSec);

      setPhase("reveal");
      setFeedback({ isCorrect: result.isCorrect, correctAnswer: result.correctAnswer });

      if (result.isCorrect) {
        if (inputRef.current) {
          const rect = inputRef.current.getBoundingClientRect();
          setFloatingScores((prev) => [
            ...prev,
            {
              id: nextScoreId.current++,
              points: result.pointsEarned,
              x: rect.left + rect.width / 2,
              y: rect.top,
            },
          ]);
        }
      } else if (!reduceMotion) {
        setShake(true);
        window.setTimeout(() => setShake(false), 450);
      }

      const delay = result.isCorrect ? CORRECT_REVEAL_MS : WRONG_REVEAL_MS;
      advanceTimerRef.current = window.setTimeout(() => onAdvance(), delay);
    },
    [onCommit, onAdvance, reduceMotion],
  );

  const submitAnswer = useCallback(() => {
    if (phaseRef.current !== "active") {
      // Keep the on-screen keyboard up even if they tap submit early.
      inputRef.current?.focus();
      return;
    }
    const numAnswer = parseInt(inputRef.current?.value ?? answer, 10);
    if (Number.isNaN(numAnswer)) {
      inputRef.current?.focus();
      return;
    }
    commit(numAnswer);
    // Refocus within the same tap/gesture so mobile keyboards stay open
    // between questions instead of dismissing after every answer.
    inputRef.current?.focus();
  }, [answer, commit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitAnswer();
  };

  const handleTimeout = useCallback(() => commit(null), [commit]);

  const removeFloatingScore = (id: number) => {
    setFloatingScores((prev) => prev.filter((score) => score.id !== id));
  };

  // Space activates the pending power-up (keyboard players).
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " && powerUp && !powerUp.active && document.activeElement !== inputRef.current) {
        e.preventDefault();
        onCollectPowerUp();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [powerUp, onCollectPowerUp]);

  const getPowerUpIcon = (type: PowerUpType) => {
    if (type === "extraTime") return <ClockIcon className="w-5 h-5" />;
    if (type === "doubleScore") return <Zap className="w-5 h-5" />;
    return null;
  };

  const getPowerUpLabel = (type: PowerUpType) => {
    if (type === "extraTime") return "Extra Time";
    if (type === "doubleScore") return "Double Score";
    return "";
  };

  const paused = phase !== "active" || tabHidden;
  const accuracyPct =
    stats.totalProblems > 0
      ? Math.round((stats.correctAnswers / stats.totalProblems) * 100)
      : 0;
  const doubleActive = powerUp?.type === "doubleScore" && powerUp.active;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, x: shake ? [-9, 9, -7, 7, 0] : 0 }}
      transition={{ x: { duration: 0.45 } }}
      className={`screen-shell screen-pad flex flex-col bg-ink-900 text-white game-surface ${
        feedback && phase === "reveal"
          ? feedback.isCorrect
            ? "bg-neon-green/8"
            : "bg-neon-red/8"
          : ""
      }`}
    >
      <div className="w-full max-w-5xl mx-auto px-2 sm:px-0 flex flex-col flex-1">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 mb-3 xs:mb-6 short:mb-2">
          <span className="ui-chip">Difficulty {stats.difficulty}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleMute}
              aria-label={muted ? "Unmute sound" : "Mute sound"}
              className="icon-button"
            >
              {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={onQuit}
              aria-label="Quit to menu"
              className="icon-button"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Score + lives */}
        <div className="flex justify-between items-center gap-4 mb-3 xs:mb-6 short:mb-2 p-3 xs:p-4 short:p-2 rounded-2xl screen-card border border-mist/15">
          <div>
            <div className="text-2xl xs:text-4xl sm:text-5xl short:text-2xl font-bold mb-1 orbitron-text score-display-soft tabular-nums">
              {stats.score.toLocaleString()}
            </div>
            <div className="text-[0.6rem] xs:text-sm tracking-[0.22em] text-mist/60 uppercase">
              Score
            </div>
          </div>
          <LivesDisplay lives={stats.lives} maxLives={3} />
        </div>

        {/* Timer */}
        <div className="mb-3 xs:mb-6 short:mb-2">
          <TimerBar
            durationSec={stats.timePerQuestion}
            resetKey={questionId}
            paused={paused}
            onTimeout={handleTimeout}
          />
        </div>

        {/* Combo */}
        <div className="flex justify-center items-center min-h-[2.25rem] short:min-h-0 mb-2 xs:mb-4 short:mb-1">
          <ComboCounter combo={stats.combo} />
        </div>

        {/* Power-up prompt */}
        <AnimatePresence>
          {powerUp && !powerUp.active && (
            <motion.div
              initial={{ scale: 0.8, y: -20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex justify-center mb-3 xs:mb-4"
            >
              <button
                type="button"
                onClick={onCollectPowerUp}
                className="flex items-center gap-2 xs:gap-3 px-4 xs:px-6 py-2 xs:py-3 text-xs xs:text-sm bg-neon-amber/12 border border-neon-amber/60 rounded-xl powerup-banner-soft touch-target"
              >
                <span className="text-neon-amber">{getPowerUpIcon(powerUp.type)}</span>
                <span className="text-neon-amber font-bold">
                  {getPowerUpLabel(powerUp.type)}
                </span>
                <span className="text-[0.65rem] xs:text-xs text-mist/75">
                  Tap / Space
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question area */}
        <div className="relative flex-1 flex flex-col items-center justify-center rounded-2xl bg-ink-800/40 border border-mist/15 p-4 xs:p-6 sm:p-10 short:p-3 mb-3 xs:mb-4 short:mb-2 min-h-0 screen-card">
          {doubleActive && (
            <div className="absolute top-3 right-3 flex items-center gap-1 text-[0.6rem] xs:text-xs font-bold text-neon-amber uppercase tracking-widest">
              <Zap className="w-4 h-4" /> 2× active
            </div>
          )}

          <motion.div
            key={questionId}
            initial={{ scale: reduceMotion ? 1 : 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: phase === "countdown" ? 0.25 : 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            className="text-center mb-4 xs:mb-8 short:mb-2 w-full"
          >
            <div className="text-4xl xs:text-6xl sm:text-7xl md:text-8xl short:text-3xl font-bold mb-2 xs:mb-4 short:mb-1 orbitron-text question-display-soft break-words leading-none">
              {question.displayText}
            </div>
            <div className="text-xs xs:text-lg short:text-[0.7rem] text-mist/60 tracking-[0.2em] uppercase">
              {feedback && phase === "reveal"
                ? feedback.isCorrect
                  ? "Correct!"
                  : "Answer below"
                : "Type the answer"}
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="w-full max-w-md px-2 xs:px-0">
            <label htmlFor="answer-input" className="sr-only">
              Your answer
            </label>
            <div className="flex items-stretch gap-2 xs:gap-3">
              <input
                id="answer-input"
                ref={inputRef}
                // text + inputMode=numeric gives a reliable digits-only keypad
                // on iOS (type=number is inconsistent there) and matches the
                // primer input, so the keyboard doesn't flip during hand-off.
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                enterKeyHint="go"
                autoCorrect="off"
                spellCheck={false}
                value={answer}
                // Only accept input while the round is live; never `disabled`,
                // which would blur the field and dismiss the mobile keyboard
                // between questions. Answers are always non-negative integers,
                // so strip anything that isn't a digit.
                onChange={(e) => {
                  if (phaseRef.current === "active") {
                    setAnswer(e.target.value.replace(/[^0-9]/g, ""));
                  }
                }}
                className={`flex-1 min-w-0 px-4 xs:px-6 py-3 xs:py-4 short:py-2 text-2xl xs:text-4xl short:text-xl text-center font-bold bg-ink-800/60 border rounded-lg xs:rounded-xl focus:outline-none transition-all orbitron-text answer-input-soft ${
                  feedback && phase === "reveal"
                    ? feedback.isCorrect
                      ? "border-neon-green"
                      : "border-neon-red"
                    : "border-neon-cyan/40 focus:border-neon-green"
                }`}
                placeholder="?"
                autoComplete="off"
                aria-describedby="answer-hint"
              />
              <button
                type="submit"
                aria-label="Submit answer"
                // Prevent the tap from stealing focus so the keyboard stays open.
                onMouseDown={(e) => e.preventDefault()}
                className="shrink-0 flex items-center justify-center px-4 xs:px-5 rounded-lg xs:rounded-xl bg-neon-green text-ink-900 font-bold transition-transform active:scale-95 touch-target submit-button-soft"
              >
                <CornerDownLeft className="w-6 h-6 xs:w-7 xs:h-7" />
              </button>
            </div>
          </form>

          <div
            id="answer-hint"
            className="mt-3 xs:mt-4 short:hidden text-center text-[0.6rem] xs:text-xs tracking-[0.18em] uppercase text-mist/60"
          >
            Faster answers &amp; longer streaks score more
          </div>

          <div className="sr-only" role="status" aria-live="polite">
            {phase === "reveal" && feedback
              ? feedback.isCorrect
                ? "Correct"
                : `Wrong. The answer was ${feedback.correctAnswer}.`
              : ""}
          </div>

          <AnimatePresence>
            {phase === "reveal" && feedback && !feedback.isCorrect && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 xs:mt-6 text-lg xs:text-2xl text-neon-red font-bold wrong-answer-soft text-center"
              >
                Answer: {feedback.correctAnswer}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Countdown overlay */}
          <AnimatePresence>
            {phase === "countdown" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center rounded-2xl bg-ink-900/70 backdrop-blur-sm"
              >
                <motion.div
                  key={countValue}
                  initial={{ scale: reduceMotion ? 1 : 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className="orbitron-text font-bold text-6xl xs:text-7xl sm:text-8xl countdown-number"
                >
                  {countValue === 0 ? "GO" : countValue}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer stats */}
        <div className="flex justify-between items-center gap-4 text-xs xs:text-sm text-mist/60 px-1">
          <div>
            Solved: <span className="text-mist font-semibold tabular-nums">{stats.problemsSolved}</span>
          </div>
          <div>
            Accuracy:{" "}
            <span className="text-mist font-semibold tabular-nums">{accuracyPct}%</span>
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
