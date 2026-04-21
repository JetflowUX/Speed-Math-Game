import React from 'react';
import { motion } from 'framer-motion';
import { ZapIcon } from 'lucide-react';
interface ComboCounterProps {
  combo: number;
}
export function ComboCounter({ combo }: ComboCounterProps) {
  if (combo < 2) return null;
  const isHighCombo = combo >= 5;
  return (
    <motion.div
      initial={{
        scale: 0
      }}
      animate={{
        scale: 1,
        ...(isHighCombo && {
          textShadow: [
          '0 0 20px #ff00aa',
          '0 0 40px #ff00aa',
          '0 0 20px #ff00aa']

        })
      }}
      transition={{
        scale: {
          type: 'spring',
          stiffness: 300
        },
        textShadow: {
          duration: 1,
          repeat: Infinity
        }
      }}
      className="flex items-center gap-2 text-3xl font-bold">
      
      <ZapIcon
        className="w-8 h-8 text-[#ff00aa]"
        style={{
          filter: 'drop-shadow(0 0 10px #ff00aa)'
        }} />
      
      <span
        className="text-[#ff00aa]"
        style={{
          textShadow: '0 0 20px #ff00aa'
        }}>
        
        {combo}x COMBO
      </span>
    </motion.div>);

}