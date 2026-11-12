"use client";

import useSWR from "swr";
import { fetcher } from "./api";
import { type Unl } from "@/components/Unlisted";

export function useUnlisted(companySlug?: string) {
  const url = companySlug ? `/api/unlisted?company=${encodeURIComponent(companySlug)}` : "/api/unlisted";
  const { data, error, isLoading } = useSWR<{ items: Unl[]; synced_at?: string }>(url, fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true
  });
  return { items: data?.items || [], syncedAt: data?.synced_at, loading: isLoading, error };
}
