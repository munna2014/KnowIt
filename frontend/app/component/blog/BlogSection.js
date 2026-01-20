"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest, getAuthToken, getCachedBlogPosts } from "../../lib/api";
import { 
  calculateReadingTime, 
  formatReadingTime, 
  formatDate, 
  getUserInitials, 
  resolveAvatarUrl 
} from "../../lib/utils";



export default function BlogSection() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [likingPosts, setLikingPosts] = useState(new Set());

  // Check for cached posts immediately
  useEffect(() => {
    const cachedPosts = getCachedBlogPosts();
    if (cachedPosts?.posts) {
      console.log("Loading cached blog posts immediately");
      setPosts(cachedPosts.posts);
      setIsLoading(false);
      
      // Still load fresh data in background
      loadPosts(true);
    } else {
      loadPosts();
    }
  }, []);

  const loadLikeStatuses = async (posts) => {
    const token = getAuthToken();
    if (!token || !posts.length) return posts;

    // Return posts immediately and load like statuses in background
    const postsWithDefaults = posts.map(post => ({ ...post, user_liked: false }));
    
    // Load like statuses asynchronously without blocking
    setTimeout(async () => {
      try {
        const postsWithLikes = await Promise.all(
          posts.map(async (post) => {
            try {
              const data = await apiRequest(`blog-posts/${post.slug}/like-status`);
              return {
                ...post,
                user_liked: Boolean(data?.liked),
                post_likes_count: data?.likes_count ?? post.post_likes_count
              };
            } catch (err) {
              console.error(`Error loading like status for ${post.slug}:`, err);
              return { ...post, user_liked: false };
            }
          })
        );
        
        // Update posts with like statuses
        setPosts(postsWithLikes);
      } catch (err) {
        console.error("Error loading like statuses:", err);
      }
    }, 0);
    
    return postsWithDefaults;
  };

  const loadPosts = useCallback(async (isBackgroundLoad = false) => {
    try {
      if (!isBackgroundLoad) {
        setIsLoading(true);
        setError("");
      }
      
      // Load published posts only with enhanced caching
      const data = await apiRequest("blog-posts?status=published", {
        useLocalStorage: true,
        skipCache: isBackgroundLoad // Skip cache for background refresh
      });
      const posts = data.posts || [];
      
      // Load like statuses for authenticated users (but don't block the UI)
      const postsWithLikes = await loadLikeStatuses(posts);
      setPosts(postsWithLikes);
    } catch (err) {
      console.error("Error loading posts:", err);
      if (!isBackgroundLoad) {
        setError("Could not load blog posts.");
      }
    } finally {
      if (!isBackgroundLoad) {
        setIsLoading(false);
      }
    }
  }, []);

  // Remove the old useEffect since we handle it in the new one above



  // Memoize the displayed posts to prevent unnecessary re-renders
  const displayedPosts = useMemo(() => posts.slice(0, 6), [posts]);

  const handleLikeToggle = async (event, post) => {
    event.preventDefault();
    event.stopPropagation();
    
    const token = getAuthToken();
    if (!token) {
      router.push("/component/login");
      return;
    }

    if (likingPosts.has(post.id)) return;

    try {
      setLikingPosts(prev => new Set([...prev, post.id]));
      
      const data = await apiRequest(`blog-posts/${post.slug}/like`, { 
        method: "POST" 
      });
      
      // Update the post in the posts array
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === post.id 
            ? { 
                ...p, 
                post_likes_count: data?.likes_count ?? p.post_likes_count,
                user_liked: Boolean(data?.liked)
              }
            : p
        )
      );
    } catch (err) {
      console.error("Error toggling like:", err);
    } finally {
      setLikingPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(post.id);
        return newSet;
      });
    }
  };

  const handleCommentsClick = useCallback((event, slug) => {
    event.preventDefault();
    event.stopPropagation();
    router.push(`/component/blog/${slug}#comments`);
  }, [router]);

  if (isLoading) {
    return (
      <div className="text-center py-12 bg-white">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Loading blog posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-white">
        <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">Could not load posts</h3>
        <p className="mt-2 text-gray-600">{error}</p>
        <button
          onClick={loadPosts}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-600/30 transition-colors hover:bg-emerald-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12 bg-black-400 min-h-screen py-8">
      {/* Modern Blog Grid - All Cards Same Size */}
      {posts.length > 0 ? (
        <div>
          <div className="space-y-16">
            {displayedPosts.map((post) => (
              <Link key={post.id} href={`/component/blog/${post.slug}`}>
                <article className="group flex m-6 min-h-[18rem] flex-col gap-10 rounded-2xl border border-gray-200 bg-white p-10 shadow-lg transition-all duration-300 hover:border-emerald-400 hover:shadow-emerald-100/50 hover:shadow-2xl hover:bg-emerald-100 lg:flex-row">
                  {/* Featured Image */}
                  {post.featured_image_url && (
                    <div className="h-58 w-full  flex-shrink-0 overflow-hidden  rounded-xl lg:h-65 lg:w-96">
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-300"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  <div className="flex-1 flex flex-col justify-between">
                    {/* Header with Category and Date */}
                    <div>
                      <div className="mb-4 flex items-center gap-4 text-sm">
                        {post.category && (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 ring-1 ring-emerald-500/20 uppercase tracking-wide">
                            {post.category}
                          </span>
                        )}
                        <span className="text-gray-600">
                          {formatDate(post.published_at || post.created_at, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600">
                          {formatReadingTime(calculateReadingTime(post.content))}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="mb-4 text-2xl md:text-3xl font-bold text-gray-900 transition-colors leading-tight group-hover:text-emerald-700">
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      {post.excerpt && (
                        <p className="mb-6 text-gray-600 leading-relaxed line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                    </div>

                    {/* Author and Stats Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
                          {post.user?.avatar_url ? (
                            <img
                              src={resolveAvatarUrl(post.user.avatar_url)}
                              alt={post.user.name || "Author"}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.parentElement.innerHTML = getUserInitials(post.user);
                              }}
                            />
                          ) : (
                            getUserInitials(post.user)
                          )}
                        </div>
                        <div>
                          <p className="text-gray-900 font-medium">
                            {post.user?.name || `${post.user?.first_name || ''} ${post.user?.last_name || ''}`.trim() || "Anonymous"}
                          </p>
                          <p className="text-sm text-gray-500">Author</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span className="flex items-center gap-2">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {post.views_count || 0} views
                        </span>
                        <button
                          className="flex items-center gap-2 hover:text-emerald-600 transition-colors"
                          onClick={(e) => handleCommentsClick(e, post.slug)}
                          type="button"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h6m-6 4h4m-5 4l-4-4H6a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                          {post.comments_count || 0} comments
                        </button>
                        <button
                          onClick={(e) => handleLikeToggle(e, post)}
                          disabled={likingPosts.has(post.id)}
                          className={`flex items-center gap-2 transition-colors ${
                            post.user_liked 
                              ? "text-red-500 hover:text-red-600" 
                              : "hover:text-emerald-600"
                          } ${likingPosts.has(post.id) ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <svg 
                            className="h-4 w-4" 
                            fill={post.user_liked ? "currentColor" : "none"} 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {post.post_likes_count || 0} likes
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
          <br></br>
          {posts.length > 6 && (
            <div className="text-center mt-12 pt-8 border-t border-gray-200">
              <Link
                href="/component/my-blogs"
                className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                View All Posts
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-white">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No blog posts yet</h3>
          <p className="mt-2 text-gray-600">
            Be the first to share your thoughts with the community.
          </p>
          <Link
            href="/component/create-blog"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-600/30 transition-colors hover:bg-emerald-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create First Post
          </Link>
        </div>
      )}
    </div>
  );
}
