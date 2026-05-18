"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { landingCopy, type LandingCopy, type Locale } from "@/lib/i18n/landing";

type AuthModal = "login" | "register" | null;

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
};

const LandingContext = createContext<LandingContextValue | null>(null);

export function LandingProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("id");
  const [authModal, setAuthModal] = useState<AuthModal>(null);

  const t = landingCopy[locale];

  const openLogin = useCallback(() => setAuthModal("login"), []);
  const openRegister = useCallback(() => setAuthModal("register"), []);
  const closeAuth = useCallback(() => setAuthModal(null), []);
  const switchToRegister = useCallback(() => setAuthModal("register"), []);
  const switchToLogin = useCallback(() => setAuthModal("login"), []);

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
