import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';

const FinancialStatementsHubPage: React.FC = () => {
    const navigate = useNavigate();
    const { activeCompanyId } = useAuth();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (activeCompanyId) {
            fetchData();
        }
    }, [activeCompanyId]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Placeholder for API integration
            // const response = await apiClient.get(`/api-endpoint/${activeCompanyId}`);
            // setData(response.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="stitch-app">
            
{/*  TopAppBar  */}
<header className="bg-surface/70 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm flex justify-between items-center w-full px-gutter h-16 z-50 sticky top-0">
<div className="flex items-center gap-md">
<button className="text-primary cursor-pointer active:scale-95 duration-200">
<span className="material-symbols-outlined">menu</span>
</button>
<h1 className="font-headline-md text-headline-md font-bold text-primary">FinPilot Pro</h1>
</div>
<div className="flex items-center gap-md">
<button className="hidden md:flex items-center gap-xs px-md py-sm rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm active:scale-95 transition-transform">
<span className="material-symbols-outlined text-[18px]">bolt</span>
<span>AI Insights</span>
</button>
<img alt="User Profile" className="w-10 h-10 rounded-full border-2 border-primary-fixed" data-alt="A professional close-up headshot of a senior financial analyst in a modern corporate office setting. The lighting is soft and flattering, with a clean, high-key background. The overall aesthetic is professional, modern, and trustworthy, matching a premium financial software interface with blue and white tones." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrUGmzCQnUhuciIbk_JmHDx2EtBZGdt8eYw8204U2xMHQWdHDrk_zKlcglk6g_NZsqY1j-iRJZhWBHWgaCG_3qY_fhRMuD__qia0YL7fCUAmAfdzknznsibh_udvkZ-YxuJnRLz32xJIj4fyIXJSBXSNGUU_Z-1m9g4KZGGR4NrD7Xio8Br4WDRKExl5_NMR-KEYDvpWGAf3Or1ulCraNQFSn8f_sJ_YklPK99pY6STjcfkVWep5ju6gkt3rQDFwuKtVu_LcpvbW8"/>
</div>
</header>
<main className="max-w-container-max mx-auto px-gutter py-lg">
{/*  Breadcrumbs & Header  */}
<div className="mb-xl">
<nav className="flex items-center gap-xs text-on-surface-variant mb-base font-label-sm text-label-sm">
<span>Reports</span>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span className="text-primary font-bold">Financial Statements</span>
</nav>
<div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
<div>
<h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">Financial Statements Hub</h2>
<p className="text-on-surface-variant font-body-md mt-xs max-w-2xl">Access real-time intelligence for your fundamental fiscal records. Audited, reconciled, and AI-validated.</p>
</div>
<div className="flex gap-sm">
<button className="flex items-center gap-xs px-md py-sm rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-colors font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[18px]">filter_list</span>
<span>FY 2023-24</span>
</button>
<button className="flex items-center gap-xs px-md py-sm rounded-lg bg-primary text-on-primary hover:opacity-90 transition-opacity font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[18px]">add</span>
<span>Generate New</span>
</button>
</div>
</div>
</div>
{/*  Statements Grid (Bento Style)  */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg mb-xl">
{/*  Balance Sheet Card  */}
<div className="glass-card rounded-xl p-lg flex flex-col justify-between hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden">
<div className="ai-shimmer absolute inset-0 opacity-20 pointer-events-none"></div>
<div className="relative z-10">
<div className="w-12 h-12 rounded-lg bg-primary-fixed/30 flex items-center justify-center text-primary mb-md">
<span className="material-symbols-outlined text-[28px]">account_balance</span>
</div>
<h3 className="font-headline-md text-headline-md text-primary mb-xs">Balance Sheet</h3>
<p className="text-on-surface-variant font-body-md line-clamp-2">Snapshot of company assets, liabilities, and equity at a specific point in time.</p>
</div>
<div className="mt-lg pt-md border-t border-outline-variant/30 flex items-center justify-between relative z-10">
<div className="flex flex-col">
<span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Last Generated</span>
<span className="font-data-mono text-data-mono text-primary">Oct 24, 14:20</span>
</div>
<button className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
<span className="material-symbols-outlined">download</span>
</button>
</div>
</div>
{/*  Profit & Loss Card  */}
<div className="glass-card rounded-xl p-lg flex flex-col justify-between hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden">
<div className="relative z-10">
<div className="w-12 h-12 rounded-lg bg-secondary-fixed/30 flex items-center justify-center text-secondary mb-md">
<span className="material-symbols-outlined text-[28px]">trending_up</span>
</div>
<h3 className="font-headline-md text-headline-md text-primary mb-xs">Profit & Loss</h3>
<p className="text-on-surface-variant font-body-md line-clamp-2">Summary of revenues, costs, and expenses incurred during a specific period.</p>
</div>
<div className="mt-lg pt-md border-t border-outline-variant/30 flex items-center justify-between relative z-10">
<div className="flex flex-col">
<span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Last Generated</span>
<span className="font-data-mono text-data-mono text-primary">Oct 26, 09:15</span>
</div>
<button className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
<span className="material-symbols-outlined">download</span>
</button>
</div>
</div>
{/*  Trial Balance Card  */}
<div className="glass-card rounded-xl p-lg flex flex-col justify-between hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden">
<div className="relative z-10">
<div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface-variant mb-md">
<span className="material-symbols-outlined text-[28px]">balance</span>
</div>
<h3 className="font-headline-md text-headline-md text-primary mb-xs">Trial Balance</h3>
<p className="text-on-surface-variant font-body-md line-clamp-2">A bookkeeping worksheet in which the balance of all ledgers are compiled.</p>
</div>
<div className="mt-lg pt-md border-t border-outline-variant/30 flex items-center justify-between relative z-10">
<div className="flex flex-col">
<span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Last Generated</span>
<span className="font-data-mono text-data-mono text-primary">Oct 27, 18:40</span>
</div>
<button className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
<span className="material-symbols-outlined">download</span>
</button>
</div>
</div>
{/*  Cash Flow Card  */}
<div className="glass-card rounded-xl p-lg flex flex-col justify-between hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden">
<div className="relative z-10">
<div className="w-12 h-12 rounded-lg bg-tertiary-fixed/30 flex items-center justify-center text-tertiary-fixed-dim mb-md" style={{ color: '#5516be' }}>
<span className="material-symbols-outlined text-[28px]">payments</span>
</div>
<h3 className="font-headline-md text-headline-md text-primary mb-xs">Cash Flow</h3>
<p className="text-on-surface-variant font-body-md line-clamp-2">Detailed mapping of incoming and outgoing cash and cash equivalents.</p>
</div>
<div className="mt-lg pt-md border-t border-outline-variant/30 flex items-center justify-between relative z-10">
<div className="flex flex-col">
<span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Last Generated</span>
<span className="font-data-mono text-data-mono text-primary">Oct 28, 11:30</span>
</div>
<button className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
<span className="material-symbols-outlined">download</span>
</button>
</div>
</div>
</div>
{/*  Detailed AI Analysis / Visual Context  */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-lg mb-xl">
{/*  Intelligence Panel  */}
<div className="lg:col-span-2 glass-card rounded-xl overflow-hidden">
<div className="p-lg border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low/50">
<div className="flex items-center gap-sm">
<span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: '"FILL" 1' }}>auto_awesome</span>
<h4 className="font-headline-md text-headline-md text-primary">Reporting Intelligence</h4>
</div>
<span className="px-sm py-1 bg-secondary/10 text-secondary text-label-sm font-label-sm rounded-full">Active Monitoring</span>
</div>
<div className="p-lg">
<div className="space-y-md">
<div className="flex gap-md items-start p-md bg-secondary-container/10 border border-secondary/20 rounded-lg">
<div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white flex-shrink-0">
<span className="material-symbols-outlined text-[18px]">info</span>
</div>
<div>
<p className="text-primary font-bold font-body-md">Variance Alert: P&L Statement</p>
<p className="text-on-surface-variant font-body-md mt-xs">Operating expenses have increased by 14% compared to the previous quarter. AI suggests reviewing "Marketing Outreach" and "Cloud Infrastructure" sub-ledgers for anomalies.</p>
<button className="mt-md text-secondary font-bold text-label-sm flex items-center gap-xs">
                                    Analyze Variance <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</div>
</div>
{/*  Visual KPI placeholders  */}
<div className="grid grid-cols-2 md:grid-cols-3 gap-md mt-lg">
<div className="p-md rounded-lg bg-surface-container-low border border-outline-variant/20">
<span className="block text-on-surface-variant text-[10px] uppercase font-bold tracking-widest mb-xs">Net Margin</span>
<div className="flex items-end justify-between">
<span className="font-data-mono text-headline-md text-primary">24.8%</span>
<span className="text-emerald-600 flex items-center font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[16px]">north_east</span> 2.1%
                                    </span>
</div>
</div>
<div className="p-md rounded-lg bg-surface-container-low border border-outline-variant/20">
<span className="block text-on-surface-variant text-[10px] uppercase font-bold tracking-widest mb-xs">Current Ratio</span>
<div className="flex items-end justify-between">
<span className="font-data-mono text-headline-md text-primary">1.85</span>
<span className="text-emerald-600 flex items-center font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[16px]">check_circle</span> Stable
                                    </span>
</div>
</div>
<div className="hidden md:block p-md rounded-lg bg-surface-container-low border border-outline-variant/20">
<span className="block text-on-surface-variant text-[10px] uppercase font-bold tracking-widest mb-xs">Cash Runway</span>
<div className="flex items-end justify-between">
<span className="font-data-mono text-headline-md text-primary">18m</span>
<span className="text-on-surface-variant flex items-center font-label-sm text-label-sm">
                                        Projected
                                    </span>
</div>
</div>
</div>
</div>
</div>
</div>
{/*  Side Utility: Recent Activity  */}
<div className="glass-card rounded-xl p-lg">
<h4 className="font-headline-md text-headline-md text-primary mb-lg">Recent Downloads</h4>
<ul className="space-y-lg">
<li className="flex items-center gap-md">
<div className="w-10 h-10 rounded bg-red-100 flex items-center justify-center text-red-600">
<span className="material-symbols-outlined">picture_as_pdf</span>
</div>
<div className="flex-1">
<p className="font-bold text-primary font-body-md leading-tight">Q3_Profit_Loss.pdf</p>
<p className="text-on-surface-variant text-label-sm font-label-sm">Downloaded by Vikram Mehta</p>
</div>
<span className="text-on-surface-variant text-[10px] font-data-mono">2h ago</span>
</li>
<li className="flex items-center gap-md">
<div className="w-10 h-10 rounded bg-emerald-100 flex items-center justify-center text-emerald-600">
<span className="material-symbols-outlined">table_view</span>
</div>
<div className="flex-1">
<p className="font-bold text-primary font-body-md leading-tight">Audit_Trial_Balance.xlsx</p>
<p className="text-on-surface-variant text-label-sm font-label-sm">Generated by FinPilot AI</p>
</div>
<span className="text-on-surface-variant text-[10px] font-data-mono">5h ago</span>
</li>
<li className="flex items-center gap-md">
<div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center text-blue-600">
<span className="material-symbols-outlined">picture_as_pdf</span>
</div>
<div className="flex-1">
<p className="font-bold text-primary font-body-md leading-tight">FY24_Balance_Sheet.pdf</p>
<p className="text-on-surface-variant text-label-sm font-label-sm">Downloaded by System Admin</p>
</div>
<span className="text-on-surface-variant text-[10px] font-data-mono">1d ago</span>
</li>
</ul>
<button className="w-full mt-xl py-md text-center text-primary border border-outline-variant rounded-lg hover:bg-surface-container transition-colors font-label-sm text-label-sm">
                    View Full Audit Log
                </button>
</div>
</div>
</main>
{/*  BottomNavBar (Mobile Only)  */}
<nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center py-2 px-4 bg-surface border-t border-outline-variant/20 shadow-lg z-50">
<div className="flex flex-col items-center justify-center text-on-surface-variant">
<span className="material-symbols-outlined">home</span>
<span className="font-label-sm text-label-sm">Home</span>
</div>
<div className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-full px-4 py-1">
<span className="material-symbols-outlined">account_balance_wallet</span>
<span className="font-label-sm text-label-sm">Ledgers</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant">
<span className="material-symbols-outlined">verified_user</span>
<span className="font-label-sm text-label-sm">Compliance</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant">
<span className="material-symbols-outlined">groups</span>
<span className="font-label-sm text-label-sm">HR</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant">
<span className="material-symbols-outlined">more_horiz</span>
<span className="font-label-sm text-label-sm">More</span>
</div>
</nav>
{/*  Micro-interaction script  */}


        </div>
    );
};

export default FinancialStatementsHubPage;
