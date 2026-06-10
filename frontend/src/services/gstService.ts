import { apiClient } from './apiClient';

export interface GSTReturn {
    id: number;
    company_id: number;
    return_type: string;
    month: number;
    year: number;
    total_supply: number;
    total_tax: number;
    status: string;
    filing_date?: string;
    arn?: string;
}

export interface GSTDashboardData {
    total_tax_liability: number;
    total_itc_available: number;
    net_tax_payable: number;
    cash_balance: number;
    recent_returns: GSTReturn[];
    notices: any[];
}

export const gstService = {
    getDashboard: async (companyId: number): Promise<GSTDashboardData> => {
        const response = await apiClient.get(`/gst/dashboard/${companyId}`);
        return response.data;
    },
    getReturns: async (companyId: number, year?: number): Promise<GSTReturn[]> => {
        const url = year ? `/gst/returns/${companyId}?year=${year}` : `/gst/returns/${companyId}`;
        const response = await apiClient.get(url);
        return response.data;
    },
    createReturn: async (payload: {
        company_id: number;
        return_type: string;
        month: number;
        year: number;
        total_supply?: number;
        total_tax?: number;
    }): Promise<GSTReturn> => {
        const response = await apiClient.post('/gst/returns/', payload);
        return response.data;
    },
    fileReturn: async (returnId: number): Promise<GSTReturn> => {
        const response = await apiClient.post(`/gst/returns/${returnId}/file`);
        return response.data;
    },
    getGSTR1: async (companyId: number, month: number, year: number): Promise<any> => {
        const response = await apiClient.get(`/gst/gstr1/${companyId}?month=${month}&year=${year}`);
        return response.data;
    },
    getGSTR3B: async (companyId: number, month: number, year: number): Promise<any> => {
        const response = await apiClient.get(`/gst/gstr3b/${companyId}?month=${month}&year=${year}`);
        return response.data;
    },
    getGSTR9: async (companyId: number, financialYear: string): Promise<any> => {
        const response = await apiClient.get(`/gst/gstr9/${companyId}?financial_year=${financialYear}`);
        return response.data;
    },
    getReconciliation: async (companyId: number, month: number, year: number): Promise<any> => {
        const response = await apiClient.get(`/gst/reconciliation/${companyId}?month=${month}&year=${year}`);
        return response.data;
    },
    validateGSTIN: async (gstin: string): Promise<any> => {
        const response = await apiClient.post(`/gst/validate-gstin?gstin=${gstin}`);
        return response.data;
    },
    calculateGST: async (payload: {
        taxable_value: number;
        gst_rate: number;
        is_interstate?: boolean;
        cess?: number;
    }): Promise<any> => {
        const response = await apiClient.post('/gst/calculate', payload);
        return response.data;
    }
};
