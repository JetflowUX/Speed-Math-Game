import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Difficulty } from '../utils/gameTypes';
import { TrophyIcon } from 'lucide-react';
interface StartScreenProps {
  onStart: (difficulty: Difficulty) => void;
  highScores: Record<Difficulty, number>;
}
export function StartScreen({ onStart, highScores }: StartScreenProps) {
  const [selectedDifficulty, setSelectedDifficulty] =
  useState<Difficulty>('easy');
  const difficulties: {
    value: Difficulty;
    label: string;
    description: string;
  }[] = [
  {
    value: 'easy',
    label: 'EASY',
    description: 'Addition & Subtraction'
  },
  {
    value: 'medium',
    label: 'MEDIUM',
    description: 'Multiplication Mix'
  },
  {
    value: 'hard',
    label: 'HARD',
    description: 'All Operations'
  }];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        setSelectedDifficulty((prev) => {
          const currentIndex = difficulties.findIndex((d) => d.value === prev);
          const newIndex =
          currentIndex > 0 ? currentIndex - 1 : difficulties.length - 1;
          return difficulties[newIndex].value;
        });
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        setSelectedDifficulty((prev) => {
          const currentIndex = difficulties.findIndex((d) => d.value === prev);
          const newIndex =
          currentIndex < difficulties.length - 1 ? currentIndex + 1 : 0;
          return difficulties[newIndex].value;
        });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onStart(selectedDifficulty);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDifficulty, onStart]);
  return (
    <motion.div
      initial={{
        opacity: 0
      }}
      animate={{
        opacity: 1
      }}
      exit={{
        opacity: 0
      }}
      className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a1a] text-white px-4">
      
      <motion.h1
        initial={{
          scale: 0.5,
          y: -50
        }}
        animate={{
          scale: 1,
          y: 0
        }}
        transition={{
          type: 'spring',
          stiffness: 200
        }}
        className="text-6xl md:text-8xl font-bold mb-4 text-center"
        style={{
          fontFamily: 'Orbitron, sans-serif',
          textShadow: '0 0 30px #00f0ff, 0 0 60px #00f0ff, 0 0 90px #00f0ff'
        }}>
        
        <span className="text-[#00f0ff]">SPEED MATH</span>
      </motion.h1>

      <motion.h2
        initial={{
          scale: 0.5,
          y: -30
        }}
        animate={{
          scale: 1,
          y: 0
        }}
        transition={{
          type: 'spring',
          stiffness: 200,
          delay: 0.1
        }}
        className="text-4xl md:text-6xl font-bold mb-12 text-center"
        style={{
          fontFamily: 'Orbitron, sans-serif',
          textShadow: '0 0 30px #ff00aa, 0 0 60px #ff00aa'
        }}>
        
        <span className="text-[#ff00aa]">BATTLE</span>
      </motion.h2>

      <motion.div
        initial={{
          y: 50,
          opacity: 0
        }}
        animate={{
          y: 0,
          opacity: 1
        }}
        transition={{
          delay: 0.3
        }}
        className="w-full max-w-md space-y-4 mb-8">
        
        {difficulties.map((diff, index) =>
        <motion.button
          key={diff.value}
          initial={{
            x: -100,
            opacity: 0
          }}
          animate={{
            x: 0,
            opacity: 1
          }}
          transition={{
            delay: 0.4 + index * 0.1
          }}
          onClick={() => setSelectedDifficulty(diff.value)}
          className={`w-full p-6 rounded-lg border-2 transition-all ${selectedDifficulty === diff.value ? 'border-[#00f0ff] bg-[#00f0ff]/20' : 'border-gray-700 bg-gray-900/50 hover:border-gray-500'}`}
          style={
          selectedDifficulty === diff.value ?
          {
            boxShadow: '0 0 30px #00f0ff'
          } :
          {}
          }>
          
            <div
            className="text-2xl font-bold mb-2"
            style={{
              fontFamily: 'Orbitron, sans-serif'
            }}>
            
              {diff.label}
            </div>
            <div className="text-sm text-gray-400">{diff.description}</div>
            {highScores[diff.value] > 0 &&
          <div className="flex items-center justify-center gap-2 mt-3 text-[#ffaa00]">
                <TrophyIcon className="w-4 h-4" />
                <span className="text-sm">
                  High Score: {highScores[diff.value]}
                </span>
              </div>
          }
          </motion.button>
        )}
      </motion.div>

      <motion.button
        initial={{
          scale: 0
        }}
        animate={{
          scale: 1
        }}
        transition={{
          type: 'spring',
          stiffness: 200,
          delay: 0.7
        }}
        whileHover={{
          scale: 1.05
        }}
        whileTap={{
          scale: 0.95
        }}
        onClick={() => onStart(selectedDifficulty)}
        className="px-12 py-4 text-2xl font-bold rounded-lg bg-[#00ff88] text-[#0a0a1a] hover:bg-[#00ff88]/90 transition-all"
        style={{
          fontFamily: 'Orbitron, sans-serif',
          boxShadow: '0 0 30px #00ff88'
        }}>
        
        START GAME
      </motion.button>

      <motion.p
        initial={{
          opacity: 0
        }}
        animate={{
          opacity: 1
        }}
        transition={{
          delay: 1
        }}
        className="mt-8 text-gray-500 text-sm">
        
        Use arrow keys to select difficulty • Press Enter to start
      </motion.p>
    </motion.div>);

}