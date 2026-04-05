"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CommandPalette from "./CommandPalette";
import ScrollToTop from "@/components/ui/ScrollToTop";
import AuthGreeting from "@/components/ui/AuthGreeting";
import { WatchlistProvider } from "@/context/WatchlistContext";

function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch((err) => {
          console.error("Service worker registration failed", err);
        });
      });
    }
  }, []);

  return (
    <WatchlistProvider>
      <Navbar onOpenSearch={openSearch} />
      <main className="flex-grow w-full pt-16">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <ScrollToTop />
      <AuthGreeting />
      <CommandPalette isOpen={searchOpen} onClose={closeSearch} />
    </WatchlistProvider>
  );
}
