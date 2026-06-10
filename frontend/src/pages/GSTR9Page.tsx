import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gstService } from '../services/gstService';

const GSTR9Page: React.FC = () => {
    const navigate = useNavigate();
    const { activeCompanyId } = useAuth();
    const [gstr9Data, setGstr9Data] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [financialYear, setFinancialYear] = useState('2023-24');

    useEffect(() => {
        if (activeCompanyId) {
            fetchData();
        }
    }, [activeCompanyId, financialYear]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await gstService.getGSTR9(parseInt(activeCompanyId!), financialYear);
            setGstr9Data(data);
        } catch (error) {
            console.error('Failed to fetch GSTR-9 data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileReturn = async () => {
        if (!gstr9Data) return;
        try {
            const payload = {
                company_id: parseInt(activeCompanyId!),
                return_type: 'GSTR-9',
                month: 3, // FY ends in March
                year: parseInt(financialYear.split('-')[0]) + 1,
                total_supply: gstr9Data.outward_supplies?.taxable_value || 0,
                total_tax: gstr9Data.outward_supplies?.tax || 0
            };
            await gstService.createReturn(payload);
            alert("Draft GSTR-9 Created successfully.");
            navigate('/gst');
        } catch (err: any) {
            alert(err.response?.data?.detail || "Failed to create return");
        }
    };

    return (
        <div className="bg-background text-on-background min-h-screen font-body-md">
            <header className="bg-surface/70 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm sticky top-0 flex justify-between items-center w-full px-gutter h-16 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/gst')} className="material-symbols-outlined text-primary cursor-pointer active:scale-95 duration-200">close</button>
                    <h1 className="font-headline-md text-headline-md font-bold text-emerald-600">GSTR-9 Annual Return</h1>
                </div>
                <div className="flex items-center gap-md">
                    <select 
                        value={financialYear}
                        onChange={(e) => setFinancialYear(e.target.value)}
                        className="text-on-surface-variant font-label-sm text-label-sm border border-outline-variant rounded px-2 py-1"
                    >
                        <option value="2022-23">2022-23</option>
                        <option value="2023-24">2023-24</option>
                        <option value="2024-25">2024-25</option>
                    </select>
                </div>
            </header>

            <main className="max-w-[1440px] mx-auto p-gutter pb-32 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
                    <div className="lg:col-span-5 flex flex-col gap-lg">
                        <section className="glass-panel rounded-xl p-xl flex flex-col items-center text-center bg-white/70 backdrop-blur-md border border-emerald-200" style={{boxShadow: '0 0 15px rgba(16, 185, 129, 0.1)'}}>
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mb-4"></div>
                            ) : (
                                <>
                                    <div className="relative w-48 h-48 mb-lg flex items-center justify-center">
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="material-symbols-outlined text-emerald-600 text-6xl">verified</span>
                                            <span className="font-label-sm text-label-sm text-emerald-700 mt-2">Aggregated</span>
                                        </div>
                                    </div>
                                    <h2 className="font-headline-md text-headline-md text-emerald-700 mb-xs">FY {financialYear} Compiled</h2>
                                    <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">Data aggregated from all GSTR-1 and GSTR-3B filings for the financial year.</p>
                                    <div className="mt-xl w-full flex flex-col gap-sm">
                                        <div className="flex justify-between items-center px-md py-sm bg-surface-container-low rounded-lg">
                                            <span className="text-body-md text-on-surface-variant">Tax Payable</span>
                                            <span className="font-data-mono text-data-mono font-bold text-error">₹ {gstr9Data?.tax_payable || 0}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </section>
                    </div>

                    <div className="lg:col-span-7 flex flex-col gap-lg">
                        <section className="glass-panel rounded-xl overflow-hidden bg-white/70 backdrop-blur-md border border-slate-200">
                            <div className="p-lg border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-high/30">
                                <div className="flex items-center gap-sm">
                                    <span className="material-symbols-outlined text-emerald-600" style={{fontVariationSettings: "'FILL' 1"}}>bar_chart</span>
                                    <h3 className="font-headline-md text-headline-md text-primary">Annual Summary</h3>
                                </div>
                            </div>
                            <div className="divide-y divide-outline-variant/20">
                                <div className="p-lg hover:bg-surface-container-low transition-colors group">
                                    <div className="flex justify-between items-start mb-sm">
                                        <div className="flex flex-col">
                                            <h4 className="font-headline-md text-headline-md text-primary">Outward Supplies (Sales)</h4>
                                        </div>
                                        <span className="font-data-mono font-bold text-primary">₹ {gstr9Data?.outward_supplies?.taxable_value || 0} Taxable</span>
                                    </div>
                                    <div className="flex gap-lg text-body-md text-on-surface-variant mb-md">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase tracking-wider opacity-60">Total Tax Generated</span>
                                            <span className="font-data-mono">₹ {gstr9Data?.outward_supplies?.tax || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-lg hover:bg-surface-container-low transition-colors group">
                                    <div className="flex justify-between items-start mb-sm">
                                        <div className="flex flex-col">
                                            <h4 className="font-headline-md text-headline-md text-primary">Input Tax Credit (ITC)</h4>
                                        </div>
                                        <span className="font-data-mono font-bold text-secondary">₹ {gstr9Data?.itc_claimed?.total_itc || 0} Claimed</span>
                                    </div>
                                </div>

                                <div className="p-lg bg-surface-container-lowest transition-colors group">
                                    <div className="flex justify-between items-start mb-sm">
                                        <div className="flex flex-col">
                                            <h4 className="font-headline-md text-headline-md text-error">Net Tax Payable</h4>
                                        </div>
                                        <span className="font-data-mono font-bold text-error text-xl">₹ {gstr9Data?.tax_payable || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 w-full bg-surface-container-lowest border-t border-outline-variant/30 px-gutter py-md z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="max-w-[1440px] mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-md">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-on-surface-variant">Filing Status</span>
                            <div className="flex items-center gap-sm">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span className="font-data-mono text-data-mono text-emerald-700">Ready to File</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-md">
                        <button onClick={handleFileReturn} className="px-xl py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors flex items-center gap-sm">
                            File Annual Return
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default GSTR9Page;
