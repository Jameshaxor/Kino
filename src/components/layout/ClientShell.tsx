"use client";

import { useState, useCallback } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CommandPalette from "./CommandPalette";
import { WatchlistProvider } from "@/context/WatchlistContext";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  return (
    <WatchlistProvider>
      <Navbar onOpenSearch={openSearch} />
      <main className="flex-grow w-full pt-16">{children}</main>
      <Footer />
      <CommandPalette isOpen={searchOpen} onClose={closeSearch} />
    </WatchlistProvider>
  );
}
