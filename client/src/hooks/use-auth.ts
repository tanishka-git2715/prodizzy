import { useState, useEffect, useCallback } from "react";
import type { User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

// Custom session type compatible with our API structure
export interface CustomSession {
  access_token: string;
  user: {
    id: string;
    email: string | null;
  };
}

export function useAuth() {
  const [session, setSession] = useState<CustomSession | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const token = await currentUser.getIdToken();
        setSession({
          access_token: token,
          user: {
            id: currentUser.uid,
            email: currentUser.email,
          },
        });
        setUser(currentUser);
      } catch (err: any) {
        setError(err.message);
      }
    } else {
      setSession(null);
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          setSession({
            access_token: token,
            user: {
              id: firebaseUser.uid,
              email: firebaseUser.email,
            },
          });
          setUser(firebaseUser);
          setError(null);
        } catch (err: any) {
          setError(err.message);
        }
      } else {
        setSession(null);
        setUser(null);
        setError(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { session, user, loading, error, refreshSession };
}
