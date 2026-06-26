"use client";

import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 sm:p-6 flex flex-col gap-2 pointer-events-none w-full sm:w-auto max-w-sm">
      <AnimatePresence>
        {toasts.map(({ id, title, description, variant }) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto shadow-xl rounded-xl p-4 border flex gap-3 ${
              variant === "destructive"
                ? "bg-red-50 text-red-900 border-red-200"
                : "bg-white text-slate-900 border-slate-200"
            }`}
          >
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {variant === "destructive" ? (
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1">
              {title && <h3 className="text-sm font-semibold">{title}</h3>}
              {description && (
                <p className={`text-sm mt-1 ${variant === "destructive" ? "text-red-700" : "text-slate-500"}`}>
                  {description}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
