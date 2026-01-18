"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthCard from "./AuthCard";
import { apiRequest, saveAuthToken, saveAuthUser } from "../../lib/api";

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const payload = {
        identifier: form.identifier.trim(),
        password: form.password,
      };

      if (payload.identifier.includes("@")) {
        payload.email = payload.identifier;
      } else if (payload.identifier) {
        payload.phone = payload.identifier;
      }

      const data = await apiRequest("login", {
        method: "POST",
        data: payload,
      });

      const token =
        data?.token ||
        data?.access_token ||
        data?.data?.token ||
        data?.data?.access_token;

      if (token) {
        saveAuthToken(token);
      }
      if (data?.user) {
        saveAuthUser(data.user);
      }

      router.push("/component/landing");
    } catch (err) {
      setError(err?.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
            value={form.identifier}
            onChange={handleChange}
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
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
          />
        </label>
        {error ? (
          <p className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </p>
        ) : null}
        <button
          className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? "Logging in..." : "Log in"}
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
