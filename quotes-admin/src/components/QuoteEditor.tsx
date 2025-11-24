import React, { useState, useEffect } from 'react';
import './QuoteEditor.css';
import { Quote, CreateQuoteDto, UpdateQuoteDto } from '../services/quotesApi';

interface QuoteEditorProps {
  quote?: Quote; // If provided, edit mode; otherwise, create mode
  onSave: (quoteData: CreateQuoteDto | UpdateQuoteDto) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function QuoteEditor({ quote, onSave, onCancel, loading }: QuoteEditorProps) {
  const isEditMode = !!quote;

  const [formData, setFormData] = useState({
    content: quote?.Content || '',
    author: quote?.Author || '',
    category: quote?.Category || '',
    language: quote?.Language || 'vi',
    type: quote?.Type || 'quote',
    tags: quote?.Tags?.join(', ') || '',
    isPublic: quote?.IsPublic !== undefined ? quote.IsPublic : true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (quote) {
      setFormData({
        content: quote.Content || '',
        author: quote.Author || '',
        category: quote.Category || '',
        language: quote.Language || 'vi',
        type: quote.Type || 'quote',
        tags: quote.Tags?.join(', ') || '',
        isPublic: quote.IsPublic !== undefined ? quote.IsPublic : true,
      });
    }
  }, [quote]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length > 500) {
      newErrors.content = 'Content must be 500 characters or less';
    }

    // Author and Category are required for new quotes
    if (!isEditMode) {
      if (!formData.author.trim()) {
        newErrors.author = 'Author is required';
      } else if (formData.author.length > 100) {
        newErrors.author = 'Author name must be 100 characters or less';
      }

      if (!formData.category.trim()) {
        newErrors.category = 'Category is required';
      } else if (formData.category.length > 50) {
        newErrors.category = 'Category must be 50 characters or less';
      }
    } else {
      // For updates, only check length if provided
      if (formData.author && formData.author.length > 100) {
        newErrors.author = 'Author name must be 100 characters or less';
      }

      if (formData.category && formData.category.length > 50) {
        newErrors.category = 'Category must be 50 characters or less';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      if (isEditMode) {
        // Update existing quote
        const updateData: UpdateQuoteDto = {
          Content: formData.content.trim(),
          Author: formData.author.trim() || undefined,
          Category: formData.category.trim() || undefined,
          Language: formData.language,
          Type: formData.type,
          Tags: tagsArray.length > 0 ? tagsArray : undefined,
          IsPublic: formData.isPublic,
        };

        await onSave(updateData);
      } else {
        // Create new quote - Author and Category are required
        const createData: CreateQuoteDto = {
          Content: formData.content.trim(),
          Author: formData.author.trim(),
          Category: formData.category.trim(),
          Language: formData.language,
          Type: formData.type,
          Tags: tagsArray.length > 0 ? tagsArray : undefined,
          IsPublic: formData.isPublic,
        };

        await onSave(createData);
      }
    } catch (error) {
      console.error('Failed to save quote:', error);
      setErrors({ submit: 'Failed to save quote. Please try again.' });
      setSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="quote-editor-overlay" onClick={onCancel}>
      <div className="quote-editor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="quote-editor-header">
          <h2>{isEditMode ? 'Edit Quote' : 'Create New Quote'}</h2>
          <button 
            className="close-btn"
            onClick={onCancel}
            disabled={submitting}
            title="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="quote-editor-form">
          {/* Content Field */}
          <div className="form-group">
            <label htmlFor="content">
              Content <span className="required">*</span>
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="Enter quote content..."
              rows={5}
              className={errors.content ? 'error' : ''}
              disabled={submitting}
              maxLength={500}
            />
            <div className="field-info">
              <span className={`char-count ${formData.content.length > 500 ? 'error' : ''}`}>
                {formData.content.length} / 500 characters
              </span>
              {errors.content && <span className="error-message">{errors.content}</span>}
            </div>
          </div>

          {/* Author Field */}
          <div className="form-group">
            <label htmlFor="author">Author</label>
            <input
              id="author"
              type="text"
              value={formData.author}
              onChange={(e) => handleChange('author', e.target.value)}
              placeholder="Author name (optional)"
              className={errors.author ? 'error' : ''}
              disabled={submitting}
              maxLength={100}
            />
            {errors.author && <span className="error-message">{errors.author}</span>}
          </div>

          {/* Category Field */}
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <input
              id="category"
              type="text"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              placeholder="e.g., wisdom, motivation, life"
              className={errors.category ? 'error' : ''}
              disabled={submitting}
              maxLength={50}
            />
            {errors.category && <span className="error-message">{errors.category}</span>}
          </div>

          {/* Language and Type Row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="language">Language</label>
              <select
                id="language"
                value={formData.language}
                onChange={(e) => handleChange('language', e.target.value)}
                disabled={submitting}
              >
                <option value="vi">Vietnamese</option>
                <option value="en">English</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="type">Type</label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                disabled={submitting}
              >
                <option value="quote">Quote</option>
                <option value="proverb">Proverb</option>
                <option value="cadao">Ca Dao</option>
                <option value="saying">Saying</option>
              </select>
            </div>
          </div>

          {/* Tags Field */}
          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input
              id="tags"
              type="text"
              value={formData.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              placeholder="Comma-separated tags: wisdom, life, motivation"
              disabled={submitting}
            />
            <span className="field-hint">Separate multiple tags with commas</span>
          </div>

          {/* Public Checkbox */}
          <div className="form-group checkbox-group">
            <label htmlFor="isPublic" className="checkbox-label">
              <input
                id="isPublic"
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => handleChange('isPublic', e.target.checked)}
                disabled={submitting}
              />
              <span>Make this quote public</span>
            </label>
            <span className="field-hint">Public quotes are visible to all users</span>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="submit-error">
              {errors.submit}
            </div>
          )}

          {/* Action Buttons */}
          <div className="quote-editor-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-save"
              disabled={submitting || loading}
            >
              {submitting || loading ? (
                <>
                  <span className="spinner-small"></span>
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditMode ? 'Update Quote' : 'Create Quote'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
