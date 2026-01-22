import React, { useState, useEffect } from 'react';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    reason: '',
    search: ''
  });
  const [stats, setStats] = useState(null);

  const reasons = [
    { value: 'spam', label: 'Spam' },
    { value: 'harassment', label: 'Harassment' },
    { value: 'hate_speech', label: 'Hate Speech' },
    { value: 'inappropriate_content', label: 'Inappropriate Content' },
    { value: 'copyright_violation', label: 'Copyright Violation' },
    { value: 'misinformation', label: 'Misinformation' },
    { value: 'violence', label: 'Violence' },
    { value: 'other', label: 'Other' }
  ];

  const statuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'reviewed', label: 'Reviewed' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'dismissed', label: 'Dismissed' }
  ];

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

  useEffect(() => {
    loadReports();
    loadStats();
  }, [filters]);

  const getAdminToken = () => {
    const stored = localStorage.getItem('admin_token');
    if (!stored) return '';
    try {
      return JSON.parse(stored) || '';
    } catch (err) {
      return stored;
    }
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      const token = getAdminToken();
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.reason) params.append('reason', filters.reason);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`${API_BASE_URL}/admin/reports?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to load reports');
      
      const data = await response.json();
      setReports(data.reports || []);
    } catch (err) {
      setError('Failed to load reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = getAdminToken();
      const response = await fetch(`${API_BASE_URL}/admin/reports/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const takeAction = async (reportId, action, adminNotes = '') => {
    try {
      const token = getAdminToken();
      const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}/action`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action,
          admin_notes: adminNotes
        })
      });

      if (!response.ok) throw new Error('Failed to take action');
      
      const data = await response.json();
      alert(data.message);
      loadReports();
      loadStats();
    } catch (err) {
      alert('Failed to take action: ' + err.message);
    }
  };

  const handleActionClick = (report, action) => {
    let adminNotes = '';
    
    if (action !== 'dismiss') {
      adminNotes = prompt(`Add notes for this ${action} action (optional):`);
      if (adminNotes === null) return; // User cancelled
    }

    const confirmMessage = {
      dismiss: 'Are you sure you want to dismiss this report?',
      warning: 'Are you sure you want to issue a warning to this user?',
      delete_post: 'Are you sure you want to delete this post?',
      ban_user: 'Are you sure you want to ban this user?'
    };

    if (confirm(confirmMessage[action])) {
      takeAction(report.id, action, adminNotes);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const classes = {
      pending: 'badge badge-pending',
      reviewed: 'badge badge-review',
      resolved: 'badge badge-resolved',
      dismissed: 'badge badge-dismissed'
    };
    
    return (
      <span className={classes[status] || classes.pending}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getReasonBadge = (reason) => {
    const classes = {
      spam: 'tag tag-danger',
      harassment: 'tag tag-purple',
      hate_speech: 'tag tag-danger',
      inappropriate_content: 'tag tag-warning',
      copyright_violation: 'tag tag-info',
      misinformation: 'tag tag-warning',
      violence: 'tag tag-danger',
      other: 'tag tag-muted'
    };

    const labels = {
      spam: 'Spam',
      harassment: 'Harassment',
      hate_speech: 'Hate Speech',
      inappropriate_content: 'Inappropriate Content',
      copyright_violation: 'Copyright Violation',
      misinformation: 'Misinformation',
      violence: 'Violence',
      other: 'Other'
    };
    
    return (
      <span className={classes[reason] || classes.other}>
        {labels[reason] || reason}
      </span>
    );
  };

  if (loading) {
    return (
      <section className="panel">
        <div className="panel-header">
          <div className="panel-title">Report Management</div>
        </div>
        <div className="subtitle">Loading reports...</div>
      </section>
    );
  }

  return (
    <section className="panel reports-panel">
      <div className="panel-header">
        <div>
          <div className="panel-title">Report Management</div>
          <div className="subtitle">Review and take action on user reports</div>
        </div>
      </div>

      {stats && (
        <div className="dashboard-grid reports-stats">
          <div className="dashboard-card">
            <div className="panel-title">Total Reports</div>
            <div className="stat-row">
              <span>All time</span>
              <strong>{stats.total_reports}</strong>
            </div>
          </div>
          <div className="dashboard-card">
            <div className="panel-title">Pending</div>
            <div className="stat-row">
              <span>Awaiting action</span>
              <strong>{stats.pending_reports}</strong>
            </div>
          </div>
          <div className="dashboard-card">
            <div className="panel-title">Resolved</div>
            <div className="stat-row">
              <span>Actioned</span>
              <strong>{stats.resolved_reports}</strong>
            </div>
          </div>
          <div className="dashboard-card">
            <div className="panel-title">Dismissed</div>
            <div className="stat-row">
              <span>Cleared</span>
              <strong>{stats.dismissed_reports}</strong>
            </div>
          </div>
        </div>
      )}

      <div className="panel reports-filters">
        <div className="form-grid">
          <label>
            Status
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Reason
            <select
              value={filters.reason}
              onChange={(e) => setFilters({ ...filters, reason: e.target.value })}
            >
              <option value="">All Reasons</option>
              {reasons.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Search
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search by user, post title, or description..."
            />
          </label>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="reports-table">
        <div className="report-row report-header">
          <span>Report Details</span>
          <span>Reporter</span>
          <span>Reported User</span>
          <span>Post</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {reports.length === 0 && (
          <div className="report-row report-empty">
            <span>No reports found</span>
          </div>
        )}
        {reports.map((report) => (
          <div key={report.id} className="report-row">
            <div className="report-details">
              {getReasonBadge(report.reason)}
              <div className="report-date">{formatDate(report.created_at)}</div>
              {report.description && (
                <div className="report-description">{report.description}</div>
              )}
            </div>
            <div className="report-person">
              <div className="report-name">{report.reporter?.name}</div>
              <div className="report-meta">{report.reporter?.email}</div>
            </div>
            <div className="report-person">
              <div className="report-name">{report.reported_user?.name}</div>
              <div className="report-meta">{report.reported_user?.email}</div>
              {report.reported_user?.status === 'banned' && (
                <span className="tag tag-danger">Banned</span>
              )}
            </div>
            <div className="report-post">
              <div className="report-name">{report.blog_post?.title}</div>
              {report.blog_post?.status === 'archived' && (
                <span className="tag tag-muted">Deleted</span>
              )}
            </div>
            <div className="report-status">
              {getStatusBadge(report.status)}
              {report.admin_action !== 'none' && (
                <div className="report-meta">
                  Action: {report.admin_action.replace('_', ' ')}
                </div>
              )}
              {report.reviewer?.name && report.status !== 'pending' && (
                <div className="report-meta">Reviewed by {report.reviewer.name}</div>
              )}
            </div>
            <div className="report-actions">
              {report.status === 'pending' ? (
                <>
                  <button
                    onClick={() => handleActionClick(report, 'dismiss')}
                    className="btn btn-outline"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => handleActionClick(report, 'warning')}
                    className="btn btn-warning"
                  >
                    Warning
                  </button>
                  <button
                    onClick={() => handleActionClick(report, 'delete_post')}
                    className="btn btn-warning"
                  >
                    Delete Post
                  </button>
                  <button
                    onClick={() => handleActionClick(report, 'ban_user')}
                    className="btn btn-danger"
                  >
                    Ban User
                  </button>
                </>
              ) : (
                <span className="report-meta">No actions</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Reports;
