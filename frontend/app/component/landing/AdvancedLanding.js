"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "../../lib/api";

export default function AdvancedLanding() {
  const [mounted, setMounted] = useState(false);
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  console.log("🎯 AdvancedLanding component rendering...");

  // Load content data
  const loadAdvancedContent = async () => {
    try {
      console.log("🚀 Loading advanced content...");
      setLoading(true);

      // Load blog posts
      const postsResponse = await apiRequest("blog-posts?status=published&limit=10");
      console.log("📊 Blog posts response:", postsResponse);
      
      if (postsResponse?.posts && Array.isArray(postsResponse.posts)) {
        console.log("✅ Found posts in response.posts:", postsResponse.posts.length);
        setBlogPosts(postsResponse.posts);
      } else {
        console.log("❌ No posts found in response");
        setBlogPosts([]);
      }
    } catch (error) {
      console.error("❌ Error loading content:", error);
      setBlogPosts([]);
    } finally {
      setLoading(false);
      console.log("🏁 Loading complete");
    }
  };

  // Handle card click
  const handleCardClick = (post) => {
    router.push(`/component/blog/${post.slug}`);
  };

  useEffect(() => {
    console.log("🎯 AdvancedLanding component mounting...");
    setMounted(true);
    loadAdvancedContent();
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Ultra-Modern Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 overflow-hidden">
        {/* Advanced Background Effects */}
        <div className="absolute inset-0">
          {/* Sophisticated Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent"></div>
          
          {/* Elegant Floating Shapes */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-indigo-400/15 to-cyan-400/15 rounded-3xl rotate-45 animate-pulse blur-sm"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-emerald-400/15 to-teal-400/15 rounded-full animate-bounce blur-sm" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-32 left-20 w-20 h-20 bg-gradient-to-br from-violet-400/15 to-indigo-400/15 rounded-2xl rotate-12 animate-pulse blur-sm" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-20 right-32 w-28 h-28 bg-gradient-to-br from-cyan-400/15 to-blue-400/15 rounded-full animate-bounce blur-sm" style={{animationDelay: '0.5s'}}></div>
          
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        </div>
        
        <div className="relative text-center max-w-7xl mx-auto">
          {/* Refined Status Badge */}
          <div className="inline-flex items-center px-6 py-3 mb-12 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-2xl rounded-full border border-white/10 shadow-2xl">
            <div className="relative mr-3">
              <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full animate-ping"></div>
            </div>
            <span className="text-white/90 text-sm font-medium tracking-wide">
              ✨ Welcome to the future of knowledge sharing
            </span>
          </div>
          
          {/* Sophisticated Typography */}
          <div className="mb-16">
            <div className="relative">
              <h1 className="text-7xl md:text-9xl lg:text-[12rem] font-black leading-none mb-6">
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-slate-200 animate-pulse">
                  KNOW
                </span>
              </h1>
              {/* Subtle Glow Effect */}
              <div className="absolute inset-0 text-7xl md:text-9xl lg:text-[12rem] font-black leading-none mb-6 opacity-10 blur-2xl">
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-cyan-300">
                  KNOW
                </span>
              </div>
            </div>
            
            <h2 className="text-4xl md:text-6xl lg:text-8xl font-light text-white/95 mb-8 tracking-tight">
              Everything
            </h2>
            
            {/* Elegant Underline */}
            <div className="flex justify-center mb-8">
              <div className="w-32 h-1 bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-400 rounded-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Description */}
          <div className="mb-20 max-w-5xl mx-auto">
            <p className="text-2xl md:text-3xl text-white/80 mb-6 leading-relaxed font-light">
              Discover insights, share knowledge, and connect with a 
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-400 font-medium">
                  community of innovators
                </span>
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-400 animate-pulse"></div>
              </span>
            </p>
            <p className="text-lg text-white/60 max-w-3xl mx-auto">
              Join thousands of creators, thinkers, and learners in the most advanced knowledge-sharing platform
            </p>
          </div>
          
          {/* Refined Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            <div className="group relative p-8 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-2xl rounded-3xl border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-indigo-500/25 group-hover:shadow-indigo-500/50 transition-all duration-500">
                  <svg className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-white font-bold text-xl mb-3">Rich Content</h3>
                <p className="text-white/70 leading-relaxed">Diverse articles, tutorials, and insights from industry experts</p>
              </div>
            </div>
            
            <div className="group relative p-8 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-2xl rounded-3xl border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-emerald-500/25 group-hover:shadow-emerald-500/50 transition-all duration-500">
                  <svg className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-white font-bold text-xl mb-3">Global Community</h3>
                <p className="text-white/70 leading-relaxed">Connect with innovators, creators, and thought leaders worldwide</p>
              </div>
            </div>
            
            <div className="group relative p-8 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-2xl rounded-3xl border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-violet-500/25 group-hover:shadow-violet-500/50 transition-all duration-500">
                  <svg className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-white font-bold text-xl mb-3">AI-Powered</h3>
                <p className="text-white/70 leading-relaxed">Smart recommendations and lightning-fast search powered by AI</p>
              </div>
            </div>
          </div>
          
          {/* Refined Scroll Indicator */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="animate-bounce">
                <div className="w-12 h-12 bg-gradient-to-br from-white/10 to-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20">
                  <svg className="w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
              <div className="absolute inset-0 w-12 h-12 bg-gradient-to-br from-indigo-400/20 to-cyan-400/20 rounded-full animate-ping"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Section - Reduced top padding */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-8xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Latest Stories
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Discover what's happening in our community
            </p>
          </div>

          {loading ? (
            <div className="text-center text-white">
              <div className="text-xl mb-4">Loading posts...</div>
            </div>
          ) : blogPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <div 
                  key={post.id} 
                  className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 cursor-pointer transition-all duration-300 hover:bg-white/15 hover:transform hover:scale-105 hover:shadow-xl flex flex-col h-full min-h-[500px]"
                  onClick={() => handleCardClick(post)}
                >
                  {post.featured_image && (
                    <div className="flex-shrink-0">
                      <img
                        src={post.featured_image.startsWith('http') 
                          ? post.featured_image 
                          : `http://localhost:8000/storage/${post.featured_image}`}
                        alt={post.title}
                        className="w-full h-64 object-cover rounded-t-xl transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-2xl font-bold text-white mb-4 line-clamp-2 flex-shrink-0">
                      {post.title}
                    </h3>
                    
                    <p className="text-white/70 text-base mb-6 line-clamp-4 flex-grow leading-relaxed">
                      {post.excerpt || post.content?.substring(0, 200) + "..."}
                    </p>
                    
                    <div className="mt-auto">
                      <div className="flex items-center justify-between text-sm text-white/60 mb-4">
                        <span className="font-medium">By {post.user?.name || "Anonymous"}</span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      {/* Click indicator */}
                      <div className="text-center py-3 border-t border-white/20">
                        <span className="text-white/60 text-sm font-medium">Click to read more →</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-white mb-4">No Stories Yet</h3>
              <p className="text-white/70 max-w-md mx-auto">
                Be the first to share your knowledge and start the conversation!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer spacing */}
      <div className="pb-20"></div>
    </div>
  );
}
