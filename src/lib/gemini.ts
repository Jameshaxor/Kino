import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";

export interface AIRecommendation {
  title: string;
  year: number;
  pitch: string;
  vibe_match: number;
  mood_tags: string[];
}

export interface AIResponse {
  recommendations: AIRecommendation[];
  taste_note: string;
}

export const getMovieRecommendations = async (query: string): Promise<AIResponse> => {
  if (!API_KEY) throw new Error("GEMINI_API_KEY is not configured");

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are a world-class film curator with encyclopedic knowledge of cinema across all eras and cultures. A user is looking for movie recommendations based on this request:

"${query}"

Analyze their intent — mood, genre preferences, themes, energy level — and suggest exactly 4 movies that perfectly match.

Respond ONLY with valid JSON (no markdown, no backticks, no extra text):
{
  "recommendations": [
    {
      "title": "Exact Movie Title",
      "year": 2024,
      "pitch": "One compelling sentence explaining WHY this movie fits their request",
      "vibe_match": 95,
      "mood_tags": ["cerebral", "emotional", "slow-burn"]
    }
  ],
  "taste_note": "A brief, sharp observation about what their request reveals about their taste (be witty, not generic)"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    console.error("Failed to parse Gemini response:", text);
    throw new Error("AI returned an invalid response. Try again.");
  }
};

export const getMovieInsights = async (movieTitle: string, movieOverview: string) => {
  if (!API_KEY) throw new Error("GEMINI_API_KEY is not configured");

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are a brilliant film critic. Given this movie:

Title: "${movieTitle}"
Overview: "${movieOverview}"

Generate insights. Respond ONLY with valid JSON (no markdown, no backticks):
{
  "why_watch": "A compelling, non-spoiler 2-sentence pitch for why someone should watch this",
  "mood_tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "perfect_for": ["situation1", "situation2", "situation3"],
  "similar_picks": [
    { "title": "Movie Title", "reason": "One line explaining the connection" }
  ]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    console.error("Failed to parse Gemini insights response:", text);
    throw new Error("AI returned an invalid response");
  }
};
