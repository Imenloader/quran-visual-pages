import { ReactNode, useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  index?: number;
  className?: string;
  delay?: number;
}

// IntersectionObserver-driven reveal: fades/slides content in the first time
// it enters the viewport. Pure CSS transitions (no animation lib), honors
// prefers-reduced-motion, and never animates for users who opt out.
const ScrollReveal = ({ children, className = "", delay = 0 }: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ease-out will-change-transform ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
