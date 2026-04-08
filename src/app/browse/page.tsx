"use client";

import { useState, useEffect, useCallback } from "react";
import MovieCard from "@/components/ui/MovieCard";
import { motion, AnimatePresence } from "framer-motion";
import { Film, Tv, SlidersHorizontal, ChevronDown, Loader2 } from "lucide-react";

const SORT_OPTIONS = [
  { label: "Most Popular", value: "popularity.desc" },
  { label: "Top Rated", value: "vote_average.desc" },
  { label: "Newest First", value: "primary_release_date.desc" },
  { label: "Oldest First", value: "primary_release_date.asc" },
];

const MEDIA_TABS = [
  { label: "Movies", value: "movie", icon: Film },
  { label: "TV Shows", value: "tv", icon: Tv },
];

type MediaType = "movie" | "tv";

async function fetchCatalog(mediaType: MediaType, sort: string, page: number) {
  const endpoint = mediaType === "movie"
    ? `/api/tmdb/discover/movie?sort_by=${sort}&vote_count.gte=50&page=${page}`
    : `/api/tmdb/discover/tv?sort_by=${sort.replace("primary_release_date", "first_air_date")}&vote_count.gte=50&page=${page}`;
  const res = await fetch(endpoint);
  if (!res.ok) return { results: [], total_pages: 1 };
  const data = await res.json();
  return { results: data.results || [], total_pages: data.total_pages || 1 };
}

export default function BrowsePage() {
  const [mediaType, setMediaType] = useState<MediaType>("movie");
  const [sort, setSort] = useState("popularity.desc");
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadCatalog = useCallback(async (type: MediaType, sortBy: string, pg: number, append = false) => {
    if (pg === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const { results, total_pages } = await fetchCatalog(type, sortBy, pg);
      const tagged = results.map((item: any) => ({ ...item, media_type: type }));
      setItems(prev => append ? [...prev, ...tagged] : tagged);
      setTotalPages(total_pages);
    } catch {
      console.error("Browse fetch failed");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    loadCatalog(mediaType, sort, 1, false);
  }, [mediaType, sort, loadCatalog]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    loadCatalog(mediaType, sort, next, true);
  };

  const currentSort = SORT_OPTIONS.find(o => o.value === sort)!;

  return (
    <main className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-text-primary tracking-tight mb-3">
            Browse Catalog
          </h1>
          <p className="text-text-secondary text-base max-w-xl">
            Explore the most popular and critically acclaimed films and TV shows.
          </p>
        </header>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          {/* Media type tabs */}
          <div className="flex items-center gap-2">
            {MEDIA_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = mediaType === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setMediaType(tab.value as MediaType)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-accent/10 text-accent border border-accent/30"
                      : "bg-bg-elevated border border-border text-text-secondary hover:text-text-primary hover:border-border-light"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-elevated border border-border text-sm text-text-secondary hover:text-text-primary hover:border-border-light transition-all"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {currentSort.label}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {sortOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 z-20 w-48 bg-bg-elevated border border-border rounded-xl shadow-overlay overflow-hidden"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSort(opt.value); setSortOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          sort === opt.value
                            ? "text-accent bg-accent-muted"
                            : "text-text-secondary hover:text-text-primary hover:bg-bg-surface"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
            {[...Array(24)].map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] bg-bg-elevated animate-pulse rounded-xl bg-[linear-gradient(110deg,var(--color-bg-elevated)_8%,var(--color-bg-surface)_18%,var(--color-bg-elevated)_33%)] bg-[length:200%_100%]"
              />
            ))}
          </div>
        ) : (
          <motion.div
            key={`${mediaType}-${sort}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8"
          >
            {items.map((item, i) => (
              <MovieCard key={`${item.media_type}-${item.id}`} movie={item} index={i % 20} />
            ))}
          </motion.div>
        )}

        {/* Load More */}
        {!loading && page < totalPages && (
          <div className="flex justify-center mt-12">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="btn-ghost px-10 py-3 flex items-center gap-2.5"
            >
              {loadingMore ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Loading more...</>
              ) : (
                "Load More"
              )}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
