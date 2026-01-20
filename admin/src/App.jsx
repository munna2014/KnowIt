import { useEffect, useMemo, useState } from "react";

const DEFAULT_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost/KnowIt/backend/public/api";
const DHAKA_OFFSET_MINUTES = 6 * 60;

function useStoredState(key, initialValue) {
  const [value, setValue] = useState(() => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

function formatDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch (error) {
    return value;
  }
}

function formatWeekLabel(weekValue) {
  if (!weekValue) return "-";
  const year = Math.floor(Number(weekValue) / 100);
  const week = Number(weekValue) % 100;
  if (!year || !week) return `Week ${weekValue}`;
  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const dayOfWeek = simple.getUTCDay();
  const weekStart = new Date(simple);
  if (dayOfWeek <= 4) {
    weekStart.setUTCDate(simple.getUTCDate() - dayOfWeek + 1);
  } else {
    weekStart.setUTCDate(simple.getUTCDate() + 8 - dayOfWeek);
  }
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
  const startLabel = weekStart.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
  const endLabel = weekEnd.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
  return `${startLabel}–${endLabel}`;
}

function statusBadge(status) {
  const map = {
    review: "badge badge-review",
    scheduled: "badge badge-pending",
    published: "badge badge-published",
    draft: "badge badge-draft",
    archived: "badge badge-archived",
    pending: "badge badge-pending",
    spam: "badge badge-spam",
    hidden: "badge badge-hidden",
    rejected: "badge badge-hidden"
  };
  return map[status] || "badge badge-draft";
}

function toDhakaISOString(localValue) {
  if (!localValue) return "";
  const [datePart, timePart] = localValue.split("T");
  if (!datePart || !timePart) return "";
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const utcMs = Date.UTC(year, month - 1, day, hour, minute) - DHAKA_OFFSET_MINUTES * 60 * 1000;
  return new Date(utcMs).toISOString();
}

function formatDhakaInputValue(utcValue) {
  if (!utcValue) return "";
  const utcMs = new Date(utcValue).getTime();
  const dhakaMs = utcMs + DHAKA_OFFSET_MINUTES * 60 * 1000;
  const date = new Date(dhakaMs);
  const pad = (value) => String(value).padStart(2, "0");
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate())
  ].join("-") + "T" + [pad(date.getUTCHours()), pad(date.getUTCMinutes())].join(":");
}

export default function App() {
  const [apiBaseUrl] = useStoredState("admin_api_base", DEFAULT_API_BASE_URL);
  const [token, setToken] = useStoredState("admin_token", "");
  const [adminUser, setAdminUser] = useStoredState("admin_user", null);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [actionMessage, setActionMessage] = useState("");
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [scheduleAt, setScheduleAt] = useState("");
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState("");
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState("");
  const [commentStatusFilter, setCommentStatusFilter] = useState("pending");
  const [commentSearch, setCommentSearch] = useState("");
  const [selectedCommentIds, setSelectedCommentIds] = useState(new Set());
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboardStats, setDashboardStats] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState("");

  const apiHeaders = useMemo(() => {
    const headers = { Accept: "application/json" };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }, [token]);

  function buildUrl(path, params = {}) {
    const base = apiBaseUrl.replace(/\/+$/, "");
    const cleanPath = path.replace(/^\/+/, "");
    const url = new URL(`${base}/${cleanPath}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });
    return url.toString();
  }

  async function apiRequest(path, options = {}) {
    const { method = "GET", data, params } = options;
    const response = await fetch(buildUrl(path, params), {
      method,
      headers: {
        ...apiHeaders,
        ...(data ? { "Content-Type": "application/json" } : {})
      },
      body: data ? JSON.stringify(data) : undefined
    });

    const text = await response.text();
    const payload = text ? JSON.parse(text) : {};

    if (!response.ok) {
      const message = payload?.message || `HTTP ${response.status}`;
      throw new Error(message);
    }

    return payload;
  }

  async function handleLogin(event) {
    event.preventDefault();
    setLoginError("");

    try {
      const payload = await apiRequest("admin/login", {
        method: "POST",
        data: loginForm
      });
      setToken(payload.token || "");
      setAdminUser(payload.user || null);
      setLoginForm({ email: "", password: "" });
    } catch (err) {
      setLoginError(err.message || "Login failed.");
    }
  }

  function handleLogout() {
    setToken("");
    setAdminUser(null);
    setPosts([]);
  }

  async function loadPosts() {
    if (!token) return;
    setLoading(true);
    setError("");
    setActionMessage("");

    try {
      const payload = await apiRequest("admin/posts", {
        method: "GET",
        params: {
          status: statusFilter || undefined,
          search: search || undefined
        }
      });
      setPosts(payload.posts || []);
    } catch (err) {
      setError(err.message || "Could not load posts.");
    } finally {
      setLoading(false);
    }
  }

  async function loadAuditLogs() {
    if (!token) return;
    setAuditLoading(true);
    setAuditError("");
    try {
      const payload = await apiRequest("admin/audit-logs?limit=20", { method: "GET" });
      setAuditLogs(payload.logs || []);
    } catch (err) {
      setAuditError(err.message || "Could not load audit logs.");
    } finally {
      setAuditLoading(false);
    }
  }

  async function loadDashboard() {
    if (!token) return;
    setDashboardLoading(true);
    setDashboardError("");
    try {
      const payload = await apiRequest("admin/stats", { method: "GET" });
      setDashboardStats(payload);
    } catch (err) {
      setDashboardError(err.message || "Could not load dashboard stats.");
    } finally {
      setDashboardLoading(false);
    }
  }

  async function loadComments() {
    if (!token) return;
    setCommentsLoading(true);
    setCommentsError("");
    try {
      const payload = await apiRequest("admin/comments", {
        method: "GET",
        params: {
          status: commentStatusFilter || undefined,
          search: commentSearch || undefined,
          limit: 25
        }
      });
      setComments(payload.comments || []);
      setSelectedCommentIds(new Set());
    } catch (err) {
      setCommentsError(err.message || "Could not load comments.");
    } finally {
      setCommentsLoading(false);
    }
  }

  async function loadUsers() {
    if (!token) return;
    setUsersLoading(true);
    setUsersError("");
    try {
      const payload = await apiRequest("admin/users", {
        method: "GET",
        params: {
          search: userSearch || undefined,
          status: userStatusFilter || undefined,
          limit: 20
        }
      });
      setUsers(payload.users || []);
    } catch (err) {
      setUsersError(err.message || "Could not load users.");
    } finally {
      setUsersLoading(false);
    }
  }

  async function updateUser(id, data) {
    try {
      await apiRequest(`admin/users/${id}`, {
        method: "PUT",
        data
      });
      loadUsers();
    } catch (err) {
      setUsersError(err.message || "Could not update user.");
    }
  }

  async function banUser(id) {
    try {
      await apiRequest(`admin/users/${id}/ban`, { method: "POST" });
      loadUsers();
    } catch (err) {
      setUsersError(err.message || "Could not ban user.");
    }
  }

  async function unbanUser(id) {
    try {
      await apiRequest(`admin/users/${id}/unban`, { method: "POST" });
      loadUsers();
    } catch (err) {
      setUsersError(err.message || "Could not unban user.");
    }
  }

  async function deleteUser(id) {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      await apiRequest(`admin/users/${id}`, { method: "DELETE" });
      loadUsers();
    } catch (err) {
      setUsersError(err.message || "Could not delete user.");
    }
  }

  async function moderateComment(id, action) {
    if (!id) return;
    try {
      if (action === "delete") {
        await apiRequest(`admin/comments/${id}`, { method: "DELETE" });
      } else if (action === "approve") {
        await apiRequest(`admin/comments/${id}/approve`, { method: "POST" });
      } else if (action === "hide") {
        await apiRequest(`admin/comments/${id}/hide`, { method: "POST" });
      }
      setRefreshCounter((count) => count + 1);
      loadComments();
    } catch (err) {
      setCommentsError(err.message || "Could not update comment.");
    }
  }

  async function bulkModerate(action) {
    if (!selectedCommentIds.size) return;
    try {
      await apiRequest("admin/comments/bulk", {
        method: "POST",
        data: {
          action,
          ids: Array.from(selectedCommentIds)
        }
      });
      setRefreshCounter((count) => count + 1);
      loadComments();
    } catch (err) {
      setCommentsError(err.message || "Bulk action failed.");
    }
  }

  function toggleCommentSelection(id) {
    setSelectedCommentIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleAllComments() {
    if (!comments.length) return;
    setSelectedCommentIds((current) => {
      if (current.size === comments.length) {
        return new Set();
      }
      return new Set(comments.map((comment) => comment.id));
    });
  }

  async function approvePost(postId) {
    setActionMessage("");
    try {
      await apiRequest(`admin/posts/${postId}/approve`, { method: "POST" });
      setActionMessage("Post approved.");
      setRefreshCounter((count) => count + 1);
    } catch (err) {
      setError(err.message || "Could not approve post.");
    }
  }

  async function schedulePost(postId) {
    if (!postId || !scheduleAt) return;
    try {
      await apiRequest(`admin/posts/${postId}`, {
        method: "PUT",
        data: {
          status: "scheduled",
          scheduled_at: toDhakaISOString(scheduleAt)
        }
      });
      setActionMessage("Post scheduled.");
      setRefreshCounter((count) => count + 1);
      loadPostDetails(postId);
    } catch (err) {
      setDetailsError(err.message || "Could not schedule post.");
    }
  }

  function openPostDetails(post) {
    const nextId = post?.id;
    if (!nextId) return;
    setSelectedPostId(nextId);
    window.history.pushState({}, "", `?post=${nextId}`);
  }

  function closePostDetails() {
    setSelectedPostId(null);
    setSelectedPost(null);
    setDetailsError("");
    window.history.pushState({}, "", window.location.pathname);
  }

  async function loadPostDetails(postId) {
    if (!postId) return;
    setDetailsLoading(true);
    setDetailsError("");
    try {
      const payload = await apiRequest(`admin/posts/${postId}`, { method: "GET" });
      setSelectedPost(payload.post || null);
      if (payload.post?.scheduled_at) {
        setScheduleAt(formatDhakaInputValue(payload.post.scheduled_at));
      } else {
        setScheduleAt("");
      }
    } catch (err) {
      setDetailsError(err.message || "Could not load post details.");
    } finally {
      setDetailsLoading(false);
    }
  }

  async function rejectPost(postId, reason) {
    setActionMessage("");
    if (!reason) {
      setError("Rejection requires a reason.");
      return;
    }
    try {
      await apiRequest(`admin/posts/${postId}/reject`, {
        method: "POST",
        data: { rejection_reason: reason }
      });
      setActionMessage("Post rejected and archived.");
      setRefreshCounter((count) => count + 1);
    } catch (err) {
      setError(err.message || "Could not reject post.");
    }
  }

  useEffect(() => {
    if (token) {
      loadPosts();
    }
  }, [token, statusFilter, refreshCounter]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const postParam = params.get("post");
    if (postParam) {
      setSelectedPostId(Number(postParam));
    }
  }, []);

  useEffect(() => {
    if (!token || !selectedPostId) return;
    loadPostDetails(selectedPostId);
  }, [token, selectedPostId]);

  useEffect(() => {
    if (!token) return;
    loadAuditLogs();
  }, [token, refreshCounter]);

  useEffect(() => {
    if (!token) return;
    loadComments();
  }, [token, commentStatusFilter]);

  useEffect(() => {
    if (!token) return;
    loadDashboard();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    loadUsers();
  }, [token, userStatusFilter]);

  return (
    <div className="page">
      <header className="header">
        <div>
          <div className="title">KnowIt Admin</div>
          <div className="subtitle">Moderate content and keep the feed clean.</div>
        </div>
        <div className="actions">
          {adminUser ? (
            <>
              <span className="token-chip">{adminUser.email}</span>
              <button className="btn btn-outline" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <span className="token-chip">Not authenticated</span>
          )}
        </div>
      </header>

      {!token && (
        <section className="login-shell">
          <div className="login-card">
            <div className="login-intro">
              <div className="login-label">Admin Access</div>
              <h2>KnowIt Moderation Console</h2>
              <p>
                Review new submissions, approve clean content, and archive anything that needs a
                second look.
              </p>
              <div className="login-meta">
                <span>Secure access only</span>
                <span>Powered by KnowIt</span>
              </div>
            </div>
            <form onSubmit={handleLogin} className="login-form">
              <div className="login-form-header">
                <div className="panel-title">Sign in</div>
                <div className="subtitle">Use your admin credentials to continue.</div>
              </div>
              <label>
                Email
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="admin@knowit.com"
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                  placeholder="Your password"
                  required
                />
              </label>
              <div className="actions login-actions">
                <button className="btn btn-primary" type="submit">
                  Log in
                </button>
              </div>
              {loginError && <div className="error">{loginError}</div>}
            </form>
          </div>
        </section>
      )}

      {token && selectedPostId && (
        <section className="panel details-panel">
          <div className="panel-header">
            <div className="panel-title">Post Details</div>
            <div className="actions">
              <button className="btn btn-outline" onClick={closePostDetails}>
                Back to Moderation
              </button>
              {selectedPost?.status === "review" && (
                <>
                  <button className="btn btn-primary" onClick={() => approvePost(selectedPost.id)}>
                    Approve
                  </button>
                  <button className="btn btn-warning" onClick={() => setSelectedPost((prev) => ({
                    ...prev,
                    showReject: !prev?.showReject
                  }))}>
                    {selectedPost?.showReject ? "Cancel" : "Reject"}
                  </button>
                </>
              )}
            </div>
          </div>

          {detailsLoading && <div className="subtitle">Loading post details...</div>}
          {detailsError && <div className="error">{detailsError}</div>}

          {selectedPost && (
            <div className="details-grid">
              <div>
                <div className="details-meta">
                  <span className={statusBadge(selectedPost.status)}>{selectedPost.status}</span>
                  {selectedPost.user?.name && <span className="token-chip">{selectedPost.user.name}</span>}
                </div>
                <h2 className="details-title">{selectedPost.title}</h2>
                <div className="post-meta">
                  Created: {formatDate(selectedPost.created_at)} - Published:{" "}
                  {formatDate(selectedPost.published_at)}
                </div>
                {selectedPost.excerpt && (
                  <p className="details-excerpt">{selectedPost.excerpt}</p>
                )}
                <div className="details-content">{selectedPost.content}</div>
              </div>
              <div className="details-side">
                <div className="details-card">
                  <div className="panel-title">Post Info</div>
                  <div className="details-row">
                    <span>Category</span>
                    <span>{selectedPost.category || "-"}</span>
                  </div>
                  <div className="details-row">
                    <span>Scheduled</span>
                    <span>{formatDate(selectedPost.scheduled_at)}</span>
                  </div>
                  <div className="details-row">
                    <span>Views</span>
                    <span>{selectedPost.views_count || 0}</span>
                  </div>
                  <div className="details-row">
                    <span>Comments</span>
                    <span>{selectedPost.comments_count || 0}</span>
                  </div>
                  <div className="details-row">
                    <span>Likes</span>
                    <span>{selectedPost.likes_count || 0}</span>
                  </div>
                </div>
                {["review", "draft"].includes(selectedPost?.status) && (
                  <div className="details-card">
                    <div className="panel-title">Schedule Publish</div>
                    <label>
                      Publish at
                      <input
                        type="datetime-local"
                        value={scheduleAt}
                        onChange={(event) => setScheduleAt(event.target.value)}
                      />
                    </label>
                    <div className="actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => schedulePost(selectedPost.id)}
                        disabled={!scheduleAt}
                      >
                        Schedule
                      </button>
                    </div>
                  </div>
                )}
                {selectedPost?.status === "review" && selectedPost?.showReject && (
                  <div className="details-card">
                    <div className="panel-title">Rejection Reason</div>
                    <textarea
                      value={selectedPost.rejection_reason || ""}
                      onChange={(event) =>
                        setSelectedPost((prev) => ({
                          ...prev,
                          rejection_reason: event.target.value
                        }))
                      }
                    />
                    <div className="actions">
                      <button
                        className="btn btn-danger"
                        onClick={() => rejectPost(selectedPost.id, selectedPost.rejection_reason)}
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                )}
                {selectedPost?.status === "archived" && selectedPost?.rejection_reason && (
                  <div className="details-card">
                    <div className="panel-title">Rejection Reason</div>
                    <div className="details-excerpt">{selectedPost.rejection_reason}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {token && !selectedPostId && (
        <div className="panel admin-tabs">
          <div className="tab-row">
            {[
              { id: "dashboard", label: "Dashboard" },
              { id: "posts", label: "Posts" },
              { id: "comments", label: "Comments" },
              { id: "users", label: "Users" },
              { id: "audit", label: "Audit Logs" }
            ].map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? "tab-btn-active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {token && !selectedPostId && activeTab === "dashboard" && (
        <section className="panel">
          <div className="panel-header">
            <div className="panel-title">Dashboard</div>
            <div className="actions">
              <button className="btn btn-outline" onClick={loadDashboard}>
                Refresh Stats
              </button>
            </div>
          </div>
          <div className="subtitle">
            Posts per day/week, top authors, and comment activity.
          </div>
          {dashboardLoading && <div className="subtitle">Loading stats...</div>}
          {dashboardError && <div className="error">{dashboardError}</div>}
          {dashboardStats && (
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <div className="panel-title">Totals</div>
                <div className="stat-row">
                  <span>Posts</span>
                  <strong>{dashboardStats.totalPosts ?? 0}</strong>
                </div>
                <div className="stat-row">
                  <span>Users</span>
                  <strong>{dashboardStats.totalUsers ?? 0}</strong>
                </div>
                <div className="stat-row">
                  <span>Comments</span>
                  <strong>{dashboardStats.totalComments ?? 0}</strong>
                </div>
                <div className="stat-row">
                  <span>Likes</span>
                  <strong>{dashboardStats.totalLikes ?? 0}</strong>
                </div>
              </div>
              <div className="dashboard-card">
                <div className="panel-title">Posts per Day</div>
                <div className="dashboard-list">
                  {(dashboardStats.postsPerDay || []).map((item) => (
                    <div key={item.date} className="stat-row">
                      <span>{item.date}</span>
                      <strong>{item.count}</strong>
                    </div>
                  ))}
                </div>
              </div>
              <div className="dashboard-card">
                <div className="panel-title">Posts per Week</div>
                <div className="dashboard-list">
                  {(dashboardStats.postsPerWeek || []).map((item) => (
                    <div key={item.week} className="stat-row">
                      <span>{formatWeekLabel(item.week)}</span>
                      <strong>{item.count}</strong>
                    </div>
                  ))}
                </div>
              </div>
              <div className="dashboard-card">
                <div className="panel-title">Top Authors</div>
                <div className="dashboard-list">
                  {(dashboardStats.topAuthors || []).map((author) => (
                    <div key={author.id} className="stat-row">
                      <span>{author.name || author.email}</span>
                      <strong>{author.posts_count ?? 0}</strong>
                    </div>
                  ))}
                </div>
              </div>
              <div className="dashboard-card">
                <div className="panel-title">Comment Activity</div>
                <div className="dashboard-list">
                  {(dashboardStats.commentActivity || []).map((item) => (
                    <div key={item.date} className="stat-row">
                      <span>{item.date}</span>
                      <strong>{item.count}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {token && !selectedPostId && activeTab === "posts" && (
        <section className="panel">
          <div className="panel-header">
            <div className="panel-title">Posts</div>
            <div className="actions">
              <label>
                Status
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  <option value="">All</option>
                  <option value="review">Review</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
              <label>
                Search
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search posts..."
                />
              </label>
              <button className="btn btn-outline" onClick={loadPosts}>
                Apply Filters
              </button>
            </div>
          </div>
          <div className="subtitle">
            Admins can approve or reject posts. Rejection requires a reason.
          </div>

          {loading && <div className="subtitle">Loading posts...</div>}
          {error && <div className="error">{error}</div>}
          {actionMessage && <div className="success">{actionMessage}</div>}

          <div className="posts">
            {posts.length === 0 && !loading && (
              <div className="post-card">
                <div className="post-title">No posts found</div>
                <div className="post-meta">Try changing filters or search.</div>
              </div>
            )}
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onApprove={approvePost}
                onReject={rejectPost}
                onViewDetails={openPostDetails}
              />
            ))}
          </div>
        </section>
      )}

      {token && !selectedPostId && activeTab === "comments" && (
        <section className="panel">
          <div className="panel-header">
            <div className="panel-title">Comment Moderation</div>
            <div className="actions">
              <label>
                Status
                <select
                  value={commentStatusFilter}
                  onChange={(event) => setCommentStatusFilter(event.target.value)}
                >
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="hidden">Hidden</option>
                  <option value="rejected">Rejected</option>
                  <option value="spam">Spam</option>
                </select>
              </label>
              <label>
                Search
                <input
                  value={commentSearch}
                  onChange={(event) => setCommentSearch(event.target.value)}
                  placeholder="Search comments..."
                />
              </label>
              <button className="btn btn-outline" onClick={loadComments}>
                Apply Filters
              </button>
            </div>
          </div>

          <div className="actions moderation-actions">
            <button className="btn btn-primary" onClick={() => bulkModerate("approve")}>
              Approve Selected
            </button>
            <button className="btn btn-warning" onClick={() => bulkModerate("hide")}>
              Hide Selected
            </button>
            <button className="btn btn-danger" onClick={() => bulkModerate("delete")}>
              Delete Selected
            </button>
          </div>

          {commentsLoading && <div className="subtitle">Loading comments...</div>}
          {commentsError && <div className="error">{commentsError}</div>}
          {!commentsLoading && comments.length === 0 && (
            <div className="subtitle">No comments found.</div>
          )}

          {comments.length > 0 && (
            <div className="comment-table">
              <div className="comment-row comment-header">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedCommentIds.size === comments.length}
                    onChange={toggleAllComments}
                  />
                  <span>All</span>
                </label>
                <span>Status</span>
                <span>Comment</span>
                <span>User</span>
                <span>Post</span>
                <span>Actions</span>
              </div>
              {comments.map((comment) => (
                <div key={comment.id} className="comment-row">
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedCommentIds.has(comment.id)}
                      onChange={() => toggleCommentSelection(comment.id)}
                    />
                  </label>
                  <span className={statusBadge(comment.status)}>{comment.status}</span>
                  <span className="comment-body">{comment.body}</span>
                  <span>{comment.user?.email || "Unknown"}</span>
                  <span>{comment.post?.title || "-"}</span>
                  <div className="comment-actions">
                    <button className="btn btn-outline" onClick={() => moderateComment(comment.id, "approve")}>
                      Approve
                    </button>
                    <button className="btn btn-warning" onClick={() => moderateComment(comment.id, "hide")}>
                      Hide
                    </button>
                    <button className="btn btn-danger" onClick={() => moderateComment(comment.id, "delete")}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {token && !selectedPostId && activeTab === "users" && (
        <section className="panel">
          <div className="panel-header">
            <div className="panel-title">User Management</div>
            <div className="actions">
              <label>
                Status
                <select
                  value={userStatusFilter}
                  onChange={(event) => setUserStatusFilter(event.target.value)}
                >
                  <option value="">All</option>
                  <option value="active">Active</option>
                  <option value="banned">Banned</option>
                  <option value="pending">Pending</option>
                </select>
              </label>
              <label>
                Search
                <input
                  value={userSearch}
                  onChange={(event) => setUserSearch(event.target.value)}
                  placeholder="Search users..."
                />
              </label>
              <button className="btn btn-outline" onClick={loadUsers}>
                Apply Filters
              </button>
            </div>
          </div>

          {usersLoading && <div className="subtitle">Loading users...</div>}
          {usersError && <div className="error">{usersError}</div>}
          {!usersLoading && users.length === 0 && (
            <div className="subtitle">No users found.</div>
          )}

          {users.length > 0 && (
            <div className="user-table">
              <div className="user-row user-header">
                <span>User</span>
                <span>Email</span>
                <span>Role</span>
                <span>Status</span>
                <span>Posts</span>
                <span>Actions</span>
              </div>
              {users.map((user) => (
                <div key={user.id} className="user-row">
                  <span>{user.name || "Unnamed"}</span>
                  <span>{user.email}</span>
                  <span>
                    <select
                      value={user.role || "user"}
                      onChange={(event) =>
                        updateUser(user.id, { role: event.target.value })
                      }
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </span>
                  <span>
                    <select
                      value={user.status || "active"}
                      onChange={(event) =>
                        updateUser(user.id, { status: event.target.value })
                      }
                    >
                      <option value="active">Active</option>
                      <option value="banned">Banned</option>
                      <option value="pending">Pending</option>
                    </select>
                  </span>
                  <span>{user.posts_count ?? 0}</span>
                  <div className="user-actions">
                    {user.status === "banned" ? (
                      <button className="btn btn-outline" onClick={() => unbanUser(user.id)}>
                        Unban
                      </button>
                    ) : (
                      <button className="btn btn-warning" onClick={() => banUser(user.id)}>
                        Ban
                      </button>
                    )}
                    <button className="btn btn-danger" onClick={() => deleteUser(user.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {token && !selectedPostId && activeTab === "audit" && (
        <section className="panel">
          <div className="panel-header">
            <div className="panel-title">Admin Activity & Audit Logs</div>
            <div className="actions">
              <button className="btn btn-outline" onClick={loadAuditLogs}>
                Refresh Logs
              </button>
            </div>
          </div>
          {auditLoading && <div className="subtitle">Loading audit logs...</div>}
          {auditError && <div className="error">{auditError}</div>}
          {!auditLoading && auditLogs.length === 0 && (
            <div className="subtitle">No admin actions logged yet.</div>
          )}
          {auditLogs.length > 0 && (
            <div className="audit-table">
              <div className="audit-row audit-header">
                <span>When</span>
                <span>Admin</span>
                <span>Action</span>
                <span>Target</span>
                <span>Post Title</span>
              </div>
              {auditLogs.map((log) => (
                <div key={log.id} className="audit-row">
                  <span>{formatDate(log.created_at)}</span>
                  <span>{log.admin?.email || "Unknown"}</span>
                  <span>{log.action}</span>
                  <span>
                    {log.target_type?.split("\\").pop()} #{log.target_id ?? "-"}
                  </span>
                  <span className="audit-meta">{log.target_title || "-"}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function PostCard({ post, onApprove, onReject, onViewDetails }) {
  const [reason, setReason] = useState("");
  const [showReject, setShowReject] = useState(false);

  return (
    <article className="post-card">
      {post.featured_image_url && (
        <div className="post-image">
          <img
            src={post.featured_image_url}
            alt={post.title || "Post image"}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}
      <div className="actions">
        <span className={statusBadge(post.status)}>{post.status}</span>
        {post.user?.name && <span className="token-chip">{post.user.name}</span>}
      </div>
      <h3 className="post-title">{post.title}</h3>
      <div className="post-meta">
        Created: {formatDate(post.created_at)} - Published: {formatDate(post.published_at)}
      </div>
      {post.excerpt && <div className="post-excerpt">{post.excerpt}</div>}
      {post.status === "archived" && post.rejection_reason && (
        <div className="post-excerpt">Rejection reason: {post.rejection_reason}</div>
      )}
      <div className="post-footer">
        <div className="actions">
          <button className="btn btn-outline" onClick={() => onViewDetails(post)}>
            View Details
          </button>
          {post.status === "review" && (
            <>
              <button className="btn btn-primary" onClick={() => onApprove(post.id)}>
                Approve
              </button>
              <button className="btn btn-warning" onClick={() => setShowReject((value) => !value)}>
                {showReject ? "Cancel" : "Reject"}
              </button>
            </>
          )}
        </div>
        {post.status === "review" && showReject && (
          <>
            <label>
              Rejection reason
              <textarea value={reason} onChange={(event) => setReason(event.target.value)} />
            </label>
            <div className="actions">
              <button className="btn btn-danger" onClick={() => onReject(post.id, reason)}>
                Confirm Rejection
              </button>
            </div>
          </>
        )}
      </div>
    </article>
  );
}
