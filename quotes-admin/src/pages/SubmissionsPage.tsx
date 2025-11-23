import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { quotesApi, Quote } from '../services/quotesApi';
import './SubmissionsPage.css';

export function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLanguage, setFilterLanguage] = useState<'all' | 'vi' | 'en'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await quotesApi.getSubmissions();
      setSubmissions(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load submissions. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm('Are you sure you want to approve this quote? It will be added to the public collection.')) {
      return;
    }

    try {
      setProcessingId(id);
      await quotesApi.approveQuote(id);
      setSubmissions(submissions.filter(s => s.Id !== id));
      alert('Quote approved successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to approve quote');
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Rejection reason (optional):');
    if (reason === null) return; // User cancelled

    if (!window.confirm('Are you sure you want to reject this quote? It will be permanently deleted.')) {
      return;
    }

    try {
      setProcessingId(id);
      await quotesApi.rejectQuote(id, reason || undefined);
      setSubmissions(submissions.filter(s => s.Id !== id));
      alert('Quote rejected successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to reject quote');
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch =
      submission.Content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.Author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.Category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLanguage = filterLanguage === 'all' || submission.Language === filterLanguage;

    return matchesSearch && matchesLanguage;
  });

  return (
    <Layout>
      <div className="submissions-page">
        <div className="page-header">
          <div className="header-left">
            <h2>Quote Submissions</h2>
            <p className="subtitle">Review and moderate user-submitted quotes</p>
          </div>
          <div className="stats-badges">
            <span className="badge badge-pending">{submissions.length} Pending</span>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
            <button onClick={loadSubmissions}>Retry</button>
          </div>
        )}

        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search submissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value as any)}
              className="filter-select"
            >
              <option value="all">All Languages</option>
              <option value="vi">Vietnamese</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-chip">Total: {submissions.length}</div>
          <div className="stat-chip">Filtered: {filteredSubmissions.length}</div>
        </div>

        {loading ? (
          <div className="loading-state">Loading submissions...</div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p className="empty-title">No pending submissions</p>
            <p className="empty-description">
              {submissions.length === 0
                ? 'There are no user-submitted quotes to review at this time.'
                : 'No submissions match your filters.'}
            </p>
          </div>
        ) : (
          <div className="submissions-grid">
            {filteredSubmissions.map((submission) => (
              <div key={submission.Id} className="submission-card">
                <div className="submission-header">
                  <span className={`type-badge ${submission.Type}`}>{submission.Type}</span>
                  <span className={`lang-badge ${submission.Language}`}>{submission.Language}</span>
                  <span className="status-badge pending">Pending Review</span>
                </div>

                <div className="submission-content">
                  <p className="submission-text">{submission.Content}</p>
                  <p className="submission-author">— {submission.Author}</p>
                </div>

                <div className="submission-meta">
                  <span className="category-tag">{submission.Category}</span>
                  {submission.Tags && submission.Tags.length > 0 && (
                    <div className="tags">
                      {submission.Tags.map((tag, idx) => (
                        <span key={idx} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {submission.CreatedBy && (
                  <div className="submission-info">
                    <small>Submitted by: {submission.CreatedBy}</small>
                    {submission.CreatedAt && (
                      <small> • {new Date(submission.CreatedAt).toLocaleDateString()}</small>
                    )}
                  </div>
                )}

                <div className="submission-actions">
                  <button
                    className="btn btn-success"
                    onClick={() => handleApprove(submission.Id)}
                    disabled={processingId === submission.Id}
                  >
                    {processingId === submission.Id ? '⏳' : '✓'} Approve
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleReject(submission.Id)}
                    disabled={processingId === submission.Id}
                  >
                    {processingId === submission.Id ? '⏳' : '✕'} Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
