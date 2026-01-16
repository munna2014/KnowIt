"use client";

import Link from "next/link";
import { useState } from "react";
import { resources } from "./blogData";

const tags = ["All", "Design", "Product", "Food", "Professional"];

export default function BlogSection() {
  const [activeTag, setActiveTag] = useState(tags[0]);

  return (
    <>
      <header className="grid max-w-4xl gap-6 text-left">
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">
          <span className="rounded-full bg-emerald-500 px-3 py-1.5 text-xl text-white shadow shadow-emerald-500/30">
            KnowIt
          </span>
          <span className="text-slate-300 text-xl">Resources</span>
        </div>
        <h1 className="text-3xl font-semibold leading-tight text-white font-[var(--font-display)] sm:text-4xl">
          Resources and insights
        </h1>
        <p className="max-w-2xl text-lg text-slate-300 sm:text-base whitespace-nowrap">
          The latest industry news, interviews, technologies, and resources curated for your communities.
        </p>

        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => {
            const isActive = tag === activeTag;

            return (
              <button
                key={tag}
                className={`rounded-full px-4 py-1.5 text-lg font-semibold shadow-sm transition ${
                  isActive
                    ? "bg-emerald-500 text-white shadow-emerald-500/30"
                    : "border border-slate-700 bg-slate-900/70 text-slate-200 hover:border-slate-500"
                }`}
                type="button"
                onClick={() => setActiveTag(tag)}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </header>

      <div className="mt-12">
        <section className="grid gap-8 sm:grid-cols-2 xl:grid-cols-2">
          {resources.map((item) => (
            <Link
              key={item.id}
              href={`/component/blog/${encodeURIComponent(item.id)}`}
              className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_40px_-30px_rgba(15,23,42,0.35)] transition hover:-translate-y-1 hover:shadow-[0_20px_45px_-25px_rgba(15,23,42,0.4)]"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-4 p-6">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  <span>{item.category}</span>
                  <span className="text-slate-400 transition group-hover:text-slate-700">
                    -&gt;
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="text-base text-slate-600">{item.description}</p>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600">
                      {item.author
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </span>
                    <span>{item.author}</span>
                  </div>
                  <span>{item.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      </div>

      <div className="mt-10 flex justify-center">
        <button
          className="rounded-full border border-slate-700 bg-slate-900/70 px-6 py-2 text-sm font-semibold text-slate-200 shadow-sm transition hover:border-emerald-400 hover:text-white"
          type="button"
        >
          Load more
        </button>
      </div>
    </>
  );
}
