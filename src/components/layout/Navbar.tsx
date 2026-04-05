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
                <div className="relative group/auth">
                  <button
                    className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full bg-bg-elevated border border-border text-text-secondary group-hover/auth:border-accent/50 transition-colors overflow-hidden"
                  >
                    {user.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-accent/20 flex items-center justify-center">
                        <span className="font-display font-medium text-accent text-sm">
                           {user.email?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                  </button>

                  <div className="absolute top-full right-0 mt-2 w-48 opacity-0 invisible group-hover/auth:opacity-100 group-hover/auth:visible transition-all duration-200 translate-y-2 group-hover/auth:translate-y-0 backdrop-blur-xl bg-bg-elevated/95 border border-border rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden">
                    <div className="px-4 py-3 border-b border-border/50">
                      <p className="text-[10px] text-text-tertiary font-mono uppercase tracking-wider mb-0.5">Signed in as</p>
                      <p className="text-sm font-medium text-text-primary truncate">{user.email}</p>
                    </div>
                    <div className="p-1.5">
                      <button 
                        onClick={() => supabase.auth.signOut()} 
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="btn-gold px-3 mb-0.5 py-1.5 md:px-4 md:py-2 text-xs md:text-sm flex items-center gap-1.5"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline font-semibold">Sign In</span>
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
