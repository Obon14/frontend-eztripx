"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { landingCopy, type LandingCopy, type Locale } from "@/lib/i18n/landing";

const LOCALE_STORAGE_KEY = "eztripx-locale";
const localeListeners = new Set<() => void>();

function isLocale(value: string | null): value is Locale {
  return value === "id" || value === "en";
}

function readStoredLocale(): Locale {
  try {
    const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(saved)) return saved;
  } catch {
    // private mode / blocked storage
  }
  return "id";
}

function getServerLocale(): Locale {
  return "id";
}

function subscribeLocale(onStoreChange: () => void) {
  localeListeners.add(onStoreChange);
  const onStorage = () => onStoreChange();
  window.addEventListener("storage", onStorage);
  return () => {
    localeListeners.delete(onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

function persistLocale(next: Locale) {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
  } catch {
    // ignore write failures
  }
  localeListeners.forEach((listener) => listener());
}

type AuthModal = "login" | "register" | null;
type LandingUser = {
  id: string;
  email: string;
  role: string;
  displayName: string | null;
  hasAvatar: boolean;
  avatarRev: number;
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
  const locale = useSyncExternalStore<Locale>(
    subscribeLocale,
    readStoredLocale,
    getServerLocale,
  );
  const [authModal, setAuthModal] = useState<AuthModal>(null);
  const [currentUser, setCurrentUser] = useState<LandingUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const setLocale = useCallback((next: Locale) => {
    persistLocale(next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

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
    const raw = (await res.json().catch(() => null)) as unknown;
    const body =
      raw && typeof raw === "object" && "data" in raw && (raw as { data: unknown }).data
        && typeof (raw as { data: unknown }).data === "object"
        ? ((raw as { data: Record<string, unknown> }).data)
        : (raw as Record<string, unknown> | null);
    const id = typeof body?.id === "string" ? body.id : null;
    const email = typeof body?.email === "string" ? body.email : null;
    const role = typeof body?.role === "string" ? body.role : null;
    if (id && email && role) {
      setCurrentUser({
        id,
        email,
        role,
        displayName: typeof body?.displayName === "string" ? body.displayName : null,
        hasAvatar: body?.hasAvatar === true,
        avatarRev: Date.now(),
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
