"use client";

import Link from "next/link";
import { Search, Sparkles, Bookmark, Compass, Menu, X, LogIn, LogOut, User as UserIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import KinoLogo from "@/components/ui/KinoLogo";
import { useWatchlist } from "@/context/WatchlistContext";
import { supabase } from "@/lib/supabase";
import AuthModal from "@/components/ui/AuthModal";

interface NavbarProps {
  onOpenSearch: () => void;
}

export default function Navbar({ onOpenSearch }: NavbarProps) {
  const { user } = useWatchlist();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Discover", icon: Sparkles },
    { href: "/browse", label: "Browse", icon: Compass },
    { href: "/library", label: "My Library", icon: Bookmark },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out border-b ${
          scrolled
            ? "bg-bg-base/80 backdrop-blur-md border-border/50 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
            : "bg-transparent border-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="group hover:opacity-90 transition-opacity">
              <KinoLogo size="default" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-white transition-colors">
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>

            {/* Search + Auth + Mobile toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenSearch}
                className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-lg bg-bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-text-secondary transition-all"
              >
                <Search className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="text-xs hidden sm:inline">Search</span>
                <kbd className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded bg-bg-elevated border border-border font-mono text-text-tertiary">
                  ⌘K
                </kbd>
              </button>

              {/* Auth Button */}
              {user ? (
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full bg-bg-elevated border border-border text-text-secondary hover:text-accent hover:border-accent/30 transition-colors"
                  title="Sign Out"
                >
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-lg bg-white text-black font-semibold text-xs md:text-sm hover:bg-white/90 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-all"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden absolute top-full left-0 right-0 bg-bg-surface border-b border-border overflow-hidden"
            >
              <div className="flex flex-col py-4 px-6 space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 text-lg font-medium text-text-secondary hover:text-white transition-colors"
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
