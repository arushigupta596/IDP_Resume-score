"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center mx-auto p-2">
            <Image
              src="/Logotype_de_DP_World.png"
              alt="DP World"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">DP World</h1>
            <p className="text-sm text-muted-foreground">Talent Intelligence Platform</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal"
              placeholder="admin@dpworld.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-teal text-white font-medium text-sm hover:bg-teal/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
