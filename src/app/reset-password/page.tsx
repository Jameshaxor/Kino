"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Lock, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import KinoLogo from "@/components/ui/KinoLogo";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    // Check if the user is authenticated (Supabase automatically logs in the user when they click the reset link)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Invalid or expired password reset link. Please try requesting a new one.");
      }
      setVerifying(false);
    };
    checkSession();

    // Setup an auth listener in case the session gets established slightly after mount
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setError(null);
        setVerifying(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <div className="w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <Link href="/" className="mb-8 hover:opacity-80 transition-opacity relative z-10">
        <KinoLogo size="default" />
      </Link>

      <div className="relative z-10 w-full max-w-md bg-bg-surface border border-border rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.8)] overflow-hidden p-8">
        <h1 className="text-2xl font-display font-medium text-text-primary mb-2 text-center">
          Update Password
        </h1>
        <p className="text-text-tertiary text-sm text-center mb-8 max-w-[280px] mx-auto">
          Please enter your secure new password below.
        </p>

        {verifying ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
            <p className="text-text-secondary text-sm">Verifying secure link...</p>
          </div>
        ) : success ? (
          <div className="flex flex-col items-center gap-4 text-center py-4">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
              <Sparkles className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-green-500 font-medium">Password updated securely!</p>
            <p className="text-sm text-text-tertiary">Redirecting to KINO...</p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-5">
            {error && (
              <div className="p-3 bg-error/10 border border-error/20 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                <p className="text-sm text-error leading-relaxed">{error}</p>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary ml-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-text-tertiary" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-bg-elevated border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all"
                  placeholder="••••••••"
                  disabled={!!error}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || password.length < 6 || !!error}
              className="w-full bg-white text-black font-semibold text-sm py-3 rounded-lg hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
