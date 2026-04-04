import { NextRequest, NextResponse } from "next/server";
import { getMovieInsights } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { title, overview } = await req.json();
    if (!title) {
      return NextResponse.json({ error: "Movie title is required" }, { status: 400 });
    }

    const insights = await getMovieInsights(title, overview || "");
    return NextResponse.json(insights);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate insights";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
