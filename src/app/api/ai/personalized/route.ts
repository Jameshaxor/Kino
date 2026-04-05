import { NextResponse } from "next/server";
import { getPersonalizedRecommendations } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { favorites } = await req.json();
    if (!favorites || favorites.length < 2) {
      return NextResponse.json(
        { error: "Need at least 2 favorites to generate recommendations" },
        { status: 400 }
      );
    }

    const titleList = favorites.slice(0, 10).map((f: any) => f.title || f.name).filter(Boolean).join(", ");
    const parsed = await getPersonalizedRecommendations(titleList);

    // Try to enrich with TMDB posters
    const tmdbKey = process.env.TMDB_API_KEY;
    if (tmdbKey && parsed.recommendations) {
      await Promise.all(
        parsed.recommendations.map(async (rec: any) => {
          try {
            const searchRes = await fetch(
              `https://api.themoviedb.org/3/search/multi?api_key=${tmdbKey}&query=${encodeURIComponent(rec.title)}&page=1`
            );
            const searchData = await searchRes.json();
            const match = searchData.results?.[0];
            if (match) {
              rec.id = match.id;
              rec.poster_path = match.poster_path;
              rec.vote_average = match.vote_average;
              rec.media_type = match.media_type;
            }
          } catch { /* skip enrichment */ }
        })
      );
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Personalized recommendations error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
