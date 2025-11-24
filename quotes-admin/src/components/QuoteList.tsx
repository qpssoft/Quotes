import React, { useState, useMemo } from 'react';
import './QuoteList.css';
import { Quote } from '../services/quotesApi';

interface QuoteListProps {
  quotes: Quote[];
  onEdit?: (quote: Quote) => void;
  onDelete?: (quoteId: string) => void;
  loading?: boolean;
  showActions?: boolean;
}

export function QuoteList({ quotes, onEdit, onDelete, loading, showActions = true }: QuoteListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Extract unique categories and languages from quotes
  const { categories, languages } = useMemo(() => {
    const cats = new Set<string>();
    const langs = new Set<string>();
    
    quotes.forEach(quote => {
      if (quote.Category) cats.add(quote.Category);
      if (quote.Language) langs.add(quote.Language);
    });
    
    return {
      categories: Array.from(cats).sort(),
      languages: Array.from(langs).sort()
    };
  }, [quotes]);

  // Filter quotes based on search and filters
  const filteredQuotes = useMemo(() => {
    return quotes.filter(quote => {
      // Search filter (content, author, tags)
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        quote.Content.toLowerCase().includes(searchLower) ||
        quote.Author?.toLowerCase().includes(searchLower) ||
        quote.Tags?.some(tag => tag.toLowerCase().includes(searchLower));

      // Category filter
      const matchesCategory = categoryFilter === 'all' || quote.Category === categoryFilter;

      // Language filter
      const matchesLanguage = languageFilter === 'all' || quote.Language === languageFilter;

      return matchesSearch && matchesCategory && matchesLanguage;
    });
  }, [quotes, searchTerm, categoryFilter, languageFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedQuotes = filteredQuotes.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, languageFilter]);

  const handleDelete = (quoteId: string, content: string) => {
    if (window.confirm(`Are you sure you want to delete this quote?\n\n"${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"`)) {
      onDelete?.(quoteId);
    }
  };

  if (loading) {
    return (
      <div className="quote-list-loading">
        <div className="spinner"></div>
        <p>Loading quotes...</p>
      </div>
    );
  }

  return (
    <div className="quote-list-container">
      {/* Filters Section */}
      <div className="quote-list-filters">
        <div className="filter-group">
          <input
            type="text"
            className="search-input"
            placeholder="Search quotes, authors, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="category-filter">Category:</label>
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="language-filter">Language:</label>
          <select
            id="language-filter"
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Languages</option>
            {languages.map(lang => (
              <option key={lang} value={lang}>{lang === 'vi' ? 'Vietnamese' : 'English'}</option>
            ))}
          </select>
        </div>

        <div className="filter-results">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredQuotes.length)} of {filteredQuotes.length} quotes
          {searchTerm || categoryFilter !== 'all' || languageFilter !== 'all' ? (
            <button 
              className="clear-filters-btn"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setLanguageFilter('all');
              }}
            >
              Clear Filters
            </button>
          ) : null}
        </div>
      </div>

      {/* Quotes List */}
      {paginatedQuotes.length === 0 ? (
        <div className="no-quotes">
          <p>No quotes found matching your filters.</p>
        </div>
      ) : (
        <div className="quotes-grid">
          {paginatedQuotes.map((quote) => (
            <div key={quote.Id} className="quote-card">
              <div className="quote-header">
                <span className="quote-language">{quote.Language === 'vi' ? '🇻🇳' : '🇬🇧'} {quote.Language}</span>
                {quote.Category && <span className="quote-category">{quote.Category}</span>}
              </div>

              <div className="quote-content">
                <p className="quote-text">"{quote.Content}"</p>
                {quote.Author && <p className="quote-author">— {quote.Author}</p>}
              </div>

              {quote.Tags && quote.Tags.length > 0 && (
                <div className="quote-tags">
                  {quote.Tags.map((tag, index) => (
                    <span key={index} className="quote-tag">#{tag}</span>
                  ))}
                </div>
              )}

              <div className="quote-meta">
                <span className="quote-type">{quote.Type}</span>
                {quote.CreatedAt && (
                  <span className="quote-date">
                    {new Date(quote.CreatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              {showActions && (
                <div className="quote-actions">
                  {onEdit && (
                    <button 
                      className="btn-edit"
                      onClick={() => onEdit(quote)}
                      title="Edit quote"
                    >
                      ✏️ Edit
                    </button>
                  )}
                  {onDelete && (
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(quote.Id, quote.Content)}
                      title="Delete quote"
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            ← Previous
          </button>

          <div className="pagination-pages">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  className={`pagination-page ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
