import { motion } from "framer-motion";
import { ZapIcon, FlameIcon } from "lucide-react";

interface ComboCounterProps {
  combo: number;
}

export function ComboCounter({ combo }: ComboCounterProps) {
  if (combo < 2) return null;

  const isHot = combo >= 5;
  const isBlazing = combo >= 10;
  const color = isBlazing ? "#ffaa00" : "#ff4db3";

  return (
    <motion.div
      // Keyed on combo so it re-pops on every increment.
      key={combo}
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: [0.6, 1.15, 1], opacity: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 16 }}
      className="flex items-center gap-1 xs:gap-2 text-lg xs:text-2xl font-bold px-3 xs:px-4 py-1 xs:py-2 rounded-full"
      style={{
        background: `${color}1a`,
        border: `1px solid ${color}55`,
      }}
    >
      {isHot ? (
        <FlameIcon
          className="w-5 xs:w-7 h-5 xs:h-7"
          style={{ color, filter: `drop-shadow(0 0 5px ${color}80)` }}
        />
      ) : (
        <ZapIcon
          className="w-5 xs:w-7 h-5 xs:h-7"
          style={{ color, filter: `drop-shadow(0 0 4px ${color}73)` }}
        />
      )}
      <span style={{ color, textShadow: `0 0 6px ${color}59` }} className="tabular-nums">
        {combo}x
      </span>
    </motion.div>
  );
}
