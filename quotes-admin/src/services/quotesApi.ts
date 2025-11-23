import axios from 'axios';
import { authService } from './authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:7071/api/v1';

export interface Quote {
  Id: string;
  Content: string;
  Author: string;
  Category: string;
  Tags?: string[];
  Language: 'vi' | 'en';
  Type: 'quote' | 'proverb' | 'cadao';
  CreatedAt?: string;
  CreatedBy?: string;
  IsPublic: boolean;
}

export interface CreateQuoteDto {
  Content: string;
  Author: string;
  Category: string;
  Tags?: string[];
  Language: 'vi' | 'en';
  Type: 'quote' | 'proverb' | 'cadao';
  IsPublic?: boolean;
}

export interface UpdateQuoteDto {
  Content?: string;
  Author?: string;
  Category?: string;
  Tags?: string[];
  Language?: 'vi' | 'en';
  Type?: 'quote' | 'proverb' | 'cadao';
  IsPublic?: boolean;
}

class QuotesApiService {
  private getHeaders() {
    const token = authService.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getAllQuotes(params?: {
    category?: string;
    language?: string;
    author?: string;
    type?: string;
  }): Promise<Quote[]> {
    try {
      const response = await axios.get<Quote[]>(`${API_BASE_URL}/quotes`, {
        params,
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Get all quotes failed:', error);
      throw error;
    }
  }

  async getQuoteById(id: string): Promise<Quote> {
    try {
      const response = await axios.get<Quote>(`${API_BASE_URL}/quotes/${id}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Get quote by ID failed:', error);
      throw error;
    }
  }

  async createQuote(quote: CreateQuoteDto): Promise<Quote> {
    try {
      const response = await axios.post<Quote>(`${API_BASE_URL}/quotes`, quote, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Create quote failed:', error);
      throw error;
    }
  }

  async updateQuote(id: string, quote: UpdateQuoteDto): Promise<Quote> {
    try {
      const response = await axios.put<Quote>(`${API_BASE_URL}/quotes/${id}`, quote, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Update quote failed:', error);
      throw error;
    }
  }

  async deleteQuote(id: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/quotes/${id}`, {
        headers: this.getHeaders(),
      });
    } catch (error) {
      console.error('Delete quote failed:', error);
      throw error;
    }
  }

  async getMyQuotes(): Promise<Quote[]> {
    try {
      const response = await axios.get<Quote[]>(`${API_BASE_URL}/users/me/quotes`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Get my quotes failed:', error);
      throw error;
    }
  }

  async getSubmissions(): Promise<Quote[]> {
    try {
      const response = await axios.get<Quote[]>(`${API_BASE_URL}/admin/submissions`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Get submissions failed:', error);
      throw error;
    }
  }

  async approveQuote(id: string): Promise<void> {
    try {
      await axios.put(`${API_BASE_URL}/admin/quotes/${id}/approve`, {}, {
        headers: this.getHeaders(),
      });
    } catch (error) {
      console.error('Approve quote failed:', error);
      throw error;
    }
  }

  async rejectQuote(id: string, reason?: string): Promise<void> {
    try {
      await axios.put(`${API_BASE_URL}/admin/quotes/${id}/reject`, { reason }, {
        headers: this.getHeaders(),
      });
    } catch (error) {
      console.error('Reject quote failed:', error);
      throw error;
    }
  }
}

export const quotesApi = new QuotesApiService();
