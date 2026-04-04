"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Compass } from "lucide-react";
import { GENRE_LIST, img } from "@/lib/tmdb";
import MovieCard from "@/components/ui/MovieCard";
import Carousel from "@/components/ui/Carousel";

const DECADES = [
  { label: "2020s", start: 2020, end: 2029, vibe: "Fresh & Now" },
  { label: "2010s", start: 2010, end: 2019, vibe: "Modern Classics" },
  { label: "2000s", start: 2000, end: 2009, vibe: "Nostalgia Hits" },
  { label: "1990s", start: 1990, end: 1999, vibe: "Golden Era" },
  { label: "1980s", start: 1980, end: 1989, vibe: "Iconic Vibes" },
  { label: "1970s", start: 1970, end: 1979, vibe: "Cinematic Revolution" },
];

const GENRE_EMOJIS: Record<number, string> = {
  28: "💥", 12: "🗺️", 16: "🎨", 35: "😂", 80: "🔫", 99: "📹",
  18: "🎭", 10751: "👨‍👩‍👧", 14: "🧙", 36: "📜", 27: "👻", 10402: "🎵",
  9648: "🔍", 10749: "❤️", 878: "🚀", 10770: "📺", 53: "😰", 10752: "⚔️", 37: "🤠",
};

export default function ExplorePage() {
  const [genrePreview, setGenrePreview] = useState<Record<number, any[]>>({});
  const [decadeMovies, setDecadeMovies] = useState<Record<string, any[]>>({});
  const [loadingDecades, setLoadingDecades] = useState(true);

  useEffect(() => {
    // Fetch preview movies for first few genres
    const fetchGenrePreviews = async () => {
      const previews: Record<number, any[]> = {};
      const genresToFetch = GENRE_LIST.slice(0, 6);
      await Promise.all(
        genresToFetch.map(async (genre) => {
          try {
            const res = await fetch(`/api/tmdb/discover/movie?with_genres=${genre.id}&sort_by=popularity.desc&page=1`);
            const data = await res.json();
            previews[genre.id] = data.results?.slice(0, 4) || [];
          } catch { /* skip */ }
        })
      );
      setGenrePreview(previews);
    };

    const fetchDecadeMovies = async () => {
      const results: Record<string, any[]> = {};
      await Promise.all(
        DECADES.slice(0, 3).map(async (decade) => {
          try {
            const res = await fetch(
              `/api/tmdb/discover/movie?sort_by=vote_average.desc&vote_count.gte=500&primary_release_date.gte=${decade.start}-01-01&primary_release_date.lte=${decade.end}-12-31`
            );
            const data = await res.json();
            results[decade.label] = data.results?.slice(0, 10) || [];
          } catch { /* skip */ }
        })
      );
      setDecadeMovies(results);
      setLoadingDecades(false);
    };

    fetchGenrePreviews();
    fetchDecadeMovies();
  }, []);

  return (
    <div className="max-w-7xl mx-auto w-full px-5 md:px-8 py-12 md:py-20 flex flex-col gap-20">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Compass className="w-6 h-6 text-accent" />
          <div className="section-line" />
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-text-primary tracking-tight">
          Explore Cinema
        </h1>
        <p className="text-text-secondary text-lg max-w-xl">
          Dive into genre worlds, travel through decades, or let curiosity guide you.
        </p>
      </div>

      {/* Genre Worlds */}
      <section>
        <h2 className="text-xl font-display font-semibold text-text-primary mb-8 flex items-center gap-2">
          Genre Worlds
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GENRE_LIST.map((genre, i) => (
            <motion.div
              key={genre.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.4 }}
            >
              <Link
                href={`/explore/genre/${genre.id}`}
                className="card-premium flex items-center gap-4 p-5 group"
              >
                <span className="text-2xl flex-shrink-0">{GENRE_EMOJIS[genre.id] || "🎬"}</span>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <h3 className="font-display font-semibold text-text-primary text-base group-hover:text-accent transition-colors">
                    {genre.name}
                  </h3>
                  {/* Mini poster strip */}
                  {genrePreview[genre.id] && (
                    <div className="flex gap-1 mt-1.5">
                      {genrePreview[genre.id].map((m: any) => (
                        <div key={m.id} className="w-7 h-10 rounded-sm overflow-hidden bg-bg-surface flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                          {m.poster_path && (
                            <Image src={img(m.poster_path, "w92")} alt="" width={28} height={40} className="object-cover w-full h-full" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-text-tertiary ml-auto flex-shrink-0 group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Decades */}
      <section>
        <h2 className="text-xl font-display font-semibold text-text-primary mb-8">
          Travel Through Time
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-12">
          {DECADES.map((decade, i) => (
            <motion.button
              key={decade.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-premium p-5 text-left group"
            >
              <span className="text-3xl font-display font-bold text-gradient-gold">{decade.label}</span>
              <p className="text-xs text-text-tertiary mt-1 font-mono uppercase tracking-wider">{decade.vibe}</p>
            </motion.button>
          ))}
        </div>

        {/* Decade carousels */}
        {!loadingDecades && DECADES.slice(0, 3).map((decade) =>
          decadeMovies[decade.label]?.length > 0 ? (
            <div key={decade.label} className="mb-12">
              <Carousel title={`Best of the ${decade.label}`} subtitle={`${decade.start}–${decade.end}`}>
                {decadeMovies[decade.label].map((movie, i) => (
                  <MovieCard key={movie.id} movie={movie} index={i} />
                ))}
              </Carousel>
            </div>
          ) : null
        )}
      </section>
    </div>
  );
}
