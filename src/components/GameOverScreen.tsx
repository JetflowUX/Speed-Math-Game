import React from "react";
import { motion } from "framer-motion";
import { TrophyIcon, TargetIcon, ZapIcon, CheckCircleIcon } from "lucide-react";
import { Difficulty } from "../utils/gameTypes";
interface GameOverScreenProps {
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  accuracy: number;
  problemsSolved: number;
  maxCombo: number;
  difficulty: Difficulty;
  onRestart: () => void;
  onMenu: () => void;
}
export function GameOverScreen({
  score,
  highScore,
  isNewHighScore,
  accuracy,
  problemsSolved,
  maxCombo,
  difficulty,
  onRestart,
  onMenu,
}: GameOverScreenProps) {
  const stats = [
    {
      icon: TargetIcon,
      label: "Final Score",
      value: score.toLocaleString(),
      iconClass: "stat-icon-cyan",
      valueClass: "stat-value-cyan",
    },
    {
      icon: TrophyIcon,
      label: "High Score",
      value: highScore.toLocaleString(),
      iconClass: "stat-icon-amber",
      valueClass: "stat-value-amber",
    },
    {
      icon: CheckCircleIcon,
      label: "Accuracy",
      value: `${accuracy}%`,
      iconClass: "stat-icon-green",
      valueClass: "stat-value-green",
    },
    {
      icon: CheckCircleIcon,
      label: "Problems Solved",
      value: problemsSolved,
      iconClass: "stat-icon-green",
      valueClass: "stat-value-green",
    },
    {
      icon: ZapIcon,
      label: "Max Combo",
      value: `${maxCombo}x`,
      iconClass: "stat-icon-pink",
      valueClass: "stat-value-pink",
    },
  ];

  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a1a] text-white px-4"
    >
      <motion.h1
        initial={{
          scale: 0,
          rotate: -180,
        }}
        animate={{
          scale: 1,
          rotate: 0,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          delay: 0.2,
        }}
        className="text-5xl md:text-7xl font-bold mb-8 text-center gameover-title"
      >
        <span className="text-[#ff3355]">GAME OVER</span>
      </motion.h1>

      {isNewHighScore && (
        <motion.div
          initial={{
            scale: 0,
            y: -20,
          }}
          animate={{
            scale: 1,
            y: 0,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            delay: 0.4,
          }}
          className="mb-6 px-6 py-3 bg-[#ffaa00]/20 border-2 border-[#ffaa00] rounded-lg new-highscore-banner"
        >
          <div className="flex items-center gap-2 text-[#ffaa00] text-xl font-bold">
            <TrophyIcon className="w-6 h-6" />
            <span>NEW HIGH SCORE!</span>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          delay: 0.5,
        }}
        className="text-gray-400 mb-6 text-lg"
      >
        Difficulty:{" "}
        <span className="text-[#00f0ff] font-bold uppercase">{difficulty}</span>
      </motion.div>

      <div className="w-full max-w-md space-y-4 mb-10">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{
              x: -100,
              opacity: 0,
            }}
            animate={{
              x: 0,
              opacity: 1,
            }}
            transition={{
              delay: 0.6 + index * 0.1,
            }}
            className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-800"
          >
            <div className="flex items-center gap-3">
              <stat.icon
                className={`w-6 h-6 ${stat.iconClass}`}
              />

              <span className="text-gray-300">{stat.label}</span>
            </div>
            <span className={`text-2xl font-bold stat-value ${stat.valueClass}`}>
              {stat.value}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
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
            delay: 1.1,
          }}
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.95,
          }}
          onClick={onRestart}
          className="px-8 py-3 text-xl font-bold rounded-lg bg-[#00ff88] text-[#0a0a1a] hover:bg-[#00ff88]/90 transition-all gameover-button gameover-button-primary"
        >
          PLAY AGAIN
        </motion.button>

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
            delay: 1.2,
          }}
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.95,
          }}
          onClick={onMenu}
          className="px-8 py-3 text-xl font-bold rounded-lg border-2 border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff]/10 transition-all gameover-button"
        >
          MAIN MENU
        </motion.button>
      </div>
    </motion.div>
  );
}
