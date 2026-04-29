import { ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  index?: number;
  className?: string;
  delay?: number;
}

const ScrollReveal = ({ children, className = "" }: ScrollRevealProps) => (
  <div className={className}>
    {children}
  </div>
);

export default ScrollReveal;
