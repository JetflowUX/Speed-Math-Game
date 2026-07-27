import { useEffect } from "react";
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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onRestart();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onMenu();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onRestart, onMenu]);

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
      className="screen-shell screen-pad flex flex-col items-center justify-center bg-ink-900 text-white game-surface"
    >
      <div className="screen-card w-full max-w-3xl rounded-3xl px-5 py-8 xs:px-8 xs:py-10 md:px-10 md:py-12">
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
          className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-bold mb-4 xs:mb-6 text-center gameover-title px-4 xs:px-0"
        >
          <span className="text-neon-red">GAME OVER</span>
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
            className="mb-4 xs:mb-6 px-4 xs:px-6 py-2 xs:py-3 bg-neon-amber/20 border-2 border-neon-amber rounded-xl new-highscore-banner"
          >
            <div className="flex items-center justify-center gap-2 text-neon-amber text-base xs:text-lg sm:text-xl font-bold text-center">
              <TrophyIcon className="w-5 h-5 xs:w-6 xs:h-6" />
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
          className="flex flex-wrap justify-center gap-2 mb-5 xs:mb-6"
        >
          <span className="ui-chip">
            <TargetIcon className="h-3.5 w-3.5 text-neon-cyan" />
            Difficulty {difficulty}
          </span>
          <span className="ui-chip">
            <TrophyIcon className="h-3.5 w-3.5 text-neon-amber" />
            Best score {highScore.toLocaleString()}
          </span>
          <span className="ui-chip">
            <ZapIcon className="h-3.5 w-3.5 text-neon-pink" />
            Max combo {maxCombo}x
          </span>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.55,
          }}
          className="ui-helper-text text-center mb-6 xs:mb-8 text-sm xs:text-base"
        >
          Strong runs come from keeping accuracy high and answers fast.
        </motion.div>

        <div className="w-full max-w-md space-y-3 xs:space-y-4 mb-8 xs:mb-10 mx-auto">
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
              className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-3 p-3 xs:p-4 rounded-2xl border border-mist/15 bg-ink-800/50"
            >
              <div className="flex items-center gap-2 xs:gap-3">
                <stat.icon
                  className={`w-5 h-5 xs:w-6 xs:h-6 ${stat.iconClass}`}
                />
                <span className="text-xs xs:text-sm text-mist/75 uppercase tracking-[0.16em]">
                  {stat.label}
                </span>
              </div>
              <span
                className={`text-lg xs:text-2xl font-bold stat-value ${stat.valueClass}`}
              >
                {stat.value}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col xs:flex-row gap-3 xs:gap-4 w-full max-w-md mx-auto">
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
            className="flex-1 px-6 xs:px-8 py-2 xs:py-3 text-base xs:text-xl font-bold rounded-lg bg-neon-green text-ink-900 hover:bg-neon-green/90 transition-all gameover-button gameover-button-primary touch-target"
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
            className="flex-1 px-6 xs:px-8 py-2 xs:py-3 text-base xs:text-xl font-bold rounded-lg border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10 transition-all gameover-button touch-target"
          >
            MAIN MENU
          </motion.button>
        </div>

        <p className="text-mist/45 text-xs xs:text-sm text-center mt-5 xs:mt-6">
          Press Enter to play again • Esc for the menu
        </p>
      </div>
    </motion.div>
  );
}
