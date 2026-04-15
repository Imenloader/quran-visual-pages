import { ReactNode } from "react";
import { motion } from "motion/react";

interface ScrollRevealProps {
  children: ReactNode;
  index?: number;
  className?: string;
  delay?: number;
}

const ScrollReveal = ({ children, className = "", index = 0, delay = 0 }: ScrollRevealProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{
      duration: 0.6,
      delay: delay !== undefined ? delay : index * 0.1,
      ease: [0.16, 1, 0.3, 1]
    }}
    className={className}
  >
    {children}
  </motion.div>
);

export default ScrollReveal;
