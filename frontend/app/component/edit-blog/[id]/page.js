"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../Navbar";
import { apiRequest, getAuthToken } from "../../../lib/api";

const categories = [
  { value: "", label: "Select Category" },
  { value: "design", label: "Design" },
  { value: "development", label: "Development" },
  { value: "technology", label: "Technology" },
  { value: "business", label: "Business" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "tutorial", label: "Tutorial" },
  { value: "news", label: "News" },
  { value: "other", label: "Other" },
];

const resolveImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) {
    return url;
  }
  return `http://localhost:8000/storage/${url}`;
};

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    featuredImageUrl: "",
    tags: [],
    status: "draft",
  });
  const [originalPost, setOriginalPost] = useState(null);
  const [featuredImage, setFeaturedImage] = useState(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadPost = async () => {
      if (!params.id) return;

      if (!getAuthToken()) {
        router.push("/component/login");
        return;
      }

      try {
        setIsLoading(true);
        setError("");
        
        const data = await apiRequest(`blog-posts/${params.id}/edit`);
        const post = data.post;
        
        setOriginalPost(post);
        setForm({
          title: post.title || "",
          content: post.content || "",
          excerpt: post.excerpt || "",
          category: post.category || "",
          featuredImageUrl: "",
          tags: post.tags || [],
          status: post.status || "draft",
        });
        
        if (post.featured_image_url) {
          setFeaturedImagePreview(post.featured_image_url);
        }
      } catch (err) {
        console.error("Error loading post:", err);
        
        if (err.status === 401) {
          router.push("/component/login");
        } else if (err.status === 404) {
          setError("Blog post not found.");
        } else if (err.status === 403) {
          setError("You don't have permission to edit this post.");
        } else {
          setError("Could not load the blog post. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();
  }, [params.id, router]);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }, []);

  const handleImageFile = useCallback((file) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB.');
      return;
    }

    setFeaturedImage(file);
    setFeaturedImagePreview(URL.createObjectURL(file));
    setForm(current => ({ ...current, featuredImageUrl: "" }));
    setError("");
  }, []);

  const handleFileInput = useCallback((event) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  }, [handleImageFile]);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  }, [handleImageFile]);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const addTag = useCallback(() => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag) && form.tags.length < 10) {
      setForm(current => ({
        ...current,
        tags: [...current.tags, tag]
      }));
      setTagInput("");
    }
  }, [tagInput, form.tags]);

  const removeTag = useCallback((tagToRemove) => {
    setForm(current => ({
      ...current,
      tags: current.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  const handleTagKeyPress = useCallback((event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag();
    }
  }, [addTag]);

  const handleSubmit = useCallback(async (event, status = form.status) => {
    event.preventDefault();
    
    if (!getAuthToken()) {
      setError("Please log in to update the blog post.");
      router.push("/component/login");
      return;
    }

    if (!form.title.trim() || !form.content.trim()) {
      setError("Title and content are required.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append('title', form.title.trim());
      formData.append('content', form.content.trim());
      formData.append('status', status);
      
      if (form.excerpt.trim()) {
        formData.append('excerpt', form.excerpt.trim());
      }
      
      if (form.category) {
        formData.append('category', form.category);
      }
      
      if (featuredImage) {
        formData.append('featured_image', featuredImage);
      } else if (form.featuredImageUrl.trim()) {
        formData.append('featured_image_url', form.featuredImageUrl.trim());
      }
      
      if (form.tags.length > 0) {
        form.tags.forEach((tag, index) => {
          formData.append(`tags[${index}]`, tag);
        });
      }

      const data = await apiRequest(`blog-posts/${params.id}/update`, {
        method: "PUT",
        data: formData,
      });

      setSuccess(`Blog post ${status === 'published' ? 'published' : 'updated'} successfully!`);
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push("/component/my-blogs");
      }, 2000);

    } catch (err) {
      console.error("Blog update error:", err);
      
      if (err.status === 401) {
        setError("Your session has expired. Please log in again.");
        setTimeout(() => {
          router.push("/component/login");
        }, 3000);
      } else if (err.status === 403) {
        setError("You don't have permission to edit this post.");
      } else if (err.status === 422) {
        setError(err?.message || "Please check your input and try again.");
      } else {
        setError(err?.message || "Could not update blog post. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [form, featuredImage, params.id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black">
        <Navbar />
        <div className="pt-16">
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
                <p className="mt-4 text-slate-300">Loading blog post...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !originalPost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black">
        <Navbar />
        <div className="pt-16">
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-white">{error}</h3>
              <button
                onClick={() => router.push("/component/my-blogs")}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-600/30 transition-colors hover:bg-emerald-700"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to My Blogs
              </button>
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
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Edit Blog Post</h1>
            <p className="mt-2 text-slate-300">
              Update your blog post and share your latest thoughts
            </p>
          </div>

          {/* Alert Messages */}
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

          {success && (
            <div className="mb-6 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="ml-3 text-sm text-emerald-200">{success}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title */}
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-6 shadow-xl">
              <label className="block text-lg font-medium text-white mb-3">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter your blog post title..."
                className="block w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3 text-slate-200 placeholder-slate-500 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>

            {/* Featured Image */}
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-6 shadow-xl">
              <h3 className="text-lg font-medium text-white mb-4">Featured Image</h3>
              
              {(featuredImagePreview || form.featuredImageUrl) && (
                <div className="mb-4">
                  <img
                    src={featuredImagePreview ? (featuredImage ? featuredImagePreview : resolveImageUrl(featuredImagePreview)) : form.featuredImageUrl}
                    alt="Featured image preview"
                    className="w-full max-w-md h-48 object-cover rounded-lg"
                    onError={(e) => {
                      setFeaturedImagePreview("");
                      setForm(current => ({ ...current, featuredImageUrl: "" }));
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFeaturedImage(null);
                      setFeaturedImagePreview("");
                      setForm(current => ({ ...current, featuredImageUrl: "" }));
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="mt-2 text-sm text-red-400 hover:text-red-300"
                  >
                    Remove Image
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {/* File Upload */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                    isDragOver
                      ? "border-blue-400 bg-blue-500/10"
                      : "border-slate-600 hover:border-slate-500 hover:bg-slate-800/50"
                  }`}
                >
                  <svg className="mx-auto h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mt-2 text-sm font-medium text-slate-200">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-slate-400">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />

                {/* URL Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Or paste image URL
                  </label>
                  <input
                    type="url"
                    name="featuredImageUrl"
                    placeholder="https://example.com/image.jpg"
                    value={form.featuredImageUrl}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-slate-600 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-6 shadow-xl">
              <label className="block text-lg font-medium text-white mb-3">
                Content *
              </label>
              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                placeholder="Write your blog post content here..."
                rows={12}
                className="block w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3 text-slate-200 placeholder-slate-500 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-y"
                required
              />
            </div>

            {/* Excerpt */}
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-6 shadow-xl">
              <label className="block text-lg font-medium text-white mb-3">
                Excerpt
              </label>
              <textarea
                name="excerpt"
                value={form.excerpt}
                onChange={handleChange}
                placeholder="Brief summary of your post (optional - will be auto-generated if left empty)"
                rows={3}
                className="block w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3 text-slate-200 placeholder-slate-500 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-y"
              />
            </div>

            {/* Category and Tags */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Category */}
              <div className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-6 shadow-xl">
                <label className="block text-lg font-medium text-white mb-3">
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3 text-slate-200 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value} className="bg-slate-800 text-slate-200">
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-6 shadow-xl">
                <label className="block text-lg font-medium text-white mb-3">
                  Tags
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleTagKeyPress}
                      placeholder="Add tags (press Enter or comma)"
                      className="flex-1 rounded-lg border border-slate-600 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                    >
                      Add
                    </button>
                  </div>
                  
                  {form.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {form.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 rounded-full bg-emerald-600/20 px-3 py-1 text-sm text-emerald-300"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-emerald-400 hover:text-emerald-200"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.push("/component/my-blogs")}
                className="rounded-lg border border-slate-600 bg-slate-800/50 px-6 py-3 text-sm font-medium text-slate-200 shadow-sm transition-colors hover:bg-slate-700"
              >
                Cancel
              </button>
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, 'draft')}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/50 px-6 py-3 text-sm font-medium text-slate-200 shadow-sm transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Save Draft
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, 'published')}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-600/30 transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Publishing...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      {form.status === 'published' ? 'Update' : 'Publish'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}