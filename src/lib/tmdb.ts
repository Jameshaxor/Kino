const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p';

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date: string;
  runtime?: number;
  genres?: { id: number; name: string }[];
  genre_ids?: number[];
  tagline?: string;
  budget?: number;
  revenue?: number;
  status?: string;
  original_language?: string;
}

export interface TMDBPerson {
  id: number;
  name: string;
  profile_path: string | null;
  biography?: string;
  birthday?: string;
  deathday?: string | null;
  place_of_birth?: string;
  known_for_department?: string;
  imdb_id?: string;
  external_ids?: {
    imdb_id?: string;
    instagram_id?: string;
    twitter_id?: string;
  };
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDBCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export const fetchTMDB = async (
  endpoint: string,
  params: Record<string, string> = {},
  options: { revalidate?: number } = {}
) => {
  if (!TMDB_API_KEY) {
    console.error('TMDB_API_KEY is not set');
    return null;
  }

  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.append(key, value);
  });

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: options.revalidate ?? 3600 },
    });

    if (!res.ok) {
      console.error(`TMDB ${endpoint} responded ${res.status}`);
      return null;
    }

    return res.json();
  } catch (error) {
    console.error(`TMDB fetch failed for ${endpoint}:`, error);
    return null;
  }
};

export const img = (path: string | null | undefined, size: string = 'original'): string => {
  if (!path) return '';
  return `${IMAGE_BASE}/${size}${path}`;
};

export const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

export const GENRE_LIST = Object.entries(GENRE_MAP).map(([id, name]) => ({
  id: Number(id),
  name,
}));
