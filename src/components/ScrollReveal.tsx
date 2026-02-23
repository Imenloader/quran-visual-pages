import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  index?: number;
  className?: string;
}

const ScrollReveal = ({ children, index = 0, className = "" }: ScrollRevealProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{ duration: 0.4, delay: (index % 10) * 0.06, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

export default ScrollReveal;
