import { NextRequest, NextResponse } from "next/server";
import { getMovieRecommendations } from "@/lib/gemini";
import { fetchTMDB } from "@/lib/tmdb";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // 1. Get AI recommendations
    const aiData = await getMovieRecommendations(query);

    // 2. Hydrate with TMDB data (posters, IDs, real ratings)
    const hydrated = await Promise.all(
      aiData.recommendations.map(async (rec) => {
        try {
          const searchRes = await fetchTMDB("/search/movie", {
            query: rec.title,
            primary_release_year: rec.year?.toString() || "",
          });

          const match = searchRes?.results?.[0];
          if (match) {
            return {
              ...rec,
              id: match.id,
              poster_path: match.poster_path,
              backdrop_path: match.backdrop_path,
              vote_average: match.vote_average,
              release_date: match.release_date,
              overview: match.overview,
            };
          }
          return { ...rec, id: null };
        } catch {
          return { ...rec, id: null };
        }
      })
    );

    return NextResponse.json({
      taste_note: aiData.taste_note,
      recommendations: hydrated.filter((r) => r.id !== null),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "AI recommendation failed";

    // Detect rate limiting
    if (message.includes("429") || message.includes("quota") || message.includes("Too Many Requests")) {
      return NextResponse.json(
        { error: "AI is temporarily rate-limited. Free tier allows ~15 requests/minute. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
