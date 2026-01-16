"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthCard from "./AuthCard";

export default function LoginForm() {
  const router = useRouter();

  const handleSubmit = (event) => {
    event.preventDefault();
    router.push("/component/landing");
  };

  return (
    <AuthCard
      title="Log in"
      subtitle="Welcome back to your people."
      footer={
        <p className="text-sm text-slate-400">
          New to KnowIt?{" "}
          <Link
            className="font-semibold text-emerald-300 hover:text-emerald-200"
            href="/component/register"
          >
            Create an account
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2 text-sm font-semibold text-slate-300">
          <span>Email or phone</span>
          <input
            type="text"
            name="identifier"
            placeholder="name@example.com"
            autoComplete="username"
            required
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
          />
        </label>
        <label className="block space-y-2 text-sm font-semibold text-slate-300">
          <span>Password</span>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
          />
        </label>
        <button
          className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
          type="submit"
        >
          Log in
        </button>
        <button
          className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
          type="button"
        >
          Forgot password?
        </button>
      </form>
    </AuthCard>
  );
}
