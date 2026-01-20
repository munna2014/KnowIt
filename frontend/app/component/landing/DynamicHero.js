"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiRequest } from "../../lib/api";
import { 
  calculateReadingTime, 
  formatReadingTime, 
  formatDate, 
  getUserInitials, 
  resolveAvatarUrl 
} from "../../lib/utils";
import "./hero.css";

// Curated collection of high-quality background images from Unsplash
const backgroundImages = [
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80", // Space/Tech
  "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80", // Code/Programming
  "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80", // Design/Creative
  "https://images.unsplash.com/photo-1504639725590-34d0984388bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80", // Innovation/Future
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80", // AI/Technology
  "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80", // Network/Connection
];

const categoryColors = {
  'Design': 'from-purple-500 to-pink-500',
  'Dev': 'from-blue-500 to-cyan-500',
  'Product': 'from-green-500 to-emerald-500',
  'Technology': 'from-orange-500 to-red-500',
  'AI': 'from-indigo-500 to-purple-500',
  'default': 'from-emerald-500 to-cyan-500'
};

export default function DynamicHero() {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    totalComments: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  useEffect(() => {
    loadDynamicContent();
    
    // Change background image every 10 seconds
    const bgInterval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 10000);

    return () => clearInterval(bgInterval);
  }, []);

  const loadDynamicContent = async () => {
    try {
      setIsLoading(true);
      
      // Load featured posts (latest 3 posts)
      const postsData = await apiRequest("blog-posts?status=published&limit=3");
      const posts = postsData.posts || [];
      setFeaturedPosts(posts);

      // Extract trending topics from posts
      const topics = posts.map(post => ({
        title: post.title,
        tag: post.category || 'General',
        slug: post.slug,
        author: post.user?.name || 'Anonymous',
        readingTime: calculateReadingTime(post.content),
        likes: post.post_likes_count || 0
      }));
      setTrendingTopics(topics);

      // Calculate stats
      setStats({
        totalPosts: postsData.total || posts.length,
        totalUsers: 4, // You could make this dynamic too
        totalComments: posts.reduce((sum, post) => sum + (post.comments_count || 0), 0)
      });

    } catch (error) {
      console.error("Error loading dynamic content:", error);
      // Fallback to static content
      setTrendingTopics([
        { title: "Future of AI Interfaces", tag: "Design", slug: "#", author: "Design Team", readingTime: 5, likes: 24 },
        { title: "React Server Patterns", tag: "Dev", slug: "#", author: "Dev Team", readingTime: 8, likes: 18 },
        { title: "Community Growth Loops", tag: "Product", slug: "#", author: "Product Team", readingTime: 6, likes: 32 },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatStatValue = (value) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K+`;
    }
    return `${value}+`;
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Dynamic Background with Smooth Transitions */}
      <div className="absolute inset-0">
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-2000 ${
              index === currentBgIndex ? 'opacity-30' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-emerald-900/95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.15),_transparent_50%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.15),_transparent_50%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 pt-28 pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            {/* Left Column - Main Content */}
            <div>
              <div className="mb-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300 backdrop-blur-sm">
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

              {/* Dynamic Stats */}
              <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {[
                  { label: "Articles", value: formatStatValue(stats.totalPosts), key: "posts" },
                  { label: "Readers", value: formatStatValue(stats.totalUsers * 1000), key: "readers" },
                  { label: "Comments", value: formatStatValue(stats.totalComments * 10), key: "comments" },
                ].map((stat, index) => (
                  <div
                    key={stat.key}
                    className="group rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left shadow-[0_20px_40px_-30px_rgba(15,23,42,0.8)] backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="text-2xl font-semibold text-white group-hover:scale-110 transition-transform duration-300">
                      {isLoading ? "..." : stat.value}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/component/create-blog"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-emerald-500/40 hover:scale-105"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Start Writing
                </Link>
                <Link
                  href="#featured-posts"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:scale-105"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  Explore Posts
                </Link>
              </div>
            </div>

            {/* Right Column - Dynamic Trending Topics */}
            <div className="relative">
              <div className="absolute -left-6 top-10 h-32 w-32 rounded-full bg-emerald-400/20 blur-2xl animate-pulse"></div>
              <div className="absolute -right-8 bottom-8 h-36 w-36 rounded-full bg-sky-400/20 blur-2xl animate-pulse"></div>
              
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-800/80 p-8 shadow-[0_30px_70px_-40px_rgba(15,23,42,0.85)] backdrop-blur-sm">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400 mb-6">
                  <span>Trending Topics</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span>Live</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {isLoading ? (
                    // Loading skeleton
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 animate-pulse">
                        <div className="h-4 bg-white/10 rounded mb-2 w-16"></div>
                        <div className="h-6 bg-white/10 rounded w-3/4"></div>
                      </div>
                    ))
                  ) : (
                    trendingTopics.map((topic, index) => (
                      <Link
                        key={index}
                        href={topic.slug.startsWith('#') ? topic.slug : `/component/blog/${topic.slug}`}
                        className="block group"
                      >
                        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-105">
                          <div className={`inline-block px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${categoryColors[topic.tag] || categoryColors.default} text-white mb-2`}>
                            {topic.tag}
                          </div>
                          <div className="text-lg font-semibold text-white group-hover:text-emerald-300 transition-colors mb-2">
                            {topic.title}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span>by {topic.author}</span>
                            <span>•</span>
                            <span>{formatReadingTime(topic.readingTime)}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              {topic.likes}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
                
                <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    New posts are landing every day. Stay close to the momentum.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Posts Preview */}
      {featuredPosts.length > 0 && (
        <div id="featured-posts" className="relative z-10 pb-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-[var(--font-display)] gradient-text-animated">
                Featured Stories
              </h2>
              <p className="text-lg text-slate-400">
                Discover the most engaging content from our community
              </p>
            </div>
            
            {/* Hero Featured Post */}
            {featuredPosts[0] && (
              <div className="mb-16">
                <Link href={`/component/blog/${featuredPosts[0].slug}`}>
                  <article className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-sm transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/20">
                    <div className="grid lg:grid-cols-2 gap-0">
                      {/* Featured Image */}
                      {featuredPosts[0].featured_image_url && (
                        <div className="relative aspect-video lg:aspect-auto overflow-hidden">
                          <img
                            src={featuredPosts[0].featured_image_url}
                            alt={featuredPosts[0].title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-slate-900/50 lg:to-slate-900/80"></div>
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="p-8 lg:p-12 flex flex-col justify-center">
                        {/* Category */}
                        {featuredPosts[0].category && (
                          <span className={`inline-block w-fit px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r ${categoryColors[featuredPosts[0].category] || categoryColors.default} text-white mb-4`}>
                            {featuredPosts[0].category}
                          </span>
                        )}
                        
                        {/* Title */}
                        <h3 className="text-2xl lg:text-4xl font-bold text-white group-hover:text-emerald-300 transition-colors mb-4 leading-tight">
                          {featuredPosts[0].title}
                        </h3>
                        
                        {/* Excerpt */}
                        {featuredPosts[0].excerpt && (
                          <p className="text-slate-300 text-lg leading-relaxed mb-6 line-clamp-3">
                            {featuredPosts[0].excerpt}
                          </p>
                        )}
                        
                        {/* Meta */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 overflow-hidden rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-semibold">
                              {featuredPosts[0].user?.avatar_url ? (
                                <img
                                  src={resolveAvatarUrl(featuredPosts[0].user.avatar_url)}
                                  alt={featuredPosts[0].user.name || "Author"}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.parentElement.innerHTML = getUserInitials(featuredPosts[0].user);
                                  }}
                                />
                              ) : (
                                getUserInitials(featuredPosts[0].user)
                              )}
                            </div>
                            <div>
                              <p className="text-white text-base font-medium">
                                {featuredPosts[0].user?.name || "Anonymous"}
                              </p>
                              <p className="text-slate-400 text-sm">
                                {formatDate(featuredPosts[0].published_at || featuredPosts[0].created_at, { month: 'short', day: 'numeric' })} • {formatReadingTime(calculateReadingTime(featuredPosts[0].content))}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-slate-400">
                            <span className="flex items-center gap-1 text-sm">
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              {featuredPosts[0].post_likes_count || 0}
                            </span>
                            <span className="flex items-center gap-1 text-sm">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h6m-6 4h4m-5 4l-4-4H6a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                              </svg>
                              {featuredPosts[0].comments_count || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              </div>
            )}
            
            {/* Secondary Featured Posts */}
            {featuredPosts.length > 1 && (
              <div className="grid gap-8 md:grid-cols-2">
                {featuredPosts.slice(1).map((post, index) => (
                  <Link key={post.id} href={`/component/blog/${post.slug}`}>
                    <article className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20 hover-lift">
                      {/* Featured Image */}
                      {post.featured_image_url && (
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={post.featured_image_url}
                            alt={post.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="p-6">
                        {/* Category */}
                        {post.category && (
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${categoryColors[post.category] || categoryColors.default} text-white mb-3`}>
                            {post.category}
                          </span>
                        )}
                        
                        {/* Title */}
                        <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors mb-3 line-clamp-2">
                          {post.title}
                        </h3>
                        
                        {/* Excerpt */}
                        {post.excerpt && (
                          <p className="text-slate-300 text-sm leading-relaxed mb-4 line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}
                        
                        {/* Meta */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 overflow-hidden rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-semibold">
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
                              <p className="text-white text-sm font-medium">
                                {post.user?.name || "Anonymous"}
                              </p>
                              <p className="text-slate-400 text-xs">
                                {formatDate(post.published_at || post.created_at, { month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-slate-400 text-xs">
                            {formatReadingTime(calculateReadingTime(post.content))}
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}