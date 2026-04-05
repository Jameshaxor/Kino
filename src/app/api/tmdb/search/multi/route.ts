import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
  }

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  // /search/multi returns Movies, TV Shows, and People!
  const url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(
    query
  )}&api_key=${apiKey}&language=en-US&page=1`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("TMDB fetch failed");

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
