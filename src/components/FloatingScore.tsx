import React from 'react';
import { motion } from 'framer-motion';
interface FloatingScoreProps {
  points: number;
  x: number;
  y: number;
  onComplete: () => void;
}
export function FloatingScore({
  points,
  x,
  y,
  onComplete
}: FloatingScoreProps) {
  return (
    <motion.div
      initial={{
        opacity: 1,
        y: 0,
        scale: 1
      }}
      animate={{
        opacity: 0,
        y: -80,
        scale: 1.2
      }}
      transition={{
        duration: 1,
        ease: 'easeOut'
      }}
      onAnimationComplete={onComplete}
      className="fixed pointer-events-none z-50 text-3xl font-bold"
      style={{
        left: x,
        top: y,
        textShadow: '0 0 20px #00ff88, 0 0 40px #00ff88'
      }}>
      
      <span className="text-[#00ff88]">+{points}</span>
    </motion.div>);

}