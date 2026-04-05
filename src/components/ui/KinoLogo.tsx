export default function KinoLogo({ className = "", size = "default" }: { className?: string; size?: "small" | "default" | "large" }) {
  const sizes = {
    small: { width: 24, height: 24, text: "text-sm", tagline: "text-[8px]" },
    default: { width: 32, height: 32, text: "text-xl", tagline: "text-[9px]" },
    large: { width: 44, height: 44, text: "text-4xl", tagline: "text-xs" },
  };

  const s = sizes[size];

  return (
    <div className={`flex items-center gap-3.5 ${className} group`}>
      {/* Logo mark — Ultra-premium monolithic geometric stencil K */}
      <svg
        width={s.width}
        height={s.height}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 text-text-primary group-hover:text-white transition-all duration-700 ease-out transform group-hover:scale-105"
      >
        {/* Solid vertical stem */}
        <rect x="8" y="8" width="8" height="32" fill="currentColor" />
        
        {/* Diagonal forward arm (upper) */}
        <path d="M18 23 L30 23 L40 8 L28 8 Z" fill="currentColor" className="opacity-80 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Diagonal backward arm (lower) */}
        <path d="M18 25 L30 25 L40 40 L28 40 Z" fill="currentColor" className="opacity-50 group-hover:opacity-90 transition-opacity duration-700" />
      </svg>

      {/* Wordmark */}
      <div className="flex flex-col pt-0.5">
        <span
          className={`font-display font-medium ${s.text} tracking-[0.2em] text-text-primary group-hover:text-white transition-colors duration-700`}
        >
          KINO
        </span>
        {size !== "small" && (
          <span className={`${s.tagline} font-body text-text-tertiary uppercase tracking-[0.55em] mt-1 ml-1 font-medium group-hover:text-text-secondary transition-colors duration-700`}>
            Cinema
          </span>
        )}
      </div>
    </div>
  );
}
