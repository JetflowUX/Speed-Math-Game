import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Difficulty } from "../utils/gameTypes";
import { TrophyIcon, ZapIcon, ClockIcon, TargetIcon } from "lucide-react";
interface StartScreenProps {
  onStart: (difficulty: Difficulty) => void;
  highScores: Record<Difficulty, number>;
}
export function StartScreen({ onStart, highScores }: StartScreenProps) {
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty>("easy");
  const difficulties: {
    value: Difficulty;
    label: string;
    description: string;
  }[] = [
    {
      value: "easy",
      label: "EASY",
      description: "Addition & Subtraction",
    },
    {
      value: "medium",
      label: "MEDIUM",
      description: "Multiplication Mix",
    },
    {
      value: "hard",
      label: "HARD",
      description: "All Operations",
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        setSelectedDifficulty((prev) => {
          const currentIndex = difficulties.findIndex((d) => d.value === prev);
          const newIndex =
            currentIndex > 0 ? currentIndex - 1 : difficulties.length - 1;
          return difficulties[newIndex].value;
        });
      } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        setSelectedDifficulty((prev) => {
          const currentIndex = difficulties.findIndex((d) => d.value === prev);
          const newIndex =
            currentIndex < difficulties.length - 1 ? currentIndex + 1 : 0;
          return difficulties[newIndex].value;
        });
      } else if (e.key === "Enter") {
        e.preventDefault();
        onStart(selectedDifficulty);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedDifficulty, onStart]);
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      className="screen-shell flex flex-col items-center justify-center min-h-screen bg-[#0a0a1a] text-white px-4 py-6 game-surface"
    >
      <div className="screen-card w-full max-w-3xl rounded-3xl px-5 py-8 xs:px-8 xs:py-10 md:px-10 md:py-12 space-y-6 xs:space-y-8">
        <motion.h1
          initial={{
            scale: 0.5,
            y: -50,
          }}
          animate={{
            scale: 1,
            y: 0,
          }}
          transition={{
            type: "spring",
            stiffness: 200,
          }}
          className="text-3xl xs:text-4xl sm:text-5xl md:text-7xl font-bold text-center px-4 xs:px-0"
          style={{
            fontFamily: "Orbitron, sans-serif",
            textShadow: "0 0 10px rgba(0, 240, 255, 0.45)",
          }}
        >
          <span className="text-[#00f0ff]">SPEED MATH</span>
        </motion.h1>

        <motion.h2
          initial={{
            scale: 0.5,
            y: -30,
          }}
          animate={{
            scale: 1,
            y: 0,
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            delay: 0.1,
          }}
          className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-center px-4 xs:px-0"
          style={{
            fontFamily: "Orbitron, sans-serif",
            textShadow: "0 0 8px rgba(255, 0, 170, 0.4)",
          }}
        >
          <span className="text-[#ff00aa]">BATTLE</span>
        </motion.h2>

        <div className="flex flex-wrap justify-center gap-2 xs:gap-3">
          <span className="ui-chip">
            <TargetIcon className="h-3.5 w-3.5 text-[#00f0ff]" />
            Beat the clock
          </span>
          <span className="ui-chip">
            <ZapIcon className="h-3.5 w-3.5 text-[#ff4db3]" />
            Build combos
          </span>
          <span className="ui-chip">
            <ClockIcon className="h-3.5 w-3.5 text-[#ffaa00]" />
            Faster answers score more
          </span>
        </div>

        <motion.p
          initial={{
            opacity: 0,
            y: 6,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.25,
          }}
          className="ui-helper-text text-center max-w-2xl mx-auto text-xs xs:text-sm sm:text-base px-2 xs:px-0"
        >
          Pick a difficulty, answer quickly, and keep your combo alive to turn
          each round into a higher-scoring run.
        </motion.p>

        <motion.div
          initial={{
            y: 50,
            opacity: 0,
          }}
          animate={{
            y: 0,
            opacity: 1,
          }}
          transition={{
            delay: 0.3,
          }}
          className="w-full max-w-md space-y-3 xs:space-y-4 mx-auto"
        >
          <div className="ui-section-heading text-[0.65rem] text-slate-400 text-center tracking-[0.2em]">
            Choose your pace
          </div>
          {difficulties.map((diff, index) => (
            <motion.button
              key={diff.value}
              initial={{
                x: -100,
                opacity: 0,
              }}
              animate={{
                x: 0,
                opacity: 1,
              }}
              transition={{
                delay: 0.4 + index * 0.1,
              }}
              onClick={() => setSelectedDifficulty(diff.value)}
              className={`w-full p-4 xs:p-6 rounded-xl border transition-all touch-target text-left ${selectedDifficulty === diff.value ? "border-cyan-400/60 bg-cyan-400/10 difficulty-selected-soft" : "border-slate-700/80 bg-slate-900/45 hover:border-slate-500"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xl xs:text-2xl font-bold mb-1 orbitron-text">
                    {diff.label}
                  </div>
                  <div className="text-xs xs:text-sm text-gray-400">
                    {diff.description}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[0.65rem] tracking-[0.16em] text-slate-500 uppercase">
                    {selectedDifficulty === diff.value ? "Selected" : "Tap"}
                  </div>
                  {highScores[diff.value] > 0 && (
                    <div className="flex items-center justify-end gap-1 mt-1 text-[#ffaa00]">
                      <TrophyIcon className="w-4 h-4" />
                      <span className="text-xs xs:text-sm">
                        {highScores[diff.value]}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>

        <div className="w-full max-w-md mx-auto">
          <motion.button
            initial={{
              scale: 0,
            }}
            animate={{
              scale: 1,
            }}
            transition={{
              type: "spring",
              stiffness: 200,
              delay: 0.7,
            }}
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
            onClick={() => onStart(selectedDifficulty)}
            className="w-full px-8 xs:px-12 py-3 xs:py-4 text-base xs:text-xl font-bold rounded-xl bg-[#00ff88] text-[#0a0a1a] hover:bg-[#00ff88]/90 transition-all orbitron-text start-button-soft touch-target"
          >
            START GAME
          </motion.button>
        </div>

        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 1,
          }}
          className="text-gray-500 text-xs xs:text-sm text-center px-4 xs:px-0"
        >
          Use arrow keys to select difficulty • Press Enter to start
        </motion.p>
      </div>
    </motion.div>
  );
}
