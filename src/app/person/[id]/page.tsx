"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Calendar, ExternalLink } from "lucide-react";
import { img } from "@/lib/tmdb";
import MovieCard from "@/components/ui/MovieCard";
import { DetailSkeleton } from "@/components/ui/Skeleton";

export default function PersonPage() {
  const params = useParams();
  const personId = params.id as string;

  const [person, setPerson] = useState<any>(null);
  const [credits, setCredits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [personRes, creditsRes] = await Promise.all([
          fetch(`/api/tmdb/person/${personId}`),
          fetch(`/api/tmdb/person/${personId}/movie_credits`),
        ]);
        const [p, c] = await Promise.all([personRes.json(), creditsRes.json()]);
        setPerson(p);

        // Sort by popularity, deduplicate
        const seen = new Set<number>();
        const sortedCredits = (c.cast || [])
          .filter((m: any) => {
            if (seen.has(m.id)) return false;
            seen.add(m.id);
            return m.poster_path;
          })
          .sort((a: any, b: any) => b.popularity - a.popularity);
        setCredits(sortedCredits);
      } catch {
        console.error("Failed to fetch person");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [personId]);

  if (loading) return <DetailSkeleton />;
  if (!person) return <div className="p-20 text-center text-text-primary font-display text-2xl">Person not found</div>;

  const knownFor = credits.slice(0, 6);
  const filmography = credits;

  return (
    <div className="max-w-7xl mx-auto w-full px-5 md:px-8 py-12 md:py-16">
      {/* Profile header */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-16">
        {/* Photo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-48 md:w-56 flex-shrink-0"
        >
          <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-bg-elevated border border-border shadow-card">
            {person.profile_path ? (
              <Image
                src={img(person.profile_path, "w500")}
                alt={person.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-text-tertiary italic">No Photo</div>
            )}
          </div>
        </motion.div>

        {/* Bio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex-1 flex flex-col gap-4"
        >
          <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary tracking-tight">
            {person.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
            {person.known_for_department && (
              <span className="px-3 py-1 rounded-md bg-accent-muted text-accent border border-accent/20 text-xs font-medium">
                {person.known_for_department}
              </span>
            )}
            {person.birthday && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-text-tertiary" />
                {new Date(person.birthday).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                {person.deathday && ` — ${new Date(person.deathday).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`}
              </span>
            )}
            {person.place_of_birth && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-text-tertiary" />
                {person.place_of_birth}
              </span>
            )}
          </div>

          {person.biography && (
            <p className="text-text-secondary text-sm leading-relaxed max-w-3xl line-clamp-6">
              {person.biography}
            </p>
          )}

          {person.imdb_id && (
            <a
              href={`https://www.imdb.com/name/${person.imdb_id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover transition-colors w-fit"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View on IMDb
            </a>
          )}
        </motion.div>
      </div>

      {/* Known For */}
      {knownFor.length > 0 && (
        <section className="mb-16">
          <h2 className="text-xl font-display font-semibold text-text-primary mb-6">Known For</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {knownFor.map((movie, i) => (
              <MovieCard key={movie.id} movie={movie} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Full Filmography */}
      {filmography.length > 6 && (
        <section>
          <h2 className="text-xl font-display font-semibold text-text-primary mb-6">
            Filmography
            <span className="text-text-tertiary text-sm font-body font-normal ml-2">({filmography.length} films)</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {filmography.slice(6).map((movie, i) => (
              <MovieCard key={movie.id} movie={movie} index={i % 20} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
