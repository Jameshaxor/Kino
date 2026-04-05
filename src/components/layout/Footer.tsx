import Link from "next/link";
import KinoLogo from "@/components/ui/KinoLogo";

export default function Footer() {
  return (
    <footer className="border-t border-border/50 mt-auto">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <KinoLogo size="small" />
            <p className="text-sm text-text-tertiary max-w-xs">
              A premium multi-media discovery platform powered by AI. Find your next favorite film, series, or anime.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-12">
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-mono text-text-tertiary uppercase tracking-wider">Navigate</span>
              <Link href="/explore" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Explore</Link>
              <Link href="/browse" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Browse</Link>
              <Link href="/feed" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Feed</Link>
              <Link href="/ai" className="text-sm text-text-secondary hover:text-text-primary transition-colors">AI Oracle</Link>
            </div>
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-mono text-text-tertiary uppercase tracking-wider">Library</span>
              <Link href="/library" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Watchlist</Link>
              <Link href="/library" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Favorites</Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-text-tertiary flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
            <span>© {new Date().getFullYear()} KINO.</span>
            <span className="hidden sm:inline">·</span>
            <span className="flex items-center">
              Crafted by 
              <span className="relative inline-flex items-center justify-center px-2 py-0.5 ml-1.5 overflow-hidden rounded border border-accent/20 bg-bg-surface transition-all duration-500 hover:border-accent/50 hover:shadow-[0_0_10px_rgba(139,92,246,0.3)] cursor-default group">
                <span className="absolute inset-0 bg-gradient-to-tr from-accent/0 via-accent/10 to-accent/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
                <span className="relative font-mono text-[10px] uppercase font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#d4b4fe]">
                  Manu Haxor
                </span>
              </span>
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="italic">Obsessive about cinema.</span>
          </div>
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-xs text-text-tertiary hover:text-text-secondary transition-colors"
          >
            Movie data provided by
            <span className="font-bold text-[#01D277]">TMDB</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
