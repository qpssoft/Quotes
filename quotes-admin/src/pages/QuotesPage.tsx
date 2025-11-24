import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { QuoteList } from '../components/QuoteList';
import { QuoteEditor } from '../components/QuoteEditor';
import { quotesApi, Quote, CreateQuoteDto, UpdateQuoteDto } from '../services/quotesApi';
import './QuotesPage.css';

export function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);

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

  const handleEdit = (quote: Quote) => {
    setEditingQuote(quote);
  };

  const handleDelete = async (id: string) => {
    try {
      await quotesApi.deleteQuote(id);
      // Update local state by removing the deleted quote
      setQuotes(quotes.filter(q => q.Id !== id));
    } catch (err) {
      console.error('Error deleting quote:', err);
      alert('Failed to delete quote. Please try again.');
    }
  };

  const handleSaveEdit = async (quoteData: CreateQuoteDto | UpdateQuoteDto) => {
    if (!editingQuote) return;

    try {
      await quotesApi.updateQuote(editingQuote.Id, quoteData as UpdateQuoteDto);
      
      // Update local state with the edited quote
      setQuotes(quotes.map(q => 
        q.Id === editingQuote.Id 
          ? { ...q, ...quoteData, Id: editingQuote.Id }
          : q
      ));
      
      setEditingQuote(null);
    } catch (err) {
      console.error('Error updating quote:', err);
      throw err; // Let QuoteEditor handle the error display
    }
  };

  const handleSaveCreate = async (quoteData: CreateQuoteDto | UpdateQuoteDto) => {
    try {
      await quotesApi.createQuote(quoteData as CreateQuoteDto);
      
      // Reload quotes to get the new one with its server-generated ID
      await loadQuotes();
      
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating quote:', err);
      throw err; // Let QuoteEditor handle the error display
    }
  };

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

        {!loading && (
          <div className="stats-row">
            <div className="stat-chip">
              <span className="stat-value">{quotes.length}</span>
              <span className="stat-label">Total Quotes</span>
            </div>
            <div className="stat-chip">
              <span className="stat-value">{quotes.filter(q => q.Language === 'vi').length}</span>
              <span className="stat-label">Vietnamese</span>
            </div>
            <div className="stat-chip">
              <span className="stat-value">{quotes.filter(q => q.Language === 'en').length}</span>
              <span className="stat-label">English</span>
            </div>
            <div className="stat-chip">
              <span className="stat-value">{new Set(quotes.map(q => q.Category).filter(Boolean)).size}</span>
              <span className="stat-label">Categories</span>
            </div>
          </div>
        )}

        <QuoteList 
          quotes={quotes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
          showActions={true}
        />

        {editingQuote && (
          <QuoteEditor
            quote={editingQuote}
            onSave={handleSaveEdit}
            onCancel={() => setEditingQuote(null)}
          />
        )}

        {showCreateModal && (
          <QuoteEditor
            onSave={handleSaveCreate}
            onCancel={() => setShowCreateModal(false)}
          />
        )}
      </div>
    </Layout>
  );
}
