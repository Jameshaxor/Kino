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
    const cleaned = text.replace(/```json\s*/i, "").replace(/```\s*/g, "").trim();
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
    const cleaned = text.replace(/```json\s*/i, "").replace(/```\s*/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    console.error("Failed to parse Gemini insights response:", text);
    throw new Error("AI returned an invalid response");
  }
};

export const getPersonalizedRecommendations = async (titleList: string) => {
  if (!API_KEY) throw new Error("GEMINI_API_KEY is not configured");

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are a world-class film and TV curator. A user's favorite titles are: ${titleList}

Based on their taste profile, recommend exactly 5 titles they would LOVE but probably haven't seen. Mix movies and TV shows. For each recommendation, provide:
- title: exact title
- year: release year
- pitch: A compelling 1-sentence personal pitch (speak directly to the user, explain WHY they'd love it based on their favorites)
- vibe_match: percentage match 70-98
- mood_tags: 2-3 short mood/vibe tags

Also provide:
- taste_profile: a 1-sentence description of their overall taste (e.g. "You gravitate towards psychologically complex narratives with morally grey characters")
- taste_tags: 3-4 short labels describing their taste (e.g. "Cerebral Thriller Fan", "Visual Storytelling")

Respond ONLY with valid JSON (no markdown, no backticks, no extra text):
{
  "taste_profile": "...",
  "taste_tags": ["...", "..."],
  "recommendations": [
    { "title": "...", "year": 2020, "pitch": "...", "vibe_match": 92, "mood_tags": ["...", "..."] }
  ]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    const cleaned = text.replace(/```json\s*/i, "").replace(/```\s*/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error: any) {
    console.error("Failed to parse personalized response:", text);
    console.error("Parse error:", error.message || error);
    throw new Error("AI returned an invalid response");
  }
};
