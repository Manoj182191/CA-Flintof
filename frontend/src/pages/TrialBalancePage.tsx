import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { accountingService } from '../services/accountingService';

const TrialBalancePage: React.FC = () => {
    const navigate = useNavigate();
    const { activeCompanyId } = useAuth();
    const [trialBalance, setTrialBalance] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (activeCompanyId) {
            fetchData();
        }
    }, [activeCompanyId, asOfDate]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await accountingService.getTrialBalance(parseInt(activeCompanyId!), asOfDate);
            setTrialBalance(data);
        } catch (error) {
            console.error('Failed to fetch trial balance', error);
        } finally {
            setIsLoading(false);
        }
    };

    const totalDebit = trialBalance.reduce((sum, item) => sum + (item.debit || 0), 0);
    const totalCredit = trialBalance.reduce((sum, item) => sum + (item.credit || 0), 0);

    return (
        <div className="stitch-app">
            <header className="bg-surface/70 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm sticky top-0 z-50 flex justify-between items-center w-full px-gutter h-16">
                <div className="flex items-center gap-md">
                    <span onClick={() => navigate('/accounting')} className="material-symbols-outlined text-primary cursor-pointer p-sm hover:bg-surface-container-high/50 rounded-lg">arrow_back</span>
                    <h1 className="font-headline-md text-headline-md font-bold text-primary">FinPilot Pro</h1>
                </div>
            </header>

            <main className="max-w-[1440px] mx-auto px-gutter py-lg flex flex-col gap-lg pb-24 md:pb-lg">
                <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-md">
                    <div>
                        <div className="flex items-center gap-sm mb-xs">
                            <span className="material-symbols-outlined text-secondary">balance</span>
                            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Reports</span>
                        </div>
                        <h2 className="font-headline-lg text-headline-lg text-primary">Trial Balance</h2>
                    </div>
                    <div className="flex items-center gap-md">
                        <div className="flex flex-col">
                            <label className="text-xs text-on-surface-variant mb-1">As Of Date</label>
                            <input 
                                type="date" 
                                value={asOfDate} 
                                onChange={e => setAsOfDate(e.target.value)}
                                className="bg-surface-container border border-outline-variant/50 rounded-lg px-md py-sm focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                    </div>
                </section>

                <div className="glass-panel border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden ai-glow">
                    <div className="overflow-x-auto scrollbar-hide">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead className="bg-surface-container text-on-surface-variant sticky top-0">
                                <tr>
                                    <th className="px-lg py-md font-label-sm text-label-sm uppercase tracking-wider">Ledger Name</th>
                                    <th className="px-lg py-md font-label-sm text-label-sm uppercase tracking-wider text-right">Debit (Dr)</th>
                                    <th className="px-lg py-md font-label-sm text-label-sm uppercase tracking-wider text-right">Credit (Cr)</th>
                                </tr>
                            </thead>
                            <tbody className="custom-zebra divide-y divide-outline-variant/10">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={3} className="text-center py-8 text-on-surface-variant">Loading trial balance...</td>
                                    </tr>
                                ) : trialBalance.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="text-center py-8 text-on-surface-variant">No data available</td>
                                    </tr>
                                ) : (
                                    trialBalance.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-surface-container-low transition-colors">
                                            <td className="px-lg py-md font-medium text-primary">
                                                {item.ledger_name}
                                            </td>
                                            <td className="px-lg py-md text-right font-data-mono">
                                                {item.debit > 0 ? `₹${item.debit.toLocaleString('en-IN')}` : '—'}
                                            </td>
                                            <td className="px-lg py-md text-right font-data-mono">
                                                {item.credit > 0 ? `₹${item.credit.toLocaleString('en-IN')}` : '—'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            <tfoot className="bg-surface-container-highest border-t-2 border-primary">
                                <tr>
                                    <td className="px-lg py-md font-bold text-primary text-right uppercase tracking-wider">Grand Total</td>
                                    <td className="px-lg py-md text-right font-data-mono font-bold text-primary text-lg">
                                        ₹{totalDebit.toLocaleString('en-IN')}
                                    </td>
                                    <td className="px-lg py-md text-right font-data-mono font-bold text-primary text-lg">
                                        ₹{totalCredit.toLocaleString('en-IN')}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TrialBalancePage;
