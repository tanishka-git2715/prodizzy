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

  const login = async (data: any) => {
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const user = await res.json();
        setSession({ user });
        setUser(user);
        return { success: true };
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Login failed");
        return { success: false, message: errorData.message };
      }
    } catch (err: any) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const register = async (data: any) => {
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const user = await res.json();
        setSession({ user });
        setUser(user);
        return { success: true };
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Registration failed");
        return { success: false, message: errorData.message };
      }
    } catch (err: any) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession(null);
    setUser(null);
    window.location.href = "/";
  };

  return { session, user, loading, error, refreshSession, loginWithGoogle, logout, login, register };
}

