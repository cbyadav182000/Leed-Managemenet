"use client";

import { useState } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { Charts } from "@/components/dashboard/Charts";
import { LeadsTable } from "@/components/dashboard/LeadsTable";
import { useDashboard, useLeads, useExportCsv, useAnalyzeLeads } from "@/services/leads";
import type { LeadFilters } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { downloadFile } from "@/lib/utils";

export default function DashboardPage() {
  const { toast } = useToast();
  
  // Data hooks
  const { data: stats, isLoading: statsLoading } = useDashboard();
  
  // Table state
  const [filters, setFilters] = useState<LeadFilters>({
    page: 1,
    page_size: 20,
    sort_by: "created_at",
    sort_order: "desc",
  });
  
  const { data: leadsData, isLoading: leadsLoading } = useLeads(filters);
  
  // Mutations
  const exportCsv = useExportCsv();
  const analyzeLeads = useAnalyzeLeads();

  const handleExport = async () => {
    try {
      const csvData = await exportCsv.mutateAsync();
      downloadFile(csvData, `leads_export_${new Date().toISOString().split("T")[0]}.csv`);
      toast({
        title: "Export Successful",
        description: "Your CSV file has been downloaded.",
      });
    } catch {
      toast({
        title: "Export Failed",
        description: "Could not export leads. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAnalyze = async () => {
    try {
      const result = await analyzeLeads.mutateAsync();
      toast({
        title: "AI Analysis Complete",
        description: result.message,
      });
    } catch (error: unknown) {
      const msg = error && typeof error === "object" && "userMessage" in error 
        ? (error as { userMessage: string }).userMessage 
        : "Failed to analyze leads.";
      toast({
        title: "Analysis Failed",
        description: msg,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Analytics Overview</h1>
            <p className="text-sm text-slate-500 mt-1">
              Track your lead generation performance and email engagement.
            </p>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={analyzeLeads.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-medium shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 disabled:opacity-70 transition-all"
          >
            {analyzeLeads.isPending ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
            Run AI Analysis
          </button>
        </div>

        {/* Stats Grid */}
        <StatsCards stats={stats!} isLoading={statsLoading} />

        {/* Charts Grid */}
        <Charts stats={stats!} isLoading={statsLoading} />

        {/* Leads Table */}
        <LeadsTable
          leads={leadsData?.leads || []}
          total={leadsData?.total || 0}
          isLoading={leadsLoading}
          filters={filters}
          onFilterChange={setFilters}
          onExport={handleExport}
          isExporting={exportCsv.isPending}
        />
      </main>
    </div>
  );
}
