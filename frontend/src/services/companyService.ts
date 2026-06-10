import { apiClient } from './apiClient';

export interface Company {
  id: number;
  name: string;
  legal_name?: string;
  pan?: string;
  gstin?: string;
  business_type?: string;
  currency: string;
  address?: string;
  phone?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyData {
  name: string;
  legal_name?: string;
  pan?: string;
  gstin?: string;
  business_type?: string;
  currency?: string;
  address?: string;
  phone?: string;
  email?: string;
}

class CompanyService {
  async createCompany(data: CreateCompanyData): Promise<Company> {
    const response = await apiClient.post('/companies/', data);
    return response.data;
  }

  async listCompanies(): Promise<Company[]> {
    const response = await apiClient.get('/companies/');
    return response.data;
  }

  async getCompany(id: number): Promise<Company> {
    const response = await apiClient.get(`/companies/${id}`);
    return response.data;
  }

  async updateCompany(id: number, data: CreateCompanyData): Promise<Company> {
    const response = await apiClient.put(`/companies/${id}`, data);
    return response.data;
  }

  async deleteCompany(id: number): Promise<void> {
    await apiClient.delete(`/companies/${id}`);
  }
}

export const companyService = new CompanyService();
