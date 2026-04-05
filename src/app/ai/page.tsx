"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Loader2, MessageCircle, Star, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { img } from "@/lib/tmdb";

interface Recommendation {
  id: number;
  title: string;
  year: number;
  pitch: string;
  vibe_match: number;
  mood_tags: string[];
  poster_path: string | null;
  vote_average: number;
  release_date: string;
}

interface AIResponse {
  taste_note: string;
  recommendations: Recommendation[];
}

const SUGGESTED_PROMPTS = [
  { text: "A rainy Sunday film that'll gently ruin me", emoji: "🌧️" },
  { text: "Something like Inception but weirder", emoji: "🌀" },
  { text: "A feel-good movie for the whole family", emoji: "🏡" },
  { text: "Visually stunning sci-fi from the last decade", emoji: "🚀" },
  { text: "An underrated thriller that keeps me guessing", emoji: "🔪" },
  { text: "A foreign masterpiece I've never heard of", emoji: "🌍" },
];

export default function AIOraclePage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (input?: string) => {
    const q = input || query;
    if (!q.trim()) return;

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to get recommendations");
      }

      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/[0.03] rounded-full blur-[120px]" />
      </div>

      <div className="max-w-3xl mx-auto w-full px-5 md:px-8 py-16 md:py-24 flex flex-col gap-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center gap-5"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center animate-glow-pulse">
              <Sparkles className="w-7 h-7 text-accent" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent animate-pulse-soft" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-text-primary tracking-tight">
              AI Movie <span className="text-gradient-gold">Oracle</span>
            </h1>
            <p className="text-text-secondary mt-3 text-base max-w-md mx-auto">
              Describe a mood, a vibe, or a specific scenario — and let AI curate your perfect watchlist.
            </p>
          </div>
        </motion.div>

        {/* Input */}
        <motion.form
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
          className="w-full"
        >
          <div className="relative group">
            {/* Glow border */}
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-accent/0 via-accent/20 to-accent/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-sm" />
            <div className="relative flex items-center bg-bg-elevated rounded-2xl border border-border group-focus-within:border-accent/30 transition-colors">
              <MessageCircle className="w-4 h-4 text-text-tertiary ml-5 flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe what you're in the mood for..."
                className="flex-1 bg-transparent px-4 py-5 text-text-primary placeholder:text-text-tertiary focus:outline-none text-base"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="m-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent to-[#E0B85C] text-black font-bold text-sm disabled:opacity-30 shadow-[0_0_15px_rgba(212,168,67,0.3)] hover:shadow-[0_0_25px_rgba(212,168,67,0.6)] hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <><Zap className="w-4 h-4" /> Ask</>
                )}
              </button>
            </div>
          </div>
        </motion.form>

        {/* Suggested prompts */}
        {!response && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-4"
          >
            <span className="text-xs font-mono text-text-tertiary uppercase tracking-[0.15em]">
              Try One of These
            </span>
            <div className="flex flex-wrap justify-center gap-2.5">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt.text}
                  onClick={() => { setQuery(prompt.text); handleSubmit(prompt.text); }}
                  className="px-4 py-2.5 text-xs text-text-secondary bg-bg-elevated border border-border rounded-xl hover:border-accent/30 hover:text-text-primary hover:bg-accent-muted transition-all flex items-center gap-2"
                >
                  <span>{prompt.emoji}</span>
                  {prompt.text}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-5 bg-error/10 border border-error/20 text-error rounded-xl text-center text-sm">
            {error}
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-accent animate-pulse-soft" />
              </div>
              <div className="absolute inset-0 rounded-2xl animate-glow-pulse" />
            </div>
            <div className="text-center">
              <p className="text-sm font-display text-text-primary">Curating your picks...</p>
              <p className="text-xs text-text-tertiary mt-1">This usually takes 3–5 seconds</p>
            </div>
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence>
          {response && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-8"
            >
              {/* Taste note */}
              <div className="relative p-6 rounded-2xl bg-bg-elevated border border-accent/10 overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                  <p className="text-base font-display text-text-primary italic leading-relaxed">
                    &ldquo;{response.taste_note}&rdquo;
                  </p>
                </div>
              </div>

              {/* Recommendation cards */}
              <div className="flex flex-col gap-4">
                <span className="text-xs font-mono text-text-tertiary uppercase tracking-[0.15em]">
                  Your Curated Picks
                </span>
                {response.recommendations.map((rec, i) => (
                  <motion.div
                    key={rec.id || i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.12, duration: 0.4 }}
                  >
                    <Link
                      href={rec.id ? `/movie/${rec.id}` : "#"}
                      className="card-premium flex gap-5 p-5 group"
                    >
                      {/* Poster */}
                      <div className="w-[80px] md:w-[100px] aspect-[2/3] rounded-lg overflow-hidden bg-bg-surface flex-shrink-0 shadow-card">
                        {rec.poster_path ? (
                          <Image
                            src={img(rec.poster_path, "w200")}
                            alt={rec.title}
                            width={100}
                            height={150}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-text-tertiary text-xs italic p-2 text-center">
                            {rec.title}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 flex flex-col gap-2.5 py-0.5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-display font-semibold text-lg text-text-primary group-hover:text-accent transition-colors leading-tight">
                              {rec.title}
                            </h3>
                            <span className="text-xs font-mono text-text-tertiary">{rec.year}</span>
                          </div>
                          <span className="px-3 py-1.5 text-xs font-mono font-bold text-rating-high bg-rating-high/10 border border-rating-high/20 rounded-lg flex-shrink-0 flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {rec.vibe_match}%
                          </span>
                        </div>

                        <p className="text-sm text-text-secondary leading-relaxed">
                          {rec.pitch}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mt-auto">
                          {rec.mood_tags?.map((tag) => (
                            <span key={tag}
                              className="text-[11px] text-accent/80 bg-accent-muted px-2.5 py-1 rounded-md border border-accent/10">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Ask again */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => { setResponse(null); setQuery(""); }}
                  className="btn-ghost text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  Ask Another Question
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
