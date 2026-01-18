"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../Navbar";
import { apiRequest } from "../../../lib/api";

const resolveAvatarUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) {
    return url;
  }
  return `http://localhost:8000${url}`;
};

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPost = async () => {
      if (!params.slug) return;

      try {
        setIsLoading(true);
        setError("");
        
        const data = await apiRequest(`blog-posts/${params.slug}`);
        setPost(data.post);

        // Load related posts by the same author
        if (data.post?.user_id) {
          try {
            const relatedData = await apiRequest(`blog-posts?user_id=${data.post.user_id}&status=published&limit=4`);
            // Filter out the current post and limit to 3 related posts
            const filtered = (relatedData.posts || [])
              .filter(p => p.slug !== params.slug)
              .slice(0, 3);
            setRelatedPosts(filtered);
          } catch (relatedErr) {
            console.error("Error loading related posts:", relatedErr);
            // Don't show error for related posts, just continue without them
          }
        }
      } catch (err) {
        console.error("Error loading post:", err);
        
        if (err.status === 404) {
          setError("Blog post not found.");
        } else {
          setError("Could not load the blog post. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();
  }, [params.slug]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-16">
          <div className="mx-auto max-w-4xl px-6 py-12">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
                <p className="mt-4 text-gray-600">Loading blog post...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-16">
          <div className="mx-auto max-w-4xl px-6 py-12">
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {error || "Blog post not found"}
              </h3>
              <p className="mt-2 text-gray-600">
                The blog post you're looking for doesn't exist or has been removed.
              </p>
              <Link
                href="/component/landing"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-16">
        {/* Hero Section with Featured Image */}
        {post.featured_image_url && (
          <div className="relative h-96 md:h-[500px] overflow-hidden">
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            
            {/* Title Overlay */}
            <div className="absolute inset-0 flex items-end">
              <div className="w-full p-8 md:p-12">
                <div className="mx-auto max-w-4xl">
                  {post.category && (
                    <span className="inline-block mb-4 text-sm font-semibold text-emerald-400 uppercase tracking-wide">
                      {post.category}
                    </span>
                  )}
                  <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                    {post.title}
                  </h1>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="mx-auto max-w-4xl px-6 py-12">
          {/* Article Header (if no featured image) */}
          {!post.featured_image_url && (
            <header className="mb-12 text-center">
              {post.category && (
                <span className="inline-block mb-4 text-sm font-semibold text-emerald-600 uppercase tracking-wide">
                  {post.category}
                </span>
              )}
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
                {post.title}
              </h1>
            </header>
          )}

          {/* Author and Meta Info */}
          <div className="mb-12 flex items-center justify-between border-b border-gray-200 pb-8">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold text-lg">
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
                <p className="text-lg font-semibold text-gray-900">
                  {post.user?.name || `${post.user?.first_name || ''} ${post.user?.last_name || ''}`.trim() || "Anonymous"}
                </p>
                <p className="text-gray-600">Author</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-gray-600 mb-1">
                {formatDate(post.published_at || post.created_at)}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {post.views_count || 0} views
                </span>
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {post.likes_count || 0} likes
                </span>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <article className="prose prose-lg prose-gray max-w-none">
            <div className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap font-light">
              {post.content}
            </div>
          </article>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Tags</h3>
              <div className="flex flex-wrap gap-3">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-200 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Author Bio Section */}
          <div className="mt-16 rounded-lg bg-white border border-gray-200 p-8 shadow-sm">
            <div className="flex items-start gap-6">
              <div className="h-20 w-20 overflow-hidden rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold text-xl flex-shrink-0">
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
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  About {post.user?.name || `${post.user?.first_name || ''} ${post.user?.last_name || ''}`.trim() || "the Author"}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {post.user?.bio || "A passionate writer sharing insights and experiences through thoughtful blog posts."}
                </p>
              </div>
            </div>
          </div>

          {/* Related Posts from Author */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 border-t border-gray-200 pt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                More from {post.user?.name || `${post.user?.first_name || ''} ${post.user?.last_name || ''}`.trim() || "this Author"}
              </h2>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <Link key={relatedPost.id} href={`/component/blog/${relatedPost.slug}`}>
                    <article className="group cursor-pointer bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      {/* Featured Image */}
                      {relatedPost.featured_image_url && (
                        <div className="aspect-video w-full overflow-hidden">
                          <img
                            src={relatedPost.featured_image_url}
                            alt={relatedPost.title}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-300"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-6">
                        {/* Category and Date */}
                        <div className="mb-2 flex items-center gap-3 text-sm">
                          {relatedPost.category && (
                            <span className="text-emerald-600 font-medium uppercase tracking-wide">
                              {relatedPost.category}
                            </span>
                          )}
                          <span className="text-gray-500">
                            {formatDate(relatedPost.published_at || relatedPost.created_at)}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors leading-tight mb-2">
                          {relatedPost.title}
                        </h3>

                        {/* Excerpt */}
                        {relatedPost.excerpt && (
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">
                            {relatedPost.excerpt}
                          </p>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {relatedPost.views_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {relatedPost.likes_count || 0}
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-16 flex items-center justify-between border-t border-gray-200 pt-8">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Blog
            </button>
            
            <Link
              href="/component/landing"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-white font-medium shadow-sm hover:bg-emerald-700 transition-colors"
            >
              View All Posts
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}