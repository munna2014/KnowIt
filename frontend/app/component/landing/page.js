"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../Navbar";
import BlogSection from "../blog/BlogSection";
import { getAuthToken, getAuthUser } from "../../lib/api";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = getAuthToken();
    const user = getAuthUser();
    
    if (!token || !user) {
      // Redirect to login if not authenticated
      router.push("/component/login");
      return;
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0b1220]">
      {/* Background Layers */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_55%),radial-gradient(circle_at_20%_80%,_rgba(16,185,129,0.12),_transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTAiIGhlaWdodD0iOTAiIHZpZXdCb3g9IjAgMCA5MCA5MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iNDUiIGN5PSI0NSIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-60"></div>
      
      <div className="relative">
        <Navbar />

        {/* Hero Section */}
        <div className="pt-28 pb-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <div className="mb-6">
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Welcome to the Community
                  </span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight font-[var(--font-display)]">
                  Find the signal.
                  <span className="block bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-300 bg-clip-text text-transparent">
                    Share the story.
                  </span>
                </h1>
                
                <p className="mt-6 text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed">
                  Discover insights, build your voice, and connect with a community of curious minds exploring technology, design, and innovation.
                </p>

                <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {[
                    { label: "Articles", value: "1.2K+" },
                    { label: "Readers", value: "5.8K+" },
                    { label: "Authors", value: "150+" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left shadow-[0_20px_40px_-30px_rgba(15,23,42,0.8)] backdrop-blur"
                    >
                      <div className="text-2xl font-semibold text-white">{stat.value}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-10 h-32 w-32 rounded-full bg-emerald-400/20 blur-2xl"></div>
                <div className="absolute -right-8 bottom-8 h-36 w-36 rounded-full bg-sky-400/20 blur-2xl"></div>
                <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-800/80 p-8 shadow-[0_30px_70px_-40px_rgba(15,23,42,0.85)] backdrop-blur">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
                    <span>Trending Topics</span>
                    <span>Live</span>
                  </div>
                  <div className="mt-6 space-y-4">
                    {[
                      { title: "Future of AI Interfaces", tag: "Design" },
                      { title: "React Server Patterns", tag: "Dev" },
                      { title: "Community Growth Loops", tag: "Product" },
                    ].map((item) => (
                      <div
                        key={item.title}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                      >
                        <div className="text-sm text-emerald-300">{item.tag}</div>
                        <div className="mt-2 text-lg font-semibold text-white">{item.title}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    New posts are landing every day. Stay close to the momentum.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Content Section */}
        <div className="pb-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-[var(--font-display)]">Latest Posts</h2>
              <p className="text-lg text-slate-400">Stay updated with our latest insights and discoveries</p>
            </div>
            
            <BlogSection />
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-700/50 py-12">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-3 mb-4 md:mb-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-sm font-semibold text-white">
                  K
                </div>
                <div>
                  <p className="text-xl font-semibold text-white">KnowIt</p>
                  <p className="text-sm text-slate-400">Social Graph</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-700/50 text-center">
              <p className="text-slate-400">
                © 2026 KnowIt. All rights reserved. Built with passion for knowledge sharing.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
