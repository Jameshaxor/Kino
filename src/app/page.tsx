"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Sparkles, ArrowRight, Shuffle, Star, TrendingUp, Clock, Award } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { img, GENRE_LIST } from "@/lib/tmdb";
import MovieCard from "@/components/ui/MovieCard";
import Carousel from "@/components/ui/Carousel";
import { CarouselSkeleton } from "@/components/ui/Skeleton";

interface MovieData {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
  vote_count?: number;
  genre_ids?: number[];
}

export default function HomePage() {
  const [trending, setTrending] = useState<MovieData[]>([]);
  const [topRated, setTopRated] = useState<MovieData[]>([]);
  const [nowPlaying, setNowPlaying] = useState<MovieData[]>([]);
  const [upcoming, setUpcoming] = useState<MovieData[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const today = new Date();
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + 1);
        const dateStr = futureDate.toISOString().split('T')[0];

        const [trendingRes, topRatedRes, nowPlayingRes, upcomingRes] = await Promise.all([
          fetch("/api/tmdb/trending/movie/week"),
          fetch("/api/tmdb/movie/top_rated"),
          fetch("/api/tmdb/movie/now_playing"),
          fetch(`/api/tmdb/discover/movie?primary_release_date.gte=${dateStr}&sort_by=popularity.desc`),
        ]);
        const [t, tr, np, u] = await Promise.all([
          trendingRes.json(), topRatedRes.json(), nowPlayingRes.json(), upcomingRes.json(),
        ]);
        setTrending(t.results || []);
        setTopRated(tr.results || []);
        setNowPlaying(np.results || []);
        setUpcoming(u.results || []);
      } catch (error) {
        console.error("Failed to fetch movies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (trending.length < 2) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % Math.min(trending.length, 5));
    }, 7000);
    return () => clearInterval(interval);
  }, [trending]);

  const hero = trending[heroIndex];

  return (
    <div className="flex flex-col">
      {/* ═══════════ CINEMATIC HERO ═══════════ */}
      {hero ? (
        <section className="relative w-full h-[75vh] md:h-[92vh] min-h-[500px] md:min-h-[650px] flex items-end overflow-hidden">
          {/* Ken Burns animated backdrop */}
          <AnimatePresence mode="wait">
            <motion.div
              key={hero.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0"
            >
              {hero.backdrop_path && (
                <div className="absolute inset-0 hero-image animate-[ken-burns_20s_ease-in-out_infinite_alternate] md:animate-[ken-burns_20s_ease-in-out_infinite_alternate]">
                  <Image
                    src={img(hero.backdrop_path, "original")}
                    alt=""
                    fill
                    className="object-cover"
                    priority
                    quality={90}
                  />
                </div>
              )}
              {/* Multi-layer cinematic gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-primary/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-bg-primary to-transparent" />
              {/* Subtle gold vignette */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(212,168,67,0.06)_0%,transparent_50%)]" />
            </motion.div>
          </AnimatePresence>

          {/* Hero content */}
          <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 w-full pb-20 md:pb-28">
            <AnimatePresence mode="wait">
              <motion.div
                key={hero.id + "-content"}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-2xl flex flex-col gap-6"
              >
                {/* Category badge */}
                <div className="flex items-center gap-3">
                  <div className="glow-dot" />
                  <span className="text-xs font-mono text-accent uppercase tracking-[0.2em] font-medium">
                    Trending #{heroIndex + 1}
                  </span>
                  <div className="section-line" />
                </div>

                {/* Title */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-text-primary leading-[0.95] tracking-tight">
                  {hero.title}
                </h1>

                {/* Overview */}
                <p className="text-base md:text-lg text-text-secondary/80 leading-relaxed max-w-xl line-clamp-2">
                  {hero.overview}
                </p>

                {/* Meta row */}
                <div className="flex items-center gap-5">
                  {/* Rating ring */}
                  <div className="flex items-center gap-2.5">
                    <div className="rating-ring">
                      <svg viewBox="0 0 36 36">
                        <circle className="bg-circle" cx="18" cy="18" r="15.9" />
                        <circle
                          className="progress-circle"
                          cx="18" cy="18" r="15.9"
                          stroke={hero.vote_average >= 7 ? "#4DB87E" : hero.vote_average >= 5 ? "#D4A843" : "#E54D4D"}
                          strokeDasharray={`${hero.vote_average * 10} 100`}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-text-primary">
                        {hero.vote_average?.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-text-tertiary font-mono uppercase tracking-wider">Rating</span>
                      <span className="text-sm text-text-primary font-medium">TMDB</span>
                    </div>
                  </div>

                  <div className="w-px h-8 bg-border" />

                  <div className="flex flex-col">
                    <span className="text-xs text-text-tertiary font-mono uppercase tracking-wider">Year</span>
                    <span className="text-sm text-text-primary font-medium">
                      {hero.release_date && new Date(hero.release_date).getFullYear()}
                    </span>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex items-center gap-3 mt-2">
                  <Link href={`/movie/${hero.id}`} className="btn-gold">
                    <Play className="w-4 h-4" />
                    Discover More
                  </Link>
                  <Link href="/ai" className="btn-ghost">
                    <Sparkles className="w-4 h-4" />
                    Ask AI Oracle
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Hero navigation dots */}
            <div className="flex items-center gap-2.5 mt-10">
              {trending.slice(0, 5).map((movie, i) => (
                <button
                  key={movie.id}
                  onClick={() => setHeroIndex(i)}
                  className="group flex items-center gap-2"
                >
                  <div className={`h-0.5 rounded-full transition-all duration-700 ${
                    i === heroIndex ? "w-12 bg-accent" : "w-3 bg-text-tertiary/30 group-hover:bg-text-tertiary/60 group-hover:w-5"
                  }`} />
                  {i === heroIndex && (
                    <motion.span
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-[10px] font-mono text-accent/60 hidden md:inline"
                    >
                      {movie.title.length > 20 ? movie.title.slice(0, 20) + "..." : movie.title}
                    </motion.span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Floating poster (desktop) */}
          {hero.poster_path && (
            <motion.div
              key={hero.id + "-poster"}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="hidden lg:block absolute right-12 xl:right-24 bottom-28 z-10"
            >
              <div className="relative w-[200px] xl:w-[240px] aspect-[2/3] rounded-xl overflow-hidden shadow-card-hover border border-white/5">
                <Image
                  src={img(hero.poster_path, "w500")}
                  alt={hero.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            </motion.div>
          )}
        </section>
      ) : loading ? (
        <div className="w-full h-[75vh] md:h-[92vh] bg-bg-primary" />
      ) : null}

      {/* ═══════════ DISCOVERY FEED ═══════════ */}
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-20 py-4">

        {/* ── Genre Quick Nav ── */}
        <section className="px-5 md:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="section-line" />
            <h2 className="text-sm font-mono text-accent uppercase tracking-[0.15em]">Browse Genres</h2>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {GENRE_LIST.slice(0, 12).map((genre, i) => (
              <motion.div
                key={genre.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  href={`/explore/genre/${genre.id}`}
                  className="px-4 py-2.5 rounded-lg bg-bg-elevated border border-border text-sm text-text-secondary hover:text-accent hover:border-accent/30 hover:bg-accent-muted hover:shadow-gold transition-all duration-300"
                >
                  {genre.name}
                </Link>
              </motion.div>
            ))}
            <Link
              href="/explore"
              className="px-4 py-2.5 rounded-lg text-sm text-accent hover:text-accent-hover transition-colors flex items-center gap-1.5 font-medium"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* ── Trending ── */}
        <section className="px-5 md:px-8">
          {loading ? <CarouselSkeleton /> : (
            <Carousel
              title="Trending Now"
              subtitle="What the world is watching this week"
              icon={<TrendingUp className="w-5 h-5 text-accent" />}
            >
              {trending.slice(1).map((movie, i) => (
                <MovieCard key={movie.id} movie={movie} index={i} size="large" />
              ))}
            </Carousel>
          )}
        </section>

        {/* ── Staff Picks / Top 5 ── */}
        {!loading && topRated.length > 0 && (
          <section className="px-5 md:px-8">
            <div className="flex items-center gap-3 mb-8">
              <Award className="w-5 h-5 text-accent" />
              <h2 className="text-xl md:text-2xl font-display font-semibold text-text-primary">
                All-Time Greats
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topRated.slice(0, 6).map((movie, i) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link
                    href={`/movie/${movie.id}`}
                    className="card-premium flex gap-4 p-4 group"
                  >
                    {/* Rank number */}
                    <div className="flex-shrink-0 w-8 flex items-start justify-center pt-1">
                      <span className="text-2xl font-display font-bold text-gradient-gold">
                        {i + 1}
                      </span>
                    </div>

                    {/* Poster */}
                    <div className="w-16 aspect-[2/3] rounded-lg overflow-hidden bg-bg-surface flex-shrink-0">
                      {movie.poster_path && (
                        <Image
                          src={img(movie.poster_path, "w200")}
                          alt={movie.title}
                          width={64}
                          height={96}
                          className="object-cover w-full h-full"
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col gap-1 py-0.5 min-w-0">
                      <h3 className="font-display font-semibold text-text-primary text-base group-hover:text-accent transition-colors truncate">
                        {movie.title}
                      </h3>
                      <div className="flex items-center gap-2.5 text-xs">
                        <span className="font-mono text-rating-high font-bold flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          {movie.vote_average.toFixed(1)}
                        </span>
                        <span className="text-text-tertiary">
                          {movie.release_date && new Date(movie.release_date).getFullYear()}
                        </span>
                      </div>
                      <p className="text-xs text-text-tertiary line-clamp-2 mt-0.5 leading-relaxed">
                        {movie.overview}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ── Now Playing ── */}
        <section className="px-5 md:px-8">
          {loading ? <CarouselSkeleton /> : (
            <Carousel
              title="In Theaters Now"
              subtitle="Currently showing on the big screen"
              icon={<Clock className="w-5 h-5 text-accent" />}
            >
              {nowPlaying.map((movie, i) => (
                <MovieCard key={movie.id} movie={movie} index={i} />
              ))}
            </Carousel>
          )}
        </section>

        {/* ── AI CTA Banner ── */}
        <section className="px-5 md:px-8">
          <Link href="/ai">
            <div className="relative overflow-hidden rounded-2xl border border-accent/10 p-8 md:p-14 group transition-all duration-700 hover:border-accent/25">
              {/* Animated gradient bg */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,168,67,0.08)_0%,transparent_60%)] group-hover:bg-[radial-gradient(ellipse_at_top_right,rgba(212,168,67,0.15)_0%,transparent_60%)] transition-all duration-700" />
              <div className="absolute inset-0 bg-bg-elevated" style={{ zIndex: -1 }} />

              <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-accent" />
                    </div>
                    <span className="text-xs font-mono text-accent uppercase tracking-[0.2em]">Gemini-Powered</span>
                  </div>
                  <h2 className="text-2xl md:text-4xl font-display font-bold text-text-primary leading-tight">
                    Describe a vibe.<br />
                    <span className="text-gradient-gold">Get perfect picks.</span>
                  </h2>
                  <p className="text-text-secondary max-w-lg text-base">
                    &ldquo;A cozy rainy Sunday film that&apos;ll gently ruin me emotionally&rdquo; — yeah, we got you.
                  </p>
                </div>
                <div className="btn-gold flex-shrink-0 text-base px-8 py-4">
                  Try AI Oracle
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </Link>
        </section>

        {/* ── Coming Soon ── */}
        <section className="px-5 md:px-8">
          {loading ? <CarouselSkeleton /> : (
            <Carousel title="Coming Soon" subtitle="Upcoming releases worth waiting for">
              {upcoming.map((movie, i) => (
                <MovieCard key={movie.id} movie={movie} index={i} />
              ))}
            </Carousel>
          )}
        </section>

        {/* ── Surprise Me ── */}
        <section className="px-5 md:px-8 flex justify-center pb-8">
          <SurpriseMe />
        </section>
      </div>
    </div>
  );
}

function SurpriseMe() {
  const [movie, setMovie] = useState<MovieData | null>(null);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const fetchRandom = async () => {
    setLoading(true);
    setRevealed(false);
    try {
      const page = Math.floor(Math.random() * 20) + 1;
      const res = await fetch(`/api/tmdb/discover/movie?sort_by=vote_average.desc&vote_count.gte=1000&page=${page}`);
      const data = await res.json();
      const movies = data.results || [];
      const pick = movies[Math.floor(Math.random() * movies.length)];
      if (pick) {
        setMovie(pick);
        setTimeout(() => setRevealed(true), 200);
      }
    } catch {
      console.error("Surprise me failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg">
      <div className="flex flex-col items-center gap-2">
        <div className="section-line mx-auto" />
        <span className="text-xs font-mono text-text-tertiary uppercase tracking-[0.15em]">Feeling adventurous?</span>
      </div>
      <button onClick={fetchRandom} disabled={loading} className="btn-ghost gap-2.5 text-base px-8 py-3.5">
        <Shuffle className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Finding a gem..." : "Surprise Me"}
      </button>

      <AnimatePresence>
        {movie && revealed && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href={`/movie/${movie.id}`}
              className="card-premium flex gap-4 p-5 max-w-md group"
            >
              <div className="w-20 aspect-[2/3] rounded-lg overflow-hidden bg-bg-surface flex-shrink-0">
                {movie.poster_path && (
                  <Image src={img(movie.poster_path, "w200")} alt={movie.title}
                    width={80} height={120} className="object-cover w-full h-full" />
                )}
              </div>
              <div className="flex flex-col gap-1.5 py-1">
                <h3 className="font-display font-semibold text-text-primary group-hover:text-accent transition-colors">
                  {movie.title}
                </h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-rating-high font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />{movie.vote_average?.toFixed(1)}
                  </span>
                  <span className="text-text-tertiary">·</span>
                  <span className="text-text-tertiary">{movie.release_date && new Date(movie.release_date).getFullYear()}</span>
                </div>
                <p className="text-xs text-text-tertiary line-clamp-2 mt-1">{movie.overview}</p>
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
