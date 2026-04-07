import Image from "next/image";
import Link from "next/link";
import { Play, TrendingUp, Calendar, Star, Megaphone } from "lucide-react";

export const metadata = {
  title: "Feed | KINO",
  description: "Your personalized timeline of new trailers, trending drops, and upcoming releases.",
};

async function getFeedData() {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return [];

  try {
    const today = new Date().toISOString().split("T")[0];
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    const futureDateStr = futureDate.toISOString().split("T")[0];

    const [trendRes, upcomingRes] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}&language=en-US`, { next: { revalidate: 3600 } }),
      fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&primary_release_date.gte=${today}&primary_release_date.lte=${futureDateStr}&page=1`, { next: { revalidate: 3600 } }),
    ]);

    const [trendData, upcomingData] = await Promise.all([trendRes.json(), upcomingRes.json()]);
    const trending = (trendData.results || []).slice(0, 8);
    const upcoming = (upcomingData.results || []).slice(0, 5);

    const feedItems: any[] = [];

    // Fetch all trailers in parallel (was serial before)
    const trailerResults = await Promise.all(
      trending.slice(0, 5).map(async (item: any) => {
        const mediaType = item.media_type || "movie";
        try {
          const res = await fetch(`https://api.themoviedb.org/3/${mediaType}/${item.id}/videos?api_key=${apiKey}`, { next: { revalidate: 3600 } });
          const data = await res.json();
          const trailer = data.results?.find((v: any) => v.site === "YouTube" && v.type === "Trailer");
          if (trailer) return { item, trailer };
        } catch { /* skip */ }
        return null;
      })
    );

    // Add trailers
    for (const result of trailerResults) {
      if (!result) continue;
      const { item, trailer } = result;
      feedItems.push({
        type: "trailer" as const,
        id: `trailer-${item.id}`,
        date: new Date(trailer.published_at || item.release_date || item.first_air_date || Date.now()).getTime(),
        content: { ...item, trailer_key: trailer.key, trailer_name: trailer.name }
      });
    }

    // Add trending announcements
    for (const item of trending.slice(5, 9)) {
      feedItems.push({
        type: "trending" as const,
        id: `trend-${item.id}`,
        date: new Date(item.release_date || item.first_air_date || Date.now()).getTime(),
        content: item
      });
    }

    // Add upcoming
    for (const item of upcoming) {
      feedItems.push({
        type: "upcoming" as const,
        id: `up-${item.id}`,
        date: new Date(item.release_date || Date.now()).getTime(),
        content: item
      });
    }

    return feedItems.sort((a, b) => b.date - a.date);
  } catch (error) {
    console.error("Feed data fetch failed:", error);
    return [];
  }
}

function FeedDate({ type, date }: { type: string, date: number }) {
  const d = new Date(date);
  if (type === "upcoming") {
    return <span className="text-xs font-mono text-text-tertiary uppercase tracking-wider">{d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>;
  }
  if (type === "trailer") {
    const diffHours = Math.floor((new Date().getTime() - date) / (1000 * 60 * 60));
    if (diffHours < 24) return <span className="text-xs font-mono text-text-tertiary uppercase tracking-wider">{diffHours}h ago</span>;
  }
  return <span className="text-xs font-mono text-text-tertiary uppercase tracking-wider">{d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>;
}

export default async function FeedPage() {
  const feedItems = await getFeedData();
  const imgUrl = (path: string, size = "w780") => `https://image.tmdb.org/t/p/${size}${path}`;

  return (
    <div className="max-w-3xl mx-auto w-full px-5 md:px-0 py-12 md:py-20 flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-5xl font-display font-bold text-text-primary tracking-tight">Your Feed</h1>
        <p className="text-text-secondary text-sm md:text-base">The latest trailers, trending news, and drops.</p>
      </div>

      <div className="flex flex-col gap-12">
        {feedItems.map((item) => (
          <article key={item.id} className="flex flex-col gap-4 pb-12 border-b border-border/50 last:border-0">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex flex-shrink-0 items-center justify-center">
                  {item.type === "trailer" && <Play className="w-4 h-4 text-accent translate-x-[1px]" />}
                  {item.type === "trending" && <TrendingUp className="w-4 h-4 text-accent" />}
                  {item.type === "upcoming" && <Megaphone className="w-4 h-4 text-accent" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-text-primary">
                    {item.type === "trailer" && "New Trailer Dropped"}
                    {item.type === "trending" && "Trending This Week"}
                    {item.type === "upcoming" && "Coming Soon to Theaters"}
                  </span>
                  <FeedDate type={item.type} date={item.date} />
                </div>
              </div>
            </div>

            {/* Content Card */}
            <div className="card-premium overflow-hidden rounded-2xl group flex flex-col">
              {item.type === "trailer" ? (
                <div className="relative aspect-video bg-black w-full overflow-hidden border-b border-border/50">
                  <iframe
                    width="100%" height="100%"
                    src={`https://www.youtube.com/embed/${item.content.trailer_key}`}
                    title={item.content.trailer_name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen className="border-0"
                  />
                </div>
              ) : (
                <Link href={`/${item.content.media_type === "tv" ? "tv" : "movie"}/${item.content.id}`}>
                  <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-border/50 bg-bg-elevated">
                    {item.content.backdrop_path ? (
                      <Image
                        src={imgUrl(item.content.backdrop_path)}
                        alt={item.content.title || item.content.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-text-tertiary">No Image</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent opacity-80" />
                    {item.type === "upcoming" && item.content.release_date && (
                      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/90 text-white backdrop-blur-md shadow-lg border border-white/10 z-10">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold font-mono tracking-wide">
                          {new Date(item.content.release_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              )}

              <div className="p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <Link href={`/${item.content.media_type === "tv" || (!item.content.title && item.content.name) ? "tv" : "movie"}/${item.content.id}`} className="hover:text-accent transition-colors">
                    <h2 className="text-xl font-display font-bold text-text-primary">{item.content.title || item.content.name}</h2>
                  </Link>
                  {item.content.vote_average > 0 && item.type !== "upcoming" && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-bg-surface border border-border flex-shrink-0">
                      <Star className="w-3 h-3 text-rating-high fill-current" />
                      <span className="text-[11px] font-mono font-bold text-text-primary">{item.content.vote_average.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">{item.content.overview}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Link
                    href={`/${item.content.media_type === "tv" || (!item.content.title && item.content.name) ? "tv" : "movie"}/${item.content.id}`}
                    className="text-xs font-bold px-4 py-2 bg-accent/10 border border-accent/20 rounded-md hover:bg-accent/20 text-accent transition-all flex items-center gap-1 uppercase tracking-wider"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </article>
        ))}

        {feedItems.length === 0 && (
          <div className="py-20 text-center text-text-tertiary border border-dashed border-border rounded-xl">
            <TrendingUp className="w-10 h-10 mx-auto mb-4 opacity-20" />
            <p className="font-display text-lg">No feed data available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
