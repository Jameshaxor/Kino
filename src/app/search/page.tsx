"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import MovieCard from "@/components/ui/MovieCard";
import { CarouselSkeleton } from "@/components/ui/Skeleton";
import { useDebounce } from "@/hooks/useDebounce";

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const router = useRouter();

  const [query, setQuery] = useState(q);
  const debouncedQuery = useDebounce(query, 400);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    const fetchSearch = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/tmdb/search/movie?query=${encodeURIComponent(debouncedQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch {
        console.error("Search failed");
      } finally {
        setLoading(false);
      }
    };
    fetchSearch();
    router.replace(`/search?q=${encodeURIComponent(debouncedQuery)}`, { scroll: false });
  }, [debouncedQuery, router]);

  return (
    <div className="flex flex-col gap-8">
      {/* Search input */}
      <div className="relative max-w-2xl w-full mx-auto">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for movies..."
          className="w-full bg-bg-elevated border border-border py-3.5 pl-12 pr-4 rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent/50 transition-colors text-base"
          autoFocus
        />
      </div>

      {/* Results */}
      <div className="flex flex-col gap-4">
        {query && (
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-display font-semibold text-text-primary">
              {loading ? "Searching..." : `Results for "${query}"`}
            </h1>
            {results.length > 0 && (
              <span className="text-sm text-text-tertiary font-mono">{results.length} found</span>
            )}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-bg-elevated animate-shimmer bg-[length:200%_100%] bg-[linear-gradient(110deg,var(--color-bg-elevated)_8%,var(--color-bg-surface)_18%,var(--color-bg-elevated)_33%)] rounded-lg" />
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {results.map((movie, i) => (
              <MovieCard key={movie.id} movie={movie} index={i} />
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-20 text-text-tertiary">
            <p className="text-lg font-display">No movies found</p>
            <p className="text-sm mt-2">Try a different search term</p>
          </div>
        ) : (
          <div className="text-center py-20 text-text-tertiary">
            <SearchIcon className="w-8 h-8 mx-auto mb-4 opacity-30" />
            <p className="font-display text-lg">Start typing to search</p>
            <p className="text-sm mt-1">Find any movie from millions of titles</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-12 min-h-[70vh]">
      <Suspense fallback={<div className="text-center text-text-tertiary p-20">Loading...</div>}>
        <SearchContent />
      </Suspense>
    </div>
  );
}
