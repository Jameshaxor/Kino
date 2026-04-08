"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Film, Tv, ArrowRight, Loader2, Sparkles, TrendingUp, Compass, Bookmark } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { img } from "@/lib/tmdb";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  media_type: "movie" | "tv" | "person";
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
  const selectedRef = useRef<HTMLButtonElement>(null);
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
        const res = await fetch(`/api/tmdb/search/multi?query=${encodeURIComponent(debouncedQuery)}`);
        if (res.ok) {
          const data = await res.json();
          // Filter out people, only keep movies and TV
          const media = data.results?.filter((r: SearchResult) => r.media_type === "movie" || r.media_type === "tv") || [];
          setResults(media.slice(0, 8));
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
        const result = results[selectedIndex];
        navigateTo(`/${result.media_type}/${result.id}`);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose, results, selectedIndex, navigateTo]);

  // Scroll selected result into view on keyboard navigation
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-xl"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[12%] md:top-[15%] left-1/2 -translate-x-1/2 z-[101] w-full max-w-2xl px-4"
          >
            <div className="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_0_80px_rgba(139,92,246,0.15)] overflow-hidden">
              <div className="flex items-center gap-4 px-5 border-b border-white/10">
                <Search className="w-5 h-5 text-accent flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  placeholder="Search movies, TV shows, anime..."
                  className="flex-1 py-5 md:py-6 bg-transparent text-white placeholder:text-white/30 text-lg md:text-xl font-display tracking-tight focus:outline-none"
                />
                {loading && <Loader2 className="w-5 h-5 text-accent/50 animate-spin" />}
                <button onClick={onClose} className="p-2 rounded-lg bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>

              <div className="max-h-[50vh] overflow-y-auto">
                {results.length > 0 ? (
                  <div className="p-2">
                    {results.map((result, i) => {
                      const title = result.title || result.name;
                      const date = result.release_date || result.first_air_date;
                      const year = date ? new Date(date).getFullYear() : "—";
                      
                      return (
                        <button
                          ref={i === selectedIndex ? selectedRef : null}
                          key={`${result.media_type}-${result.id}`}
                          onClick={() => navigateTo(`/${result.media_type}/${result.id}`)}
                          onMouseEnter={() => setSelectedIndex(i)}
                          className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                            i === selectedIndex ? "bg-bg-surface" : "hover:bg-bg-surface/50"
                          }`}
                        >
                          <div className="w-9 aspect-[2/3] rounded overflow-hidden bg-bg-surface flex-shrink-0 relative">
                            {result.poster_path ? (
                              <Image
                                src={img(result.poster_path, "w92")}
                                alt={title || ""}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                {result.media_type === "tv" ? (
                                  <Tv className="w-3 h-3 text-text-tertiary" />
                                ) : (
                                  <Film className="w-3 h-3 text-text-tertiary" />
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-text-primary truncate">{title}</p>
                              <span className="px-1.5 py-0.5 rounded bg-bg-surface border border-border text-[9px] uppercase tracking-wider text-text-tertiary shrink-0">
                                {result.media_type}
                              </span>
                            </div>
                            <p className="text-xs text-text-tertiary font-mono mt-0.5">
                              {year}
                              {result.vote_average > 0 && ` · ${result.vote_average.toFixed(1)}★`}
                            </p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                ) : query && !loading ? (
                  <div className="p-8 text-center">
                    <p className="text-text-tertiary text-sm">No results found for &ldquo;{query}&rdquo;</p>
                    <Link
                      href={`/search?q=${encodeURIComponent(query)}`}
                      onClick={onClose}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover transition-colors"
                    >
                      Search full catalog <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ) : !query ? (
                  <div className="p-4">
                    <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-[0.15em] px-2 mb-2">Quick Navigation</p>
                    <div className="flex flex-col gap-0.5">
                      {[
                        { href: "/", label: "Discover", icon: TrendingUp, desc: "Home feed & trending" },
                        { href: "/browse", label: "Browse Catalog", icon: Compass, desc: "Full movie & TV library" },
                        { href: "/ai", label: "AI Oracle", icon: Sparkles, desc: "Gemini-powered picks" },
                        { href: "/library", label: "My Library", icon: Bookmark, desc: "Watchlist & favorites" },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-bg-surface transition-colors group"
                          >
                            <div className="w-7 h-7 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                              <Icon className="w-3.5 h-3.5 text-accent" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-text-primary">{item.label}</p>
                              <p className="text-[11px] text-text-tertiary">{item.desc}</p>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-white/5 text-xs text-text-tertiary">
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

              {results.length > 0 && (
                <div className="px-4 py-2.5 border-t border-border flex justify-between items-center text-xs text-text-tertiary">
                  <span>{results.length} results</span>
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}`}
                    onClick={onClose}
                    className="flex items-center gap-1 text-accent hover:text-accent-hover transition-colors font-medium"
                  >
                    View all <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
