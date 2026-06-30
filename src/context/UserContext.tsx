"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { PropertyIntelligence } from "@/lib/api/intelligence";
import type { AppUser } from "@/lib/user-types";

interface UserContextValue {
  user: AppUser | null;
  property: PropertyIntelligence | null;
  loading: boolean;
  setUser: (user: AppUser) => void;
  refreshProperty: () => Promise<void>;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AppUser | null>(null);
  const [property, setProperty] = useState<PropertyIntelligence | null>(null);
  const [loading, setLoading] = useState(true);

  const setUser = (u: AppUser) => {
    setUserState(u);
    localStorage.setItem("plotpulse_user", JSON.stringify(u));
    localStorage.setItem("plotpulse_postcode", u.postcode);
  };

  const refreshProperty = useCallback(async () => {
    const postcode =
      user?.postcode ?? localStorage.getItem("plotpulse_postcode");
    if (!postcode) {
      setProperty(null);
      return;
    }

    try {
      const res = await fetch(
        `/api/property?postcode=${encodeURIComponent(postcode)}`
      );
      if (res.ok) setProperty(await res.json());
    } catch {
      setProperty(null);
    }
  }, [user?.postcode]);

  useEffect(() => {
    const stored = localStorage.getItem("plotpulse_user");
    if (stored) {
      try {
        setUserState(JSON.parse(stored));
      } catch {
        localStorage.removeItem("plotpulse_user");
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) refreshProperty();
  }, [loading, refreshProperty]);

  const signOut = async () => {
    await fetch("/api/auth/session", { method: "DELETE" });
    localStorage.removeItem("plotpulse_user");
    localStorage.removeItem("plotpulse_postcode");
    setUserState(null);
    setProperty(null);
  };

  return (
    <UserContext.Provider
      value={{ user, property, loading, setUser, refreshProperty, signOut }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
