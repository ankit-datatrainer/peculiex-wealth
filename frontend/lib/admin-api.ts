import { apiFetch, apiPostJSON } from "./api";

/**
 * Thin typed helpers around the /api/admin/* endpoints.
 *
 * Every helper here uses `apiFetch` / `apiPostJSON`, which automatically
 * attach the bearer token from localStorage. The backend already enforces
 * `requireAuth + requireAdmin` on every route, so these helpers don't need
 * to do any authorisation themselves — the server is the gate.
 */

export type AdminStats = {
  unlisted: number;
  stocks: number;
  users: number;
  leads: number;
  newsletter: number;
  contact: number;
  db: "connected" | "seed-mode";
};

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  mobile: string | null;
  role: "user" | "admin" | "superadmin";
  created_at: string;
};

export type AdminUnlisted = {
  id: string;
  name: string;
  domain: string;
  sector: string;
  brand: string;
  initial: string;
  price: number;
  iv: string;
  tag: "trend" | "avail" | "lim";
  logo_url: string | null;
  created_at?: string;
  updated_at?: string;
};

export type AdminStock = {
  id: string;
  sym: string;
  name: string;
  price: number;
  chg: number;
  vol: string;
  cap: string;
  cat: "up" | "stable" | "watch";
  created_at?: string;
  updated_at?: string;
};

export type AdminLead = {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  interest: string;
  budget: string;
  message: string | null;
  status: string;
  created_at: string;
};

export type AdminSubscriber = {
  email: string;
  unsubscribed: boolean;
  created_at: string;
};

export type AdminContactMessage = {
  id: number | string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
};

// ---------- stats ----------
export const fetchStats = () =>
  apiFetch<{ stats: AdminStats }>("/api/admin/stats").then((r) => r.stats);

// ---------- users ----------
export const fetchUsers = (q = "") =>
  apiFetch<{ users: AdminUser[] }>(
    `/api/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`
  ).then((r) => r.users);

export const updateUser = (
  id: string,
  patch: Partial<{
    name: string;
    mobile: string | null;
    role: "user" | "admin" | "superadmin";
    password: string;
  }>
) =>
  apiPostJSON<{ user: AdminUser }>(`/api/admin/users/${id}`, patch, {
    method: "PATCH"
  }).then((r) => r.user);

export const deleteUser = (id: string) =>
  apiFetch<{ ok: boolean }>(`/api/admin/users/${id}`, { method: "DELETE" });

// ---------- unlisted ----------
export const fetchUnlisted = () =>
  apiFetch<{ items: AdminUnlisted[] }>("/api/admin/unlisted").then(
    (r) => r.items
  );

export const createUnlisted = (
  payload: Omit<AdminUnlisted, "id" | "created_at" | "updated_at">
) =>
  apiPostJSON<{ item: AdminUnlisted }>("/api/admin/unlisted", payload).then(
    (r) => r.item
  );

export const updateUnlisted = (
  id: string,
  patch: Partial<Omit<AdminUnlisted, "id" | "created_at" | "updated_at">>
) =>
  apiPostJSON<{ item: AdminUnlisted }>(`/api/admin/unlisted/${id}`, patch, {
    method: "PATCH"
  }).then((r) => r.item);

export const deleteUnlisted = (id: string) =>
  apiFetch<{ ok: boolean }>(`/api/admin/unlisted/${id}`, { method: "DELETE" });

// ---------- stocks ----------
export const fetchStocks = () =>
  apiFetch<{ items: AdminStock[] }>("/api/admin/stocks").then((r) => r.items);

export const createStock = (
  payload: Omit<AdminStock, "id" | "created_at" | "updated_at">
) =>
  apiPostJSON<{ item: AdminStock }>("/api/admin/stocks", payload).then(
    (r) => r.item
  );

export const updateStock = (
  id: string,
  patch: Partial<Omit<AdminStock, "id" | "created_at" | "updated_at">>
) =>
  apiPostJSON<{ item: AdminStock }>(`/api/admin/stocks/${id}`, patch, {
    method: "PATCH"
  }).then((r) => r.item);

export const deleteStock = (id: string) =>
  apiFetch<{ ok: boolean }>(`/api/admin/stocks/${id}`, { method: "DELETE" });

// ---------- leads ----------
export const fetchLeads = () =>
  apiFetch<{ items: AdminLead[] }>("/api/admin/leads").then((r) => r.items);

export const updateLeadStatus = (id: string | number, status: string) =>
  apiPostJSON<{ item: AdminLead }>(`/api/admin/leads/${id}`, { status }, {
    method: "PATCH"
  }).then((r) => r.item);

export const deleteLead = (id: string | number) =>
  apiFetch<{ ok: boolean }>(`/api/admin/leads/${id}`, { method: "DELETE" });

// ---------- newsletter ----------
export const fetchNewsletter = () =>
  apiFetch<{ items: AdminSubscriber[] }>("/api/admin/newsletter").then(
    (r) => r.items
  );

export const deleteSubscriber = (email: string) =>
  apiFetch<{ ok: boolean }>(
    `/api/admin/newsletter/${encodeURIComponent(email)}`,
    { method: "DELETE" }
  );

// ---------- contact ----------
export const fetchContactMessages = () =>
  apiFetch<{ items: AdminContactMessage[] }>("/api/admin/contact").then(
    (r) => r.items
  );

export const deleteContactMessage = (id: string | number) =>
  apiFetch<{ ok: boolean }>(`/api/admin/contact/${id}`, { method: "DELETE" });
