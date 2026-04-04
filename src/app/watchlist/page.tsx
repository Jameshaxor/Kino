"use client";

import { Bookmark, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { img } from "@/lib/tmdb";
import { useWatchlist } from "@/context/WatchlistContext";

export default function WatchlistPage() {
  const { watchlist, removeFromWatchlist } = useWatchlist();

  return (
    <div className="max-w-7xl mx-auto w-full px-5 md:px-8 py-12 md:py-16 min-h-[70vh]">
      <div className="flex items-center gap-3 mb-8">
        <Bookmark className="w-5 h-5 text-accent" />
        <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight">Watchlist</h1>
        {watchlist.length > 0 && (
          <span className="text-sm font-mono text-text-tertiary">({watchlist.length})</span>
        )}
      </div>

      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <Bookmark className="w-10 h-10 text-text-tertiary/30" />
          <div>
            <p className="font-display text-lg text-text-primary">Your watchlist is empty</p>
            <p className="text-sm text-text-tertiary mt-1">
              Start adding movies you want to watch later
            </p>
          </div>
          <Link href="/explore" className="btn-gold mt-2">
            Explore Movies
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {watchlist.map((movie, i) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
              className="group relative flex flex-col gap-2.5"
            >
              <Link href={`/movie/${movie.id}`}>
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-bg-elevated border border-border/50 group-hover:border-accent/30 transition-all shadow-card group-hover:shadow-card-hover">
                  {movie.poster_path ? (
                    <Image
                      src={img(movie.poster_path, "w500")}
                      alt={movie.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-text-tertiary text-sm italic p-4 text-center">
                      {movie.title}
                    </div>
                  )}

                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeFromWatchlist(movie.id);
                    }}
                    className="absolute top-2 right-2 p-2 rounded-md bg-black/70 backdrop-blur-sm text-text-tertiary hover:text-error opacity-0 group-hover:opacity-100 transition-all"
                    title="Remove from watchlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Link>
              <div className="px-0.5">
                <h3 className="text-sm font-medium text-text-primary truncate group-hover:text-accent transition-colors">
                  {movie.title}
                </h3>
                <span className="text-xs text-text-tertiary font-mono">
                  {movie.release_date && new Date(movie.release_date).getFullYear()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
