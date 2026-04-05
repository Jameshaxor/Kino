"use client";

import { useWatchlist } from "@/context/WatchlistContext";
import MovieCard from "@/components/ui/MovieCard";
import { motion } from "framer-motion";
import { Bookmark, Heart, AlertCircle, Compass } from "lucide-react";
import Link from "next/link";
import AuthModal from "@/components/ui/AuthModal";
import { useState } from "react";

export default function LibraryPage() {
  const { user, watchlist, favorites } = useWatchlist();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-medium text-white mb-4">My Library</h1>
          {user ? (
            <p className="text-text-secondary text-lg">Your cinematic collection, securely synced across all your devices.</p>
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
          <div className="space-y-16">
            {/* Favorites Section */}
            {favorites.length > 0 && (
              <section>
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
              <section>
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
