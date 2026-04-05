"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Tv, ShoppingCart, Film, ExternalLink } from "lucide-react";

interface Provider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

interface WatchProvidersData {
  flatrate?: Provider[];
  rent?: Provider[];
  buy?: Provider[];
  link?: string;
}

interface WatchProvidersProps {
  providers: WatchProvidersData | null;
}

const TMDB_IMG = "https://image.tmdb.org/t/p/original";

function ProviderRow({
  label,
  icon: Icon,
  items,
  delay = 0,
}: {
  label: string;
  icon: React.ElementType;
  items: Provider[];
  delay?: number;
}) {
  if (!items || items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-3"
    >
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-accent" />
        <span className="text-xs font-mono text-text-tertiary uppercase tracking-[0.15em] font-medium">
          {label}
        </span>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {items.slice(0, 8).map((provider, i) => (
          <motion.div
            key={provider.provider_id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: delay + i * 0.04 }}
            className="group/prov relative"
          >
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl overflow-hidden bg-bg-elevated border border-border hover:border-accent/30 transition-all duration-300 hover:shadow-gold hover:-translate-y-0.5">
              <Image
                src={`${TMDB_IMG}${provider.logo_path}`}
                alt={provider.provider_name}
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
            </div>
            {/* Tooltip */}
            <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-bg-primary border border-border rounded-md text-[10px] text-text-primary whitespace-nowrap opacity-0 group-hover/prov:opacity-100 transition-opacity duration-200 pointer-events-none z-30 shadow-overlay">
              {provider.provider_name}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default function WatchProviders({ providers }: WatchProvidersProps) {
  if (!providers) return null;

  const hasProviders =
    (providers.flatrate && providers.flatrate.length > 0) ||
    (providers.rent && providers.rent.length > 0) ||
    (providers.buy && providers.buy.length > 0);

  if (!hasProviders) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-5 bg-bg-elevated rounded-xl border border-border"
      >
        <div className="flex items-center gap-3">
          <Tv className="w-5 h-5 text-text-tertiary" />
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-text-secondary">
              Not currently available for streaming
            </span>
            <span className="text-xs text-text-tertiary">
              Check back later or visit TMDB for updates
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="section-line" />
          <h2 className="text-sm font-mono text-accent uppercase tracking-[0.15em]">
            Where to Watch
          </h2>
        </div>
        {providers.link && (
          <a
            href={providers.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-accent transition-colors"
          >
            <span>JustWatch</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      <div className="p-5 md:p-6 bg-bg-elevated rounded-xl border border-border flex flex-col gap-5">
        <ProviderRow
          label="Stream"
          icon={Tv}
          items={providers.flatrate || []}
          delay={0}
        />
        <ProviderRow
          label="Rent"
          icon={Film}
          items={providers.rent || []}
          delay={0.1}
        />
        <ProviderRow
          label="Buy"
          icon={ShoppingCart}
          items={providers.buy || []}
          delay={0.2}
        />
      </div>
    </div>
  );
}
