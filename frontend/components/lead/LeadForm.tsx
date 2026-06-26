"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateLead } from "@/services/leads";
import { useToast } from "@/hooks/use-toast";

// ─────────────────────────────────────────
// Validation Schema
// ─────────────────────────────────────────
const leadSchema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long")
    .regex(/[a-zA-Z]/, "Name must contain letters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .regex(
      /^[\+]?[\d\s\-\(\)]{7,15}$/,
      "Enter a valid phone number (7-15 digits)"
    ),
  company: z.string().max(150).optional().or(z.literal("")),
  requirement: z
    .string()
    .min(10, "Please describe your requirement (at least 10 characters)")
    .max(2000, "Requirement is too long (max 2000 chars)"),
});

type LeadFormData = z.infer<typeof leadSchema>;

// ─────────────────────────────────────────
// Success Screen
// ─────────────────────────────────────────
function SuccessScreen({ name }: { name: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center text-center py-12 px-6"
    >
      {/* Animated check circle */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
        className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-200"
      >
        <svg
          className="w-12 h-12 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-2xl font-bold text-slate-800 mb-2"
      >
        You&apos;re all set, {name.split(" ")[0]}! 🎉
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-slate-500 text-base leading-relaxed max-w-sm"
      >
        We&apos;ve received your request and sent a confirmation email. Our team
        will review your requirements and get back to you within{" "}
        <strong className="text-slate-700">24–48 hours</strong>.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-8 flex gap-3"
      >
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          View Dashboard →
        </a>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
        >
          Submit Another
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────
// Input Field Component
// ─────────────────────────────────────────
interface FieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

function Field({ label, error, required, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs text-red-500 flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-slate-300";

const errorInputClass =
  "w-full px-4 py-3 rounded-xl border border-red-300 bg-red-50/50 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all duration-200";

// ─────────────────────────────────────────
// Main Form Component
// ─────────────────────────────────────────
export function LeadForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const { toast } = useToast();
  const createLead = useCreateLead();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: LeadFormData) => {
    try {
      await createLead.mutateAsync({
        ...data,
        company: data.company || undefined,
      });
      setSubmittedName(data.full_name);
      setSubmitted(true);
    } catch (error: unknown) {
      const axiosError = error as { userMessage?: string; response?: { data?: { message?: string } } };
      const message =
        axiosError.userMessage ||
        axiosError.response?.data?.message ||
        "Something went wrong. Please try again.";
      toast({
        title: "Submission Failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  if (submitted) {
    return <SuccessScreen name={submittedName} />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Full Name */}
      <Field label="Full Name" error={errors.full_name?.message} required>
        <input
          {...register("full_name")}
          type="text"
          placeholder="John Doe"
          className={errors.full_name ? errorInputClass : inputClass}
          id="lead-full-name"
        />
      </Field>

      {/* Email */}
      <Field label="Email Address" error={errors.email?.message} required>
        <input
          {...register("email")}
          type="email"
          placeholder="john@company.com"
          className={errors.email ? errorInputClass : inputClass}
          id="lead-email"
        />
      </Field>

      {/* Phone */}
      <Field label="Phone Number" error={errors.phone?.message} required>
        <input
          {...register("phone")}
          type="tel"
          placeholder="+1 (555) 000-0000"
          className={errors.phone ? errorInputClass : inputClass}
          id="lead-phone"
        />
      </Field>

      {/* Company (optional) */}
      <Field label="Company" error={errors.company?.message}>
        <input
          {...register("company")}
          type="text"
          placeholder="Acme Inc. (optional)"
          className={errors.company ? errorInputClass : inputClass}
          id="lead-company"
        />
      </Field>

      {/* Requirement */}
      <Field label="Your Requirement" error={errors.requirement?.message} required>
        <textarea
          {...register("requirement")}
          placeholder="Tell us about your project — what are you looking to build or solve?"
          rows={5}
          className={`${errors.requirement ? errorInputClass : inputClass} resize-none`}
          id="lead-requirement"
        />
        <p className="text-xs text-slate-400">
          Be as detailed as possible — this helps us respond accurately.
        </p>
      </Field>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isSubmitting || createLead.isPending}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="relative w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
        id="lead-submit-button"
      >
        {isSubmitting || createLead.isPending ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Submitting...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Send My Request
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </span>
        )}
      </motion.button>

      <p className="text-xs text-slate-400 text-center">
        By submitting, you agree to be contacted regarding your inquiry.
        No spam, ever.
      </p>
    </form>
  );
}
