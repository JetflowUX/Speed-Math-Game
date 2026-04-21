import React from 'react';
import { motion } from 'framer-motion';
import { HeartIcon } from 'lucide-react';
interface LivesDisplayProps {
  lives: number;
  maxLives: number;
}
export function LivesDisplay({ lives, maxLives }: LivesDisplayProps) {
  return (
    <div className="flex gap-2">
      {Array.from({
        length: maxLives
      }).map((_, i) =>
      <motion.div
        key={i}
        animate={
        i < lives ?
        {
          scale: [1, 1.2, 1]
        } :
        {}
        }
        transition={{
          duration: 0.3
        }}>
        
          <HeartIcon
          className={`w-8 h-8 ${i < lives ? 'fill-[#ff3355] text-[#ff3355]' : 'fill-gray-700 text-gray-700'}`}
          style={
          i < lives ?
          {
            filter: 'drop-shadow(0 0 8px #ff3355)'
          } :
          {}
          } />
        
        </motion.div>
      )}
    </div>);

}