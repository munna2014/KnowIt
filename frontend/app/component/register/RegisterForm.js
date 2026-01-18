"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthCard from "./AuthCard";
import { apiRequest, saveAuthToken, saveAuthUser } from "../../lib/api";

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    newPassword: "",
    phone: "",
    gender: "",
  });
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
      const name = `${form.firstName} ${form.lastName}`.trim();
      const payload = {
        name,
        first_name: form.firstName || undefined,
        last_name: form.lastName || undefined,
        email: form.email,
        password: form.newPassword,
        password_confirmation: form.newPassword,
        phone: form.phone || undefined,
        gender: form.gender || undefined,
      };

      const data = await apiRequest("register", {
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

      router.push("/component/login");
    } catch (err) {
      setError(err?.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Create account"
      subtitle="Join and start sharing today."
      footer={
        <p className="text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            className="font-semibold text-emerald-300 hover:text-emerald-200"
            href="/component/login"
          >
            Log in
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2 text-sm font-semibold text-slate-300">
            <span>First name</span>
            <input
              type="text"
              name="firstName"
              placeholder="Alex"
              value={form.firstName}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
            />
          </label>
          <label className="block space-y-2 text-sm font-semibold text-slate-300">
            <span>Last name</span>
            <input
              type="text"
              name="lastName"
              placeholder="Jordan"
              value={form.lastName}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
            />
          </label>
        </div>
        <label className="block space-y-2 text-sm font-semibold text-slate-300">
          <span>Email address</span>
          <input
            type="email"
            name="email"
            placeholder="alex@email.com"
            autoComplete="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
          />
        </label>
        <label className="block space-y-2 text-sm font-semibold text-slate-300">
          <span>New password</span>
          <input
            type="password"
            name="newPassword"
            placeholder="Create a password"
            autoComplete="new-password"
            required
            value={form.newPassword}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2 text-sm font-semibold text-slate-300">
            <span>Phone number</span>
            <input
              type="tel"
              name="phone"
              placeholder="+880 1234 567890"
              value={form.phone}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
            />
          </label>
          <label className="block space-y-2 text-sm font-semibold text-slate-300">
            <span>I am</span>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
            >
              <option value="" disabled>
                Select
              </option>
              <option value="woman">Woman</option>
              <option value="man">Man</option>
              <option value="nonbinary">Non-binary</option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>
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
          {isSubmitting ? "Signing up..." : "Sign up"}
        </button>
        <p className="text-xs text-slate-400">
          By clicking Sign up, you agree to our Terms, Privacy Policy, and
          Cookies Policy.
        </p>
      </form>
    </AuthCard>
  );
}
