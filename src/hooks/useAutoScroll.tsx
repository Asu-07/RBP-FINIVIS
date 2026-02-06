import { useCallback } from "react";

/**
 * Auto-scroll hook for forms
 * 
 * Per FINAL MASTER PROMPT:
 * After clicking Continue / Submit / Next, the page must auto-scroll to top
 * No page should remain stuck at the bottom after submission
 */
export function useAutoScroll() {
  const scrollToTop = useCallback((smooth = true) => {
    window.scrollTo({
      top: 0,
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  const scrollToElement = useCallback((elementId: string, smooth = true) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "start",
      });
    }
  }, []);

  return {
    scrollToTop,
    scrollToElement,
  };
}
