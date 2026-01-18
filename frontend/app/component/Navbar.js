"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiRequest, clearAuthToken, getAuthUser } from "../lib/api";

const navItems = ["Home", "My Blogs", "Networks", "Notification"];

const resolveAvatarUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) {
    return url;
  }
  return `http://localhost:8000${url}`;
};

export default function Navbar() {
  const [activeItem, setActiveItem] = useState(navItems[0]);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [user, setUser] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const mountedRef = useRef(true);
  const router = useRouter();
  const pathname = usePathname();

  const handleNavClick = (item) => {
    setActiveItem(item);

    if (item === "Home") {
      router.push("/component/landing");
    } else if (item === "My Blogs") {
      router.push("/component/my-blogs");
    }
  };

  const handleProfile = () => {
    router.push("/component/profile");
  };

  const loadUser = useCallback(() => {
    const currentUser = getAuthUser();
    console.log("Loading user in navbar:", currentUser?.email);
    setUser(currentUser);
  }, []);

  const updateActiveItemFromPath = useCallback(() => {
    if (!pathname) return;
    
    if (pathname.includes('/component/landing') || pathname === '/') {
      setActiveItem("Home");
    } else if (
      pathname.includes('/component/my-blogs') || 
      pathname.includes('/component/create-blog') || 
      pathname.includes('/component/edit-blog') ||
      pathname.includes('/component/blog/')
    ) {
      setActiveItem("My Blogs");
    } else if (pathname.includes('/component/networks')) {
      setActiveItem("Networks");
    } else if (pathname.includes('/component/notification')) {
      setActiveItem("Notification");
    }
    // If none match, keep the current active item
  }, [pathname]);

  const getUserInitials = (currentUser) => {
    if (!currentUser) return "NR";
    const rawName = currentUser.name || currentUser.email || "";
    const parts = rawName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "NR";
    const first = parts[0]?.[0] || "";
    const second = parts.length > 1 ? parts[1]?.[0] : parts[0]?.[1] || "";
    return (first + second).toUpperCase();
  };

  const getUserAvatar = (currentUser) => {
    if (!currentUser?.avatar_url) return null;
    
    // If it's already a full URL, return as-is
    if (currentUser.avatar_url.startsWith('http')) {
      return currentUser.avatar_url;
    }
    
    // If it's a relative path, construct full URL
    return `http://localhost:8000${currentUser.avatar_url}`;
  };

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);

    try {
      await apiRequest("logout", { method: "POST" });
    } catch (error) {
      // Ignore API errors; we still clear the local token.
    } finally {
      clearAuthToken();
      setIsSigningOut(false);
      router.push("/component/login");
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    setIsMounted(true);
    loadUser();
    updateActiveItemFromPath(); // Set active item based on current route

    const handleStorageChange = () => {
      if (mountedRef.current) {
        loadUser();
      }
    };

    const handleUserUpdate = () => {
      if (mountedRef.current) {
        loadUser();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userUpdated", handleUserUpdate);

    return () => {
      mountedRef.current = false;
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userUpdated", handleUserUpdate);
    };
  }, [loadUser, updateActiveItemFromPath]);

  // Update active item when pathname changes
  useEffect(() => {
    updateActiveItemFromPath();
  }, [pathname, updateActiveItemFromPath]);

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
                    ? "bg-emerald-600 text-white shadow-sm"
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
          <summary className="list-none flex h-9 w-9 cursor-pointer items-center justify-center rounded-full overflow-hidden bg-emerald-600 text-xs font-semibold text-white">
            {isMounted && getUserAvatar(user) ? (
              <img
                src={resolveAvatarUrl(getUserAvatar(user))}
                alt="Profile"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML = getUserInitials(user);
                }}
              />
            ) : (
              getUserInitials(user)
            )}
          </summary>
          <div className="absolute right-0 z-10 mt-3 flex w-40 flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 text-sm text-slate-600 shadow-lg">
            <button
              className="block w-full rounded-xl bg-slate-900 px-3 py-2 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              type="button"
              onClick={handleProfile}
            >
              Profile
            </button>
            <button
              className="block w-full rounded-xl bg-slate-900 px-3 py-2 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              {isSigningOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </details>
      </div>
    </nav>
  );
}
