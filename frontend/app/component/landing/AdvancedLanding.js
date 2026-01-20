"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest, getAuthToken, getAuthUser } from "../../lib/api";
import { 
  formatDate, 
  getUserInitials, 
  resolveAvatarUrl 
} from "../../lib/utils";

// Advanced particle system configuration
const PARTICLE_COUNT = 50;
const PARTICLE_SPEED = 0.5;

// Advanced background images with themes
const backgroundThemes = {
  tech: [
    "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
  ],
  space: [
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
  ],
  abstract: [
    "https://images.unsplash.com/photo-1557672172-298e090bd0f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
  ]
};

const categoryGradients = {
  'Design': 'from-purple-500 via-pink-500 to-red-500',
  'Dev': 'from-blue-500 via-cyan-500 to-teal-500',
  'Product': 'from-green-500 via-emerald-500 to-cyan-500',
  'Technology': 'from-orange-500 via-red-500 to-pink-500',
  'AI': 'from-indigo-500 via-purple-500 to-pink-500',
  'default': 'from-emerald-500 via-cyan-500 to-blue-500'
};

export default function AdvancedLanding() {
  const router = useRouter();
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  
  // State management
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    totalComments: 0,
    totalLikes: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentTheme, setCurrentTheme] = useState('tech');
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  // Authentication check and mounting
  useEffect(() => {
    console.log('AdvancedLanding mounting...');
    
    const token = getAuthToken();
    const user = getAuthUser();
    
    console.log('Auth check - token:', !!token, 'user:', !!user);
    
    if (!token || !user) {
      console.log('No auth, redirecting to login');
      router.push("/component/login");
      return;
    }
    
    console.log('Auth successful, setting mounted to true');
    setMounted(true);
    
    // Load content after mounting
    loadAdvancedContent();
  }, [router]);

  // Particle system initialization
  useEffect(() => {
    initParticles();
    startParticleAnimation();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Background theme rotation
  useEffect(() => {
    const themeInterval = setInterval(() => {
      const themes = Object.keys(backgroundThemes);
      const currentIndex = themes.indexOf(currentTheme);
      const nextTheme = themes[(currentIndex + 1) % themes.length];
      setCurrentTheme(nextTheme);
      setCurrentBgIndex(0);
    }, 15000); // Change theme every 15 seconds

    const bgInterval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgroundThemes[currentTheme].length);
    }, 5000); // Change background every 5 seconds

    return () => {
      clearInterval(themeInterval);
      clearInterval(bgInterval);
    };
  }, [currentTheme]);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible((prev) => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting
          }));
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const initParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * PARTICLE_SPEED,
        vy: (Math.random() - 0.5) * PARTICLE_SPEED,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        color: `hsl(${Math.random() * 60 + 160}, 70%, 60%)` // Cyan to green range
      });
    }
    particlesRef.current = particles;
  };

  const startParticleAnimation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Bounce off edges
        if (particle.x <= 0 || particle.x >= canvas.width) particle.vx *= -1;
        if (particle.y <= 0 || particle.y >= canvas.height) particle.vy *= -1;
        
        // Mouse interaction
        const dx = mousePosition.x - particle.x;
        const dy = mousePosition.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          particle.x -= dx * 0.01;
          particle.y -= dy * 0.01;
        }
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();
      });
      
      // Draw connections
      particlesRef.current.forEach((particle, i) => {
        particlesRef.current.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.2 * (1 - distance / 100)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
  };

  const loadAdvancedContent = async () => {
    console.log('Loading advanced content...');
    try {
      setIsLoading(true);
      
      // Load all featured posts (increased limit to show all posts)
      console.log('Fetching blog posts...');
      const postsData = await apiRequest("blog-posts?status=published&limit=50");
      const posts = postsData.posts || [];
      console.log('Loaded posts:', posts.length, posts);
      setFeaturedPosts(posts);

      // Load admin stats for real-time data
      try {
        const adminToken = getAuthToken();
        const statsData = await apiRequest("admin/stats", {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        setStats({
          totalPosts: statsData.totalPosts || posts.length,
          totalUsers: statsData.totalUsers || 4,
          totalComments: statsData.totalComments || 0,
          totalLikes: statsData.totalLikes || 0
        });
      } catch (adminError) {
        // Fallback to calculated stats
        setStats({
          totalPosts: posts.length,
          totalUsers: 4,
          totalComments: posts.reduce((sum, post) => sum + (post.comments_count || 0), 0),
          totalLikes: posts.reduce((sum, post) => sum + (post.post_likes_count || 0), 0)
        });
      }

      // Create trending topics from posts (show more topics)
      const topics = posts.slice(0, 6).map(post => ({
        title: post.title,
        tag: post.category || 'General',
        slug: post.slug,
        author: post.user?.name || 'Anonymous',
        likes: post.post_likes_count || 0,
        excerpt: post.excerpt
      }));
      setTrendingTopics(topics);

      // If no posts, set fallback content
      if (posts.length === 0) {
        console.log('No posts found, using fallback content');
        setTrendingTopics([
          { title: "Future of AI Interfaces", tag: "Design", slug: "#", author: "Design Team", likes: 24, excerpt: "Exploring the next generation of AI-powered user interfaces" },
          { title: "React Server Components Deep Dive", tag: "Dev", slug: "#", author: "Dev Team", likes: 18, excerpt: "Understanding the architecture of React Server Components" },
          { title: "Building Scalable Design Systems", tag: "Product", slug: "#", author: "Product Team", likes: 32, excerpt: "Best practices for creating maintainable design systems" },
          { title: "The Evolution of Web Performance", tag: "Technology", slug: "#", author: "Tech Team", likes: 28, excerpt: "How modern web technologies are reshaping performance" },
          { title: "AI-Powered Content Creation", tag: "AI", slug: "#", author: "AI Team", likes: 45, excerpt: "Leveraging artificial intelligence for creative content generation" },
          { title: "Sustainable Web Development", tag: "Technology", slug: "#", author: "Green Team", likes: 38, excerpt: "Building environmentally conscious web applications" },
        ]);
      }

    } catch (error) {
      console.error("Error loading advanced content:", error);
      console.log("Using fallback content");
      // Fallback content
      setTrendingTopics([
        { title: "Future of AI Interfaces", tag: "Design", slug: "#", author: "Design Team", likes: 24, excerpt: "Exploring the next generation of AI-powered user interfaces" },
        { title: "React Server Components Deep Dive", tag: "Dev", slug: "#", author: "Dev Team", likes: 18, excerpt: "Understanding the architecture of React Server Components" },
        { title: "Building Scalable Design Systems", tag: "Product", slug: "#", author: "Product Team", likes: 32, excerpt: "Best practices for creating maintainable design systems" },
        { title: "The Evolution of Web Performance", tag: "Technology", slug: "#", author: "Tech Team", likes: 28, excerpt: "How modern web technologies are reshaping performance" },
        { title: "AI-Powered Content Creation", tag: "AI", slug: "#", author: "AI Team", likes: 45, excerpt: "Leveraging artificial intelligence for creative content generation" },
        { title: "Sustainable Web Development", tag: "Technology", slug: "#", author: "Green Team", likes: 38, excerpt: "Building environmentally conscious web applications" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatStatValue = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M+`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K+`;
    return `${value}+`;
  };

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Early return for SSR to prevent hydration issues
  console.log('AdvancedLanding render, mounted:', mounted);
  
  if (!mounted) {
    return (
      <div className="min-h-screen bg-black overflow-hidden">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
            <p className="mt-4 text-slate-300">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden landing-modern">
      {/* Advanced Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-10"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Dynamic Background System */}
      <div className="fixed inset-0 z-0">
          {backgroundThemes[currentTheme].map((image, index) => (
            <div
              key={`${currentTheme}-${index}`}
              className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-3000 ${
                index === currentBgIndex ? 'opacity-40 scale-105' : 'opacity-0 scale-100'
              }`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
          
          {/* Advanced Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-slate-900/85 to-emerald-900/90" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(transparent 0%, rgba(255,255,255,0.06) 100%), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
              backgroundSize: "100% 100%, 48px 48px"
            }}
          />
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(16, 185, 129, 0.15) 0%, transparent 50%)`
            }}
          />
        </div>

        {/* Main Content */}
        <div className="relative z-20">
        {/* Advanced Hero Section */}
        <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="text-center space-y-8">
              {/* Animated Badge */}
              <div 
                className="hero-badge inline-flex items-center gap-3 px-6 py-3 rounded-full border border-emerald-400/30 bg-emerald-500/10 backdrop-blur-xl"
                data-animate
                id="hero-badge"
              >
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                <span className="text-emerald-300 font-semibold text-sm uppercase tracking-wider">
                  Welcome to the Future of Blogging
                </span>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
              </div>

              {/* Main Heading with Advanced Typography */}
              <div className="space-y-6">
                <h1 
                  className={`hero-title text-6xl md:text-8xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r ${categoryGradients.default} leading-tight transform transition-all duration-1000 ${
                    isVisible['hero-badge'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                  style={{
                    textShadow: '0 0 40px rgba(16, 185, 129, 0.3)',
                    transform: `translateY(${scrollY * 0.1}px)`
                  }}
                >
                  KnowIt
                </h1>
                
                <div className="relative">
                  <h2 className="hero-subtitle text-2xl md:text-4xl lg:text-5xl font-bold text-white/90 leading-tight">
                    Where{" "}
                    <span className="relative inline-block">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
                        Ideas
                      </span>
                      <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transform scale-x-0 animate-pulse" 
                           style={{ animationDelay: '2s', animationFillMode: 'forwards' }} />
                    </span>
                    {" "}Meet{" "}
                    <span className="relative inline-block">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                        Innovation
                      </span>
                      <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full transform scale-x-0 animate-pulse" 
                           style={{ animationDelay: '2.5s', animationFillMode: 'forwards' }} />
                    </span>
                  </h2>
                </div>
              </div>

              {/* Enhanced Description */}
              <p className="hero-lede text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed font-light">
                Discover cutting-edge insights, share groundbreaking ideas, and connect with visionaries 
                shaping the future of technology, design, and innovation.
              </p>

              {/* Advanced CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
                <Link
                  href="/component/create-blog"
                  className="group relative px-12 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl text-white font-bold text-lg shadow-2xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transform hover:scale-105 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center gap-3">
                    <svg className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Start Creating
                  </div>
                </Link>
                
                <Link
                  href="#featured-content"
                  className="group px-12 py-4 border-2 border-white/20 rounded-2xl text-white font-bold text-lg backdrop-blur-xl hover:border-emerald-400/50 hover:bg-white/5 transform hover:scale-105 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 group-hover:translate-y-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    Explore Stories
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-xl animate-bounce" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-xl animate-bounce" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-20 w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-full blur-xl animate-bounce" style={{ animationDelay: '0.5s' }} />
        </section>

        {/* Advanced Stats Section */}
        <section className="py-20 relative" data-animate id="stats-section">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: "Articles", value: formatStatValue(stats.totalPosts * 100), icon: "📚", color: "from-blue-500 to-cyan-500" },
                { label: "Creators", value: formatStatValue(stats.totalUsers * 1000), icon: "👥", color: "from-purple-500 to-pink-500" },
                { label: "Interactions", value: formatStatValue((stats.totalComments + stats.totalLikes) * 50), icon: "💬", color: "from-emerald-500 to-green-500" },
                { label: "Impact", value: formatStatValue(stats.totalLikes * 200), icon: "🚀", color: "from-orange-500 to-red-500" },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className={`group relative p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 backdrop-blur-xl hover:from-white/10 hover:to-white/15 transition-all duration-500 transform hover:scale-105 ${
                    isVisible['stats-section'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`} />
                  <div className="relative text-center">
                    <div className="text-4xl mb-4">{stat.icon}</div>
                    <div className="text-3xl md:text-4xl font-black text-white mb-2">
                      {isLoading ? "..." : stat.value}
                    </div>
                    <div className="text-slate-400 font-medium uppercase tracking-wider text-sm">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Trending Topics */}
        <section className="py-20 relative" data-animate id="trending-section">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
                Trending{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  Now
                </span>
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Discover what's capturing the attention of our community
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trendingTopics.map((topic, index) => (
                <Link
                  key={index}
                  href={topic.slug.startsWith('#') ? topic.slug : `/component/blog/${topic.slug}`}
                  className={`group block transform transition-all duration-500 hover:scale-105 ${
                    isVisible['trending-section'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="relative p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 backdrop-blur-xl hover:from-white/10 hover:to-white/15 transition-all duration-500 h-full shadow-xl shadow-black/10 hover:shadow-2xl hover:shadow-emerald-500/10">
                    <div className={`absolute inset-0 bg-gradient-to-br ${categoryGradients[topic.tag] || categoryGradients.default} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`} />
                    
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`inline-block px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r ${categoryGradients[topic.tag] || categoryGradients.default} text-white shadow-lg`}>
                          {topic.tag}
                        </div>
                        <div className="text-slate-500 text-xs">
                          #{index + 1}
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors mb-4 line-clamp-2">
                        {topic.title}
                      </h3>
                      
                      {topic.excerpt && (
                        <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
                          {topic.excerpt}
                        </p>
                      )}
                      
                        <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-medium">by {topic.author}</span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {topic.likes}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced All Posts Section */}
        <section className="py-20 relative" data-animate id="featured-content">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
                All{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Stories
                </span>
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Explore every story, insight, and idea from our community
              </p>
              <div className="mt-8 flex items-center justify-center gap-4">
                <div className="h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent w-32"></div>
                <div className="text-emerald-400 font-semibold">
                  {featuredPosts.length} {featuredPosts.length === 1 ? 'Post' : 'Posts'} Available
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent w-32"></div>
              </div>
            </div>

            {featuredPosts.length > 0 && (
              <div className="space-y-20">
                {/* Hero Featured Post - Most Recent */}
                {featuredPosts[0] && (
                  <div className={`transform transition-all duration-1000 ${
                    isVisible['featured-content'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}>
                    <div className="text-center mb-8">
                      <span className="inline-block px-6 py-2 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-full text-emerald-300 font-semibold text-sm uppercase tracking-wider">
                        Latest Story
                      </span>
                    </div>
                    <Link href={`/component/blog/${featuredPosts[0].slug}`}>
                      <article className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-xl hover:from-white/15 hover:to-white/10 transition-all duration-700 transform hover:scale-[1.02] shadow-2xl shadow-black/20">
                        <div className="grid lg:grid-cols-2 gap-0 min-h-[600px]">
                          {featuredPosts[0].featured_image_url && (
                            <div className="relative overflow-hidden">
                              <img
                                src={featuredPosts[0].featured_image_url}
                                alt={featuredPosts[0].title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/60" />
                              <div className="absolute top-6 left-6">
                                <div className="flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-xl rounded-full">
                                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                  <span className="text-white text-sm font-medium">Featured</span>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="p-12 flex flex-col justify-center">
                            {featuredPosts[0].category && (
                              <span className={`inline-block w-fit px-6 py-3 rounded-full text-sm font-bold bg-gradient-to-r ${categoryGradients[featuredPosts[0].category] || categoryGradients.default} text-white mb-6 shadow-lg`}>
                                {featuredPosts[0].category}
                              </span>
                            )}
                            
                            <h3 className="text-3xl lg:text-5xl font-black text-white group-hover:text-emerald-300 transition-colors mb-6 leading-tight">
                              {featuredPosts[0].title}
                            </h3>
                            
                            {featuredPosts[0].excerpt && (
                              <p className="text-slate-300 text-lg leading-relaxed mb-8">
                                {featuredPosts[0].excerpt}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg">
                                  {featuredPosts[0].user?.avatar_url ? (
                                    <img
                                      src={resolveAvatarUrl(featuredPosts[0].user.avatar_url)}
                                      alt={featuredPosts[0].user.name}
                                      className="w-full h-full rounded-full object-cover"
                                    />
                                  ) : (
                                    getUserInitials(featuredPosts[0].user)
                                  )}
                                </div>
                                <div>
                                  <p className="text-white font-semibold text-lg">
                                    {featuredPosts[0].user?.name || "Anonymous"}
                                  </p>
                                  <p className="text-slate-400">
                                    {formatDate(featuredPosts[0].published_at || featuredPosts[0].created_at, { month: 'short', day: 'numeric' })}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-6 text-slate-400">
                                <span className="flex items-center gap-2">
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                  {featuredPosts[0].post_likes_count || 0}
                                </span>
                                <span className="flex items-center gap-2">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                {/* All Posts Grid - Enhanced Layout */}
                {featuredPosts.length > 1 && (
                  <div>
                    <div className="text-center mb-12">
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        More Stories to Explore
                      </h3>
                      <p className="text-slate-400">
                        Discover insights, tutorials, and thoughts from our community
                      </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {featuredPosts.slice(1).map((post, index) => (
                        <Link key={post.id} href={`/component/blog/${post.slug}`}>
                          <article className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 backdrop-blur-xl hover:from-white/10 hover:to-white/15 transition-all duration-500 transform hover:scale-105 h-full shadow-xl shadow-black/10 hover:shadow-2xl hover:shadow-emerald-500/10 ${
                            isVisible['featured-content'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                          }`}
                          style={{ transitionDelay: `${(index + 1) * 100}ms` }}>
                            
                            {/* Post Image */}
                            {post.featured_image_url ? (
                              <div className="aspect-video overflow-hidden relative">
                                <img
                                  src={post.featured_image_url}
                                  alt={post.title}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                              </div>
                            ) : (
                              <div className="aspect-video bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                                <div className="text-6xl opacity-30">📝</div>
                              </div>
                            )}
                            
                            {/* Post Content */}
                            <div className="p-6 flex flex-col flex-grow">
                              {/* Category Badge */}
                              {post.category && (
                                <span className={`inline-block w-fit px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${categoryGradients[post.category] || categoryGradients.default} text-white mb-4 shadow-md`}>
                                  {post.category}
                                </span>
                              )}
                              
                              {/* Title */}
                              <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors mb-3 line-clamp-2 flex-grow">
                                {post.title}
                              </h3>
                              
                              {/* Excerpt */}
                              {post.excerpt && (
                                <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
                                  {post.excerpt}
                                </p>
                              )}
                              
                              {/* Author and Meta */}
                              <div className="mt-auto">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                                      {post.user?.avatar_url ? (
                                        <img
                                          src={resolveAvatarUrl(post.user.avatar_url)}
                                          alt={post.user.name}
                                          className="w-full h-full rounded-full object-cover"
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
                                </div>
                                
                                {/* Engagement Stats */}
                                <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-white/10">
                                  <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                      </svg>
                                      {post.post_likes_count || 0}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h6m-6 4h4m-5 4l-4-4H6a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                      </svg>
                                      {post.comments_count || 0}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                      {post.views_count || 0}
                                    </span>
                                  </div>
                                  <div className="text-emerald-400 font-medium">
                                    Read More →
                                  </div>
                                </div>
                              </div>
                            </div>
                          </article>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Call to Action */}
                <div className="text-center pt-16">
                  <div className="inline-block p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 backdrop-blur-xl">
                    <h3 className="text-2xl font-bold text-white mb-4">
                      Ready to Share Your Story?
                    </h3>
                    <p className="text-slate-400 mb-6 max-w-md">
                      Join our community of writers and share your insights with the world
                    </p>
                    <Link
                      href="/component/create-blog"
                      className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl text-white font-bold hover:from-cyan-500 hover:to-emerald-500 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-emerald-500/25"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Start Writing
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {featuredPosts.length === 0 && !isLoading && (
              <div className="text-center py-20">
                <div className="text-6xl mb-6 opacity-50">📚</div>
                <h3 className="text-2xl font-bold text-white mb-4">No Stories Yet</h3>
                <p className="text-slate-400 mb-8 max-w-md mx-auto">
                  Be the first to share your knowledge and insights with the community
                </p>
                <Link
                  href="/component/create-blog"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl text-white font-bold hover:from-cyan-500 hover:to-emerald-500 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-emerald-500/25"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create First Post
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Advanced Footer */}
        <footer className="py-20 border-t border-white/10 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
              <div className="md:col-span-2">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-black text-xl">
                    K
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">KnowIt</h3>
                    <p className="text-slate-400">Future of Knowledge Sharing</p>
                  </div>
                </div>
                <p className="text-slate-400 leading-relaxed max-w-md">
                  Empowering creators and innovators to share their knowledge and shape the future through compelling storytelling and cutting-edge insights.
                </p>
              </div>
              
              <div>
                <h4 className="text-white font-bold mb-4">Platform</h4>
                <ul className="space-y-2 text-slate-400">
                  <li><Link href="/component/create-blog" className="hover:text-emerald-400 transition-colors">Write</Link></li>
                  <li><Link href="/component/landing" className="hover:text-emerald-400 transition-colors">Discover</Link></li>
                  <li><Link href="/component/profile" className="hover:text-emerald-400 transition-colors">Profile</Link></li>
                  <li><Link href="/component/my-blogs" className="hover:text-emerald-400 transition-colors">My Posts</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-bold mb-4">Connect</h4>
                <div className="flex gap-4">
                  {[
                    { icon: "🐦", href: "#", label: "Twitter" },
                    { icon: "💼", href: "#", label: "LinkedIn" },
                    { icon: "📧", href: "#", label: "Email" },
                    { icon: "🌐", href: "#", label: "Website" },
                  ].map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-xl hover:bg-white/10 hover:border-emerald-400/50 transition-all duration-300 transform hover:scale-110"
                      title={social.label}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="pt-8 border-t border-white/10 text-center">
              <p className="text-slate-400">
                © 2026 KnowIt. Crafted with passion for the future of knowledge sharing.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
