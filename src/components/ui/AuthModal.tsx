import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, AlertCircle, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [view, setView] = useState<"login" | "signup" | "forgot_password">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (view === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.toLowerCase().includes("email not confirmed")) {
            throw new Error("Please verify your email address. Check your inbox!");
          }
          throw error;
        }
        onClose();
      } else if (view === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccessMsg("Welcome! Please check your email inbox to verify your account before signing in.");
        setView("login");
        setPassword("");
      } else if (view === "forgot_password") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSuccessMsg("Check your email for the password reset link.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-bg-surface border border-border rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.8)] overflow-hidden relative"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8">
                {/* Header */}
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-display font-medium text-text-primary mb-2">
                    {view === "login" && "Welcome Back"}
                    {view === "signup" && "Create Account"}
                    {view === "forgot_password" && "Reset Password"}
                  </h2>
                  <p className="text-text-tertiary text-sm max-w-[280px] mx-auto">
                    {view === "login" && "Sign in to securely sync your content."}
                    {view === "signup" && "Join KINO to build your ultimate multi-media library."}
                    {view === "forgot_password" && "Enter your email and we'll send you a link to reset your password."}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-error/10 border border-error/20 rounded-lg flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                      <p className="text-sm text-error">{error}</p>
                    </div>
                  )}

                  {successMsg && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-green-500">{successMsg}</p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-text-secondary ml-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-4 h-4 text-text-tertiary" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-bg-elevated border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all placeholder:text-text-tertiary/50"
                        placeholder="cinema@example.com"
                      />
                    </div>
                  </div>

                  {view !== "forgot_password" && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between ml-1">
                        <label className="text-xs font-medium text-text-secondary">Password</label>
                        {view === "login" && (
                          <button 
                            type="button" 
                            onClick={() => { setView("forgot_password"); setError(null); setSuccessMsg(null); }}
                            className="text-[10px] text-accent hover:text-accent-hover transition-colors font-medium mr-1"
                          >
                            Forgot?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 w-4 h-4 text-text-tertiary" />
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-bg-elevated border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all placeholder:text-text-tertiary/50"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 bg-white text-black font-semibold text-sm py-2.5 rounded-lg hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
                  >
                    {loading ? "Please wait..." : view === "login" ? "Sign In" : view === "signup" ? "Sign Up" : "Send Reset Link"}
                  </button>
                </form>

                {view === "forgot_password" ? (
                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={() => { setView("login"); setError(null); setSuccessMsg(null); }}
                      className="text-sm text-text-tertiary hover:text-white transition-colors"
                    >
                      Back to Sign In
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Divider */}
                    <div className="my-6 flex items-center gap-3">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-text-tertiary font-medium uppercase tracking-wider">Or</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* Google Button */}
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="w-full bg-bg-elevated border border-border text-text-secondary text-sm py-2.5 rounded-lg hover:text-text-primary hover:border-text-secondary transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Continue with Google
                    </button>
                  </>
                )}
              </div>

              {/* Footer Toggle */}
              {view !== "forgot_password" && (
                <div className="px-8 py-4 bg-bg-elevated/50 border-t border-border flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setView(view === "login" ? "signup" : "login");
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-sm text-text-tertiary hover:text-white transition-colors"
                  >
                    {view === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
