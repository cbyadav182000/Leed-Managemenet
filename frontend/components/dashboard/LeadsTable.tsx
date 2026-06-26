"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { Lead, LeadFilters } from "@/types";
import { formatDate, getCategoryColor, getPriorityColor } from "@/lib/utils";
import { LeadDetailDialog } from "./LeadDetailDialog";

interface LeadsTableProps {
  leads: Lead[];
  total: number;
  isLoading: boolean;
  filters: LeadFilters;
  onFilterChange: (filters: LeadFilters) => void;
  onExport: () => void;
  isExporting: boolean;
}

export function LeadsTable({
  leads,
  total,
  isLoading,
  filters,
  onFilterChange,
  onExport,
  isExporting,
}: LeadsTableProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const handleSort = (field: string) => {
    const isAsc = filters.sort_by === field && filters.sort_order === "asc";
    onFilterChange({
      ...filters,
      sort_by: field,
      sort_order: isAsc ? "desc" : "asc",
    });
  };

  const renderSortIcon = (field: string) => {
    if (filters.sort_by !== field) {
      return (
        <svg className="w-3 h-3 text-slate-300 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return filters.sort_order === "asc" ? (
      <svg className="w-3 h-3 text-blue-500 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-3 h-3 text-blue-500 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      {/* Table Header / Toolbar */}
      <div className="p-4 md:p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-slate-800">Lead Directory</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
            {total} Total
          </span>
        </div>

        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
          <div className="relative w-full sm:w-64">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search leads..."
              value={filters.search || ""}
              onChange={(e) =>
                onFilterChange({ ...filters, search: e.target.value, page: 1 })
              }
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          <button
            onClick={onExport}
            disabled={isExporting || total === 0}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            {isExporting ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
            Export CSV
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th
                className="px-6 py-4 cursor-pointer hover:text-slate-700 group transition-colors"
                onClick={() => handleSort("full_name")}
              >
                <div className="flex items-center">
                  Name / Company {renderSortIcon("full_name")}
                </div>
              </th>
              <th
                className="px-6 py-4 cursor-pointer hover:text-slate-700 group transition-colors"
                onClick={() => handleSort("created_at")}
              >
                <div className="flex items-center">
                  Date {renderSortIcon("created_at")}
                </div>
              </th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">AI Class</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-32 mb-1" /><div className="h-3 bg-slate-50 rounded w-24" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-20" /></td>
                  <td className="px-6 py-4"><div className="h-5 bg-slate-100 rounded-full w-24" /></td>
                  <td className="px-6 py-4"><div className="h-5 bg-slate-100 rounded-full w-16" /></td>
                  <td className="px-6 py-4 text-right"><div className="h-8 bg-slate-100 rounded w-20 inline-block" /></td>
                </tr>
              ))
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  No leads found matching your criteria.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">{lead.full_name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {lead.company || lead.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {formatDate(lead.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {lead.link_clicked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold tracking-wide border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          CLICKED
                        </span>
                      ) : lead.email_opened ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold tracking-wide border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          OPENED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold tracking-wide border border-blue-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          SENT
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {lead.ai_priority ? (
                        <span className={`px-2 py-1 rounded border text-[10px] font-bold ${getPriorityColor(lead.ai_priority)}`}>
                          {lead.ai_priority}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                      {lead.ai_category && (
                        <span className={`px-2 py-1 rounded border text-[10px] font-bold ${getCategoryColor(lead.ai_category)}`}>
                          {lead.ai_category}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedLead(lead)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
        <span className="text-sm text-slate-500">
          Page {filters.page} of {Math.max(1, Math.ceil(total / (filters.page_size || 20)))}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onFilterChange({ ...filters, page: Math.max(1, (filters.page || 1) - 1) })}
            disabled={filters.page === 1 || isLoading}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 disabled:opacity-50 hover:bg-slate-100 transition-colors"
          >
            Prev
          </button>
          <button
            onClick={() => onFilterChange({ ...filters, page: (filters.page || 1) + 1 })}
            disabled={(filters.page || 1) * (filters.page_size || 20) >= total || isLoading}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 disabled:opacity-50 hover:bg-slate-100 transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* Detail Dialog */}
      <AnimatePresence>
        {selectedLead && (
          <LeadDetailDialog
            lead={selectedLead}
            onClose={() => setSelectedLead(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
