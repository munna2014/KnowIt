"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../Navbar";
import { apiRequest, getAuthToken, getAuthUser } from "../../../lib/api";

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
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentBody, setCommentBody] = useState("");
  const [commentError, setCommentError] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyBody, setReplyBody] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingBody, setEditingBody] = useState("");
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      if (!params.slug) return;

      try {
        setIsLoading(true);
        setError("");
        
        const data = await apiRequest(`blog-posts/${params.slug}`);
        setPost(data.post);
        await loadComments(params.slug);
        await loadLikeStatus(params.slug);

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

  const loadComments = async (slug) => {
    try {
      setCommentsLoading(true);
      setCommentError("");
      const data = await apiRequest(`blog-posts/${slug}/comments`);
      setComments(data.comments || []);
    } catch (err) {
      console.error("Error loading comments:", err);
      setCommentError("Could not load comments.");
    } finally {
      setCommentsLoading(false);
    }
  };

  const loadLikeStatus = async (slug) => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const data = await apiRequest(`blog-posts/${slug}/like-status`);
      setLiked(Boolean(data?.liked));
      setPost((current) =>
        current ? { ...current, post_likes_count: data?.likes_count ?? current.post_likes_count } : current
      );
    } catch (err) {
      console.error("Error loading like status:", err);
    }
  };

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

  const formatCommentDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const updateCommentInState = (commentId, newBody) => {
    setComments((current) =>
      current.map((comment) => {
        if (comment.id === commentId) {
          return { ...comment, body: newBody };
        }
        if (comment.replies?.length) {
          const updatedReplies = comment.replies.map((reply) =>
            reply.id === commentId ? { ...reply, body: newBody } : reply
          );
          return { ...comment, replies: updatedReplies };
        }
        return comment;
      })
    );
  };

  const adjustCommentCount = (delta) => {
    setPost((current) =>
      current
        ? { ...current, comments_count: Math.max(0, (current.comments_count || 0) + delta) }
        : current
    );
  };

  const removeCommentFromState = (commentId) => {
    setComments((current) =>
      current
        .filter((comment) => comment.id !== commentId)
        .map((comment) => {
          if (!comment.replies?.length) return comment;
          return {
            ...comment,
            replies: comment.replies.filter((reply) => reply.id !== commentId),
          };
        })
    );
  };

  const getDeleteDelta = (commentId) => {
    const parentMatch = comments.find((comment) => comment.id === commentId);
    if (parentMatch) {
      return 1 + (parentMatch.replies?.length || 0);
    }
    for (const comment of comments) {
      const replyMatch = comment.replies?.find((reply) => reply.id === commentId);
      if (replyMatch) {
        return 1;
      }
    }
    return 1;
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    const trimmed = commentBody.trim();
    if (!trimmed || isSubmittingComment) return;

    const token = getAuthToken();
    if (!token) {
      setCommentError("Please log in to comment.");
      router.push("/component/login");
      return;
    }

    try {
      setIsSubmittingComment(true);
      setCommentError("");
      const data = await apiRequest(`blog-posts/${params.slug}/comments`, {
        method: "POST",
        data: { body: trimmed },
      });
      if (data?.comment) {
        setComments((current) => [...current, data.comment]);
        setCommentBody("");
        setShowCommentForm(false);
        adjustCommentCount(1);
      }
    } catch (err) {
      console.error("Error submitting comment:", err);
      if (err?.status === 401) {
        setCommentError("Please log in to comment.");
      } else if (err?.status === 422) {
        setCommentError("Comment is required and must be under 1000 characters.");
      } else {
        setCommentError("Could not submit comment. Please try again.");
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleReplySubmit = async (event) => {
    event.preventDefault();
    const trimmed = replyBody.trim();
    if (!trimmed || isSubmittingComment || !replyingTo) return;

    const token = getAuthToken();
    if (!token) {
      setCommentError("Please log in to reply.");
      router.push("/component/login");
      return;
    }

    try {
      setIsSubmittingComment(true);
      setCommentError("");
      const data = await apiRequest(`blog-posts/${params.slug}/comments`, {
        method: "POST",
        data: { body: trimmed, parent_id: replyingTo },
      });
      if (data?.comment) {
        setComments((current) =>
          current.map((comment) =>
            comment.id === replyingTo
              ? { ...comment, replies: [...(comment.replies || []), data.comment] }
              : comment
          )
        );
        setReplyBody("");
        setReplyingTo(null);
        adjustCommentCount(1);
      }
    } catch (err) {
      console.error("Error submitting reply:", err);
      if (err?.status === 401) {
        setCommentError("Please log in to reply.");
      } else if (err?.status === 403) {
        setCommentError("Only the author can reply.");
      } else if (err?.status === 422) {
        setCommentError("Reply is required and must be under 1000 characters.");
      } else {
        setCommentError("Could not submit reply. Please try again.");
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    const trimmed = editingBody.trim();
    if (!trimmed || isSubmittingComment || !editingCommentId) return;

    try {
      setIsSubmittingComment(true);
      setCommentError("");
      const data = await apiRequest(`comments/${editingCommentId}`, {
        method: "PUT",
        data: { body: trimmed },
      });
      if (data?.comment) {
        updateCommentInState(editingCommentId, data.comment.body);
        setEditingCommentId(null);
        setEditingBody("");
      }
    } catch (err) {
      console.error("Error updating comment:", err);
      if (err?.status === 401) {
        setCommentError("Please log in to edit your comment.");
      } else if (err?.status === 403) {
        setCommentError("You can only edit your own comments.");
      } else if (err?.status === 422) {
        setCommentError("Comment is required and must be under 1000 characters.");
      } else {
        setCommentError("Could not update comment. Please try again.");
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      setIsSubmittingComment(true);
      setCommentError("");
      const delta = getDeleteDelta(commentId);
      await apiRequest(`comments/${commentId}`, { method: "DELETE" });
      removeCommentFromState(commentId);
      if (editingCommentId === commentId) {
        setEditingCommentId(null);
        setEditingBody("");
      }
      adjustCommentCount(-delta);
    } catch (err) {
      console.error("Error deleting comment:", err);
      if (err?.status === 401) {
        setCommentError("Please log in to delete your comment.");
      } else if (err?.status === 403) {
        setCommentError("You can only delete your own comments.");
      } else {
        setCommentError("Could not delete comment. Please try again.");
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleLikeToggle = async () => {
    if (isLiking) return;
    const token = getAuthToken();
    if (!token) {
      router.push("/component/login");
      return;
    }
    try {
      setIsLiking(true);
      const data = await apiRequest(`blog-posts/${params.slug}/like`, { method: "POST" });
      setLiked(Boolean(data?.liked));
      setPost((current) =>
        current ? { ...current, post_likes_count: data?.likes_count ?? current.post_likes_count } : current
      );
    } catch (err) {
      console.error("Error toggling like:", err);
    } finally {
      setIsLiking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-16">
          <div className="mx-auto max-w-4xl px-8 py-12">
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
          <div className="mx-auto max-w-4xl px-12 py-12">
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
          <div className="px-6 py-6">
            <div className="relative mx-auto h-96 max-w-6xl overflow-hidden rounded-3xl md:h-[600px]">
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="h-full w-full object-cover object-center"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              
              {/* Title Overlay */}
              <div className="absolute  inset-0 flex items-end">
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
          </div>
        )}

        {/* Article Content */}
        <div className="mx-auto max-w-6xl px-5 py-10">
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
              <p className="text-gray-600 mb-2">
                {formatDate(post.published_at || post.created_at)}
              </p>
              <button
                type="button"
                onClick={handleLikeToggle}
                disabled={isLiking}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-base font-semibold transition ${
                  liked
                    ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                    : "border-gray-200 text-gray-500 hover:border-emerald-200 hover:text-emerald-600"
                }`}
              >
                <svg
                  className="h-5 w-5"
                  fill={liked ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                {post.post_likes_count || 0} likes
              </button>
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

            {/* Comments */}
          <div id="comments" className="mt-16 border-t border-gray-200 pt-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Comments ({post.comments_count || comments.length})
              </h2>
              <button
                type="button"
                onClick={() => setShowCommentForm((current) => !current)}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-100"
                aria-expanded={showCommentForm}
                aria-controls="comment-form"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h8m-8 4h5m-1 6l-4-4H6a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                {showCommentForm ? "Hide" : "Comment"}
              </button>
            </div>

            {showCommentForm && (
              <form
                id="comment-form"
                onSubmit={handleCommentSubmit}
                className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <label className="mb-3 block text-sm font-semibold text-gray-700">
                  Share your thoughts
                </label>
                <textarea
                  value={commentBody}
                  onChange={(event) => setCommentBody(event.target.value)}
                  rows={4}
                  placeholder="Write a comment..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                {commentError && (
                  <p className="mt-3 text-sm text-red-600">{commentError}</p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    {commentBody.trim().length}/1000
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCommentForm(false);
                        setCommentBody("");
                      }}
                      className="text-sm font-semibold text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingComment || !commentBody.trim()}
                      className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmittingComment ? "Posting..." : "Post Comment"}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {commentsLoading ? (
              <div className="py-6 text-gray-500">Loading comments...</div>
            ) : comments.length > 0 ? (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 overflow-hidden rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold">
                          {comment.user?.avatar_url ? (
                            <img
                              src={resolveAvatarUrl(comment.user.avatar_url)}
                              alt={comment.user.name || "User"}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.parentElement.innerHTML = getUserInitials(comment.user);
                              }}
                            />
                          ) : (
                            getUserInitials(comment.user)
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {comment.user?.name || `${comment.user?.first_name || ''} ${comment.user?.last_name || ''}`.trim() || "Anonymous"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatCommentDate(comment.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                    {editingCommentId === comment.id ? (
                      <form onSubmit={handleEditSubmit} className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <textarea
                          value={editingBody}
                          onChange={(event) => setEditingBody(event.target.value)}
                          rows={3}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            {editingBody.trim().length}/1000
                          </p>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCommentId(null);
                                setEditingBody("");
                              }}
                              className="text-xs font-semibold text-gray-500 hover:text-gray-700"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isSubmittingComment || !editingBody.trim()}
                              className="rounded-md bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isSubmittingComment ? "Saving..." : "Save"}
                            </button>
                          </div>
                        </div>
                      </form>
                    ) : (
                      <p className="mt-4 text-gray-700 leading-relaxed">
                        {comment.body}
                      </p>
                    )}
                    {comment.user_id === getAuthUser()?.id && (
                      <div className="mt-4 flex items-center gap-4 text-sm">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCommentId(comment.id);
                            setEditingBody(comment.body);
                          }}
                          className="font-semibold text-slate-600 hover:text-slate-800"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="font-semibold text-red-500 hover:text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                    {post?.user_id === getAuthUser()?.id && (
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingTo(comment.id);
                          setReplyBody("");
                        }}
                        className="mt-4 inline-flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                      >
                        Reply
                      </button>
                    )}
                    {replyingTo === comment.id && (
                      <form onSubmit={handleReplySubmit} className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <textarea
                          value={replyBody}
                          onChange={(event) => setReplyBody(event.target.value)}
                          rows={3}
                          placeholder="Write a reply..."
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            {replyBody.trim().length}/1000
                          </p>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyBody("");
                              }}
                              className="text-xs font-semibold text-gray-500 hover:text-gray-700"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isSubmittingComment || !replyBody.trim()}
                              className="rounded-md bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isSubmittingComment ? "Posting..." : "Post Reply"}
                            </button>
                          </div>
                        </div>
                      </form>
                    )}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-6 space-y-4 border-l-2 border-emerald-100 pl-6">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-4">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 overflow-hidden rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-semibold">
                                {reply.user?.avatar_url ? (
                                  <img
                                    src={resolveAvatarUrl(reply.user.avatar_url)}
                                    alt={reply.user.name || "User"}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                      e.target.parentElement.innerHTML = getUserInitials(reply.user);
                                    }}
                                  />
                                ) : (
                                  getUserInitials(reply.user)
                                )}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-900">
                                  {reply.user?.name || `${reply.user?.first_name || ''} ${reply.user?.last_name || ''}`.trim() || "Anonymous"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatCommentDate(reply.created_at)}
                                </p>
                              </div>
                            </div>
                            {editingCommentId === reply.id ? (
                              <form onSubmit={handleEditSubmit} className="mt-3 rounded-md border border-gray-200 bg-white p-3">
                                <textarea
                                  value={editingBody}
                                  onChange={(event) => setEditingBody(event.target.value)}
                                  rows={3}
                                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                />
                                <div className="mt-2 flex items-center justify-between">
                                  <p className="text-xs text-gray-500">
                                    {editingBody.trim().length}/1000
                                  </p>
                                  <div className="flex items-center gap-3">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingCommentId(null);
                                        setEditingBody("");
                                      }}
                                      className="text-xs font-semibold text-gray-500 hover:text-gray-700"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="submit"
                                      disabled={isSubmittingComment || !editingBody.trim()}
                                      className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      {isSubmittingComment ? "Saving..." : "Save"}
                                    </button>
                                  </div>
                                </div>
                              </form>
                            ) : (
                              <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                                {reply.body}
                              </p>
                            )}
                            {reply.user_id === getAuthUser()?.id && (
                              <div className="mt-3 flex items-center gap-3 text-xs">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingCommentId(reply.id);
                                    setEditingBody(reply.body);
                                  }}
                                  className="font-semibold text-slate-600 hover:text-slate-800"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteComment(reply.id)}
                                  className="font-semibold text-red-500 hover:text-red-600"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
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
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h6m-6 4h4m-5 4l-4-4H6a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            {relatedPost.comments_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {relatedPost.post_likes_count || 0}
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
