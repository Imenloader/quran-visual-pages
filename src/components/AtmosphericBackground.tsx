import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "@/contexts/ThemeContext";

const AtmosphericBackground = () => {
  const { theme, atmosphericBackground } = useTheme();

  if (!atmosphericBackground) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <AnimatePresence mode="wait">
        {theme === "dark" && (
          <motion.div 
            key="dark-stars"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            {/* Stars */}
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: Math.random() }}
                animate={{ 
                  opacity: [0.2, 0.8, 0.2],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 3 + Math.random() * 4, 
                  repeat: Infinity,
                  delay: Math.random() * 5
                }}
                className="absolute w-0.5 h-0.5 bg-white rounded-full"
                style={{ 
                  left: `${Math.random() * 100}%`, 
                  top: `${Math.random() * 100}%` 
                }}
              />
            ))}
            {/* Deep Gradients */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-transparent to-black/40" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(67,56,202,0.1),transparent_70%)]" />
          </motion.div>
        )}

        {theme === "light" && (
          <motion.div 
            key="light-sun"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            {/* Sun Rays */}
            <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-amber-200/10 rounded-full blur-[120px]" />
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-amber-500/5 via-transparent to-emerald-500/5" />
            
            {/* Floating Particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  y: [-20, -100],
                  opacity: [0, 0.3, 0],
                  x: Math.sin(i) * 50
                }}
                transition={{ 
                  duration: 10 + Math.random() * 10, 
                  repeat: Infinity,
                  delay: Math.random() * 10
                }}
                className="absolute w-1 h-1 bg-gold/20 rounded-full"
                style={{ 
                  left: `${Math.random() * 100}%`, 
                  top: `${80 + Math.random() * 20}%` 
                }}
              />
            ))}
          </motion.div>
        )}

        {theme === "sepia" && (
          <motion.div 
            key="sepia-nature"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(120,53,15,0.05),transparent_50%)]" />
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-emerald-900/5 to-transparent" />
            
            {/* Soft Dust Particles */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  rotate: 360,
                  x: [0, 30, 0],
                  y: [0, 30, 0]
                }}
                transition={{ 
                  duration: 20 + Math.random() * 20, 
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute w-2 h-2 border border-gold/10 rounded-sm"
                style={{ 
                  left: `${Math.random() * 100}%`, 
                  top: `${Math.random() * 100}%` 
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AtmosphericBackground;
