"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AuthGreeting() {
  const [greeting, setGreeting] = useState<string | null>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        // Prevent showing the greeting multiple times if the browser suspends/resumes or token refreshes
        const hasGreeted = sessionStorage.getItem("kino_has_greeted");
        if (!hasGreeted) {
          const username = session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "there";
          setGreeting(`Welcome to KINO, ${username}.`);
          sessionStorage.setItem("kino_has_greeted", "true");
          
          // Auto-dismiss after 5 seconds
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            setGreeting(null);
          }, 5000);
        }
      }
      
      // If they explicitly sign out, clear the flag so they can be greeted again later
      if (event === "SIGNED_OUT") {
        sessionStorage.removeItem("kino_has_greeted");
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <AnimatePresence>
      {greeting && (
        <motion.div
           initial={{ opacity: 0, y: 50, scale: 0.9 }}
           animate={{ opacity: 1, y: 0, scale: 1 }}
           exit={{ opacity: 0, y: 20, scale: 0.9 }}
           transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
           className="fixed bottom-6 right-6 z-[200]"
        >
          <div className="relative group overflow-hidden bg-bg-elevated/90 backdrop-blur-xl border border-accent/30 rounded-2xl shadow-gold p-4 flex items-center gap-4 min-w-[300px]">
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.1)_0%,transparent_60%)] pointer-events-none" />
             
             <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 relative">
               <Sparkles className="w-5 h-5 text-accent animate-pulse" />
             </div>
             
             <div className="flex-1">
               <p className="text-xs text-accent font-mono uppercase tracking-wider mb-0.5">Authorization Success</p>
               <p className="text-sm md:text-base font-display text-text-primary capitalize">{greeting}</p>
             </div>
             
             <button 
               onClick={() => setGreeting(null)}
               className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-white/5 transition-colors"
             >
               <X className="w-4 h-4" />
             </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
