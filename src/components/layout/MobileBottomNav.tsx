"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, TrendingUp, Sparkles, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
              className={`relative flex items-center justify-center transition-all duration-300 ease-out active:scale-95 ${
                isActive ? "px-4 h-[46px]" : "w-[46px] h-[46px]"
              }`}
            >
              {/* Active Tab Background */}
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-active-pill"
                  className="absolute inset-0 rounded-full bg-accent/15 border border-accent/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}

              <div className="relative z-10 flex items-center justify-center gap-2">
                <Icon
                  className={`transition-colors duration-300 ${
                    isActive ? "w-5 h-5 text-accent" : "w-5 h-5 text-text-tertiary hover:text-text-primary"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                
                {/* Expandable Text Label */}
                <AnimatePresence mode="popLayout">
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, width: 0, x: -10 }}
                      animate={{ opacity: 1, width: "auto", x: 0 }}
                      exit={{ opacity: 0, width: 0, x: -10 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="text-[11px] font-bold tracking-wide text-accent whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
