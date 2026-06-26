// TypeScript type definitions for the entire application

// ─────────────────────────────────────────
// Lead Types
// ─────────────────────────────────────────

export interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company?: string;
  requirement: string;
  created_at: string;
  email_sent: boolean;
  email_opened: boolean;
  email_opened_at?: string;
  link_clicked: boolean;
  link_clicked_at?: string;
  ai_category?: string;
  ai_priority?: string;
}

export interface LeadCreatePayload {
  full_name: string;
  email: string;
  phone: string;
  company?: string;
  requirement: string;
}

export interface LeadCreateResponse {
  success: boolean;
  message: string;
  lead_id: string;
}

// ─────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────

export interface PaginatedLeadsResponse {
  leads: Lead[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface LeadFilters {
  page?: number;
  page_size?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  email_sent?: boolean;
  email_opened?: boolean;
  link_clicked?: boolean;
}

// ─────────────────────────────────────────
// Dashboard / Analytics
// ─────────────────────────────────────────

export interface DailyCount {
  date: string;
  count: number;
}

export interface DashboardStats {
  total_leads: number;
  emails_sent: number;
  emails_opened: number;
  open_rate: number;
  links_clicked: number;
  click_rate: number;
  leads_per_day: DailyCount[];
  open_rate_trend: DailyCount[];
  click_rate_trend: DailyCount[];
}

// ─────────────────────────────────────────
// AI Analysis
// ─────────────────────────────────────────

export interface AnalyzeResponse {
  analyzed: number;
  skipped: number;
  message: string;
}

// ─────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────

export interface StatCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  bgColor: string;
  trend?: string;
}

// ─────────────────────────────────────────
// API Error
// ─────────────────────────────────────────

export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
  status_code?: number;
}
