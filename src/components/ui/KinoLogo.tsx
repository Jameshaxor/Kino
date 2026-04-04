export default function KinoLogo({ className = "", size = "default" }: { className?: string; size?: "small" | "default" | "large" }) {
  const sizes = {
    small: { width: 28, height: 28, text: "text-[13px]" },
    default: { width: 34, height: 34, text: "text-base" },
    large: { width: 48, height: 48, text: "text-xl" },
  };

  const s = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo mark — abstract film projector / aperture */}
      <svg
        width={s.width}
        height={s.height}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Outer ring */}
        <circle cx="24" cy="24" r="22" stroke="url(#goldGrad)" strokeWidth="2" opacity="0.6" />
        {/* Inner aperture blades - cinematic feel */}
        <path d="M24 6 L30 18 L24 16 Z" fill="url(#goldGrad)" opacity="0.9" />
        <path d="M42 24 L30 30 L32 24 Z" fill="url(#goldGrad)" opacity="0.75" />
        <path d="M24 42 L18 30 L24 32 Z" fill="url(#goldGrad)" opacity="0.6" />
        <path d="M6 24 L18 18 L16 24 Z" fill="url(#goldGrad)" opacity="0.45" />
        {/* Center circle — lens */}
        <circle cx="24" cy="24" r="6" fill="url(#goldGrad)" />
        <circle cx="24" cy="24" r="3.5" fill="#060608" />
        <circle cx="24" cy="24" r="1.5" fill="url(#goldGrad)" opacity="0.5" />
        <defs>
          <linearGradient id="goldGrad" x1="0" y1="0" x2="48" y2="48">
            <stop offset="0%" stopColor="#F0D78C" />
            <stop offset="50%" stopColor="#D4A843" />
            <stop offset="100%" stopColor="#B8892E" />
          </linearGradient>
        </defs>
      </svg>

      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <span
          className={`font-display font-bold ${s.text} tracking-[0.15em] text-text-primary`}
          style={{ fontVariantCaps: "small-caps" }}
        >
          KINO
        </span>
        {size !== "small" && (
          <span className="text-[9px] font-mono text-accent/50 uppercase tracking-[0.35em] mt-0.5">
            Cinema
          </span>
        )}
      </div>
    </div>
  );
}
