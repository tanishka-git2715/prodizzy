import { useState, useEffect, useCallback } from "react";

export interface CustomSession {
  user: {
    id: string;
    googleId?: string;
    email: string | null;
    displayName?: string;
    avatarUrl?: string;
  };
}

export function useAuth() {
  const [session, setSession] = useState<CustomSession | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setSession({ user: data });
        setUser(data);
      } else {
        setSession(null);
        setUser(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const loginWithGoogle = () => {
    window.location.href = "/api/auth/google";
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession(null);
    setUser(null);
    window.location.href = "/";
  };

  return { session, user, loading, error, refreshSession, loginWithGoogle, logout };
}

