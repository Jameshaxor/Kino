"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, TrendingUp, Sparkles, Bookmark } from "lucide-react";

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
      <div className="pointer-events-auto flex items-center gap-1.5 px-2 py-2 rounded-full bg-[#0a0a0c]/90 backdrop-blur-3xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.02)]">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex items-center justify-center h-[44px] rounded-full active:scale-95 transition-transform duration-150"
            >
              {/* Active background — pure CSS, no spring physics */}
              <div
                className={`absolute inset-0 rounded-full transition-all duration-300 ease-out ${
                  isActive
                    ? "bg-accent/15 border border-accent/25 opacity-100"
                    : "opacity-0"
                }`}
              />

              <div
                className={`relative z-10 flex items-center justify-center h-full transition-all duration-300 ease-out ${
                  isActive ? "px-4" : "w-[44px]"
                }`}
              >
                <Icon
                  className={`flex-shrink-0 transition-all duration-300 ${
                    isActive
                      ? "w-[18px] h-[18px] text-accent"
                      : "w-[18px] h-[18px] text-white/40"
                  }`}
                  strokeWidth={isActive ? 2.5 : 1.75}
                />

                {/* Smooth label expansion */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-out flex items-center ${
                    isActive ? "max-w-[72px] ml-1.5 opacity-100" : "max-w-0 opacity-0"
                  }`}
                >
                  <span className="text-[11px] font-semibold tracking-wide text-accent whitespace-nowrap">
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
