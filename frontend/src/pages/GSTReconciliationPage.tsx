import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gstService } from '../services/gstService';

const GSTReconciliationPage: React.FC = () => {
    const navigate = useNavigate();
    const { activeCompanyId } = useAuth();
    const [reconData, setReconData] = useState<any>(null);
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
            const data = await gstService.getReconciliation(parseInt(activeCompanyId!), month, year);
            setReconData(data);
        } catch (error) {
            console.error('Failed to fetch Reconciliation data', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-surface text-on-surface font-body-md overflow-hidden h-screen flex flex-col relative">
            <header className="sticky top-0 w-full z-40 bg-surface/70 backdrop-blur-md border-b border-outline-variant/30 flex justify-between items-center px-lg py-sm">
                <div className="flex items-center gap-md">
                    <button onClick={() => navigate('/gst')} className="material-symbols-outlined text-primary hover:text-secondary cursor-pointer">arrow_back</button>
                    <span className="material-symbols-outlined text-error">warning</span>
                    <h2 className="font-headline-md text-headline-md text-primary">GST Reconciliation</h2>
                </div>
                <div className="flex items-center gap-lg">
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

            <div className="flex-1 overflow-y-auto p-lg custom-scrollbar">
                <div className="max-w-container-max mx-auto space-y-lg">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-lg">
                                <div className="glass-card p-lg rounded-xl flex flex-col justify-between">
                                    <h3 className="font-label-sm text-on-surface-variant uppercase tracking-wider">Books ITC</h3>
                                    <p className="font-headline-lg text-primary mt-2">₹{reconData?.books_itc || 0}</p>
                                </div>
                                <div className="glass-card p-lg rounded-xl flex flex-col justify-between">
                                    <h3 className="font-label-sm text-on-surface-variant uppercase tracking-wider">GSTR-2A/2B ITC</h3>
                                    <p className="font-headline-lg text-secondary mt-2">₹{reconData?.['2a_itc'] || 0}</p>
                                </div>
                                <div className="glass-card p-lg rounded-xl flex flex-col justify-between border-error">
                                    <h3 className="font-label-sm text-on-surface-variant uppercase tracking-wider">Pending/Variance</h3>
                                    <p className="font-headline-lg text-error mt-2">₹{reconData?.pending_itc || 0}</p>
                                </div>
                            </div>

                            <div className="glass-card rounded-xl overflow-hidden flex flex-col">
                                <div className="p-lg border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest/50">
                                    <div className="flex items-center gap-sm">
                                        <h3 className="font-bold text-primary">Mismatch Detection (Unmatched in Books)</h3>
                                    </div>
                                    <span className="bg-error-container text-on-error-container px-3 py-1 rounded-full font-label-sm text-label-sm">
                                        {reconData?.unmatched_in_books?.length || 0} Alerts
                                    </span>
                                </div>
                                
                                {reconData?.recommendation && (
                                    <div className="p-md bg-primary-container text-white m-4 rounded-lg flex gap-3 items-start">
                                        <span className="material-symbols-outlined text-sm">info</span>
                                        <p className="text-sm">{reconData.recommendation}</p>
                                    </div>
                                )}

                                <div className="flex-1 p-lg overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="text-xs font-label-sm text-on-surface-variant border-b border-outline-variant/20">
                                                <th className="pb-sm px-xs">INVOICE #</th>
                                                <th className="pb-sm px-xs">DATE</th>
                                                <th className="pb-sm px-xs">SUPPLIER GSTIN</th>
                                                <th className="pb-sm px-xs">TAXABLE</th>
                                                <th className="pb-sm px-xs">TAX</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-xs md:text-sm font-data-mono">
                                            {reconData?.unmatched_in_books?.map((row: any, i: number) => (
                                                <tr key={i} className="hover:bg-surface-container-low transition-colors group border-b border-outline-variant/10">
                                                    <td className="py-md px-xs font-bold text-primary">{row.invoice_number}</td>
                                                    <td className="py-md px-xs">{row.invoice_date}</td>
                                                    <td className="py-md px-xs">{row.supplier_gstin || 'Unregistered'}</td>
                                                    <td className="py-md px-xs">₹{row.taxable}</td>
                                                    <td className="py-md px-xs text-error font-bold">₹{row.tax}</td>
                                                </tr>
                                            ))}
                                            {(!reconData?.unmatched_in_books || reconData.unmatched_in_books.length === 0) && (
                                                <tr>
                                                    <td colSpan={5} className="py-4 text-center text-on-surface-variant">No mismatches found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GSTReconciliationPage;
