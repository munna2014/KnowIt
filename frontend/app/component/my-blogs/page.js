"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../Navbar";
import { apiRequest, getAuthToken } from "../../lib/api";

const statusFilters = [
  { value: "", label: "All Posts" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
  { value: "archived", label: "Archived" },
];

export default function MyBlogsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  const loadPosts = useCallback(async (page = 1, status = statusFilter) => {
    if (!getAuthToken()) {
      router.push("/component/login");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      
      const params = new URLSearchParams({ page: page.toString() });
      if (status) {
        params.append('status', status);
      }
      
      const data = await apiRequest(`my-blog-posts?${params.toString()}`);
      
      setPosts(data.posts || []);
      setPagination(data.pagination || {
        current_page: 1,
        last_page: 1,
        total: 0,
      });
    } catch (err) {
      console.error("Error loading posts:", err);
      
      if (err.status === 401) {
        router.push("/component/login");
      } else {
        setError("Could not load your blog posts. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, router]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleStatusFilter = useCallback((status) => {
    setStatusFilter(status);
    loadPosts(1, status);
  }, [loadPosts]);

  const handleDelete = useCallback(async (postId) => {
    if (!confirm("Are you sure you want to delete this blog post? This action cannot be undone.")) {
      return;
    }

    try {
      await apiRequest(`blog-posts/${postId}/delete`, { method: "DELETE" });
      
      // Reload posts after deletion
      loadPosts(pagination.current_page);
    } catch (err) {
      console.error("Error deleting post:", err);
      setError("Could not delete the blog post. Please try again.");
    }
  }, [loadPosts, pagination.current_page]);

  const getStatusBadge = (status) => {
    const badges = {
      published: "bg-emerald-600/20 text-emerald-300 border-emerald-600/30",
      draft: "bg-yellow-600/20 text-yellow-300 border-yellow-600/30",
      archived: "bg-slate-600/20 text-slate-300 border-slate-600/30",
    };
    
    return badges[status] || badges.draft;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black">
        <Navbar />
        <div className="pt-16">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
                <p className="mt-4 text-slate-300">Loading your blog posts...</p>
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
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">My Blog Posts</h1>
              <p className="mt-2 text-slate-300">
                Manage and edit your blog posts
              </p>
            </div>
            
            <Link
              href="/component/create-blog"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-600/30 transition-colors hover:bg-emerald-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Post
            </Link>
          </div>

          {/* Error Message */}
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

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => handleStatusFilter(filter.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  statusFilter === filter.value
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-800/50 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Posts Grid */}
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-white">No blog posts yet</h3>
              <p className="mt-2 text-slate-400">
                {statusFilter ? `No ${statusFilter} posts found.` : "Get started by creating your first blog post."}
              </p>
              <Link
                href="/component/create-blog"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-600/30 transition-colors hover:bg-emerald-700"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Post
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="group rounded-xl border border-slate-700/60 bg-slate-900/70 p-6 shadow-xl transition-all hover:border-slate-600 hover:shadow-2xl"
                >
                  {/* Featured Image */}
                  {post.featured_image_url && (
                    <div className="mb-4 overflow-hidden rounded-lg">
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        className="h-32 w-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="mb-3 flex items-center justify-between">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(post.status)}`}>
                      {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatDate(post.created_at)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="mb-2 text-lg font-semibold text-white line-clamp-2">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="mb-4 text-sm text-slate-300 line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Category */}
                  {post.category && (
                    <div className="mb-4">
                      <span className="inline-flex items-center rounded-full bg-blue-600/20 px-2.5 py-0.5 text-xs font-medium text-blue-300">
                        {post.category.toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="mb-4 flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {post.views_count || 0} views
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h6m-6 4h4m-5 4l-4-4H6a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      {post.comments_count || 0} comments
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {post.post_likes_count || 0} likes
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/component/edit-blog/${post.id}`}
                      className="flex-1 rounded-lg bg-slate-700 px-3 py-2 text-center text-xs font-medium text-slate-200 transition-colors hover:bg-slate-600"
                    >
                      Edit
                    </Link>
                    {post.status === 'published' && (
                      <Link
                        href={`/component/blog/${post.slug}`}
                        className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-center text-xs font-medium text-white transition-colors hover:bg-emerald-700"
                      >
                        View
                      </Link>
                    )}
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="rounded-lg bg-red-600/20 px-3 py-2 text-xs font-medium text-red-300 transition-colors hover:bg-red-600/30"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => loadPosts(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="rounded-lg bg-slate-800/50 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 text-sm text-slate-300">
                Page {pagination.current_page} of {pagination.last_page}
              </span>
              
              <button
                onClick={() => loadPosts(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className="rounded-lg bg-slate-800/50 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
