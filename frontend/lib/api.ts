import { apiBase } from "./util";

export const apiUrl = (path: string) => {
  const base = apiBase();
  if (!base) return path; // rely on next.config rewrites
  return base.replace(/\/$/, "") + path;
};

const TOKEN_KEY = "finvoq-auth-token";

export const tokenStore = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(TOKEN_KEY, token);
    } catch {}
  },
  clear() {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(TOKEN_KEY);
    } catch {}
  }
};

const buildHeaders = (
  init?: RequestInit,
  withAuth?: boolean
): HeadersInit => {
  const h = new Headers(init?.headers || {});
  if (init?.body && !h.has("Content-Type")) {
    h.set("Content-Type", "application/json");
  }
  if (withAuth) {
    const t = tokenStore.get();
    if (t) h.set("Authorization", `Bearer ${t}`);
  }
  return h;
};

const handle = async <T>(r: Response): Promise<T> => {
  if (!r.ok) {
    let msg = `Request failed: ${r.status}`;
    let data: any = null;
    try {
      data = await r.json();
      if (data?.error) msg = data.error;
    } catch {}
    const err = new Error(msg) as Error & {
      status?: number;
      data?: any;
    };
    err.status = r.status;
    err.data = data;
    throw err;
  }
  // 204 / empty
  const text = await r.text();
  return (text ? JSON.parse(text) : ({} as T)) as T;
};

export const fetcher = async <T = unknown>(path: string): Promise<T> => {
  const r = await fetch(apiUrl(path));
  return handle<T>(r);
};

export async function postJSON<T = unknown>(
  path: string,
  body: unknown
): Promise<T> {
  const r = await fetch(apiUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return handle<T>(r);
}

/**
 * Authenticated request helper. Automatically attaches the bearer token if
 * one is present in localStorage. Throws an Error with `status` set on
 * non-2xx responses, so callers can branch on `err.status === 401`.
 */
export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const r = await fetch(apiUrl(path), {
    ...init,
    headers: buildHeaders(init, true)
  });
  return handle<T>(r);
}

export async function apiPostJSON<T = unknown>(
  path: string,
  body: unknown,
  init: RequestInit = {}
): Promise<T> {
  return apiFetch<T>(path, {
    ...init,
    method: init.method || "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json", ...(init.headers || {}) }
  });
}
