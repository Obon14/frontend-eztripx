"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { landingCopy, type LandingCopy, type Locale } from "@/lib/i18n/landing";

type AuthModal = "login" | "register" | null;
type LandingUser = {
  id: string;
  email: string;
  role: string;
};

type LandingContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: LandingCopy;
  authModal: AuthModal;
  openLogin: () => void;
  openRegister: () => void;
  closeAuth: () => void;
  switchToRegister: () => void;
  switchToLogin: () => void;
  currentUser: LandingUser | null;
  isCheckingAuth: boolean;
  refreshCurrentUser: () => Promise<void>;
  logout: () => Promise<void>;
};

const LandingContext = createContext<LandingContextValue | null>(null);

export function LandingProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("id");
  const [authModal, setAuthModal] = useState<AuthModal>(null);
  const [currentUser, setCurrentUser] = useState<LandingUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const t = landingCopy[locale];

  const openLogin = useCallback(() => setAuthModal("login"), []);
  const openRegister = useCallback(() => setAuthModal("register"), []);
  const closeAuth = useCallback(() => setAuthModal(null), []);
  const switchToRegister = useCallback(() => setAuthModal("register"), []);
  const switchToLogin = useCallback(() => setAuthModal("login"), []);
  const refreshCurrentUser = useCallback(async () => {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    if (!res.ok) {
      setCurrentUser(null);
      return;
    }
    const body = (await res.json().catch(() => null)) as
      | { id?: string; email?: string; role?: string }
      | null;
    if (body?.id && body?.email && body?.role) {
      setCurrentUser({
        id: body.id,
        email: body.email,
        role: body.role,
      });
      return;
    }
    setCurrentUser(null);
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setCurrentUser(null);
  }, []);

  useEffect(() => {
    let active = true;
    async function loadCurrentUser() {
      try {
        await refreshCurrentUser();
      } finally {
        if (active) {
          setIsCheckingAuth(false);
        }
      }
    }
    void loadCurrentUser();
    return () => {
      active = false;
    };
  }, [refreshCurrentUser]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      authModal,
      openLogin,
      openRegister,
      closeAuth,
      switchToRegister,
      switchToLogin,
      currentUser,
      isCheckingAuth,
      refreshCurrentUser,
      logout,
    }),
    [
      locale,
      t,
      authModal,
      openLogin,
      openRegister,
      closeAuth,
      switchToRegister,
      switchToLogin,
      currentUser,
      isCheckingAuth,
      refreshCurrentUser,
      logout,
    ],
  );

  return <LandingContext.Provider value={value}>{children}</LandingContext.Provider>;
}

export function useLanding() {
  const ctx = useContext(LandingContext);
  if (!ctx) {
    throw new Error("useLanding must be used within LandingProvider");
  }
  return ctx;
}
