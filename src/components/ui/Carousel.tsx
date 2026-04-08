"use client";

import { useRef, ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
}

export default function Carousel({ title, subtitle, icon, children }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = direction === "left" ? -scrollRef.current.clientWidth * 0.5 : scrollRef.current.clientWidth * 0.5;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-6 group/carousel">
      {/* Header */}
      <div className="flex items-end justify-between px-6 md:px-0">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            {icon}
            <h2 className="text-xl md:text-2xl font-display font-semibold text-text-primary tracking-tight">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-sm text-text-tertiary ml-0">{subtitle}</p>
          )}
        </div>

        {/* Nav arrows */}
        <div className="hidden md:flex items-center gap-1.5 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => scroll("left")}
            className="p-2.5 rounded-lg bg-bg-elevated border border-border text-text-tertiary hover:text-text-primary hover:border-accent/30 hover:bg-bg-surface transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2.5 rounded-lg bg-bg-elevated border border-border text-text-tertiary hover:text-text-primary hover:border-accent/30 hover:bg-bg-surface transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scroll container */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-5 overflow-x-auto hide-scrollbar px-6 md:px-0 pb-4 scroll-smooth snap-x snap-mandatory overscroll-x-contain"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
