"use client";

import { createContext, useContext, useCallback, ReactNode, useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { TMDBMovie } from "@/lib/tmdb";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

type StoredMovie = {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
  media_type: "movie" | "tv";
  addedAt: number;
};

interface WatchlistContextType {
  user: User | null;
  watchlist: StoredMovie[];
  favorites: StoredMovie[];
  addToWatchlist: (movie: any) => void;
  removeFromWatchlist: (id: number) => void;
  isInWatchlist: (id: number) => boolean;
  addToFavorites: (movie: any) => void;
  removeFromFavorites: (id: number) => void;
  isInFavorites: (id: number) => boolean;
  toggleWatchlist: (movie: any) => void;
  toggleFavorites: (movie: any) => void;
}

const WatchlistContext = createContext<WatchlistContextType | null>(null);

function movieToStored(movie: any): StoredMovie {
  return {
    id: movie.id,
    title: movie.title || movie.name,
    poster_path: movie.poster_path,
    vote_average: movie.vote_average,
    release_date: movie.release_date || movie.first_air_date || "",
    media_type: movie.media_type || (movie.name ? "tv" : "movie"),
    addedAt: Date.now(),
  };
}

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [localWatchlist, setLocalWatchlist] = useLocalStorage<StoredMovie[]>("kino-watchlist", []);
  const [localFavorites, setLocalFavorites] = useLocalStorage<StoredMovie[]>("kino-favorites", []);
  
  const [cloudWatchlist, setCloudWatchlist] = useState<StoredMovie[]>([]);
  const [cloudFavorites, setCloudFavorites] = useState<StoredMovie[]>([]);
  
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const fetchCloudData = async () => {
        const { data: wlData } = await supabase.from('watchlist').select('*').eq('user_id', user.id).order('added_at', { ascending: false });
        const { data: favData } = await supabase.from('favorites').select('*').eq('user_id', user.id).order('added_at', { ascending: false });
        
        if (wlData) setCloudWatchlist(wlData.map(d => ({ ...d, id: d.movie_id, media_type: d.media_type || "movie" })));
        if (favData) setCloudFavorites(favData.map(d => ({ ...d, id: d.movie_id, media_type: d.media_type || "movie" })));
      }
      fetchCloudData();
    } else {
      setCloudWatchlist([]);
      setCloudFavorites([]);
    }
  }, [user]);

  const activeWatchlist = user ? cloudWatchlist : localWatchlist;
  const activeFavorites = user ? cloudFavorites : localFavorites;

  const isInWatchlist = useCallback((id: number) => activeWatchlist.some((m) => m.id === id), [activeWatchlist]);
  const isInFavorites = useCallback((id: number) => activeFavorites.some((m) => m.id === id), [activeFavorites]);

  const addToWatchlist = useCallback(async (movie: any) => {
    if (isInWatchlist(movie.id)) return;
    const stored = movieToStored(movie);

    if (user) {
      setCloudWatchlist(prev => [stored, ...prev]);
      await supabase.from('watchlist').insert({
        user_id: user.id,
        movie_id: stored.id,
        title: stored.title,
        poster_path: stored.poster_path,
        vote_average: stored.vote_average,
        release_date: stored.release_date,
        media_type: stored.media_type
      });
    } else {
      setLocalWatchlist(prev => [stored, ...prev]);
    }
  }, [user, isInWatchlist, setLocalWatchlist]);

  const removeFromWatchlist = useCallback(async (id: number) => {
    if (user) {
      setCloudWatchlist(prev => prev.filter(m => m.id !== id));
      await supabase.from('watchlist').delete().match({ user_id: user.id, movie_id: id });
    } else {
      setLocalWatchlist(prev => prev.filter(m => m.id !== id));
    }
  }, [user, setLocalWatchlist]);

  const addToFavorites = useCallback(async (movie: any) => {
    if (isInFavorites(movie.id)) return;
    const stored = movieToStored(movie);

    if (user) {
      setCloudFavorites(prev => [stored, ...prev]);
      await supabase.from('favorites').insert({
        user_id: user.id,
        movie_id: stored.id,
        title: stored.title,
        poster_path: stored.poster_path,
        vote_average: stored.vote_average,
        release_date: stored.release_date,
        media_type: stored.media_type
      });
    } else {
      setLocalFavorites(prev => [stored, ...prev]);
    }
  }, [user, isInFavorites, setLocalFavorites]);

  const removeFromFavorites = useCallback(async (id: number) => {
    if (user) {
      setCloudFavorites(prev => prev.filter(m => m.id !== id));
      await supabase.from('favorites').delete().match({ user_id: user.id, movie_id: id });
    } else {
      setLocalFavorites(prev => prev.filter(m => m.id !== id));
    }
  }, [user, setLocalFavorites]);

  const toggleWatchlist = useCallback((movie: TMDBMovie) => {
    if (isInWatchlist(movie.id)) removeFromWatchlist(movie.id);
    else addToWatchlist(movie);
  }, [isInWatchlist, removeFromWatchlist, addToWatchlist]);

  const toggleFavorites = useCallback((movie: TMDBMovie) => {
    if (isInFavorites(movie.id)) removeFromFavorites(movie.id);
    else addToFavorites(movie);
  }, [isInFavorites, removeFromFavorites, addToFavorites]);

  return (
    <WatchlistContext.Provider
      value={{
        user,
        watchlist: activeWatchlist,
        favorites: activeFavorites,
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
