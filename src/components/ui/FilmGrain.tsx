"use client";

import { useState, useEffect } from "react";

export default function FilmGrain() {
  const [isMobile, setIsMobile] = useState(true); // Default to true to prevent flash on unstyled SSR

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    };
    
    // Initial check
    checkMobile();
    
    // Listen for resize
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isMobile) return null;

  return <div className="film-grain" />;
}
