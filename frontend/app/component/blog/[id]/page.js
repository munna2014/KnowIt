"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams, usePathname } from "next/navigation";
import Navbar from "../../Navbar";
import { resources } from "../blogData";
import BlogDetails from "../BlogDetails";

const normalizeSlug = (value) =>
  decodeURIComponent(String(value ?? ""))
    .trim()
    .toLowerCase()
    .replace(/\/+$/, "");

export default function BlogDetailPage() {
  const params = useParams();
  const pathname = usePathname();

  const slug = useMemo(() => {
    const paramValue = params?.id;
    const rawParam = Array.isArray(paramValue)
      ? paramValue[paramValue.length - 1]
      : paramValue;

    if (rawParam) {
      return normalizeSlug(rawParam);
    }

    if (pathname) {
      const parts = pathname.split("/").filter(Boolean);
      return normalizeSlug(parts[parts.length - 1]);
    }

    return "";
  }, [params, pathname]);

  const post = useMemo(() => {
    if (!slug) {
      return null;
    }

    return (
      resources.find((item) => normalizeSlug(item.id) === slug) ||
      resources.find((item) => normalizeSlug(item.title) === slug) ||
      null
    );
  }, [slug]);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-black">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-[-18%] h-[22rem] w-[40rem] rounded-full bg-blue-800/20 blur-[160px]" />
        <div className="absolute top-20 right-[-16%] h-[18rem] w-[34rem] rounded-full bg-blue-700/20 blur-[150px]" />
        <div className="absolute bottom-[-18%] left-[-5%] h-[20rem] w-[36rem] rounded-full bg-blue-900/25 blur-[170px]" />
      </div>

      <div className="relative w-full pb-12 sm:pb-16">
        <Navbar />

        <div className="mx-auto w-full max-w-6xl px-6 pt-17">
          <div className="mx-auto h-px w-11/12 bg-slate-200/50 shadow-[0_4px_12px_rgba(15,23,42,0.05)]" />

          <div className="mt-1">
            {post ? (
              <BlogDetails post={post} />
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
                We could not find this post. Try one of these:
                <div className="mt-2 text-xs text-slate-500">
                  Requested id: <span className="font-semibold">{slug || "-"}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {resources.map((item) => (
                    <Link
                      key={item.id}
                      href={`/component/blog/${item.id}`}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300"
                    >
                      {item.id}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
