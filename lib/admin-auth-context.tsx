"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const STORAGE_KEY = "porter_admin_session";
const IMPERSONATE_KEY = "porter_impersonate_seller_id";

type AdminSession = {
  email: string;
  /** In production, set from Supabase admin_users check */
  role: "super_admin" | "support";
};

type AdminAuthContextValue = {
  session: AdminSession | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  impersonateSellerId: string | null;
  setImpersonateSellerId: (id: string | null) => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

/** Demo gate: any non-empty password accepts. Replace with Supabase + admin_users check on server. */
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [impersonateSellerId, setImpersonateSellerIdState] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSession(JSON.parse(raw) as AdminSession);
      setImpersonateSellerIdState(localStorage.getItem(IMPERSONATE_KEY));
    } catch {
      /* ignore */
    }
  }, []);

  const login = useCallback((email: string, password: string) => {
    const trimmed = email.trim();
    if (!trimmed || !password) return false;
    const next: AdminSession = {
      email: trimmed,
      role: trimmed.toLowerCase().includes("support") ? "support" : "super_admin",
    };
    setSession(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return true;
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    localStorage.removeItem(STORAGE_KEY);
    setImpersonateSellerIdState(null);
    localStorage.removeItem(IMPERSONATE_KEY);
  }, []);

  const setImpersonateSellerId = useCallback((id: string | null) => {
    setImpersonateSellerIdState(id);
    if (id) localStorage.setItem(IMPERSONATE_KEY, id);
    else localStorage.removeItem(IMPERSONATE_KEY);
  }, []);

  const value = useMemo(
    () => ({ session, login, logout, impersonateSellerId, setImpersonateSellerId }),
    [session, login, logout, impersonateSellerId, setImpersonateSellerId]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
