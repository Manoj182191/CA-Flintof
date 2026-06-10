import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gstService, GSTDashboardData, GSTReturn } from '../services/gstService';

const GSTDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { activeCompanyId } = useAuth();
    const [dashboardData, setDashboardData] = useState<GSTDashboardData | null>(null);
    const [returns, setReturns] = useState<GSTReturn[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (activeCompanyId) {
            fetchData();
        }
    }, [activeCompanyId]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [dash, retList] = await Promise.all([
                gstService.getDashboard(parseInt(activeCompanyId!)),
                gstService.getReturns(parseInt(activeCompanyId!))
            ]);
            setDashboardData(dash);
            setReturns(retList);
        } catch (error) {
            console.error('Failed to fetch GST data', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-surface text-on-surface font-body-md overflow-hidden h-screen flex flex-col relative">
            <header className="sticky top-0 w-full z-40 bg-surface/70 backdrop-blur-md border-b border-outline-variant/30 flex justify-between items-center px-lg py-sm">
                <div className="flex items-center gap-md">
                    <button onClick={() => navigate('/dashboard')} className="material-symbols-outlined text-primary hover:text-secondary cursor-pointer">arrow_back</button>
                    <span className="material-symbols-outlined text-primary">account_balance</span>
                    <h2 className="font-headline-md text-headline-md text-primary">GST Compliance Center</h2>
                </div>
                <div className="flex items-center gap-lg">
                    <div className="hidden lg:flex items-center gap-sm px-md py-xs bg-surface-container rounded-full border border-outline-variant/30">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-xs font-medium text-on-surface-variant">Portal Status: Live</span>
                    </div>
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
                            {/* Hero Section: Stats & AI Focus */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
                                {/* Filing Calendar & Summary */}
                                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-md">
                                    <div className="glass-card p-lg rounded-xl flex flex-col justify-between h-48 cursor-pointer hover:border-secondary transition-colors" onClick={() => navigate('/gst/gstr1')}>
                                        <div className="flex justify-between items-start">
                                            <span className="material-symbols-outlined text-secondary">event_repeat</span>
                                            <span className="text-xs font-bold text-error uppercase">GSTR-1</span>
                                        </div>
                                        <div>
                                            <h3 className="font-label-sm text-on-surface-variant">File Outward Supplies</h3>
                                            <p className="font-headline-lg text-primary text-xl mt-2">Start Filing →</p>
                                        </div>
                                    </div>
                                    <div className="glass-card p-lg rounded-xl flex flex-col justify-between h-48 cursor-pointer hover:border-secondary transition-colors" onClick={() => navigate('/gst/gstr3b')}>
                                        <div className="flex justify-between items-start">
                                            <span className="material-symbols-outlined text-secondary">account_balance</span>
                                            <span className="text-xs font-bold text-primary uppercase">GSTR-3B</span>
                                        </div>
                                        <div>
                                            <h3 className="font-label-sm text-on-surface-variant">Monthly Return & ITC</h3>
                                            <p className="font-headline-lg text-primary text-xl mt-2">Start Filing →</p>
                                        </div>
                                    </div>
                                    <div className="glass-card p-lg rounded-xl flex flex-col justify-between h-48 cursor-pointer hover:border-emerald-600 transition-colors" onClick={() => navigate('/gst/gstr9')}>
                                        <div className="flex justify-between items-start">
                                            <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                                            <span className="text-xs font-bold text-emerald-600 uppercase">GSTR-9</span>
                                        </div>
                                        <div>
                                            <h3 className="font-label-sm text-on-surface-variant">Annual Return</h3>
                                            <p className="font-headline-lg text-primary text-xl mt-2">View Report →</p>
                                        </div>
                                    </div>
                                </div>
                                {/* AI GST Assistant Panel */}
                                <div className="lg:col-span-4 border border-outline-variant/30 bg-white rounded-xl p-lg flex flex-col gap-md relative overflow-hidden" style={{boxShadow: '0 0 20px rgba(79, 70, 229, 0.12)'}}>
                                    <div className="flex items-center gap-sm">
                                        <div className="bg-primary-container p-sm rounded-lg">
                                            <span className="material-symbols-outlined text-white text-sm" style={{fontVariationSettings: "'FILL' 1"}}>smart_toy</span>
                                        </div>
                                        <span className="font-bold text-primary">AI GST Assistant</span>
                                    </div>
                                    <div className="space-y-sm">
                                        <p className="text-sm font-medium text-on-surface">Tax Liability Summary</p>
                                        <p className="text-xs text-on-surface-variant leading-relaxed">
                                            Total Tax Liability: <span className="font-bold text-error">₹{dashboardData?.total_tax_liability?.toFixed(2) || '0.00'}</span><br/>
                                            Total ITC Available: <span className="font-bold text-emerald-600">₹{dashboardData?.total_itc_available?.toFixed(2) || '0.00'}</span><br/>
                                            Net Tax Payable: <span className="font-bold text-primary">₹{dashboardData?.net_tax_payable?.toFixed(2) || '0.00'}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Bento Grid: Mismatch Detection & Detailed Status */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
                                {/* Mismatch Detection Alerts -> GST Reconciliation */}
                                <div className="lg:col-span-2 glass-card rounded-xl overflow-hidden flex flex-col">
                                    <div className="p-lg border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest/50">
                                        <div className="flex items-center gap-sm">
                                            <span className="material-symbols-outlined text-error">warning</span>
                                            <h3 className="font-bold text-primary">GST Reconciliation</h3>
                                        </div>
                                        <button onClick={() => navigate('/gst/reconciliation')} className="text-xs font-bold text-secondary hover:underline">View Reconciliation Report →</button>
                                    </div>
                                    <div className="flex-1 p-lg overflow-x-auto">
                                        <p className="text-sm text-on-surface-variant mb-4">Books ITC vs GSTR-2A/2B Data mismatches will appear here during reconciliation.</p>
                                        <button onClick={() => navigate('/gst/reconciliation')} className="px-sm py-xs border border-outline-variant rounded hover:bg-surface-container-low transition-colors text-sm font-medium">Run Reconciliation</button>
                                    </div>
                                </div>
                                {/* Entity Filing Tracker -> Returns List */}
                                <div className="glass-card rounded-xl p-lg flex flex-col">
                                    <h3 className="font-bold text-primary mb-lg">Recent Returns</h3>
                                    <div className="space-y-md">
                                        {returns.slice(0, 4).map(ret => (
                                            <div key={ret.id} className="flex items-center justify-between p-sm rounded-lg bg-surface-container-low border border-outline-variant/10">
                                                <div className="flex items-center gap-md">
                                                    <div className="w-8 h-8 rounded bg-primary-container text-white flex items-center justify-center font-bold text-xs">{ret.return_type.substring(0,2)}</div>
                                                    <div>
                                                        <p className="text-sm font-bold">{ret.return_type}</p>
                                                        <p className="text-[10px] text-on-surface-variant">{ret.month}/{ret.year}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold ${ret.status === 'Filed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {ret.status}
                                                </span>
                                            </div>
                                        ))}
                                        {returns.length === 0 && <p className="text-xs text-on-surface-variant">No returns found.</p>}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GSTDashboardPage;
