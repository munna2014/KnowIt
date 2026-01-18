import Link from "next/link";
import AuthCard from "./AuthCard";

export default function RegisterForm() {
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
      <form className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2 text-sm font-semibold text-slate-300">
            <span>First name</span>
            <input
              type="text"
              name="firstName"
              placeholder="Alex"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
            />
          </label>
          <label className="block space-y-2 text-sm font-semibold text-slate-300">
            <span>Last name</span>
            <input
              type="text"
              name="lastName"
              placeholder="Jordan"
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
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2 text-sm font-semibold text-slate-300">
            <span>Birthday</span>
            <input
              type="date"
              name="birthday"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
            />
          </label>
          <label className="block space-y-2 text-sm font-semibold text-slate-300">
            <span>I am</span>
            <select
              name="gender"
              defaultValue=""
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
        <button
          className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
          type="submit"
        >
          Sign up
        </button>
        <p className="text-xs text-slate-400">
          By clicking Sign up, you agree to our Terms, Privacy Policy, and
          Cookies Policy.
        </p>
      </form>
    </AuthCard>
  );
}
