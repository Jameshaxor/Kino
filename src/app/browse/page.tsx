import MovieCard from "@/components/ui/MovieCard";

export const metadata = {
  title: "Browse Catalog | KINO",
  description: "Explore the vast cinematic catalog.",
};

async function getBrowseMovies() {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return [];
  
  // Fetch popular and highly rated movies to build a pristine catalog
  const urls = [
    `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&page=1`,
    `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&page=2`,
    `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&page=3`,
    `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-US&sort_by=vote_count.desc&page=1`, // All-time highly rated
  ];

  try {
    const responses = await Promise.all(urls.map(url => fetch(url, { next: { revalidate: 3600 } })));
    const data = await Promise.all(responses.map(r => r.json()));
    
    const allMovies = data.flatMap(d => d.results || []);
    
    // Deduplicate movies by ID
    const uniqueMovies = Array.from(new Map(allMovies.map(m => [m.id, m])).values());
    return uniqueMovies;
  } catch (error) {
    console.error("Failed to fetch browse catalog:", error);
    return [];
  }
}

export default async function BrowsePage() {
  const movies = await getBrowseMovies();

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-medium text-white mb-4">Browse Catalog</h1>
          <p className="text-text-secondary text-lg max-w-2xl">
            Explore a curated selection of the most popular and critically acclaimed films in cinematic history.
          </p>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
          {movies.map((movie, index) => (
            <MovieCard key={`browse-${movie.id}`} movie={movie as any} index={index % 20} />
          ))}
        </div>
      </div>
    </main>
  );
}
