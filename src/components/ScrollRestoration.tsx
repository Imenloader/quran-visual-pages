import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

// Global object to store scroll positions for each path
const scrollPositions: Record<string, number> = {};

const ScrollRestoration = () => {
  const { pathname } = useLocation();
  const lastPath = useRef(pathname);

  useEffect(() => {
    const handleScroll = () => {
      scrollPositions[pathname] = window.scrollY;
    };

    // Save scroll position when the user scrolls
    window.addEventListener("scroll", handleScroll);

    // Restore scroll position when the pathname changes
    const savedPosition = scrollPositions[pathname];
    
    // We use a small timeout to ensure the content has rendered
    // This is often necessary in React apps where content might load asynchronously
    const timeoutId = setTimeout(() => {
      if (savedPosition !== undefined) {
        window.scrollTo({
          top: savedPosition,
          behavior: "instant"
        });
      } else {
        window.scrollTo({
          top: 0,
          behavior: "instant"
        });
      }
    }, 0);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, [pathname]);

  return null;
};

export default ScrollRestoration;
