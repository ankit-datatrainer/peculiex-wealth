"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { apiFetch, apiPostJSON, tokenStore } from "./api";

export type UserRole = "user" | "manager" | "admin" | "superadmin";

export type User = {
  id: string;
  email: string;
  name: string;
  mobile: string | null;
  role: UserRole;
  email_verified?: boolean;
};

/** Convenience: does this user have full admin-panel access? */
export const isAdminUser = (u: User | null | undefined): boolean =>
  !!u && (u.role === "admin" || u.role === "superadmin");

/** Managers have access ONLY to the Unlisted Shares admin page. */
export const isManagerUser = (u: User | null | undefined): boolean =>
  !!u && u.role === "manager";

/** Anyone allowed to reach the admin shell (admins, super-admins, managers). */
export const canAccessAdmin = (u: User | null | undefined): boolean =>
  isAdminUser(u) || isManagerUser(u);

type AuthState = {
  user: User | null;
  ready: boolean; // initial /me lookup has completed
  loading: boolean; // a login/signup request is in flight
  error: string | null;
};

type StartSignupResult = {
  pendingEmail: string;
  delivery: "email" | "dev-console";
  message: string;
};

type LoginResult =
  | { ok: true; user: User }
  | { ok: false; needsVerification: true; pendingEmail: string };

type AuthActions = {
  /** Submit credentials. Returns the email awaiting OTP verification. The
   *  user is NOT logged in yet — call verifyOtp next. */
  startSignup: (
    name: string,
    email: string,
    password: string,
    mobile?: string
  ) => Promise<StartSignupResult>;
  /** Verify the 6-digit OTP. On success, the user is logged in. */
  verifyOtp: (email: string, otp: string) => Promise<User>;
  /** Request a fresh OTP for the given email. */
  resendOtp: (email: string) => Promise<void>;
  /** Login. If the email isn't verified the result tells the caller to
   *  pivot to the OTP screen instead of throwing. */
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  refresh: () => Promise<User | null>;
  clearError: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<User>;
  requestChangePassword: () => Promise<void>;
  verifyChangePassword: (otp: string, newPassword: string) => Promise<void>;
};

type AuthContextValue = AuthState & AuthActions;

const AuthContext = createContext<AuthContextValue | null>(null);

const isBrowser = () => typeof window !== "undefined";

/** Migrate any pre-existing localStorage watchlist into the user account.
 *  Best-effort: we never block login on this. */
async function migrateLocalWatchlist(): Promise<void> {
  if (!isBrowser()) return;
  try {
    const raw = window.localStorage.getItem("peculiex-watchlist");
    if (!raw) return;
    const list = JSON.parse(raw);
    if (!Array.isArray(list) || !list.length) return;
    const items = list
      .filter((s) => typeof s === "string" && s.trim())
      .map((s: string) => ({ symbol: s.toUpperCase().trim() }));
    if (!items.length) return;
    await apiPostJSON("/api/watchlist/batch", { items });
    window.localStorage.removeItem("peculiex-watchlist");
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[auth] watchlist migration skipped:", e);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bootRef = useRef(false);

  // Boot: if we have a token, validate it and load the user.
  useEffect(() => {
    if (bootRef.current) return;
    bootRef.current = true;
    const token = tokenStore.get();
    if (!token) {
      setReady(true);
      return;
    }
    apiFetch<{ user: User }>("/api/auth/me")
      .then((r) => setUser(r.user))
      .catch(() => {
        tokenStore.clear();
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  const refresh = useCallback(async () => {
    if (!tokenStore.get()) {
      setUser(null);
      return null;
    }
    try {
      const r = await apiFetch<{ user: User }>("/api/auth/me");
      setUser(r.user);
      return r.user;
    } catch {
      tokenStore.clear();
      setUser(null);
      return null;
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      setLoading(true);
      setError(null);
      try {
        const r = await apiPostJSON<{ token: string; user: User }>(
          "/api/auth/login",
          { email: email.trim(), password }
        );
        tokenStore.set(r.token);
        setUser(r.user);
        void migrateLocalWatchlist();
        return { ok: true, user: r.user };
      } catch (e: any) {
        // Pivot path: server says "verify your email first"
        if (e?.status === 403 && e?.data?.needsVerification) {
          return {
            ok: false,
            needsVerification: true,
            pendingEmail: e.data.pendingEmail || email.trim()
          };
        }
        const msg = e?.message || "Could not sign you in.";
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const startSignup = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      mobile?: string
    ): Promise<StartSignupResult> => {
      setLoading(true);
      setError(null);
      try {
        const r = await apiPostJSON<StartSignupResult>("/api/auth/signup", {
          name: name.trim(),
          email: email.trim(),
          password,
          mobile: mobile?.trim() || ""
        });
        return r;
      } catch (e: any) {
        const msg = e?.message || "Could not create your account.";
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    setLoading(true);
    setError(null);
    try {
      const r = await apiPostJSON<{ token: string; user: User }>(
        "/api/auth/verify-otp",
        { email: email.trim(), otp: otp.trim() }
      );
      tokenStore.set(r.token);
      setUser(r.user);
      void migrateLocalWatchlist();
      return r.user;
    } catch (e: any) {
      const msg = e?.message || "Could not verify your code.";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const resendOtp = useCallback(async (email: string) => {
    setError(null);
    try {
      await apiPostJSON("/api/auth/resend-otp", { email: email.trim() });
    } catch (e: any) {
      const msg = e?.message || "Could not resend the code.";
      setError(msg);
      throw e;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiPostJSON("/api/auth/logout", {});
    } catch {
      /* ignore */
    }
    tokenStore.clear();
    setUser(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const forgotPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiPostJSON("/api/auth/forgot-password", { email: email.trim() });
    } catch (e: any) {
      setError(e?.message || "Could not request password reset.");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string, otp: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      const r = await apiPostJSON<{ token: string; user: User }>("/api/auth/reset-password", {
        email: email.trim(),
        otp: otp.trim(),
        newPassword
      });
      tokenStore.set(r.token);
      setUser(r.user);
      return r.user;
    } catch (e: any) {
      setError(e?.message || "Could not reset password.");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const requestChangePassword = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await apiPostJSON("/api/auth/change-password-request", {});
    } catch (e: any) {
      setError(e?.message || "Could not request password change.");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyChangePassword = useCallback(async (otp: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiPostJSON("/api/auth/change-password-verify", {
        otp: otp.trim(),
        newPassword
      });
    } catch (e: any) {
      setError(e?.message || "Could not verify password change.");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      loading,
      error,
      login,
      startSignup,
      verifyOtp,
      resendOtp,
      logout,
      refresh,
      clearError,
      forgotPassword,
      resetPassword,
      requestChangePassword,
      verifyChangePassword
    }),
    [
      user,
      ready,
      loading,
      error,
      login,
      startSignup,
      verifyOtp,
      resendOtp,
      logout,
      refresh,
      clearError,
      forgotPassword,
      resetPassword,
      requestChangePassword,
      verifyChangePassword
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
