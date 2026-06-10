import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gstService } from '../services/gstService';

const GSTR1Page: React.FC = () => {
    const navigate = useNavigate();
    const { activeCompanyId } = useAuth();
    const [gstr1Data, setGstr1Data] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        if (activeCompanyId) {
            fetchData();
        }
    }, [activeCompanyId, month, year]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await gstService.getGSTR1(parseInt(activeCompanyId!), month, year);
            setGstr1Data(data);
        } catch (error) {
            console.error('Failed to fetch GSTR-1 data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileReturn = async () => {
        if (!gstr1Data) return;
        try {
            const payload = {
                company_id: parseInt(activeCompanyId!),
                return_type: 'GSTR-1',
                month,
                year,
                total_supply: gstr1Data.summary.total_taxable_value,
                total_tax: gstr1Data.summary.total_tax
            };
            await gstService.createReturn(payload);
            alert("Draft GSTR-1 Created successfully. In a real app, this would proceed to filing.");
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
                    <h1 className="font-headline-md text-headline-md font-bold text-primary">GSTR-1 Filing Wizard</h1>
                </div>
                <div className="flex items-center gap-md">
                    <input 
                        type="month" 
                        value={`${year}-${String(month).padStart(2, '0')}`}
                        onChange={(e) => {
                            const [y, m] = e.target.value.split('-');
                            setYear(parseInt(y));
                            setMonth(parseInt(m));
                        }}
                        className="text-on-surface-variant font-label-sm text-label-sm border border-outline-variant rounded px-2 py-1"
                    />
                    <div className="h-8 w-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-xs">VM</div>
                </div>
            </header>

            <main className="max-w-[1440px] mx-auto p-gutter pb-32">
                <nav className="relative flex justify-between items-center mb-xl max-w-3xl mx-auto">
                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-outline-variant/30 -translate-y-1/2 -z-10"></div>
                    <div className="flex flex-col items-center gap-xs z-10">
                        <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold shadow-lg ring-4 ring-secondary/20">1</div>
                        <span className="font-label-sm text-label-sm text-secondary">Validation</span>
                    </div>
                    <div className="flex flex-col items-center gap-xs z-10">
                        <div className="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold">2</div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">Review</span>
                    </div>
                    <div className="flex flex-col items-center gap-xs z-10">
                        <div className="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold">3</div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">Summary</span>
                    </div>
                    <div className="flex flex-col items-center gap-xs z-10">
                        <div className="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold">4</div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">File</span>
                    </div>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
                    <div className="lg:col-span-5 flex flex-col gap-lg">
                        <section className="glass-panel rounded-xl p-xl flex flex-col items-center text-center bg-white/70 backdrop-blur-md border border-slate-200">
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
                            ) : (
                                <>
                                    <div className="relative w-48 h-48 mb-lg flex items-center justify-center">
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="font-display-lg text-display-lg text-primary">100%</span>
                                            <span className="font-label-sm text-label-sm text-on-surface-variant">Processed</span>
                                        </div>
                                    </div>
                                    <h2 className="font-headline-md text-headline-md text-primary mb-xs">Data Verified</h2>
                                    <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">Data fetched from books and ready for GSTR-1 review.</p>
                                    <div className="mt-xl w-full flex flex-col gap-sm">
                                        <div className="flex justify-between items-center px-md py-sm bg-surface-container-low rounded-lg">
                                            <span className="text-body-md text-on-surface-variant">Total Invoices</span>
                                            <span className="font-data-mono text-data-mono text-primary">{gstr1Data?.summary?.total_invoices || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center px-md py-sm bg-surface-container-low rounded-lg">
                                            <span className="text-body-md text-on-surface-variant">B2B / B2C Count</span>
                                            <span className="font-data-mono text-data-mono text-primary">{gstr1Data?.summary?.b2b_count || 0} / {gstr1Data?.summary?.b2c_count || 0}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </section>
                        
                        <section className="ai-glow bg-surface-container-lowest border border-secondary/20 rounded-xl p-lg" style={{boxShadow: '0 0 15px rgba(79, 70, 229, 0.15)'}}>
                            <div className="flex items-start gap-md">
                                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-white" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
                                </div>
                                <div>
                                    <h3 className="font-headline-md text-headline-md text-primary mb-xs">HSN Summary Analysis</h3>
                                    <p className="font-body-md text-body-md text-on-surface-variant">
                                        You have {gstr1Data?.hsn_summary?.length || 0} HSN codes summarized for this period. Ensure the summary accurately reflects outward supplies.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="lg:col-span-7 flex flex-col gap-lg">
                        <section className="glass-panel rounded-xl overflow-hidden bg-white/70 backdrop-blur-md border border-slate-200">
                            <div className="p-lg border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-high/30">
                                <div className="flex items-center gap-sm">
                                    <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>fact_check</span>
                                    <h3 className="font-headline-md text-headline-md text-primary">Summary Data</h3>
                                </div>
                            </div>
                            <div className="divide-y divide-outline-variant/20">
                                {/* Taxable Value Row */}
                                <div className="p-lg hover:bg-surface-container-low transition-colors group">
                                    <div className="flex justify-between items-start mb-sm">
                                        <div className="flex flex-col">
                                            <span className="font-label-sm text-label-sm text-secondary mb-xs">4A, 4B, 4C, 6B, 6C</span>
                                            <h4 className="font-headline-md text-headline-md text-primary">B2B Invoices</h4>
                                        </div>
                                        <span className="font-data-mono font-bold text-primary">₹ {gstr1Data?.summary?.total_taxable_value || 0} Taxable</span>
                                    </div>
                                    <div className="flex gap-lg text-body-md text-on-surface-variant mb-md">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase tracking-wider opacity-60">Total Tax</span>
                                            <span className="font-data-mono">₹ {gstr1Data?.summary?.total_tax || 0}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* HSN Row */}
                                <div className="p-lg hover:bg-surface-container-low transition-colors group">
                                    <div className="flex justify-between items-start mb-sm">
                                        <div className="flex flex-col">
                                            <span className="font-label-sm text-label-sm text-secondary mb-xs">12</span>
                                            <h4 className="font-headline-md text-headline-md text-primary">HSN-wise Summary of Outward Supplies</h4>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-sm">
                                            <thead>
                                                <tr className="text-left font-label-sm text-on-surface-variant border-b border-outline-variant/20">
                                                    <th className="py-2 pr-4">HSN</th>
                                                    <th className="py-2 pr-4">Description</th>
                                                    <th className="py-2 pr-4 text-right">Taxable</th>
                                                    <th className="py-2 pr-4 text-right">Tax</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {gstr1Data?.hsn_summary?.map((h: any, i: number) => (
                                                    <tr key={i} className="border-b border-outline-variant/10">
                                                        <td className="py-2 pr-4 font-data-mono">{h.hsn_code}</td>
                                                        <td className="py-2 pr-4">{h.description}</td>
                                                        <td className="py-2 pr-4 text-right font-data-mono">₹{h.taxable_value}</td>
                                                        <td className="py-2 pr-4 text-right font-data-mono">₹{h.tax}</td>
                                                    </tr>
                                                ))}
                                                {(!gstr1Data?.hsn_summary || gstr1Data.hsn_summary.length === 0) && (
                                                    <tr>
                                                        <td colSpan={4} className="py-4 text-center text-on-surface-variant">No HSN data found</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
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
                            <span className="text-[10px] uppercase font-bold text-on-surface-variant">Validation Status</span>
                            <div className="flex items-center gap-sm">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span className="font-data-mono text-data-mono text-primary">Ready to File</span>
                            </div>
                        </div>
                        <div className="h-8 w-[1px] bg-outline-variant/30 hidden md:block"></div>
                        <div className="hidden md:flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-on-surface-variant">Total Liability</span>
                            <span className="font-data-mono text-data-mono text-primary">₹ {gstr1Data?.summary?.total_tax || '0.00'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-md">
                        <button onClick={handleFileReturn} className="px-xl py-3 bg-primary text-on-primary rounded-lg font-bold hover:bg-secondary transition-colors flex items-center gap-sm">
                            Create Draft Return
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default GSTR1Page;
