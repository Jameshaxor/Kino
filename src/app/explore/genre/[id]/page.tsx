"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowUpDown } from "lucide-react";
import { GENRE_MAP } from "@/lib/tmdb";
import MovieCard from "@/components/ui/MovieCard";

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Most Popular" },
  { value: "vote_average.desc", label: "Highest Rated" },
  { value: "primary_release_date.desc", label: "Newest First" },
  { value: "revenue.desc", label: "Highest Revenue" },
];

export default function GenrePage() {
  const params = useParams();
  const genreId = params.id as string;
  const genreName = GENRE_MAP[Number(genreId)] || "Genre";

  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [hasMore, setHasMore] = useState(true);

  const fetchMovies = async (pageNum: number, sort: string, append = false) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/tmdb/discover/movie?with_genres=${genreId}&sort_by=${sort}&vote_count.gte=50&page=${pageNum}`
      );
      const data = await res.json();
      const results = data.results || [];
      setMovies((prev) => (append ? [...prev, ...results] : results));
      setHasMore(data.page < data.total_pages);
    } catch {
      console.error("Failed to fetch genre movies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchMovies(1, sortBy);
  }, [genreId, sortBy]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMovies(nextPage, sortBy, true);
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-5 md:px-8 py-12 md:py-16 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-accent rounded-full" />
            <span className="text-xs font-mono text-accent uppercase tracking-widest">Genre</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary tracking-tight">
            {genreName}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-text-tertiary" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-bg-elevated border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/50 appearance-none cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {movies.map((movie, i) => (
          <MovieCard key={`${movie.id}-${i}`} movie={movie} index={i % 20} />
        ))}
      </div>

      {/* Load more */}
      {hasMore && !loading && (
        <div className="flex justify-center mt-4">
          <button onClick={loadMore} className="btn-ghost">
            Load More
          </button>
        </div>
      )}

      {loading && movies.length === 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-bg-elevated animate-shimmer bg-[length:200%_100%] bg-[linear-gradient(110deg,var(--color-bg-elevated)_8%,var(--color-bg-surface)_18%,var(--color-bg-elevated)_33%)] rounded-lg" />
          ))}
        </div>
      )}
    </div>
  );
}
