import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question, GameStats, PowerUp, PowerUpType } from '../utils/gameTypes';
import { TimerBar } from './TimerBar';
import { LivesDisplay } from './LivesDisplay';
import { ComboCounter } from './ComboCounter';
import { FloatingScore } from './FloatingScore';
import { ClockIcon, Zap } from 'lucide-react';
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
  onCollectPowerUp
}: GameScreenProps) {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [floatingScores, setFloatingScores] = useState<FloatingScoreData[]>([]);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextScoreId = useRef(0);
  useEffect(() => {
    setAnswer('');
    setFeedback(null);
    inputRef.current?.focus();
  }, [question]);
  useEffect(() => {
    if (feedback === 'wrong') {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }, [feedback]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAnswer = parseInt(answer);
    if (isNaN(numAnswer)) return;
    const isCorrect = numAnswer === question.answer;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const points = Math.floor(10 + stats.timePerQuestion / 8 * 10);
      const totalPoints = points * Math.min(stats.combo + 1, 10);
      setFloatingScores((prev) => [
      ...prev,
      {
        id: nextScoreId.current++,
        points: totalPoints,
        x: rect.left + rect.width / 2,
        y: rect.top
      }]
      );
    }
    setTimeout(
      () => {
        setFeedback(null);
        onAnswer(numAnswer);
      },
      isCorrect ? 300 : 1000
    );
  };
  const removeFloatingScore = (id: number) => {
    setFloatingScores((prev) => prev.filter((score) => score.id !== id));
  };
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' && powerUp && !powerUp.active) {
        e.preventDefault();
        onCollectPowerUp();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [powerUp, onCollectPowerUp]);
  const getPowerUpIcon = (type: PowerUpType) => {
    if (type === 'extraTime') return <ClockIcon className="w-6 h-6" />;
    if (type === 'doubleScore') return <Zap className="w-6 h-6" />;
    return null;
  };
  const getPowerUpLabel = (type: PowerUpType) => {
    if (type === 'extraTime') return 'Extra Time';
    if (type === 'doubleScore') return 'Double Score';
    return '';
  };
  return (
    <motion.div
      initial={{
        opacity: 0
      }}
      animate={{
        opacity: 1,
        x: shake ? [-10, 10, -10, 10, 0] : 0
      }}
      transition={{
        x: {
          duration: 0.5
        }
      }}
      className={`flex flex-col min-h-screen bg-[#0a0a1a] text-white p-6 ${feedback === 'correct' ? 'bg-[#00ff88]/10' : feedback === 'wrong' ? 'bg-[#ff3355]/10' : ''}`}
      style={{
        transition: 'background-color 0.3s'
      }}>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div
            className="text-5xl font-bold mb-2"
            style={{
              fontFamily: 'Orbitron, sans-serif',
              color: '#00f0ff',
              textShadow: '0 0 20px #00f0ff'
            }}>
            
            {stats.score.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">SCORE</div>
        </div>
        <LivesDisplay lives={stats.lives} maxLives={3} />
      </div>

      {/* Timer */}
      <div className="mb-8">
        <TimerBar duration={stats.timePerQuestion} onTimeout={onTimeout} />
      </div>

      {/* Combo Counter */}
      <div className="flex justify-center mb-8">
        <ComboCounter combo={stats.combo} />
      </div>

      {/* Power-up Display */}
      <AnimatePresence>
        {powerUp && !powerUp.active &&
        <motion.div
          initial={{
            scale: 0,
            y: -50
          }}
          animate={{
            scale: 1,
            y: 0
          }}
          exit={{
            scale: 0,
            opacity: 0
          }}
          className="flex justify-center mb-6">
          
            <div
            className="flex items-center gap-3 px-6 py-3 bg-[#ffaa00]/20 border-2 border-[#ffaa00] rounded-lg"
            style={{
              boxShadow: '0 0 30px #ffaa00'
            }}>
            
              <span className="text-[#ffaa00]">
                {getPowerUpIcon(powerUp.type)}
              </span>
              <span className="text-[#ffaa00] font-bold">
                {getPowerUpLabel(powerUp.type)}
              </span>
              <span className="text-sm text-gray-300">(Press SPACE)</span>
            </div>
          </motion.div>
        }
      </AnimatePresence>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          key={question.displayText}
          initial={{
            scale: 0.8,
            opacity: 0
          }}
          animate={{
            scale: 1,
            opacity: 1
          }}
          transition={{
            type: 'spring',
            stiffness: 200
          }}
          className="text-center mb-12">
          
          <div
            className="text-6xl md:text-8xl font-bold mb-4"
            style={{
              fontFamily: 'Orbitron, sans-serif',
              color: '#00f0ff',
              textShadow: '0 0 30px #00f0ff, 0 0 60px #00f0ff'
            }}>
            
            {question.displayText}
          </div>
          <div className="text-2xl text-gray-400">= ?</div>
        </motion.div>

        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <input
            ref={inputRef}
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full px-6 py-4 text-4xl text-center font-bold bg-gray-900/50 border-2 border-[#00f0ff] rounded-lg focus:outline-none focus:border-[#00ff88] transition-all"
            style={{
              fontFamily: 'Orbitron, sans-serif',
              color: '#fff',
              boxShadow: '0 0 20px #00f0ff'
            }}
            placeholder="?"
            autoComplete="off"
            disabled={feedback !== null} />
          
        </form>

        {feedback === 'wrong' &&
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          className="mt-6 text-2xl text-[#ff3355] font-bold"
          style={{
            textShadow: '0 0 20px #ff3355'
          }}>
          
            Correct answer: {question.answer}
          </motion.div>
        }
      </div>

      {/* Stats Footer */}
      <div className="flex justify-between items-center text-sm text-gray-400">
        <div>Problems: {stats.problemsSolved}</div>
        <div>
          Accuracy:{' '}
          {stats.totalProblems > 0 ?
          Math.round(stats.correctAnswers / stats.totalProblems * 100) :
          0}
          %
        </div>
      </div>

      {/* Floating Scores */}
      <AnimatePresence>
        {floatingScores.map((score) =>
        <FloatingScore
          key={score.id}
          points={score.points}
          x={score.x}
          y={score.y}
          onComplete={() => removeFloatingScore(score.id)} />

        )}
      </AnimatePresence>
    </motion.div>);

}