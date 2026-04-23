import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Difficulty } from "../utils/gameTypes";
import { TrophyIcon } from "lucide-react";
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
      className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a1a] text-white px-4 game-surface"
    >
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
        className="text-3xl xs:text-4xl sm:text-5xl md:text-7xl font-bold mb-2 xs:mb-3 text-center px-4 xs:px-0"
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
        className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold mb-3 xs:mb-4 text-center px-4 xs:px-0"
        style={{
          fontFamily: "Orbitron, sans-serif",
          textShadow: "0 0 8px rgba(255, 0, 170, 0.4)",
        }}
      >
        <span className="text-[#ff00aa]">BATTLE</span>
      </motion.h2>

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
        className="text-slate-300 mb-6 xs:mb-8 sm:mb-10 text-center max-w-xl text-xs xs:text-sm sm:text-base px-4 xs:px-0"
      >
        Pick your pace and solve as many problems as you can before time runs
        out.
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
        className="w-full max-w-md space-y-3 xs:space-y-4 mb-6 xs:mb-8 px-4 xs:px-0"
      >
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
            className={`w-full p-4 xs:p-6 rounded-lg xs:rounded-xl border transition-all touch-target ${selectedDifficulty === diff.value ? "border-cyan-400/60 bg-cyan-400/10 difficulty-selected-soft" : "border-slate-700/80 bg-slate-900/45 hover:border-slate-500"}`}
          >
            <div className="text-xl xs:text-2xl font-bold mb-1 xs:mb-2 orbitron-text">
              {diff.label}
            </div>
            <div className="text-xs xs:text-sm text-gray-400">{diff.description}</div>
            {highScores[diff.value] > 0 && (
              <div className="flex items-center justify-center gap-2 mt-2 xs:mt-3 text-[#ffaa00]">
                <TrophyIcon className="w-4 h-4" />
                <span className="text-xs xs:text-sm">
                  High Score: {highScores[diff.value]}
                </span>
              </div>
            )}
          </motion.button>
        ))}
      </motion.div>

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
        className="px-8 xs:px-12 py-3 xs:py-4 text-base xs:text-xl font-bold rounded-lg xs:rounded-xl bg-[#00ff88] text-[#0a0a1a] hover:bg-[#00ff88]/90 transition-all orbitron-text start-button-soft touch-target"
      >
        START GAME
      </motion.button>

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
        className="mt-6 xs:mt-8 text-gray-500 text-xs xs:text-sm text-center px-4 xs:px-0"
      >
        Use arrow keys to select difficulty • Press Enter to start
      </motion.p>
    </motion.div>
  );
}
