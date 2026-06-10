import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token and company ID to request headers
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      const companyId = localStorage.getItem('active_company_id');
      if (companyId) {
        config.headers['X-Company-ID'] = companyId;
      }
      return config;
    });

    // Handle response errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  get<T = any>(url: string, config?: any) { return this.client.get<T>(url, config); }
  post<T = any>(url: string, data?: any, config?: any) { return this.client.post<T>(url, data, config); }
  put<T = any>(url: string, data?: any, config?: any) { return this.client.put<T>(url, data, config); }
  patch<T = any>(url: string, data?: any, config?: any) { return this.client.patch<T>(url, data, config); }
  delete<T = any>(url: string, config?: any) { return this.client.delete<T>(url, config); }
}

export const apiClient = new APIClient();
