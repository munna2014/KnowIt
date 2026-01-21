"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "../../lib/api";

export default function AdvancedLanding() {
  const [mounted, setMounted] = useState(false);
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    console.log("🎯 AdvancedLanding component mounting...");
    setMounted(true);
    loadAdvancedContent();
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-6xl mx-auto">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white mb-4">
            KNOW
          </h1>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-white/90 mb-8">
            Everything
          </h2>
          
          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
            Discover insights, share knowledge, and connect with a community of learners
          </p>
        </div>
      </section>

      {/* Blog Posts Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Latest Stories
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Discover what's happening in our community
            </p>
          </div>

          {loading ? (
            <div className="text-center text-white">
              <div className="text-2xl mb-4">Loading posts...</div>
            </div>
          ) : blogPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <div key={post.id} className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
                  {post.featured_image && (
                    <div className="mb-4">
                      <img
                        src={post.featured_image.startsWith('http') 
                          ? post.featured_image 
                          : `http://localhost:8000/storage/${post.featured_image}`}
                        alt={post.title}
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-white mb-2">
                    {post.title}
                  </h3>
                  <p className="text-white/70 text-sm mb-4">
                    {post.excerpt || post.content?.substring(0, 150) + "..."}
                  </p>
                  <div className="flex items-center justify-between text-sm text-white/60">
                    <span>By {post.user?.name || "Anonymous"}</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
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
    </div>
  );
}
