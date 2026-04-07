"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search as SearchIcon, Film, Tv, User } from "lucide-react";
import MovieCard from "@/components/ui/MovieCard";
import { useDebounce } from "@/hooks/useDebounce";

type MediaType = "movie" | "tv" | "person";

const TYPE_TABS: { label: string; value: MediaType; icon: React.ElementType; endpoint: string }[] = [
  { label: "Movies", value: "movie", icon: Film, endpoint: "search/movie" },
  { label: "TV Shows", value: "tv", icon: Tv, endpoint: "search/tv" },
  { label: "People", value: "person", icon: User, endpoint: "search/person" },
];

function PersonCard({ person }: { person: any }) {
  return (
    <a
      href={`/person/${person.id}`}
      className="group card-premium p-4 flex gap-4 items-center"
    >
      <div className="w-14 h-14 rounded-full overflow-hidden bg-bg-surface border border-border flex-shrink-0">
        {person.profile_path ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
            alt={person.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-text-tertiary text-xl">🎬</div>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors truncate">{person.name}</p>
        <p className="text-xs text-text-tertiary truncate">{person.known_for_department || "Actor"}</p>
        {person.known_for?.length > 0 && (
          <p className="text-xs text-text-tertiary/70 truncate mt-0.5">
            Known for: {person.known_for.slice(0, 2).map((k: any) => k.title || k.name).join(", ")}
          </p>
        )}
      </div>
    </a>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const router = useRouter();

  const [query, setQuery] = useState(q);
  const [activeType, setActiveType] = useState<MediaType>("movie");
  const debouncedQuery = useDebounce(query, 400);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults([]); return; }
    const fetchSearch = async () => {
      setLoading(true);
      try {
        const endpoint = TYPE_TABS.find(t => t.value === activeType)?.endpoint || "search/movie";
        const res = await fetch(`/api/tmdb/${endpoint}?query=${encodeURIComponent(debouncedQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch { console.error("Search failed"); }
      finally { setLoading(false); }
    };
    fetchSearch();
    router.replace(`/search?q=${encodeURIComponent(debouncedQuery)}`, { scroll: false });
  }, [debouncedQuery, activeType, router]);

  return (
    <div className="flex flex-col gap-8">
      {/* Search Input */}
      <div className="relative max-w-2xl w-full mx-auto">
        <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-accent/0 via-accent/15 to-accent/0 opacity-0 focus-within:opacity-100 transition-opacity duration-500 blur-sm" />
        <div className="relative flex items-center bg-bg-elevated border border-border focus-within:border-accent/40 rounded-xl transition-colors">
          <SearchIcon className="absolute left-4 w-5 h-5 text-text-tertiary" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${activeType === "movie" ? "movies" : activeType === "tv" ? "TV shows" : "people"}...`}
            className="w-full bg-transparent py-4 pl-12 pr-4 rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none text-base"
            autoFocus
          />
        </div>
      </div>

      {/* Type Tabs */}
      <div className="flex items-center gap-2 max-w-2xl w-full mx-auto">
        {TYPE_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeType === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => { setActiveType(tab.value); setResults([]); }}
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

      {/* Results */}
      <div className="flex flex-col gap-4">
        {query && (
          <div className="flex items-center justify-between max-w-2xl w-full mx-auto">
            <h1 className="text-xl font-display font-semibold text-text-primary">
              {loading ? "Searching..." : `Results for "${query}"`}
            </h1>
            {results.length > 0 && <span className="text-sm text-text-tertiary font-mono">{results.length} found</span>}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-bg-elevated animate-shimmer bg-[length:200%_100%] bg-[linear-gradient(110deg,var(--color-bg-elevated)_8%,var(--color-bg-surface)_18%,var(--color-bg-elevated)_33%)] rounded-lg" />
            ))}
          </div>
        ) : results.length > 0 ? (
          activeType === "person" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto w-full">
              {results.map((person) => <PersonCard key={person.id} person={person} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {results.map((item, i) => (
                <MovieCard key={item.id} movie={{ ...item, media_type: activeType }} index={i} />
              ))}
            </div>
          )
        ) : query ? (
          <div className="text-center py-20 text-text-tertiary">
            <p className="text-lg font-display">No {activeType === "person" ? "people" : activeType === "tv" ? "TV shows" : "movies"} found</p>
            <p className="text-sm mt-2">Try a different search term or switch tabs</p>
          </div>
        ) : (
          <div className="text-center py-20 text-text-tertiary">
            <SearchIcon className="w-8 h-8 mx-auto mb-4 opacity-30" />
            <p className="font-display text-lg">Start typing to search</p>
            <p className="text-sm mt-1">Find any movie, TV show, or person</p>
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
