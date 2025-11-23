import axios from 'axios';
import { authService, User } from './authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:7071/api/v1';

export interface UpdateUserDto {
  Role?: 'Authenticated' | 'Contributor' | 'Admin';
  IsActive?: boolean;
}

class UsersApiService {
  private getHeaders() {
    const token = authService.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const response = await axios.get<User[]>(`${API_BASE_URL}/admin/users`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Get all users failed:', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const response = await axios.get<User>(`${API_BASE_URL}/admin/users/${id}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Get user by ID failed:', error);
      throw error;
    }
  }

  async updateUser(id: string, updates: UpdateUserDto): Promise<User> {
    try {
      const response = await axios.put<User>(
        `${API_BASE_URL}/admin/users/${id}`,
        updates,
        {
          headers: this.getHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error('Update user failed:', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/admin/users/${id}`, {
        headers: this.getHeaders(),
      });
    } catch (error) {
      console.error('Delete user failed:', error);
      throw error;
    }
  }

  async banUser(id: string): Promise<User> {
    try {
      const response = await axios.put<User>(
        `${API_BASE_URL}/admin/users/${id}`,
        { IsActive: false },
        {
          headers: this.getHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error('Ban user failed:', error);
      throw error;
    }
  }

  async unbanUser(id: string): Promise<User> {
    try {
      const response = await axios.put<User>(
        `${API_BASE_URL}/admin/users/${id}`,
        { IsActive: true },
        {
          headers: this.getHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error('Unban user failed:', error);
      throw error;
    }
  }

  async assignRole(
    id: string,
    role: 'Authenticated' | 'Contributor' | 'Admin'
  ): Promise<User> {
    try {
      const response = await axios.put<User>(
        `${API_BASE_URL}/admin/users/${id}`,
        { Role: role },
        {
          headers: this.getHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error('Assign role failed:', error);
      throw error;
    }
  }
}

export const usersApi = new UsersApiService();
