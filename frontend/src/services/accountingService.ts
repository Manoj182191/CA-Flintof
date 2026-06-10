import { apiClient } from './apiClient';

export interface LedgerGroup {
    id: number;
    name: string;
    group_type: string;
}

export interface Ledger {
    id: number;
    company_id: number;
    group_id: number;
    name: string;
    alias?: string;
    opening_balance: number;
    current_balance?: number;
    is_system?: boolean;
}

export interface LedgerCreate {
    company_id: number;
    group_id: number;
    name: string;
    alias?: string;
    opening_balance: number;
}

export interface VoucherTransaction {
    ledger_id: number;
    debit: number;
    credit: number;
}

export interface VoucherCreate {
    company_id: number;
    voucher_type: string; // 'JOURNAL', 'PAYMENT', 'RECEIPT', 'CONTRA'
    voucher_date: string;
    transactions: VoucherTransaction[];
    description?: string;
    narration?: string;
}

export interface Voucher {
    id: number;
    company_id: number;
    voucher_number: string;
    voucher_type: string;
    voucher_date: string;
    total_debit: number;
    total_credit: number;
    is_posted: boolean;
    description: string;
    narration: string;
    transactions: any[];
}

export const accountingService = {
    // Ledger Groups
    getLedgerGroups: async (companyId: number) => {
        const response = await apiClient.get(`/accounting/ledger-groups/${companyId}`);
        return response.data as LedgerGroup[];
    },
    createLedgerGroup: async (companyId: number, name: string, groupType: string) => {
        const response = await apiClient.post(`/accounting/ledger-groups/?company_id=${companyId}&name=${encodeURIComponent(name)}&group_type=${groupType}`);
        return response.data;
    },

    // Ledgers
    getLedgers: async (companyId: number, groupId?: number) => {
        const url = groupId ? `/accounting/ledgers/${companyId}?group_id=${groupId}` : `/accounting/ledgers/${companyId}`;
        const response = await apiClient.get(url);
        return response.data as Ledger[];
    },
    createLedger: async (data: LedgerCreate) => {
        const response = await apiClient.post(`/accounting/ledgers/`, data);
        return response.data as Ledger;
    },
    getLedgerDetails: async (ledgerId: number) => {
        const response = await apiClient.get(`/accounting/ledgers/${ledgerId}/detail`);
        return response.data as Ledger;
    },

    // Vouchers
    getVouchers: async (companyId: number, params?: { voucher_type?: string, from_date?: string, to_date?: string, is_posted?: boolean }) => {
        let url = `/accounting/vouchers/${companyId}`;
        if (params) {
            const query = new URLSearchParams();
            if (params.voucher_type) query.append('voucher_type', params.voucher_type);
            if (params.from_date) query.append('from_date', params.from_date);
            if (params.to_date) query.append('to_date', params.to_date);
            if (params.is_posted !== undefined) query.append('is_posted', String(params.is_posted));
            const queryString = query.toString();
            if (queryString) url += `?${queryString}`;
        }
        const response = await apiClient.get(url);
        return response.data as Voucher[];
    },
    createVoucher: async (data: VoucherCreate) => {
        const response = await apiClient.post(`/accounting/vouchers/`, data);
        return response.data as Voucher;
    },
    getVoucherDetails: async (voucherId: number) => {
        const response = await apiClient.get(`/accounting/vouchers/detail/${voucherId}`);
        return response.data as Voucher;
    },
    postVoucher: async (voucherId: number) => {
        const response = await apiClient.post(`/accounting/vouchers/${voucherId}/post`);
        return response.data;
    },
    deleteVoucher: async (voucherId: number) => {
        const response = await apiClient.delete(`/accounting/vouchers/${voucherId}`);
        return response.data;
    },

    // Reports
    getTrialBalance: async (companyId: number, asOfDate?: string) => {
        const url = asOfDate ? `/accounting/trial-balance/${companyId}?as_of_date=${asOfDate}` : `/accounting/trial-balance/${companyId}`;
        const response = await apiClient.get(url);
        return response.data;
    },
    getProfitLoss: async (companyId: number, fromDate: string, toDate: string) => {
        const response = await apiClient.get(`/accounting/profit-loss/${companyId}?from_date=${fromDate}&to_date=${toDate}`);
        return response.data;
    },
    getBalanceSheet: async (companyId: number, asOfDate?: string) => {
        const url = asOfDate ? `/accounting/balance-sheet/${companyId}?as_of_date=${asOfDate}` : `/accounting/balance-sheet/${companyId}`;
        const response = await apiClient.get(url);
        return response.data;
    },
    getCashFlow: async (companyId: number, fromDate: string, toDate: string) => {
        const response = await apiClient.get(`/accounting/cash-flow/${companyId}?from_date=${fromDate}&to_date=${toDate}`);
        return response.data;
    },
    getDayBook: async (companyId: number, fromDate: string, toDate: string) => {
        const response = await apiClient.get(`/accounting/day-book/${companyId}?from_date=${fromDate}&to_date=${toDate}`);
        return response.data;
    },
    getGeneralLedger: async (ledgerId: number, fromDate?: string, toDate?: string) => {
        let url = `/accounting/general-ledger/${ledgerId}`;
        const query = new URLSearchParams();
        if (fromDate) query.append('from_date', fromDate);
        if (toDate) query.append('to_date', toDate);
        const queryString = query.toString();
        if (queryString) url += `?${queryString}`;
        const response = await apiClient.get(url);
        return response.data;
    }
};
