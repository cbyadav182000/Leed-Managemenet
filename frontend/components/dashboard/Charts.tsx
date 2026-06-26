"use client";

import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import type { DashboardStats } from "@/types";

interface ChartsProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

// ─────────────────────────────────────────
// Skeleton Loader
// ─────────────────────────────────────────
function ChartSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-32 mb-2" />
      <div className="h-3 bg-slate-100 rounded w-48 mb-6" />
      <div className="h-48 bg-slate-100 rounded-xl" />
    </div>
  );
}

// ─────────────────────────────────────────
// Custom Tooltip
// ─────────────────────────────────────────
interface TooltipPayload {
  name?: string;
  value?: number | string;
  color?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white px-3 py-2 rounded-xl shadow-xl text-sm">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-semibold">
          {p.value}
          {typeof p.value === "number" && p.name?.includes("rate") ? "%" : ""}
        </p>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────
// Chart Card Wrapper
// ─────────────────────────────────────────
function ChartCard({
  title,
  subtitle,
  delay,
  children,
}: {
  title: string;
  subtitle?: string;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay ?? 0, ease: "easeOut" }}
      className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-sm transition-shadow"
    >
      <h3 className="text-sm font-semibold text-slate-800 mb-0.5">{title}</h3>
      {subtitle && <p className="text-xs text-slate-400 mb-5">{subtitle}</p>}
      <div className="h-52">{children}</div>
    </motion.div>
  );
}

// ─────────────────────────────────────────
// Empty State for Charts
// ─────────────────────────────────────────
function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-slate-400">
      <svg
        className="w-8 h-8 mb-2 opacity-50"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
      <p className="text-xs">{message}</p>
    </div>
  );
}

// ─────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────
export function Charts({ stats, isLoading }: ChartsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  const tickStyle = { fontSize: 11, fill: "#94a3b8" };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Leads Per Day — Bar Chart */}
      <ChartCard
        title="Leads Per Day"
        subtitle="New leads over the last 30 days"
        delay={0}
      >
        {stats.leads_per_day.length === 0 ? (
          <EmptyChart message="No lead data yet" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.leads_per_day} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date"
                tick={tickStyle}
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={tickStyle} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f5f9" }} />
              <Bar
                dataKey="count"
                fill="url(#blueGrad)"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Open Rate Trend — Area Chart */}
      <ChartCard
        title="Open Rate Trend"
        subtitle="Email opens per day"
        delay={0.1}
      >
        {stats.open_rate_trend.length === 0 ? (
          <EmptyChart message="No open tracking data yet" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.open_rate_trend} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date"
                tick={tickStyle}
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={tickStyle} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#emeraldGrad)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: "#10b981" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Click Rate Trend — Line Chart */}
      <ChartCard
        title="Click Rate Trend"
        subtitle="Link clicks per day"
        delay={0.2}
      >
        {stats.click_rate_trend.length === 0 ? (
          <EmptyChart message="No click tracking data yet" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.click_rate_trend} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date"
                tick={tickStyle}
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={tickStyle} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: "#f59e0b" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}
