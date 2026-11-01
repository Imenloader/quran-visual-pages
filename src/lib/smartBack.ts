import type { NavigateFunction } from "react-router-dom";

/**
 * Go back when there is real in-app history; otherwise go home.
 * Fixes the case where a user deep-links into a page (e.g. /juz/30) and
 * the back button silently does nothing because there is nothing to pop.
 */
export const smartBack = (navigate: NavigateFunction) => {
  const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
  if (idx > 0) {
    navigate(-1);
  } else {
    navigate("/", { replace: true });
  }
};
