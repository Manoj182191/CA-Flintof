import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { accountingService, Voucher } from '../services/accountingService';

const VoucherListPage: React.FC = () => {
    const navigate = useNavigate();
    const { activeCompanyId } = useAuth();
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filterType, setFilterType] = useState<string>('');

    useEffect(() => {
        if (activeCompanyId) {
            fetchVouchers();
        }
    }, [activeCompanyId, filterType]);

    const fetchVouchers = async () => {
        setIsLoading(true);
        try {
            const params: any = {};
            if (filterType) params.voucher_type = filterType;
            
            const data = await accountingService.getVouchers(parseInt(activeCompanyId!), params);
            setVouchers(data);
        } catch (error) {
            console.error('Failed to fetch vouchers', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="stitch-app">
            <header className="bg-surface/70 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm sticky top-0 z-50 flex justify-between items-center w-full px-gutter h-16">
                <div className="flex items-center gap-md">
                    <span onClick={() => navigate('/accounting')} className="material-symbols-outlined text-primary cursor-pointer p-sm hover:bg-surface-container-high/50 rounded-lg">arrow_back</span>
                    <h1 className="font-headline-md text-headline-md font-bold text-primary">FinPilot Pro</h1>
                </div>
                <div className="flex gap-sm">
                    <button onClick={() => navigate('/journal-voucher')} className="bg-surface-container px-4 py-2 rounded-lg text-sm hover:bg-surface-container-highest transition-colors">
                        + Journal
                    </button>
                    <button onClick={() => navigate('/smart-voucher')} className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">smart_toy</span> Smart Entry
                    </button>
                </div>
            </header>

            <main className="max-w-[1440px] mx-auto px-gutter py-lg flex flex-col gap-lg pb-24 md:pb-lg">
                <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-md">
                    <div>
                        <div className="flex items-center gap-sm mb-xs">
                            <span className="material-symbols-outlined text-secondary">receipt_long</span>
                            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Transactions</span>
                        </div>
                        <h2 className="font-headline-lg text-headline-lg text-primary">Voucher Master Hub</h2>
                    </div>
                    <div className="flex items-center gap-md">
                        <select 
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="bg-surface-container border border-outline-variant/50 rounded-lg px-md py-sm focus:ring-2 focus:ring-primary outline-none text-sm"
                        >
                            <option value="">All Vouchers</option>
                            <option value="JOURNAL">Journal</option>
                            <option value="PAYMENT">Payment</option>
                            <option value="RECEIPT">Receipt</option>
                            <option value="CONTRA">Contra</option>
                        </select>
                    </div>
                </section>

                <div className="glass-panel border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden ai-glow">
                    <div className="overflow-x-auto scrollbar-hide">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead className="bg-surface-container text-on-surface-variant sticky top-0">
                                <tr>
                                    <th className="px-lg py-md font-label-sm text-label-sm uppercase tracking-wider">Date</th>
                                    <th className="px-lg py-md font-label-sm text-label-sm uppercase tracking-wider">Voucher #</th>
                                    <th className="px-lg py-md font-label-sm text-label-sm uppercase tracking-wider">Type</th>
                                    <th className="px-lg py-md font-label-sm text-label-sm uppercase tracking-wider">Description</th>
                                    <th className="px-lg py-md font-label-sm text-label-sm uppercase tracking-wider text-right">Amount</th>
                                    <th className="px-lg py-md font-label-sm text-label-sm uppercase tracking-wider text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="custom-zebra divide-y divide-outline-variant/10">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-on-surface-variant">Loading vouchers...</td>
                                    </tr>
                                ) : vouchers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-on-surface-variant">No vouchers found</td>
                                    </tr>
                                ) : (
                                    vouchers.map((voucher) => (
                                        <tr key={voucher.id} className="hover:bg-surface-container-low transition-colors">
                                            <td className="px-lg py-md font-data-mono text-sm whitespace-nowrap">
                                                {voucher.voucher_date}
                                            </td>
                                            <td className="px-lg py-md font-bold text-primary">
                                                {voucher.voucher_number}
                                            </td>
                                            <td className="px-lg py-md">
                                                <span className="bg-surface-container-high px-sm py-1 rounded text-xs">
                                                    {voucher.voucher_type}
                                                </span>
                                            </td>
                                            <td className="px-lg py-md text-sm text-on-surface-variant">
                                                {voucher.description || voucher.narration || '-'}
                                            </td>
                                            <td className="px-lg py-md text-right font-data-mono text-primary font-bold">
                                                ₹{voucher.total_debit?.toLocaleString('en-IN') || '0.00'}
                                            </td>
                                            <td className="px-lg py-md text-center">
                                                {voucher.is_posted ? (
                                                    <span className="material-symbols-outlined text-emerald-500" title="Posted">check_circle</span>
                                                ) : (
                                                    <span className="material-symbols-outlined text-amber-500" title="Draft">pending</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default VoucherListPage;
