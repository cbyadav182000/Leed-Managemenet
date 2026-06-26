"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-md">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">
                LeadFlow
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className={`text-sm font-medium transition-colors ${
                pathname === "/dashboard"
                  ? "text-blue-600"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/lead"
              className={`text-sm font-medium transition-colors ${
                pathname === "/lead"
                  ? "text-blue-600"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Form Preview
            </Link>
            
            <div className="h-5 w-px bg-slate-200 mx-2" />
            
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="hidden sm:block font-medium">Admin User</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
