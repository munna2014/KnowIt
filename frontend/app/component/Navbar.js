"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const navItems = ["Home", "My Blogs", "Networks", "Notification"];

export default function Navbar() {
  const [activeItem, setActiveItem] = useState(navItems[0]);
  const router = useRouter();

  const handleNavClick = (item) => {
    setActiveItem(item);

    if (item === "Home") {
      router.push("/component/landing");
    }
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-50 grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border border-slate-200/80 border-x-0 bg-white/95 px-6 py-2.5 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.45)]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white shadow-lg shadow-slate-900/20">
          K
        </div>
        <div>
          <p className="text-xl font-semibold text-slate-900 font-[var(--font-display)]">
            KnowIt
          </p>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
            Social Graph
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-center">
        <div className="hidden items-center gap-2 rounded-full bg-slate-100/80 px-2 py-1 text-xl font-semibold text-slate-600 lg:flex">
          {navItems.map((item) => {
            const isActive = item === activeItem;

            return (
              <button
                key={item}
                className={`rounded-full px-4 py-2 transition ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                type="button"
                onClick={() => handleNavClick(item)}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 md:justify-end">
        <div className="hidden w-64 md:flex">
          <div className="relative w-full">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="search"
              placeholder="Search posts, people, groups"
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-11 pr-4 text-sm text-slate-700 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-200"
            />
          </div>
        </div>
        <details className="relative">
          <summary className="list-none flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
            NR
          </summary>
          <div className="absolute right-0 z-10 mt-3 w-40 rounded-2xl border border-slate-200 bg-white p-2 text-sm text-slate-600 shadow-lg">
            <a className="block rounded-xl bg-slate-900 px-3 py-2 text-white" href="#">
              Sign out
            </a>
          </div>
        </details>
      </div>
    </nav>
  );
}
