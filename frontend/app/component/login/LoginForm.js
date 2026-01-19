"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthCard from "./AuthCard";
import { apiRequest, saveAuthToken, saveAuthUser } from "../../lib/api";

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Determine if identifier is email or phone
      const isEmail = form.identifier.includes("@");
      const loginData = {
        [isEmail ? "email" : "phone"]: form.identifier,
        password: form.password,
      };

      const data = await apiRequest("login", {
        method: "POST",
        data: loginData,
      });

      if (data?.token && data?.user) {
        // Save authentication data
        saveAuthToken(data.token);
        saveAuthUser(data.user);
        
        // Redirect to landing page
        router.push("/component/landing");
      } else {
        setError("Invalid response from server. Please try again.");
      }
    } catch (err) {
      if (!err?.status || err.status >= 500) {
        console.error("Login error:", err);
      }
      
      // Handle different types of errors
      if (err?.status === 401) {
        setError("Invalid email/phone or password. Please check your credentials.");
      } else if (err?.status === 422) {
        setError("Please check your input and try again.");
      } else if (err?.status >= 500) {
        setError("Server error. Please try again later.");
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
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
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 mb-4">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}
        
        <label className="block space-y-2 text-sm font-semibold text-slate-300">
          <span>Email or phone</span>
          <input
            type="text"
            name="identifier"
            value={form.identifier}
            onChange={handleChange}
            placeholder="name@example.com"
            autoComplete="username"
            required
            disabled={isLoading}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </label>
        
        <label className="block space-y-2 text-sm font-semibold text-slate-300">
          <span>Password</span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            disabled={isLoading}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </label>
        
        <button
          className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-500"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Logging in...
            </span>
          ) : (
            "Log in"
          )}
        </button>
        
        <button
          className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
          disabled={isLoading}
        >
          Forgot password?
        </button>
      </form>
    </AuthCard>
  );
}
