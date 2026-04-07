"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useRegion, REGIONS } from "@/context/RegionContext";

export default function RegionPicker() {
  const { region, setRegion } = useRegion();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-surface border border-border hover:border-accent/30 text-sm text-text-secondary hover:text-text-primary transition-all"
      >
        <span className="text-base leading-none">{region.flag}</span>
        <span className="font-mono text-xs">{region.code}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full right-0 mt-2 w-52 z-50 bg-bg-elevated/95 backdrop-blur-xl border border-border rounded-xl shadow-overlay overflow-hidden"
          >
            <div className="p-1.5 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-border">
              <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider px-3 py-2">Streaming Region</p>
              {REGIONS.map((r) => (
                <button
                  key={r.code}
                  onClick={() => { setRegion(r); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    r.code === region.code
                      ? "bg-accent-muted text-accent"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-surface"
                  }`}
                >
                  <span className="text-lg leading-none">{r.flag}</span>
                  <span className="text-sm font-medium">{r.name}</span>
                  <span className="ml-auto text-[11px] font-mono text-text-tertiary">{r.code}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
