import type { Metadata } from "next";
import { LeadForm } from "@/components/lead/LeadForm";

export const metadata: Metadata = {
  title: "Submit Your Requirement — LeadFlow",
  description:
    "Tell us about your project. Fill in the form and we'll get back to you within 24 hours with a personalized proposal.",
};

export default function LeadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 shadow-2xl rounded-3xl overflow-hidden z-10">
        {/* Left — Hero Panel */}
        <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-10 lg:p-14 flex flex-col justify-between text-white">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-2 mb-10">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <span className="font-bold text-lg tracking-tight">LeadFlow</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight mb-4">
              Let&apos;s Build Something{" "}
              <span className="text-white/80">Amazing Together</span>
            </h1>
            <p className="text-blue-100 leading-relaxed text-base mb-8">
              Share your project requirements and get a personalized response
              from our team within 24–48 hours. No commitment required.
            </p>

            {/* Feature bullets */}
            <ul className="space-y-4">
              {[
                "Instant email confirmation",
                "Personalized project proposal",
                "No spam, ever — unsubscribe anytime",
                "Free consultation included",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-blue-50 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Stats bar */}
          <div className="mt-10 pt-8 border-t border-white/20 grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Happy Clients", value: "500+" },
              { label: "Projects Delivered", value: "1.2K+" },
              { label: "Response Rate", value: "99%" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-xl font-extrabold">{stat.value}</div>
                <div className="text-xs text-blue-100 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Form Panel */}
        <div className="bg-white p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">
              Get Started
            </p>
            <h2 className="text-2xl font-bold text-slate-800">
              Tell us about your project
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Fill in the details below and we&apos;ll be in touch shortly.
            </p>
          </div>

          <LeadForm />

          <div className="mt-6 text-center">
            <a
              href="/dashboard"
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              View Analytics Dashboard →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
