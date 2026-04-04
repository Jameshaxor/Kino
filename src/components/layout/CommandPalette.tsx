"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Film, ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { img } from "@/lib/tmdb";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchResult {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/tmdb/search/movie?query=${encodeURIComponent(debouncedQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results?.slice(0, 8) || []);
        }
      } catch {
        console.error("Search failed");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [debouncedQuery]);

  const navigateTo = useCallback(
    (path: string) => {
      onClose();
      router.push(path);
    },
    [onClose, router]
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        navigateTo(`/movie/${results[selectedIndex].id}`);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose, results, selectedIndex, navigateTo]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[101] w-full max-w-xl"
          >
            <div className="mx-4 bg-bg-elevated border border-border rounded-xl shadow-overlay overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 border-b border-border">
                <Search className="w-4 h-4 text-text-tertiary flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  placeholder="Search movies..."
                  className="flex-1 py-4 bg-transparent text-text-primary placeholder:text-text-tertiary text-sm focus:outline-none"
                />
                {loading && <Loader2 className="w-4 h-4 text-text-tertiary animate-spin" />}
                <button onClick={onClose} className="p-1.5 rounded text-text-tertiary hover:text-text-secondary transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[400px] overflow-y-auto">
                {results.length > 0 ? (
                  <div className="p-2">
                    {results.map((movie, i) => (
                      <button
                        key={movie.id}
                        onClick={() => navigateTo(`/movie/${movie.id}`)}
                        onMouseEnter={() => setSelectedIndex(i)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                          i === selectedIndex ? "bg-bg-surface" : "hover:bg-bg-surface/50"
                        }`}
                      >
                        <div className="w-9 h-13 rounded overflow-hidden bg-bg-surface flex-shrink-0">
                          {movie.poster_path ? (
                            <Image
                              src={img(movie.poster_path, "w92")}
                              alt=""
                              width={36}
                              height={52}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Film className="w-3 h-3 text-text-tertiary" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">{movie.title}</p>
                          <p className="text-xs text-text-tertiary font-mono">
                            {movie.release_date ? new Date(movie.release_date).getFullYear() : "—"}
                            {movie.vote_average > 0 && ` · ${movie.vote_average.toFixed(1)}★`}
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-text-tertiary opacity-0 group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                ) : query && !loading ? (
                  <div className="p-8 text-center text-text-tertiary text-sm">
                    No movies found for &ldquo;{query}&rdquo;
                  </div>
                ) : !query ? (
                  <div className="p-6 text-center text-text-tertiary text-sm">
                    <p>Start typing to search movies</p>
                    <div className="flex items-center justify-center gap-4 mt-3 text-xs">
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 rounded bg-bg-surface border border-border font-mono">↑↓</kbd>
                        navigate
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 rounded bg-bg-surface border border-border font-mono">↵</kbd>
                        select
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 rounded bg-bg-surface border border-border font-mono">esc</kbd>
                        close
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Footer hint */}
              {results.length > 0 && (
                <div className="px-4 py-2.5 border-t border-border flex justify-between text-xs text-text-tertiary">
                  <span>{results.length} results</span>
                  <button
                    onClick={() => navigateTo(`/search?q=${encodeURIComponent(query)}`)}
                    className="text-accent hover:text-accent-hover transition-colors"
                  >
                    View all results →
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
