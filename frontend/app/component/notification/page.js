"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../Navbar";
import { apiRequest, getAuthToken } from "../../lib/api";

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function NotificationPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    if (!getAuthToken()) {
      router.push("/component/login");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const data = await apiRequest("notifications", { skipCache: true });
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Error loading notifications:", err);
      setError("Could not load notifications.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleNotificationClick = useCallback(
    async (notification) => {
      const postSlug = notification?.data?.post_slug;

      if (!notification?.read_at) {
        try {
          await apiRequest(`notifications/${notification.id}/read`, {
            method: "POST",
          });
          setNotifications((current) =>
            current.map((item) =>
              item.id === notification.id
                ? { ...item, read_at: new Date().toISOString() }
                : item
            )
          );
        } catch (err) {
          console.error("Error marking notification read:", err);
        }
      }

      if (postSlug) {
        router.push(`/component/blog/${postSlug}`);
      } else {
        router.push("/component/my-blogs");
      }
    },
    [router]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black">
        <Navbar />
        <div className="pt-16">
          <div className="mx-auto max-w-4xl px-4 py-10">
            <div className="flex items-center justify-center min-h-[320px]">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
                <p className="mt-4 text-slate-300">Loading notifications...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black">
      <Navbar />
      <div className="pt-16">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Notifications</h1>
            <p className="mt-2 text-slate-300">
              Updates from the admin about your posts.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-400/30 bg-red-500/10 p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="ml-3 text-sm text-red-200">{error}</p>
              </div>
            </div>
          )}

          {notifications.length === 0 ? (
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-8 text-center text-slate-300">
              No notifications yet.
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full rounded-2xl border px-6 py-5 text-left transition ${
                    notification.read_at
                      ? "border-slate-800/70 bg-slate-900/60 text-slate-300"
                      : "border-emerald-500/40 bg-emerald-500/10 text-white"
                  } hover:border-emerald-400`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">
                        {notification.title}
                      </p>
                      <p className="mt-2 text-base leading-relaxed">
                        {notification.message}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">
                      {formatDateTime(notification.created_at)}
                    </span>
                  </div>
                  <div className="mt-3 text-xs text-slate-400">
                    View in My Blogs
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
