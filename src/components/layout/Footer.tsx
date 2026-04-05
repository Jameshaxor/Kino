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
              <Link href="/ai" className="text-sm text-text-secondary hover:text-text-primary transition-colors">AI Oracle</Link>
              <Link href="/search" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Search</Link>
            </div>
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-mono text-text-tertiary uppercase tracking-wider">Library</span>
              <Link href="/watchlist" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Watchlist</Link>
              <Link href="/favorites" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Favorites</Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-tertiary">
            © {new Date().getFullYear()} KINO. Founded by Manu Haxor. Built with obsessive attention to cinema.
          </p>
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
