"use client";

import { motion } from "framer-motion";
import type { DashboardStats } from "@/types";
import { formatPercent } from "@/lib/utils";

interface StatsCardsProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

interface StatCardData {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  gradient: string;
  textColor: string;
  borderColor: string;
  delay: number;
}

// ─────────────────────────────────────────
// Skeleton Card
// ─────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-slate-200 rounded w-24" />
        <div className="w-10 h-10 bg-slate-200 rounded-xl" />
      </div>
      <div className="h-8 bg-slate-200 rounded w-16 mb-2" />
      <div className="h-3 bg-slate-100 rounded w-20" />
    </div>
  );
}

// ─────────────────────────────────────────
// Individual Stat Card
// ─────────────────────────────────────────
function StatCard({
  title,
  value,
  subtitle,
  icon,
  gradient,
  textColor,
  borderColor,
  delay,
}: StatCardData) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={`bg-white rounded-2xl border ${borderColor} p-6 hover:shadow-md transition-shadow duration-200 group`}
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div
          className={`w-10 h-10 rounded-xl ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
        >
          <span className={textColor}>{icon}</span>
        </div>
      </div>
      <div className={`text-3xl font-extrabold ${textColor} tracking-tight mb-1`}>
        {value}
      </div>
      {subtitle && (
        <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────
// Icons
// ─────────────────────────────────────────
const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const PercentIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const CursorIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
  </svg>
);

const TrendIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

// ─────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────
export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  const cards: StatCardData[] = [
    {
      title: "Total Leads",
      value: stats.total_leads.toLocaleString(),
      subtitle: "All time",
      icon: <UsersIcon />,
      gradient: "bg-blue-50",
      textColor: "text-blue-600",
      borderColor: "border-blue-100",
      delay: 0,
    },
    {
      title: "Emails Sent",
      value: stats.emails_sent.toLocaleString(),
      subtitle: `${stats.total_leads > 0 ? Math.round((stats.emails_sent / stats.total_leads) * 100) : 0}% delivery rate`,
      icon: <MailIcon />,
      gradient: "bg-violet-50",
      textColor: "text-violet-600",
      borderColor: "border-violet-100",
      delay: 0.05,
    },
    {
      title: "Emails Opened",
      value: stats.emails_opened.toLocaleString(),
      subtitle: `of ${stats.emails_sent} sent`,
      icon: <EyeIcon />,
      gradient: "bg-emerald-50",
      textColor: "text-emerald-600",
      borderColor: "border-emerald-100",
      delay: 0.1,
    },
    {
      title: "Open Rate",
      value: formatPercent(stats.open_rate),
      subtitle: "Industry avg ~21%",
      icon: <PercentIcon />,
      gradient: "bg-amber-50",
      textColor: "text-amber-600",
      borderColor: "border-amber-100",
      delay: 0.15,
    },
    {
      title: "Links Clicked",
      value: stats.links_clicked.toLocaleString(),
      subtitle: "CTA button clicks",
      icon: <CursorIcon />,
      gradient: "bg-rose-50",
      textColor: "text-rose-600",
      borderColor: "border-rose-100",
      delay: 0.2,
    },
    {
      title: "Click Rate",
      value: formatPercent(stats.click_rate),
      subtitle: "of emails sent",
      icon: <TrendIcon />,
      gradient: "bg-cyan-50",
      textColor: "text-cyan-600",
      borderColor: "border-cyan-100",
      delay: 0.25,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
}
