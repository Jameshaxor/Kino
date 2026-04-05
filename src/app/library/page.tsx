"use client";

import { useWatchlist } from "@/context/WatchlistContext";
import MovieCard from "@/components/ui/MovieCard";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Heart, AlertCircle, Compass, Sparkles, Loader2, Star, BarChart3, Zap, Film, Tv } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import AuthModal from "@/components/ui/AuthModal";
import { useState, useMemo } from "react";
import { img, GENRE_MAP } from "@/lib/tmdb";
import ShareButton from "@/components/ui/ShareButton";

// ═══════════════════════════════════════
// TASTE PROFILE STATS COMPONENT
// ═══════════════════════════════════════

const TASTE_LABELS: Record<number, string> = {
  28: "Action Enthusiast", 12: "Adventure Seeker", 16: "Animation Lover", 35: "Comedy Fan",
  80: "Crime Buff", 99: "Docu Connoisseur", 18: "Drama Devotee", 10751: "Family Watcher",
  14: "Fantasy Dreamer", 36: "History Buff", 27: "Horror Addict", 10402: "Music Lover",
  9648: "Mystery Sleuth", 10749: "Romance Enthusiast", 878: "Sci-Fi Explorer", 53: "Thriller Junkie",
  10752: "War Film Fan", 37: "Western Trailblazer", 10770: "TV Movie Viewer",
};

function TasteProfile({ watchlist, favorites }: { watchlist: any[]; favorites: any[] }) {
  const stats = useMemo(() => {
    const all = [...favorites, ...watchlist];
    if (all.length === 0) return null;

    // Genre counts
    const genreCounts: Record<number, number> = {};
    all.forEach((item) => {
      const ids = item.genres ? item.genres.map((g: any) => g.id) : (item.genre_ids || []);
      ids.forEach((id: number) => {
        genreCounts[id] = (genreCounts[id] || 0) + 1;
      });
    });

    const sortedGenres = Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const maxCount = sortedGenres.length > 0 ? sortedGenres[0][1] : 1;

    // Decade distribution
    const decades: Record<string, number> = {};
    all.forEach((item) => {
      const date = item.release_date || item.first_air_date;
      if (date) {
        const decade = `${Math.floor(new Date(date).getFullYear() / 10) * 10}s`;
        decades[decade] = (decades[decade] || 0) + 1;
      }
    });
    const sortedDecades = Object.entries(decades).sort(([a], [b]) => b.localeCompare(a)).slice(0, 4);

    // Average rating
    const ratings = all.filter((m) => m.vote_average > 0).map((m) => m.vote_average);
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

    // Taste tags
    const tasteTags = sortedGenres.slice(0, 3).map(([id]) => TASTE_LABELS[Number(id)] || GENRE_MAP[Number(id)] || "Cinephile");

    // Media type split
    const movies = all.filter((m) => m.media_type !== "tv").length;
    const tvShows = all.filter((m) => m.media_type === "tv").length;

    return { sortedGenres, maxCount, sortedDecades, avgRating, tasteTags, total: all.length, movies, tvShows };
  }, [watchlist, favorites]);

  if (!stats || stats.total < 2) return null;

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-display font-semibold text-text-primary">Your Taste Profile</h2>
        </div>
        <ShareButton type="taste" items={favorites.slice(0, 5)} subtitle={stats.tasteTags.join(" · ")} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Summary Card */}
        <div className="bg-bg-elevated border border-border rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-text-tertiary uppercase tracking-wider">Collection</span>
            <span className="text-2xl font-display font-bold text-text-primary">{stats.total}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-text-secondary">
            <span className="flex items-center gap-1.5"><Film className="w-3.5 h-3.5 text-text-tertiary" /> {stats.movies} Movies</span>
            <span className="flex items-center gap-1.5"><Tv className="w-3.5 h-3.5 text-text-tertiary" /> {stats.tvShows} TV</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Star className="w-4 h-4 text-rating-high fill-current" />
            <span className="text-sm text-text-primary font-medium">{stats.avgRating.toFixed(1)}</span>
            <span className="text-xs text-text-tertiary">avg rating</span>
          </div>
          {/* Taste tags */}
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {stats.tasteTags.map((tag) => (
              <span key={tag} className="text-[11px] px-2.5 py-1 rounded-md bg-accent-muted text-accent border border-accent/20 font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Genre Breakdown */}
        <div className="bg-bg-elevated border border-border rounded-xl p-5 flex flex-col gap-3">
          <span className="text-xs font-mono text-text-tertiary uppercase tracking-wider">Top Genres</span>
          {stats.sortedGenres.length > 0 ? (
            <div className="flex flex-col gap-2.5 mt-1">
              {stats.sortedGenres.map(([id, count]) => (
                <div key={id} className="flex items-center gap-3">
                  <span className="text-xs text-text-secondary w-20 truncate">{GENRE_MAP[Number(id)] || "Other"}</span>
                  <div className="flex-1 h-2 bg-bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent/60 to-accent rounded-full transition-all duration-700"
                      style={{ width: `${(count / stats.maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-text-tertiary w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="my-auto text-center flex flex-col items-center gap-2">
              <span className="text-xs text-text-tertiary">Not enough genre data.</span>
              <span className="text-[10px] text-text-secondary/50 max-w-[150px]">Re-save older titles to refresh your cache.</span>
            </div>
          )}
        </div>

        {/* Decade Distribution */}
        <div className="bg-bg-elevated border border-border rounded-xl p-5 flex flex-col gap-3">
          <span className="text-xs font-mono text-text-tertiary uppercase tracking-wider">By Decade</span>
          <div className="flex items-end gap-3 mt-auto h-24">
            {stats.sortedDecades.map(([decade, count]) => {
              const maxD = Math.max(...stats.sortedDecades.map(([, c]) => c));
              return (
                <div key={decade} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-mono text-text-tertiary">{count}</span>
                  <div
                    className="w-full bg-gradient-to-t from-accent/40 to-accent/80 rounded-t-md transition-all duration-700"
                    style={{ height: `${(count / maxD) * 100}%`, minHeight: "8px" }}
                  />
                  <span className="text-[10px] font-mono text-text-secondary">{decade}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════
// AI PERSONAL RECOMMENDATIONS
// ═══════════════════════════════════════

function PersonalizedPicks({ favorites }: { favorites: any[] }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  const fetchPicks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/personalized", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorites }),
      });
      if (!res.ok) throw new Error("Failed to generate");
      const result = await res.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (favorites.length < 2) return null;

  return (
    <section className="mb-16">
      {!data && !loading && (
        <button
          onClick={fetchPicks}
          className="w-full group relative overflow-hidden rounded-xl border border-accent/10 p-6 md:p-8 hover:border-accent/25 transition-all duration-500"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.06)_0%,transparent_60%)] group-hover:bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.12)_0%,transparent_60%)] transition-all duration-500" />
          <div className="absolute inset-0 bg-bg-elevated" style={{ zIndex: -1 }} />
          <div className="relative flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div className="text-left">
              <h3 className="font-display font-semibold text-text-primary text-lg group-hover:text-accent transition-colors">
                Get Personalized Picks
              </h3>
              <p className="text-sm text-text-tertiary mt-0.5">
                AI-curated recommendations based on your {favorites.length} favorites
              </p>
            </div>
            <Zap className="w-5 h-5 text-accent ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </button>
      )}

      {loading && (
        <div className="rounded-xl border border-accent/10 bg-bg-elevated p-10 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-accent animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-sm font-display text-text-primary">Analyzing your taste...</p>
            <p className="text-xs text-text-tertiary mt-1">This usually takes 3–5 seconds</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm text-center">
          {error}
        </div>
      )}

      <AnimatePresence>
        {data && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {/* Taste profile summary */}
            {data.taste_profile && (
              <div className="relative p-5 rounded-xl bg-bg-elevated border border-accent/10 overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-base font-display text-text-primary italic leading-relaxed">
                      &ldquo;{data.taste_profile}&rdquo;
                    </p>
                    {data.taste_tags && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {data.taste_tags.map((tag: string) => (
                          <span key={tag} className="text-[11px] px-2.5 py-1 rounded-md bg-accent-muted text-accent border border-accent/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Recommendation cards */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-mono text-text-tertiary uppercase tracking-[0.15em]">Your Personal Picks</span>
              {data.recommendations?.map((rec: any, i: number) => (
                <motion.div
                  key={rec.id || i}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={rec.id ? `/${rec.media_type === "tv" ? "tv" : "movie"}/${rec.id}` : "#"}
                    className="card-premium flex gap-4 p-4 group"
                  >
                    <div className="w-[70px] aspect-[2/3] rounded-lg overflow-hidden bg-bg-surface flex-shrink-0">
                      {rec.poster_path ? (
                        <Image src={img(rec.poster_path, "w200")} alt={rec.title} width={70} height={105} className="object-cover w-full h-full" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-text-tertiary text-xs italic p-2 text-center">{rec.title}</div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5 py-0.5 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-display font-semibold text-text-primary group-hover:text-accent transition-colors truncate">{rec.title}</h3>
                          <span className="text-xs font-mono text-text-tertiary">{rec.year}</span>
                        </div>
                        <span className="px-2.5 py-1 text-xs font-mono font-bold text-rating-high bg-rating-high/10 border border-rating-high/20 rounded-md flex-shrink-0">
                          {rec.vibe_match}%
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">{rec.pitch}</p>
                      <div className="flex flex-wrap gap-1 mt-auto">
                        {rec.mood_tags?.map((tag: string) => (
                          <span key={tag} className="text-[10px] text-accent/70 bg-accent-muted px-2 py-0.5 rounded-md border border-accent/10">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Refresh button */}
            <div className="flex justify-center">
              <button onClick={fetchPicks} className="btn-ghost text-sm">
                <Sparkles className="w-4 h-4" /> Regenerate Picks
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ═══════════════════════════════════════
// MAIN LIBRARY PAGE
// ═══════════════════════════════════════

export default function LibraryPage() {
  const { user, watchlist, favorites } = useWatchlist();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-medium text-white mb-4">My Library</h1>
          {user ? (
            <p className="text-text-secondary text-lg">Your collection, securely synced across all your devices.</p>
          ) : (
            <div className="bg-bg-elevated/50 border border-accent/20 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 justify-between max-w-3xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <p className="text-sm text-text-secondary">
                  You are currently viewing a temporary local library. <br className="hidden sm:block" />
                  <span className="text-text-primary">Sign in to permanently save and sync your titles.</span>
                </p>
              </div>
              <button 
                onClick={() => setAuthModalOpen(true)}
                className="whitespace-nowrap px-4 py-2 bg-white text-black font-semibold text-sm rounded-lg hover:bg-white/90 transition-colors"
              >
                Sign In
              </button>
            </div>
          )}
        </header>

        {watchlist.length === 0 && favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-bg-surface border border-border rounded-2xl border-dashed">
            <div className="w-16 h-16 bg-bg-elevated rounded-full flex items-center justify-center mb-4">
              <Compass className="w-8 h-8 text-text-tertiary" />
            </div>
            <h2 className="text-2xl font-display font-medium text-white mb-2">Your library is empty</h2>
            <p className="text-text-secondary max-w-md mb-8">
              You haven't saved any titles yet. Explore our catalog and click the heart or bookmark icons to start building your collection.
            </p>
            <Link 
              href="/browse"
              className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-colors"
            >
              Discover Content
            </Link>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* AI Features & Stats (Require Auth) */}
            {user && (
              <>
                <TasteProfile watchlist={watchlist} favorites={favorites} />
                <PersonalizedPicks favorites={favorites} />
              </>
            )}

            {/* Favorites Section */}
            {favorites.length > 0 && (
              <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <Heart className="w-6 h-6 text-red-500 fill-red-500/20" />
                  <h2 className="text-2xl font-display font-medium text-white">Favorites <span className="text-text-tertiary text-lg font-normal ml-2">({favorites.length})</span></h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
                  {favorites.map((movie, index) => (
                    <MovieCard key={`fav-${movie.id}`} movie={movie as any} index={index} />
                  ))}
                </div>
              </section>
            )}

            {/* Watchlist Section */}
            {watchlist.length > 0 && (
              <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <Bookmark className="w-6 h-6 text-accent fill-accent/20" />
                  <h2 className="text-2xl font-display font-medium text-white">Watchlist <span className="text-text-tertiary text-lg font-normal ml-2">({watchlist.length})</span></h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
                  {watchlist.map((movie, index) => (
                    <MovieCard key={`wl-${movie.id}`} movie={movie as any} index={index} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </main>
  );
}
