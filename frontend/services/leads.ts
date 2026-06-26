import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api";
import type {
  LeadCreatePayload,
  LeadCreateResponse,
  PaginatedLeadsResponse,
  DashboardStats,
  AnalyzeResponse,
  LeadFilters,
} from "@/types";

// ─────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────
export const QUERY_KEYS = {
  leads: (filters: LeadFilters) => ["leads", filters] as const,
  dashboard: () => ["dashboard"] as const,
} as const;

// ─────────────────────────────────────────
// Fetch Functions
// ─────────────────────────────────────────

async function fetchLeads(filters: LeadFilters): Promise<PaginatedLeadsResponse> {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));
  if (filters.search) params.set("search", filters.search);
  if (filters.sort_by) params.set("sort_by", filters.sort_by);
  if (filters.sort_order) params.set("sort_order", filters.sort_order);
  if (filters.email_sent !== undefined) params.set("email_sent", String(filters.email_sent));
  if (filters.email_opened !== undefined) params.set("email_opened", String(filters.email_opened));
  if (filters.link_clicked !== undefined) params.set("link_clicked", String(filters.link_clicked));

  const { data } = await api.get<PaginatedLeadsResponse>(`/api/leads?${params.toString()}`);
  return data;
}

async function fetchDashboard(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>("/api/dashboard");
  return data;
}

async function createLead(payload: LeadCreatePayload): Promise<LeadCreateResponse> {
  const { data } = await api.post<LeadCreateResponse>("/api/leads", payload);
  return data;
}

async function triggerAnalysis(): Promise<AnalyzeResponse> {
  const { data } = await api.post<AnalyzeResponse>("/api/analyze");
  return data;
}

async function downloadCsv(): Promise<string> {
  const { data } = await api.get<string>("/api/export/csv", {
    responseType: "text",
  });
  return data;
}

// ─────────────────────────────────────────
// TanStack Query Hooks
// ─────────────────────────────────────────

/**
 * Hook: Fetch paginated leads with search/filter/sort.
 */
export function useLeads(filters: LeadFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.leads(filters),
    queryFn: () => fetchLeads(filters),
    staleTime: 30_000, // Consider data fresh for 30 seconds
    placeholderData: (prev) => prev, // Keep previous data during page transitions
  });
}

/**
 * Hook: Fetch dashboard analytics stats.
 */
export function useDashboard() {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard(),
    queryFn: fetchDashboard,
    refetchInterval: 60_000, // Auto-refresh every 60 seconds
    staleTime: 30_000,
  });
}

/**
 * Mutation: Submit a new lead.
 * On success, invalidates the leads and dashboard caches.
 */
export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard() });
    },
  });
}

/**
 * Mutation: Trigger AI analysis of unclassified leads.
 * On success, invalidates leads cache so table refreshes.
 */
export function useAnalyzeLeads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: triggerAnalysis,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

/**
 * Mutation: Download leads as CSV.
 */
export function useExportCsv() {
  return useMutation({
    mutationFn: downloadCsv,
  });
}
