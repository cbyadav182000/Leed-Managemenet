import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export function truncate(str: string, length: number = 50) {
  if (!str) return "";
  return str.length > length ? str.substring(0, length) + "..." : str;
}

export function getPriorityColor(priority: string) {
  switch (priority.toLowerCase()) {
    case "high":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "medium":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "low":
      return "bg-blue-50 text-blue-700 border-blue-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

export function getCategoryColor(category: string) {
  switch (category.toLowerCase()) {
    case "web development":
      return "bg-cyan-50 text-cyan-700 border-cyan-200";
    case "mobile app":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "ai automation":
      return "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200";
    default:
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
}

export function downloadFile(data: string, filename: string) {
  const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
