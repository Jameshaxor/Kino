"use client";

import Image from "next/image";
import Link from "next/link";
import { img } from "@/lib/tmdb";
import { Star, Bookmark, Heart } from "lucide-react";
import { useWatchlist } from "@/context/WatchlistContext";

export interface MovieCardMovie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
  genre_ids?: number[];
  overview?: string;
  vote_count?: number;
}

interface MovieCardProps {
  movie: MovieCardMovie;
  index?: number;
  size?: "default" | "large";
}

export default function MovieCard({ movie, index = 0, size = "default" }: MovieCardProps) {
  const { isInWatchlist, isInFavorites, toggleWatchlist, toggleFavorites } = useWatchlist();

  const inWatchlist = isInWatchlist(movie.id);
  const inFavorites = isInFavorites(movie.id);

  const ratingColor =
    movie.vote_average >= 7 ? "text-rating-high" : movie.vote_average >= 5 ? "text-rating-mid" : "text-rating-low";

  const displayTitle = movie.title || movie.name;
  const displayDate = movie.release_date || movie.first_air_date;
  const targetRoute = movie.media_type === "tv" || movie.name ? `/tv/${movie.id}` : `/movie/${movie.id}`;

  return (
    <div
      className={`group relative flex flex-col gap-3 snap-start select-none active:scale-[0.98] transition-transform duration-200 ${
        size === "large" ? "min-w-[200px] md:min-w-[240px]" : "min-w-[150px] md:min-w-[185px]"
      }`}
      style={{ WebkitTouchCallout: 'none' }}
    >
      <Link href={targetRoute} className="block outline-none" prefetch={false}>
        <div className="relative overflow-hidden rounded-xl bg-bg-elevated shadow-card transition-all duration-500 group-hover:shadow-card-hover md:group-hover:-translate-y-2 aspect-[2/3]">
          {/* Gradient border on hover */}
          <div className="absolute inset-0 rounded-xl border border-border/50 group-hover:border-accent/20 transition-colors duration-500 z-30 pointer-events-none" />

          {/* Premium Glint Sheen (Desktop Only to prevent touch hijack) */}
          <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-xl opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 hidden md:block">
            <div className="absolute top-0 left-[-150%] w-[100%] h-[200%] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] transition-all duration-[800ms] group-hover:translate-x-[350%] group-hover:translate-y-[-20%]" />
          </div>

          {movie.poster_path ? (
            <Image
              src={img(movie.poster_path, "w500")}
              alt={displayTitle || ""}
              fill
              className="object-cover transition-transform duration-700 md:group-hover:scale-110"
              sizes={size === "large" ? "(max-width: 768px) 50vw, 240px" : "(max-width: 768px) 40vw, 185px"}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-bg-surface p-4">
              <span className="font-display text-sm text-text-tertiary text-center italic">{displayTitle}</span>
            </div>
          )}

          {/* Hover overlay with actions */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 md:group-hover:opacity-100 transition-all duration-300 z-10 flex flex-col justify-end p-3.5 mobile-no-blur">
            <div className="flex gap-2 transform translate-y-3 md:group-hover:translate-y-0 transition-transform duration-300 delay-75">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWatchlist(movie as any); }}
                className={`p-2 rounded-lg backdrop-blur-md transition-all ${
                  inWatchlist ? "bg-accent/25 text-accent shadow-gold" : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                }`}
                title={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
              >
                <Bookmark className="w-3.5 h-3.5" fill={inWatchlist ? "currentColor" : "none"} />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorites(movie as any); }}
                className={`p-2 rounded-lg backdrop-blur-md transition-all ${
                  inFavorites ? "bg-red-500/25 text-red-400" : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                }`}
                title={inFavorites ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className="w-3.5 h-3.5" fill={inFavorites ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          {/* Rating badge */}
          {movie.vote_average > 0 && (
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-md bg-black/70 border border-white/5 z-20">
              <Star className={`w-3 h-3 fill-current ${ratingColor}`} />
              <span className={`text-[11px] font-mono font-bold ${ratingColor}`}>
                {movie.vote_average.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Title + year */}
      <div className="flex flex-col gap-0.5 px-0.5">
        <Link href={targetRoute}>
          <h3 className="font-body text-[13px] font-medium text-text-primary line-clamp-1 group-hover:text-accent transition-colors duration-300">
            {displayTitle}
          </h3>
        </Link>
        {displayDate && (
          <span className="text-[11px] text-text-tertiary font-mono">
            {new Date(displayDate).getFullYear()}
          </span>
        )}
      </div>
    </div>
  );
}
