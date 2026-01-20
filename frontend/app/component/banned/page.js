"use client";

import Link from "next/link";

export default function BannedPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6 py-12">
      <div className="max-w-xl rounded-2xl border border-red-500/30 bg-slate-900/80 p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
          <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="mt-6 text-2xl font-bold text-white">You have been banned from this server</h1>
        <p className="mt-3 text-sm text-slate-300">
          Your account is currently disabled. Please contact an administrator if you believe this is a mistake.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/component/login"
            className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-400"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
