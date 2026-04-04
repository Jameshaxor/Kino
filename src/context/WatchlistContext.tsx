"use client";

import { createContext, useContext, useCallback, ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { TMDBMovie } from "@/lib/tmdb";

type StoredMovie = {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
  addedAt: number;
};

interface WatchlistContextType {
  watchlist: StoredMovie[];
  favorites: StoredMovie[];
  addToWatchlist: (movie: TMDBMovie) => void;
  removeFromWatchlist: (id: number) => void;
  isInWatchlist: (id: number) => boolean;
  addToFavorites: (movie: TMDBMovie) => void;
  removeFromFavorites: (id: number) => void;
  isInFavorites: (id: number) => boolean;
  toggleWatchlist: (movie: TMDBMovie) => void;
  toggleFavorites: (movie: TMDBMovie) => void;
}

const WatchlistContext = createContext<WatchlistContextType | null>(null);

function movieToStored(movie: TMDBMovie): StoredMovie {
  return {
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    vote_average: movie.vote_average,
    release_date: movie.release_date,
    addedAt: Date.now(),
  };
}

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useLocalStorage<StoredMovie[]>("kino-watchlist", []);
  const [favorites, setFavorites] = useLocalStorage<StoredMovie[]>("kino-favorites", []);

  const isInWatchlist = useCallback((id: number) => watchlist.some((m) => m.id === id), [watchlist]);
  const isInFavorites = useCallback((id: number) => favorites.some((m) => m.id === id), [favorites]);

  const addToWatchlist = useCallback(
    (movie: TMDBMovie) => {
      if (!isInWatchlist(movie.id)) {
        setWatchlist((prev) => [movieToStored(movie), ...prev]);
      }
    },
    [isInWatchlist, setWatchlist]
  );

  const removeFromWatchlist = useCallback(
    (id: number) => setWatchlist((prev) => prev.filter((m) => m.id !== id)),
    [setWatchlist]
  );

  const addToFavorites = useCallback(
    (movie: TMDBMovie) => {
      if (!isInFavorites(movie.id)) {
        setFavorites((prev) => [movieToStored(movie), ...prev]);
      }
    },
    [isInFavorites, setFavorites]
  );

  const removeFromFavorites = useCallback(
    (id: number) => setFavorites((prev) => prev.filter((m) => m.id !== id)),
    [setFavorites]
  );

  const toggleWatchlist = useCallback(
    (movie: TMDBMovie) => {
      if (isInWatchlist(movie.id)) removeFromWatchlist(movie.id);
      else addToWatchlist(movie);
    },
    [isInWatchlist, removeFromWatchlist, addToWatchlist]
  );

  const toggleFavorites = useCallback(
    (movie: TMDBMovie) => {
      if (isInFavorites(movie.id)) removeFromFavorites(movie.id);
      else addToFavorites(movie);
    },
    [isInFavorites, removeFromFavorites, addToFavorites]
  );

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        favorites,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        addToFavorites,
        removeFromFavorites,
        isInFavorites,
        toggleWatchlist,
        toggleFavorites,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) throw new Error("useWatchlist must be used within WatchlistProvider");
  return context;
}
