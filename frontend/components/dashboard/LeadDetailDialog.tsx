"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Lead } from "@/types";
import {
  formatDate,
  formatDateTime,
  getPriorityColor,
  getCategoryColor,
  truncate,
} from "@/lib/utils";

interface LeadDetailDialogProps {
  lead: Lead;
  onClose: () => void;
}

function StatusBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
        active
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-slate-100 text-slate-500 border-slate-200"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"}`}
      />
      {label}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm text-slate-800 font-medium">{value}</span>
    </div>
  );
}

export function LeadDetailDialog({ lead, onClose }: LeadDetailDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Lead details"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 rounded-t-3xl">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{lead.full_name}</h2>
              <p className="text-blue-100 text-sm mt-0.5">{lead.email}</p>
            </div>
            <button
              id="lead-detail-close-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Status badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            <StatusBadge active={lead.email_sent} label="Email Sent" />
            <StatusBadge active={lead.email_opened} label="Email Opened" />
            <StatusBadge active={lead.link_clicked} label="Link Clicked" />
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Phone" value={lead.phone} />
            <InfoRow label="Company" value={lead.company || "—"} />
            <InfoRow label="Submitted" value={formatDate(lead.created_at)} />
            <InfoRow
              label="Lead ID"
              value={
                <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">
                  {lead.id.slice(-8)}
                </span>
              }
            />
          </div>

          {/* Requirement */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Requirement
            </p>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
              {lead.requirement}
            </div>
          </div>

          {/* AI Classification */}
          {(lead.ai_category || lead.ai_priority) && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                AI Classification
              </p>
              <div className="flex flex-wrap gap-2">
                {lead.ai_category && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(
                      lead.ai_category
                    )}`}
                  >
                    {lead.ai_category}
                  </span>
                )}
                {lead.ai_priority && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(
                      lead.ai_priority
                    )}`}
                  >
                    {lead.ai_priority} Priority
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Tracking Timeline */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Activity Timeline
            </p>
            <div className="space-y-2">
              {[
                {
                  label: "Lead submitted",
                  time: lead.created_at,
                  active: true,
                  color: "bg-blue-500",
                },
                {
                  label: "Email delivered",
                  time: null,
                  active: lead.email_sent,
                  color: "bg-violet-500",
                },
                {
                  label: "Email opened",
                  time: lead.email_opened_at,
                  active: lead.email_opened,
                  color: "bg-emerald-500",
                },
                {
                  label: "CTA link clicked",
                  time: lead.link_clicked_at,
                  active: lead.link_clicked,
                  color: "bg-amber-500",
                },
              ].map((event) => (
                <div
                  key={event.label}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    event.active ? "bg-slate-50" : "opacity-40"
                  }`}
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      event.active ? event.color : "bg-slate-300"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700">
                      {event.label}
                    </p>
                    {event.time && (
                      <p className="text-xs text-slate-400">
                        {formatDateTime(event.time)}
                      </p>
                    )}
                  </div>
                  {event.active && (
                    <svg
                      className="w-4 h-4 text-emerald-500 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
