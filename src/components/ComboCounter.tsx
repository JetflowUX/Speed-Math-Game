import React from "react";
import { motion } from "framer-motion";
import { ZapIcon } from "lucide-react";
interface ComboCounterProps {
  combo: number;
}
export function ComboCounter({ combo }: ComboCounterProps) {
  if (combo < 2) return null;
  return (
    <motion.div
      initial={{
        scale: 0,
      }}
      animate={{
        scale: 1,
      }}
      transition={{
        type: "spring",
        stiffness: 220,
        duration: 0.5,
      }}
      className="flex items-center gap-1 xs:gap-2 text-lg xs:text-2xl font-bold px-3 xs:px-4 py-1 xs:py-2 rounded-full bg-pink-500/10 border border-pink-300/30"
    >
      <ZapIcon
        className="w-5 xs:w-7 h-5 xs:h-7 text-[#ff4db3]"
        style={{
          filter: "drop-shadow(0 0 4px rgba(255, 77, 179, 0.45))",
        }}
      />

      <span
        className="text-[#ff4db3]"
        style={{
          textShadow: "0 0 5px rgba(255, 77, 179, 0.35)",
        }}
      >
        {combo}x
      </span>
    </motion.div>
  );
}
