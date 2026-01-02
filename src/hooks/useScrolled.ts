import { useState, useEffect } from "react";

/**
 * Hook to detect if page has scrolled past a threshold
 * Useful for sticky headers that change appearance on scroll
 */
export const useScrolled = (threshold = 10): boolean => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > threshold);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return scrolled;
};

