import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * ScrollToTop component ensures that the window scrolls to the top
 * whenever the route changes in the application.
 */
export default function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    // Scroll to the very top of the window
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant" // We want immediate jump, not smooth scroll for route changes
    });
  }, [location]);

  return null;
}
