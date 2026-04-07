"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, TrendingUp, Sparkles, Bookmark } from "lucide-react";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { href: "/", label: "Discover", icon: Home },
  { href: "/browse", label: "Browse", icon: Compass },
  { href: "/feed", label: "Feed", icon: TrendingUp },
  { href: "/ai", label: "Oracle", icon: Sparkles },
  { href: "/library", label: "Library", icon: Bookmark },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex justify-center pointer-events-none"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
    >
      {/* Expanding Pill Tab Bar */}
      <div className="pointer-events-auto flex items-center gap-2 px-2 py-2 rounded-full bg-[#0a0a0c]/85 backdrop-blur-3xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.02)]">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex items-center justify-center h-[46px] rounded-full transition-transform active:scale-95"
            >
              {/* Active Tab Background */}
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-active-pill"
                  className="absolute inset-0 rounded-full bg-accent/15 border border-accent/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}

              <div className={`relative z-10 flex items-center justify-center h-full transition-all duration-300 ease-out ${
                isActive ? "px-4" : "w-[46px]"
              }`}>
                <Icon
                  className={`flex-shrink-0 transition-colors duration-300 ${
                    isActive ? "w-5 h-5 text-accent" : "w-5 h-5 text-text-tertiary hover:text-text-primary"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                
                {/* CSS purely fluid expansion */}
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-out flex items-center ${
                    isActive ? "max-w-[80px] ml-1.5 opacity-100" : "max-w-0 opacity-0"
                  }`}
                >
                  <span className="text-[11px] font-bold tracking-wide text-accent whitespace-nowrap pt-[1px]">
                    {item.label}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
