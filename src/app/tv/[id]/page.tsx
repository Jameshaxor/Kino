"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Clock, Calendar, Play, Bookmark, Heart, ExternalLink, Sparkles, ChevronRight, Tv } from "lucide-react";
import { img } from "@/lib/tmdb";
import MovieCard from "@/components/ui/MovieCard";
import Carousel from "@/components/ui/Carousel";
import WatchProviders from "@/components/ui/WatchProviders";
import { DetailSkeleton } from "@/components/ui/Skeleton";
import { useWatchlist } from "@/context/WatchlistContext";
import ShareButton from "@/components/ui/ShareButton";

export default function TVDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const tvId = resolvedParams.id;

  const [tvShow, setTvShow] = useState<any>(null);
  const [credits, setCredits] = useState<any>(null);
  const [videos, setVideos] = useState<any>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [allProviders, setAllProviders] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInsights, setShowInsights] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const { isInWatchlist, isInFavorites, toggleWatchlist, toggleFavorites } = useWatchlist();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tvRes, creditsRes, videosRes, similarRes, providersRes] = await Promise.all([
          fetch(`/api/tmdb/tv/${tvId}`),
          fetch(`/api/tmdb/tv/${tvId}/credits`),
          fetch(`/api/tmdb/tv/${tvId}/videos`),
          fetch(`/api/tmdb/tv/${tvId}/recommendations`),
          fetch(`/api/tmdb/tv/${tvId}/watch/providers`),
        ]);

        const [t, c, v, s, wp] = await Promise.all([
          tvRes.json(),
          creditsRes.json(),
          videosRes.json(),
          similarRes.json(),
          providersRes.json(),
        ]);

        // Inject media_type so context knows how to route it
        t.media_type = "tv";

        setTvShow(t);
        setCredits(c);
        setVideos(v);
        // Ensure similar shows also get tagged as "tv"
        const finalSimilar = (s.results || []).map((show: any) => ({ ...show, media_type: "tv" }));
        setSimilar(finalSimilar);
        
        setAllProviders(wp?.results || null);
      } catch (error) {
        console.error("Failed to fetch tv show:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tvId]);

  const fetchInsights = async () => {
    if (insights || insightsLoading || !tvShow) return;
    setInsightsLoading(true);

    const cacheKey = `kino-insights-tv-${tvId}`;
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
        body: JSON.stringify({ title: tvShow.name, overview: tvShow.overview }),
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
  if (!tvShow || tvShow.success === false) return <div className="p-20 text-center text-text-primary font-display text-2xl">TV Show not found</div>;

  const creators = tvShow.created_by || [];
  const cast = credits?.cast?.slice(0, 12) || [];
  const trailers = videos?.results?.filter((v: any) => v.site === "YouTube" && v.type === "Trailer") || [];
  const ratingColor = tvShow.vote_average >= 7 ? "text-rating-high" : tvShow.vote_average >= 5 ? "text-rating-mid" : "text-rating-low";

  return (
    <div className="flex flex-col relative min-h-screen">
      {/* ===== AMBIENT COLOR BLEED ===== */}
      {tvShow.poster_path && (
        <div className="absolute top-0 left-0 w-full h-[120vh] pointer-events-none overflow-hidden -z-10 opacity-[0.12] mix-blend-screen">
          <Image
            src={img(tvShow.poster_path, "w500")}
            alt=""
            fill
            className="object-cover blur-[120px] scale-150 -translate-y-20 origin-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-primary/50 to-bg-primary" />
        </div>
      )}
      {/* ===== CINEMATIC HERO ===== */}
      <section className="relative w-full h-[50vh] md:h-[60vh] min-h-[400px] flex items-end">
        <div className="absolute inset-0 bg-bg-primary overflow-hidden">
          {tvShow.backdrop_path && (
            <motion.div
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.4, scale: 1 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0"
            >
              <Image
                src={img(tvShow.backdrop_path, "original")}
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
              {tvShow.poster_path ? (
                <Image
                  src={img(tvShow.poster_path, "w500")}
                  alt={tvShow.name}
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
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-bg-surface text-text-secondary border border-border rounded text-[10px] font-mono uppercase tracking-widest">
                  Series
                </span>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-text-primary tracking-tight leading-tight">
                  {tvShow.name}
                  {tvShow.first_air_date && (
                    <span className="text-text-tertiary font-normal text-xl md:text-2xl ml-3">
                      ({new Date(tvShow.first_air_date).getFullYear()})
                    </span>
                  )}
                </h1>
              </div>
              {tvShow.tagline && (
                <p className="text-text-tertiary italic text-base">&ldquo;{tvShow.tagline}&rdquo;</p>
              )}
            </div>

            {/* Meta pills */}
            <div className="flex flex-wrap items-center gap-3">
              {tvShow.vote_average > 0 && (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-bg-elevated border border-border font-mono text-sm font-bold ${ratingColor}`}>
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {tvShow.vote_average.toFixed(1)}
                  <span className="text-text-tertiary font-normal text-xs ml-1">({tvShow.vote_count?.toLocaleString()} votes)</span>
                </div>
              )}
              {tvShow.number_of_seasons > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-bg-elevated border border-border text-sm text-text-secondary">
                  <Tv className="w-3.5 h-3.5 text-text-tertiary" />
                  {tvShow.number_of_seasons} Season{tvShow.number_of_seasons > 1 ? "s" : ""}
                </div>
              )}
              {tvShow.first_air_date && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-bg-elevated border border-border text-sm text-text-secondary">
                  <Calendar className="w-3.5 h-3.5 text-text-tertiary" />
                  {new Date(tvShow.first_air_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </div>
              )}
            </div>

            {/* Genres */}
            {tvShow.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tvShow.genres.map((g: any) => (
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
              {tvShow.overview}
            </p>

            {/* Creators */}
            {creators.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-text-tertiary">Created by</span>
                {creators.map((c: any, i: number) => (
                  <span key={c.id}>
                    <Link href={`/person/${c.id}`} className="text-text-primary hover:text-accent transition-colors font-medium">
                      {c.name}
                    </Link>
                    {i < creators.length - 1 && <span className="text-text-tertiary">, </span>}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {trailers.length > 0 && (
                <a href="#trailers" className="btn-gold">
                  <Play className="w-4 h-4" />
                  Watch Trailer
                </a>
              )}
              <button
                onClick={() => toggleWatchlist(tvShow)}
                className={`btn-ghost ${isInWatchlist(tvShow.id) ? "border-accent/50 text-accent" : ""}`}
              >
                <Bookmark className="w-4 h-4" fill={isInWatchlist(tvShow.id) ? "currentColor" : "none"} />
                {isInWatchlist(tvShow.id) ? "In Watchlist" : "Watchlist"}
              </button>
              <button
                onClick={() => toggleFavorites(tvShow)}
                className={`btn-ghost ${isInFavorites(tvShow.id) ? "border-red-500/50 text-red-400" : ""}`}
              >
                <Heart className="w-4 h-4" fill={isInFavorites(tvShow.id) ? "currentColor" : "none"} />
                {isInFavorites(tvShow.id) ? "Favorited" : "Favorite"}
              </button>
              <ShareButton
                type="movie"
                items={[{ title: tvShow.name, year: tvShow.first_air_date ? parseInt(tvShow.first_air_date) : undefined, poster_path: tvShow.poster_path }]}
              />
            </div>
          </motion.div>
        </div>

        {/* ===== WHERE TO WATCH ===== */}
        <section className="mt-12">
          <WatchProviders allProviders={allProviders} />
        </section>

        {/* ===== CAST ===== */}
        {cast.length > 0 && (
          <section className="mt-16">
            <Carousel title="Series Cast">
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
                  Analyzing this series...
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
            <Carousel title="Similar Shows" subtitle="Series you might also enjoy">
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
