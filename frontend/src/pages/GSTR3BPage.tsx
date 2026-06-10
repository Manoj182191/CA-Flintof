import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gstService } from '../services/gstService';

const GSTR3BPage: React.FC = () => {
    const navigate = useNavigate();
    const { activeCompanyId } = useAuth();
    const [gstr3bData, setGstr3bData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        'table-31': true,
        'table-4': false
    });

    useEffect(() => {
        if (activeCompanyId) {
            fetchData();
        }
    }, [activeCompanyId, month, year]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await gstService.getGSTR3B(parseInt(activeCompanyId!), month, year);
            setGstr3bData(data);
        } catch (error) {
            console.error('Failed to fetch GSTR-3B data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSection = (id: string) => {
        setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleFileReturn = async () => {
        if (!gstr3bData) return;
        try {
            const payload = {
                company_id: parseInt(activeCompanyId!),
                return_type: 'GSTR-3B',
                month,
                year,
                total_supply: gstr3bData.total_outward_taxable,
                total_tax: gstr3bData.total_outward_tax
            };
            await gstService.createReturn(payload);
            alert("Draft GSTR-3B Created successfully. Proceed to payment offset.");
            navigate('/gst');
        } catch (err: any) {
            alert(err.response?.data?.detail || "Failed to create return");
        }
    };

    return (
        <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col relative overflow-hidden h-screen">
            <header className="bg-surface/70 backdrop-blur-xl z-50 sticky top-0 border-b border-outline-variant/30 shadow-sm flex justify-between items-center w-full px-gutter h-16">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/gst')} className="text-primary cursor-pointer active:scale-95 duration-200 material-symbols-outlined">
                        arrow_back
                    </button>
                    <h1 className="font-headline-md text-headline-md font-bold text-primary">GSTR-3B Filing Wizard</h1>
                </div>
                <div className="flex items-center gap-gutter">
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
                </div>
            </header>

            <main className="max-w-[1440px] mx-auto flex flex-col w-full flex-1 overflow-y-auto">
                <section className="flex-1 p-gutter md:p-xl space-y-lg overflow-x-hidden">
                    <div className="w-full flex items-center justify-between mb-lg relative">
                        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-outline-variant/30 -z-10 -translate-y-1/2"></div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold ring-4 ring-background">1</div>
                            <span className="text-xs font-bold text-primary">Liability & ITC</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-bold ring-4 ring-background">2</div>
                            <span className="text-xs text-on-surface-variant">System Offset</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-bold ring-4 ring-background">3</div>
                            <span className="text-xs text-on-surface-variant">Payment</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-bold ring-4 ring-background">4</div>
                            <span className="text-xs text-on-surface-variant">File Return</span>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="font-headline-lg text-headline-lg text-primary">Liability & ITC Summary</h2>
                            <p className="text-on-surface-variant">Review auto-populated data from GSTR-1 and GSTR-2B before filing.</p>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                                <div className="bg-surface-container-lowest border border-outline-variant/20 p-lg rounded-xl shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-md">
                                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Total Tax Liability</span>
                                        <div className="p-2 bg-primary/5 text-primary rounded-lg">
                                            <span className="material-symbols-outlined">trending_up</span>
                                        </div>
                                    </div>
                                    <p className="font-data-mono text-headline-lg text-primary">₹ {gstr3bData?.total_outward_tax || 0}</p>
                                </div>
                                <div className="bg-surface-container-lowest border border-outline-variant/20 p-lg rounded-xl shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-md">
                                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Eligible ITC</span>
                                        <div className="p-2 bg-secondary/5 text-secondary rounded-lg">
                                            <span className="material-symbols-outlined">account_balance_wallet</span>
                                        </div>
                                    </div>
                                    <p className="font-data-mono text-headline-lg text-secondary">₹ {gstr3bData?.total_itc || 0}</p>
                                </div>
                                <div className="bg-primary text-white p-lg rounded-xl shadow-lg relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-md">
                                            <span className="text-xs font-bold text-primary-fixed uppercase tracking-widest">Net Tax Payable</span>
                                            <div className="p-2 bg-white/10 text-white rounded-lg">
                                                <span className="material-symbols-outlined">payments</span>
                                            </div>
                                        </div>
                                        <p className="font-data-mono text-headline-lg">₹ {gstr3bData?.['6_tax_payable']?.total || 0}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-md">
                                <h3 className="font-headline-md text-primary mt-lg">Detailed Table Breakdown</h3>
                                
                                {/* Table 3.1 */}
                                <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl overflow-hidden">
                                    <button className="w-full flex items-center justify-between p-md hover:bg-surface-container transition-colors" onClick={() => toggleSection('table-31')}>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded">3.1</span>
                                            <span className="font-bold text-on-surface">Details of Outward Supplies</span>
                                        </div>
                                        <span className={`material-symbols-outlined transition-transform ${openSections['table-31'] ? 'rotate-180' : ''}`}>expand_more</span>
                                    </button>
                                    {openSections['table-31'] && (
                                        <div className="border-t border-outline-variant/10 overflow-x-auto">
                                            <table className="w-full text-left font-body-md text-sm">
                                                <thead className="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-wider">
                                                    <tr>
                                                        <th className="font-bold p-2">Nature of Supplies</th>
                                                        <th className="font-bold text-right p-2">Taxable Value</th>
                                                        <th className="font-bold text-right p-2">IGST</th>
                                                        <th className="font-bold text-right p-2">CGST</th>
                                                        <th className="font-bold text-right p-2">SGST</th>
                                                        <th className="font-bold text-right p-2">Cess</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-outline-variant/10">
                                                    {gstr3bData?.['3.1_outward_supplies']?.map((row: any, i: number) => (
                                                        <tr key={i}>
                                                            <td className="p-2">Outward taxable supplies ({row.gst_rate}%)</td>
                                                            <td className="text-right font-data-mono p-2">₹ {row.taxable_value}</td>
                                                            <td className="text-right font-data-mono p-2">₹ {row.igst}</td>
                                                            <td className="text-right font-data-mono p-2">₹ {row.cgst}</td>
                                                            <td className="text-right font-data-mono p-2">₹ {row.sgst}</td>
                                                            <td className="text-right font-data-mono p-2">₹ {row.cess}</td>
                                                        </tr>
                                                    ))}
                                                    <tr className="bg-primary/5 font-bold">
                                                        <td className="p-2">Total</td>
                                                        <td className="text-right font-data-mono p-2">₹ {gstr3bData?.total_outward_taxable}</td>
                                                        <td className="text-right font-data-mono text-primary p-2" colSpan={4}>₹ {gstr3bData?.total_outward_tax} Total Tax</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>

                                {/* Table 4 */}
                                <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl overflow-hidden">
                                    <button className="w-full flex items-center justify-between p-md hover:bg-surface-container transition-colors" onClick={() => toggleSection('table-4')}>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-bold bg-secondary/10 text-secondary px-2 py-1 rounded">4.0</span>
                                            <span className="font-bold text-on-surface">Eligible ITC</span>
                                        </div>
                                        <span className={`material-symbols-outlined transition-transform ${openSections['table-4'] ? 'rotate-180' : ''}`}>expand_more</span>
                                    </button>
                                    {openSections['table-4'] && (
                                        <div className="border-t border-outline-variant/10 overflow-x-auto">
                                            <table className="w-full text-left font-body-md text-sm">
                                                <thead className="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-wider">
                                                    <tr>
                                                        <th className="font-bold p-2">Details</th>
                                                        <th className="font-bold text-right p-2">IGST</th>
                                                        <th className="font-bold text-right p-2">CGST</th>
                                                        <th className="font-bold text-right p-2">SGST</th>
                                                        <th className="font-bold text-right p-2">Cess</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-outline-variant/10">
                                                    {gstr3bData?.['4_itc']?.map((row: any, i: number) => (
                                                        <tr key={i}>
                                                            <td className="p-2">ITC Available ({row.gst_rate}%)</td>
                                                            <td className="text-right font-data-mono p-2">₹ {row.igst}</td>
                                                            <td className="text-right font-data-mono p-2">₹ {row.cgst}</td>
                                                            <td className="text-right font-data-mono p-2">₹ {row.sgst}</td>
                                                            <td className="text-right font-data-mono p-2">₹ {row.cess}</td>
                                                        </tr>
                                                    ))}
                                                    <tr className="bg-secondary/5 font-bold">
                                                        <td className="p-2">Total Eligible ITC</td>
                                                        <td className="text-right font-data-mono text-secondary p-2" colSpan={4}>₹ {gstr3bData?.total_itc} Total ITC</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-container/30 p-md rounded-xl border border-outline-variant/20 mt-xl">
                                <div className="flex items-center gap-2 text-on-surface-variant">
                                    <span className="material-symbols-outlined text-primary">info</span>
                                    <span className="text-xs">Next Step: System will calculate optimal ITC utilization to minimize cash payout.</span>
                                </div>
                                <div className="flex gap-md w-full sm:w-auto">
                                    <button onClick={handleFileReturn} className="flex-1 sm:flex-none px-gutter py-3 rounded-lg border border-outline font-bold hover:bg-surface-container transition-all">Save Draft</button>
                                    <button onClick={handleFileReturn} className="flex-1 sm:flex-none px-gutter py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-md active:scale-95">Proceed to Offset</button>
                                </div>
                            </div>
                        </>
                    )}
                </section>
            </main>
        </div>
    );
};

export default GSTR3BPage;
