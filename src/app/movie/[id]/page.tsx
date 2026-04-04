"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Clock, Calendar, Play, Bookmark, Heart, ExternalLink, Sparkles, ChevronRight } from "lucide-react";
import { img, GENRE_MAP } from "@/lib/tmdb";
import MovieCard from "@/components/ui/MovieCard";
import Carousel from "@/components/ui/Carousel";
import { DetailSkeleton } from "@/components/ui/Skeleton";
import { useWatchlist } from "@/context/WatchlistContext";

export default function MovieDetailPage() {
  const params = useParams();
  const movieId = params.id as string;

  const [movie, setMovie] = useState<any>(null);
  const [credits, setCredits] = useState<any>(null);
  const [videos, setVideos] = useState<any>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInsights, setShowInsights] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const { isInWatchlist, isInFavorites, toggleWatchlist, toggleFavorites } = useWatchlist();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [movieRes, creditsRes, videosRes, similarRes] = await Promise.all([
          fetch(`/api/tmdb/movie/${movieId}`),
          fetch(`/api/tmdb/movie/${movieId}/credits`),
          fetch(`/api/tmdb/movie/${movieId}/videos`),
          fetch(`/api/tmdb/movie/${movieId}/similar`),
        ]);

        const [m, c, v, s] = await Promise.all([
          movieRes.json(),
          creditsRes.json(),
          videosRes.json(),
          similarRes.json(),
        ]);

        setMovie(m);
        setCredits(c);
        setVideos(v);
        setSimilar(s.results || []);
      } catch (error) {
        console.error("Failed to fetch movie:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [movieId]);

  const fetchInsights = async () => {
    if (insights || insightsLoading || !movie) return;
    setInsightsLoading(true);

    // Check localStorage cache first
    const cacheKey = `kino-insights-${movieId}`;
    const cached = typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;
    if (cached) {
      try {
        setInsights(JSON.parse(cached));
        setInsightsLoading(false);
        return;
      } catch { /* ignore */ }
    }

    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: movie.title, overview: movie.overview }),
      });
      if (res.ok) {
        const data = await res.json();
        setInsights(data);
        localStorage.setItem(cacheKey, JSON.stringify(data));
      }
    } catch {
      console.error("Failed to fetch AI insights");
    } finally {
      setInsightsLoading(false);
    }
  };

  if (loading) return <DetailSkeleton />;
  if (!movie) return <div className="p-20 text-center text-text-primary font-display text-2xl">Movie not found</div>;

  const directors = credits?.crew?.filter((c: any) => c.job === "Director") || [];
  const cast = credits?.cast?.slice(0, 12) || [];
  const trailers = videos?.results?.filter((v: any) => v.site === "YouTube" && v.type === "Trailer") || [];
  const ratingColor = movie.vote_average >= 7 ? "text-rating-high" : movie.vote_average >= 5 ? "text-rating-mid" : "text-rating-low";

  return (
    <div className="flex flex-col">
      {/* ===== CINEMATIC HERO ===== */}
      <section className="relative w-full h-[50vh] md:h-[60vh] min-h-[400px] flex items-end">
        <div className="absolute inset-0 bg-bg-primary overflow-hidden">
          {movie.backdrop_path && (
            <motion.div
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.4, scale: 1 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0"
            >
              <Image
                src={img(movie.backdrop_path, "original")}
                alt=""
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/70 to-bg-primary/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/80 via-transparent to-transparent" />
        </div>
      </section>

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-7xl mx-auto w-full px-5 md:px-8 -mt-40 md:-mt-52 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:block w-[260px] lg:w-[300px] flex-shrink-0"
          >
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-card bg-bg-elevated border border-border/50">
              {movie.poster_path ? (
                <Image
                  src={img(movie.poster_path, "w500")}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center text-text-tertiary font-display italic">
                  No Poster
                </div>
              )}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex-1 flex flex-col gap-5 pt-4 md:pt-8"
          >
            {/* Title */}
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-text-primary tracking-tight leading-tight">
                {movie.title}
                {movie.release_date && (
                  <span className="text-text-tertiary font-normal text-xl md:text-2xl ml-3">
                    ({new Date(movie.release_date).getFullYear()})
                  </span>
                )}
              </h1>
              {movie.tagline && (
                <p className="text-text-tertiary italic text-base">&ldquo;{movie.tagline}&rdquo;</p>
              )}
            </div>

            {/* Meta pills */}
            <div className="flex flex-wrap items-center gap-3">
              {movie.vote_average > 0 && (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-bg-elevated border border-border font-mono text-sm font-bold ${ratingColor}`}>
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {movie.vote_average.toFixed(1)}
                  <span className="text-text-tertiary font-normal text-xs ml-1">({movie.vote_count?.toLocaleString()})</span>
                </div>
              )}
              {movie.runtime > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-bg-elevated border border-border text-sm text-text-secondary">
                  <Clock className="w-3.5 h-3.5 text-text-tertiary" />
                  {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                </div>
              )}
              {movie.release_date && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-bg-elevated border border-border text-sm text-text-secondary">
                  <Calendar className="w-3.5 h-3.5 text-text-tertiary" />
                  {new Date(movie.release_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </div>
              )}
            </div>

            {/* Genres */}
            {movie.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((g: any) => (
                  <Link
                    key={g.id}
                    href={`/explore/genre/${g.id}`}
                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-accent-muted text-accent border border-accent/20 hover:border-accent/40 transition-colors"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Overview */}
            <p className="text-text-secondary text-base leading-relaxed max-w-3xl">
              {movie.overview}
            </p>

            {/* Director */}
            {directors.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-text-tertiary">Directed by</span>
                {directors.map((d: any, i: number) => (
                  <span key={d.id}>
                    <Link href={`/person/${d.id}`} className="text-text-primary hover:text-accent transition-colors font-medium">
                      {d.name}
                    </Link>
                    {i < directors.length - 1 && <span className="text-text-tertiary">, </span>}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {trailers.length > 0 && (
                <a href="#trailers" className="btn-gold">
                  <Play className="w-4 h-4" />
                  Play Trailer
                </a>
              )}
              <button
                onClick={() => toggleWatchlist(movie)}
                className={`btn-ghost ${isInWatchlist(movie.id) ? "border-accent/50 text-accent" : ""}`}
              >
                <Bookmark className="w-4 h-4" fill={isInWatchlist(movie.id) ? "currentColor" : "none"} />
                {isInWatchlist(movie.id) ? "In Watchlist" : "Watchlist"}
              </button>
              <button
                onClick={() => toggleFavorites(movie)}
                className={`btn-ghost ${isInFavorites(movie.id) ? "border-red-500/50 text-red-400" : ""}`}
              >
                <Heart className="w-4 h-4" fill={isInFavorites(movie.id) ? "currentColor" : "none"} />
                {isInFavorites(movie.id) ? "Favorited" : "Favorite"}
              </button>
            </div>
          </motion.div>
        </div>

        {/* ===== CAST ===== */}
        {cast.length > 0 && (
          <section className="mt-16">
            <Carousel title="Top Cast">
              {cast.map((actor: any, i: number) => (
                <Link
                  key={actor.id}
                  href={`/person/${actor.id}`}
                  className="group flex flex-col gap-2.5 min-w-[120px] md:min-w-[140px] snap-start"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    className="relative aspect-[2/3] rounded-lg overflow-hidden bg-bg-elevated border border-border/50 group-hover:border-accent/30 transition-all"
                  >
                    {actor.profile_path ? (
                      <Image
                        src={img(actor.profile_path, "w300")}
                        alt={actor.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-text-tertiary text-xs text-center p-2 italic">
                        No Photo
                      </div>
                    )}
                  </motion.div>
                  <div className="px-0.5">
                    <p className="text-sm font-medium text-text-primary truncate group-hover:text-accent transition-colors">
                      {actor.name}
                    </p>
                    <p className="text-xs text-text-tertiary truncate">{actor.character}</p>
                  </div>
                </Link>
              ))}
            </Carousel>
          </section>
        )}

        {/* ===== TRAILERS ===== */}
        {trailers.length > 0 && (
          <section id="trailers" className="mt-16 scroll-mt-24">
            <h2 className="text-xl md:text-2xl font-display font-semibold text-text-primary mb-6">
              Trailers & Clips
            </h2>
            <div className="flex gap-5 overflow-x-auto hide-scrollbar pb-4">
              {trailers.slice(0, 4).map((video: any) => (
                <div key={video.id} className="min-w-[320px] md:min-w-[480px] flex-shrink-0">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-bg-elevated border border-border">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${video.key}`}
                      title={video.name}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="border-0"
                    />
                  </div>
                  <p className="mt-2 text-sm text-text-secondary truncate">{video.name}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== AI INSIGHTS ===== */}
        <section className="mt-16">
          <button
            onClick={() => {
              setShowInsights(!showInsights);
              if (!showInsights) fetchInsights();
            }}
            className="flex items-center gap-2.5 text-accent hover:text-accent-hover transition-colors group"
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-lg font-display font-semibold">AI Insights</span>
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${showInsights ? "rotate-90" : ""}`} />
          </button>

          {showInsights && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="mt-4 overflow-hidden"
            >
              {insightsLoading ? (
                <div className="p-8 bg-bg-elevated rounded-xl border border-border text-text-tertiary text-sm flex items-center gap-3">
                  <Sparkles className="w-4 h-4 animate-pulse-soft" />
                  Analyzing this film...
                </div>
              ) : insights ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 bg-bg-elevated rounded-xl border border-border">
                    <h3 className="text-xs font-mono text-accent uppercase tracking-wider mb-2">Why Watch</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{insights.why_watch}</p>
                  </div>
                  <div className="p-5 bg-bg-elevated rounded-xl border border-border">
                    <h3 className="text-xs font-mono text-accent uppercase tracking-wider mb-2">Perfect For</h3>
                    <div className="flex flex-wrap gap-2">
                      {insights.perfect_for?.map((s: string, i: number) => (
                        <span key={i} className="px-3 py-1 text-xs rounded-md bg-bg-surface text-text-secondary border border-border">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-5 bg-bg-elevated rounded-xl border border-border">
                    <h3 className="text-xs font-mono text-accent uppercase tracking-wider mb-2">Mood Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {insights.mood_tags?.map((tag: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 text-xs rounded-md bg-accent-muted text-accent border border-accent/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-5 bg-bg-elevated rounded-xl border border-border">
                    <h3 className="text-xs font-mono text-accent uppercase tracking-wider mb-2">If You Loved This</h3>
                    <div className="flex flex-col gap-2">
                      {insights.similar_picks?.map((pick: any, i: number) => (
                        <div key={i} className="text-sm">
                          <span className="text-text-primary font-medium">{pick.title}</span>
                          <span className="ml-2 text-text-tertiary">— {pick.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-bg-elevated rounded-xl border border-border text-text-tertiary text-sm">
                  Failed to load insights. Please try again.
                </div>
              )}
            </motion.div>
          )}
        </section>

        {/* ===== SIMILAR ===== */}
        {similar.length > 0 && (
          <section className="mt-16 mb-16">
            <Carousel title="Similar Films" subtitle="Movies you might also enjoy">
              {similar.map((m: any, i: number) => (
                <MovieCard key={m.id} movie={m} index={i} />
              ))}
            </Carousel>
          </section>
        )}
      </div>
    </div>
  );
}
