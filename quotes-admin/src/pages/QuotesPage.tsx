import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { quotesApi, Quote, CreateQuoteDto, UpdateQuoteDto } from '../services/quotesApi';
import './QuotesPage.css';

export function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLanguage, setFilterLanguage] = useState<'all' | 'vi' | 'en'>('all');
  const [filterType, setFilterType] = useState<'all' | 'quote' | 'proverb' | 'cadao'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [formData, setFormData] = useState<CreateQuoteDto>({
    Content: '',
    Author: '',
    Category: '',
    Language: 'vi',
    Type: 'quote',
    Tags: [],
    IsPublic: true,
  });

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await quotesApi.getAllQuotes();
      setQuotes(data);
    } catch (err) {
      setError('Failed to load quotes. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await quotesApi.createQuote(formData);
      setShowCreateModal(false);
      resetForm();
      loadQuotes();
    } catch (err) {
      alert('Failed to create quote');
      console.error(err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuote) return;

    try {
      const updates: UpdateQuoteDto = {
        Content: formData.Content,
        Author: formData.Author,
        Category: formData.Category,
        Language: formData.Language,
        Type: formData.Type,
        Tags: formData.Tags,
        IsPublic: formData.IsPublic,
      };
      await quotesApi.updateQuote(editingQuote.Id, updates);
      setEditingQuote(null);
      resetForm();
      loadQuotes();
    } catch (err) {
      alert('Failed to update quote');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this quote?')) return;

    try {
      await quotesApi.deleteQuote(id);
      loadQuotes();
    } catch (err) {
      alert('Failed to delete quote');
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      Content: '',
      Author: '',
      Category: '',
      Language: 'vi',
      Type: 'quote',
      Tags: [],
      IsPublic: true,
    });
  };

  const startEdit = (quote: Quote) => {
    setEditingQuote(quote);
    setFormData({
      Content: quote.Content,
      Author: quote.Author,
      Category: quote.Category,
      Language: quote.Language,
      Type: quote.Type,
      Tags: quote.Tags || [],
      IsPublic: quote.IsPublic,
    });
  };

  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch =
      quote.Content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.Author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.Category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLanguage = filterLanguage === 'all' || quote.Language === filterLanguage;
    const matchesType = filterType === 'all' || quote.Type === filterType;

    return matchesSearch && matchesLanguage && matchesType;
  });

  return (
    <Layout>
      <div className="quotes-page">
        <div className="page-header">
          <div className="header-left">
            <h2>Quotes Management</h2>
            <p className="subtitle">Manage all quotes in the system</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            ➕ Add New Quote
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
            <button onClick={loadQuotes}>Retry</button>
          </div>
        )}

        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search quotes, authors, categories..."
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

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="quote">Quote</option>
              <option value="proverb">Proverb</option>
              <option value="cadao">Ca Dao</option>
            </select>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-chip">Total: {quotes.length}</div>
          <div className="stat-chip">Filtered: {filteredQuotes.length}</div>
        </div>

        {loading ? (
          <div className="loading-state">Loading quotes...</div>
        ) : (
          <div className="quotes-grid">
            {filteredQuotes.map((quote) => (
              <div key={quote.Id} className="quote-card">
                <div className="quote-header">
                  <span className={`type-badge ${quote.Type}`}>{quote.Type}</span>
                  <span className={`lang-badge ${quote.Language}`}>{quote.Language}</span>
                  {!quote.IsPublic && <span className="private-badge">Private</span>}
                </div>

                <div className="quote-content">
                  <p className="quote-text">{quote.Content}</p>
                  <p className="quote-author">— {quote.Author}</p>
                </div>

                <div className="quote-meta">
                  <span className="category-tag">{quote.Category}</span>
                  {quote.Tags && quote.Tags.length > 0 && (
                    <div className="tags">
                      {quote.Tags.map((tag, idx) => (
                        <span key={idx} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="quote-actions">
                  <button
                    className="btn-icon btn-edit"
                    onClick={() => startEdit(quote)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    onClick={() => handleDelete(quote.Id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredQuotes.length === 0 && (
          <div className="empty-state">
            <p>No quotes found</p>
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              Add First Quote
            </button>
          </div>
        )}

        {/* Create/Edit Modal */}
        {(showCreateModal || editingQuote) && (
          <div className="modal-overlay" onClick={() => {
            setShowCreateModal(false);
            setEditingQuote(null);
            resetForm();
          }}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editingQuote ? 'Edit Quote' : 'Create New Quote'}</h3>
                <button
                  className="modal-close"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingQuote(null);
                    resetForm();
                  }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={editingQuote ? handleUpdate : handleCreate}>
                <div className="form-group">
                  <label>Content *</label>
                  <textarea
                    value={formData.Content}
                    onChange={(e) => setFormData({ ...formData, Content: e.target.value })}
                    placeholder="Enter quote content"
                    required
                    rows={4}
                    maxLength={500}
                  />
                  <small>{formData.Content.length}/500 characters</small>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Author *</label>
                    <input
                      type="text"
                      value={formData.Author}
                      onChange={(e) => setFormData({ ...formData, Author: e.target.value })}
                      placeholder="Author name"
                      required
                      maxLength={100}
                    />
                  </div>

                  <div className="form-group">
                    <label>Category *</label>
                    <input
                      type="text"
                      value={formData.Category}
                      onChange={(e) => setFormData({ ...formData, Category: e.target.value })}
                      placeholder="e.g., Wisdom, Love, Life"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Language *</label>
                    <select
                      value={formData.Language}
                      onChange={(e) => setFormData({ ...formData, Language: e.target.value as 'vi' | 'en' })}
                    >
                      <option value="vi">Vietnamese</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Type *</label>
                    <select
                      value={formData.Type}
                      onChange={(e) => setFormData({ ...formData, Type: e.target.value as any })}
                    >
                      <option value="quote">Quote</option>
                      <option value="proverb">Proverb</option>
                      <option value="cadao">Ca Dao</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.Tags?.join(', ') || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        Tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                      })
                    }
                    placeholder="motivation, success, inspiration"
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.IsPublic}
                      onChange={(e) => setFormData({ ...formData, IsPublic: e.target.checked })}
                    />
                    <span>Public (visible to all users)</span>
                  </label>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingQuote(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingQuote ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
