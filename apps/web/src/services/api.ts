import axios, { AxiosInstance, AxiosResponse } from 'axios';

interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

class ApiService {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_URL || '/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle auth errors
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        if (error.response?.status === 401) {
          // Try to refresh token
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const response = await axios.post('/api/auth/refresh', {
                refreshToken,
              });
              
              const { accessToken } = response.data;
              localStorage.setItem('accessToken', accessToken);
              
              // Retry original request
              error.config.headers.Authorization = `Bearer ${accessToken}`;
              return this.instance.request(error.config);
            } catch (refreshError) {
              // Refresh failed, clear tokens and redirect to login
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              window.location.href = '/login';
            }
          } else {
            // No refresh token, redirect to login
            window.location.href = '/login';
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  async get<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.instance.get(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.instance.post(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.instance.put(url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.instance.patch(url, data, config);
  }

  async delete<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.instance.delete(url, config);
  }
}

export const api = new ApiService();