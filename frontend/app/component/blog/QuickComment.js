"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, getAuthToken, getAuthUser } from "../../lib/api";

const resolveAvatarUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) {
    return url;
  }
  return `http://localhost:8000${url}`;
};

export default function QuickComment({ post, onCommentAdded }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const currentUser = getAuthUser();

  const getUserInitials = (user) => {
    if (!user) return "U";
    const name = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim();
    if (name) {
      const parts = name.split(' ').filter(Boolean);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = commentBody.trim();
    if (!trimmed || isSubmitting) return;

    const token = getAuthToken();
    if (!token) {
      router.push("/component/login");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      
      const data = await apiRequest(`blog-posts/${post.slug}/comments`, {
        method: "POST",
        data: { body: trimmed },
      });
      
      if (data?.comment) {
        setCommentBody("");
        setIsOpen(false);
        if (onCommentAdded) {
          onCommentAdded(data.comment);
        }
      }
    } catch (err) {
      console.error("Error submitting comment:", err);
      if (err?.status === 401) {
        setError("Please log in to comment.");
        router.push("/component/login");
      } else if (err?.status === 422) {
        setError("Comment is required and must be under 1000 characters.");
      } else {
        setError("Could not submit comment. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <button
        onClick={() => router.push("/component/login")}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-300 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h6m-6 4h4m-5 4l-4-4H6a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        Login to comment
      </button>
    );
  }

  return (
    <div className="relative">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-300 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Quick comment
        </button>
      ) : (
        <div className="absolute bottom-full right-0 mb-2 w-80 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50">
          <form onSubmit={handleSubmit} className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="h-8 w-8 overflow-hidden rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                {currentUser?.avatar_url ? (
                  <img
                    src={resolveAvatarUrl(currentUser.avatar_url)}
                    alt={currentUser.name || "You"}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML = getUserInitials(currentUser);
                    }}
                  />
                ) : (
                  getUserInitials(currentUser)
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white mb-1">
                  {currentUser?.name || `${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`.trim() || "You"}
                </p>
                <textarea
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  placeholder="Write a quick comment..."
                  rows={3}
                  className="w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  autoFocus
                />
              </div>
            </div>
            
            {error && (
              <p className="text-sm text-red-400 mb-3">{error}</p>
            )}
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">
                {commentBody.trim().length}/1000
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setCommentBody("");
                    setError("");
                  }}
                  className="text-xs font-medium text-slate-400 hover:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !commentBody.trim()}
                  className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}