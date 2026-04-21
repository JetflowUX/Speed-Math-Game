import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
interface TimerBarProps {
  duration: number;
  onTimeout: () => void;
  isPaused?: boolean;
}
export function TimerBar({
  duration,
  onTimeout,
  isPaused = false
}: TimerBarProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          clearInterval(interval);
          onTimeout();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [onTimeout, isPaused, duration]);
  const percentage = timeLeft / duration * 100;
  const getColor = () => {
    if (percentage > 60) return '#00ff88';
    if (percentage > 30) return '#ffaa00';
    return '#ff3355';
  };
  return (
    <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{
          width: `${percentage}%`,
          backgroundColor: getColor(),
          boxShadow: `0 0 20px ${getColor()}`
        }}
        transition={{
          duration: 0.1
        }} />
      
    </div>);

}