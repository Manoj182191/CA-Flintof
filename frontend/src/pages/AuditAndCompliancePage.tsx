import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';

const AuditAndCompliancePage: React.FC = () => {
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
            
{/*  NavigationDrawer (Web only)  */}
<aside className="hidden md:flex fixed h-full w-[280px] left-0 top-0 flex-col py-md px-sm bg-surface border-r border-outline-variant shadow-sm z-50">
<div className="mb-lg px-md">
<h1 className="font-display-lg text-display-lg text-primary">FinPilot Pro</h1>
<p className="font-body-md text-on-primary-container opacity-80 uppercase tracking-widest text-[10px]">Enterprise OS</p>
</div>
<nav className="flex-1 space-y-1">
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-low transition-all duration-200 ease-in-out" href="#">
<span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span className="font-body-md">Dashboard</span>
</a>
<a className="flex items-center gap-md px-md py-sm bg-secondary-container text-on-secondary-container rounded-lg font-bold transition-all duration-200 ease-in-out" href="#">
<span className="material-symbols-outlined" data-icon="account_balance_wallet">account_balance_wallet</span>
<span className="font-body-md">Ledgers</span>
</a>
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-low transition-all duration-200 ease-in-out" href="#">
<span className="material-symbols-outlined" data-icon="receipt_long">receipt_long</span>
<span className="font-body-md">Vouchers</span>
</a>
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-low transition-all duration-200 ease-in-out" href="#">
<span className="material-symbols-outlined" data-icon="account_balance">account_balance</span>
<span className="font-body-md">Taxes</span>
</a>
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-low transition-all duration-200 ease-in-out" href="#">
<span className="material-symbols-outlined" data-icon="settings">settings</span>
<span className="font-body-md">Settings</span>
</a>
</nav>
<div className="mt-auto p-md border-t border-outline-variant/30 flex items-center gap-sm">
<div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold">JD</div>
<div className="flex flex-col">
<span className="font-label-sm text-on-surface font-bold">John Doe</span>
<span className="text-[10px] text-on-surface-variant">v2.4.0</span>
</div>
</div>
</aside>
{/*  TopAppBar  */}
<header className="sticky top-0 w-full z-40 bg-surface/70 backdrop-blur-md border-b border-outline-variant/30 md:pl-[280px]">
<div className="flex justify-between items-center px-lg py-sm max-w-container-max mx-auto h-16">
<div className="flex items-center gap-md">
<span className="material-symbols-outlined text-primary scale-95 active:scale-90 transition-all" data-icon="search">search</span>
<h2 className="font-headline-md text-headline-md text-primary">Global Search</h2>
</div>
<div className="flex items-center gap-md">
<button className="p-2 rounded-full hover:bg-surface-container hover:text-secondary transition-colors">
<span className="material-symbols-outlined" data-icon="smart_toy">smart_toy</span>
</button>
<button className="md:hidden p-2">
<span className="material-symbols-outlined" data-icon="menu">menu</span>
</button>
</div>
</div>
</header>
<main className="md:ml-[280px] p-md md:p-lg space-y-lg pb-32 md:pb-lg">
{/*  Hero Section: Risk & Summary  */}
<section className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
{/*  Main Risk Score  */}
<div className="lg:col-span-4 glass-panel rounded-xl p-lg flex flex-col items-center justify-center text-center relative overflow-hidden group">
<div className="absolute inset-0 opacity-10 pointer-events-none">

</div>
<h3 className="font-label-sm text-on-surface-variant mb-md uppercase tracking-widest">Aggregate Risk Score</h3>
<div className="relative w-40 h-40 flex items-center justify-center">
<svg className="w-full h-full -rotate-90">
<circle className="text-surface-container" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" stroke-width="8"></circle>
<circle className="text-secondary transition-all duration-1000" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" stroke-dasharray="440" stroke-dashoffset="88" stroke-width="8"></circle>
</svg>
<div className="absolute inset-0 flex flex-col items-center justify-center">
<span className="font-display-lg text-display-lg text-primary">82</span>
<span className="font-label-sm text-secondary font-bold">STABLE</span>
</div>
</div>
<p className="mt-md font-body-md text-on-surface-variant max-w-[200px]">Risk decreased by 4.2% since the last audit period.</p>
</div>
{/*  Bento Grid: Key Metrics  */}
<div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-md">
<div className="bg-surface-container-low rounded-xl p-md flex flex-col justify-between border border-outline-variant/20">
<div className="flex justify-between items-start">
<div>
<p className="font-label-sm text-on-surface-variant">Active Audits</p>
<h4 className="font-headline-lg text-headline-lg text-primary">14</h4>
</div>
<span className="material-symbols-outlined text-secondary" data-icon="account_tree">account_tree</span>
</div>
<div className="h-1 w-full bg-surface-container rounded-full mt-md">
<div className="h-full bg-secondary w-3/4 rounded-full"></div>
</div>
<p className="text-[10px] mt-sm text-on-surface-variant">75% Completion Rate</p>
</div>
<div className="bg-surface-container-low rounded-xl p-md flex flex-col justify-between border border-outline-variant/20">
<div className="flex justify-between items-start">
<div>
<p className="font-label-sm text-on-surface-variant">Red Flags Detected</p>
<h4 className="font-headline-lg text-headline-lg text-error">03</h4>
</div>
<span className="material-symbols-outlined text-error" data-icon="warning">warning</span>
</div>
<div className="flex gap-1 mt-md">
<div className="flex-1 h-1 bg-error rounded-full"></div>
<div className="flex-1 h-1 bg-error rounded-full"></div>
<div className="flex-1 h-1 bg-error rounded-full"></div>
<div className="flex-1 h-1 bg-surface-container rounded-full"></div>
</div>
<p className="text-[10px] mt-sm text-on-surface-variant">Immediate action required for Q3 Ledgers</p>
</div>
{/*  Transaction Risk Table  */}
<div className="md:col-span-2 glass-panel rounded-xl p-md ai-glow">
<div className="flex justify-between items-center mb-md">
<h3 className="font-headline-md text-headline-md text-primary flex items-center gap-sm">
<span className="material-symbols-outlined text-secondary" data-icon="verified_user">verified_user</span>
                            High-Risk Transactions
                        </h3>
<button className="text-secondary font-label-sm hover:underline">View All</button>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="border-b border-outline-variant/30">
<th className="py-sm px-xs font-label-sm text-on-surface-variant">ENTITY</th>
<th className="py-sm px-xs font-label-sm text-on-surface-variant">AMOUNT</th>
<th className="py-sm px-xs font-label-sm text-on-surface-variant">RISK SCORE</th>
<th className="py-sm px-xs font-label-sm text-on-surface-variant">STATUS</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/10">
<tr className="hover:bg-surface-container-high/20 transition-colors">
<td className="py-sm px-xs font-body-md font-bold">Acme Corp.</td>
<td className="py-sm px-xs font-data-mono">$12,450.00</td>
<td className="py-sm px-xs">
<div className="flex items-center gap-sm">
<div className="w-16 h-1.5 bg-surface-container rounded-full overflow-hidden">
<div className="bg-error w-4/5 h-full"></div>
</div>
<span className="font-label-sm text-error">92%</span>
</div>
</td>
<td className="py-sm px-xs"><span className="px-2 py-1 rounded bg-error-container text-on-error-container text-[10px] font-bold">FLAGGED</span></td>
</tr>
<tr className="hover:bg-surface-container-high/20 transition-colors">
<td className="py-sm px-xs font-body-md font-bold">Global Logistics</td>
<td className="py-sm px-xs font-data-mono">$8,120.50</td>
<td className="py-sm px-xs">
<div className="flex items-center gap-sm">
<div className="w-16 h-1.5 bg-surface-container rounded-full overflow-hidden">
<div className="bg-secondary w-2/5 h-full"></div>
</div>
<span className="font-label-sm text-secondary">41%</span>
</div>
</td>
<td className="py-sm px-xs"><span className="px-2 py-1 rounded bg-surface-container text-on-surface-variant text-[10px] font-bold">PENDING</span></td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
</section>
{/*  AI Audit Management & GSTR Checklist  */}
<section className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
{/*  AI GSTR Checklist  */}
<div className="lg:col-span-2 glass-panel rounded-xl p-lg relative border-l-4 border-l-secondary overflow-hidden">
<div className="absolute top-4 right-4 animate-pulse-subtle">
<span className="material-symbols-outlined text-secondary/40 text-4xl" data-icon="auto_awesome">auto_awesome</span>
</div>
<h3 className="font-headline-md text-headline-md text-primary mb-lg">AI GSTR Reconciliation</h3>
<div className="space-y-md">
<div className="flex items-start gap-md p-md rounded-lg bg-surface-container-lowest border border-outline-variant/30 hover:shadow-md transition-shadow">
<input checked={true} className="mt-1 rounded border-secondary text-secondary focus:ring-secondary" type="checkbox"/>
<div className="flex-1">
<p className="font-body-md font-bold text-on-surface">Invoice Matching vs. GSTR-2B</p>
<p className="font-body-md text-on-surface-variant text-sm">3,420 entries verified. 2 discrepancies found in Purchase Ledger.</p>
<div className="mt-sm flex gap-sm">
<span className="bg-secondary-fixed text-on-secondary-fixed-variant text-[10px] px-2 py-0.5 rounded-full font-bold">AI VALIDATED</span>
</div>
</div>
</div>
<div className="flex items-start gap-md p-md rounded-lg bg-surface-container-lowest border border-outline-variant/30 hover:shadow-md transition-shadow">
<input className="mt-1 rounded border-secondary text-secondary focus:ring-secondary" type="checkbox"/>
<div className="flex-1">
<p className="font-body-md font-bold text-on-surface">HSN/SAC Code Validation</p>
<p className="font-body-md text-on-surface-variant text-sm">Validating tax rates against updated GST council mandates.</p>
</div>
<span className="material-symbols-outlined text-on-primary-container animate-spin" data-icon="sync" style={{ animationDuration: '3s' }}>sync</span>
</div>
<div className="flex items-start gap-md p-md rounded-lg bg-surface-container-lowest border border-outline-variant/30 hover:shadow-md transition-shadow">
<input className="mt-1 rounded border-secondary text-secondary focus:ring-secondary" type="checkbox"/>
<div className="flex-1">
<p className="font-body-md font-bold text-on-surface">Input Tax Credit (ITC) Optimization</p>
<p className="font-body-md text-on-surface-variant text-sm">Scanning for unclaimed credits from previous quarters.</p>
</div>
</div>
</div>
<div className="mt-lg flex justify-end">
<button className="bg-secondary text-white px-lg py-md rounded-lg font-bold text-body-md hover:bg-secondary/90 transition-colors shadow-lg flex items-center gap-sm">
<span className="material-symbols-outlined" data-icon="magic_button">magic_button</span>
                        Run Full Reconciliation
                    </button>
</div>
</div>
{/*  Audit Calendar / Alerts  */}
<div className="bg-primary-container text-surface-bright rounded-xl p-lg flex flex-col shadow-xl">
<h3 className="font-headline-md text-headline-md mb-lg flex items-center gap-sm">
<span className="material-symbols-outlined text-secondary-fixed" data-icon="notifications_active">notifications_active</span>
                    Critical Alerts
                </h3>
<div className="space-y-lg flex-1 overflow-y-auto custom-scrollbar pr-2">
<div className="flex gap-md group cursor-pointer">
<div className="w-1 h-12 bg-error rounded-full group-hover:scale-y-125 transition-transform"></div>
<div>
<p className="font-label-sm text-on-primary-container uppercase">Due in 2 Days</p>
<p className="font-body-md font-bold">TDS Return Filing - Q4</p>
<p className="text-xs opacity-70">Client: Zenith Ventures Ltd.</p>
</div>
</div>
<div className="flex gap-md group cursor-pointer">
<div className="w-1 h-12 bg-secondary rounded-full group-hover:scale-y-125 transition-transform"></div>
<div>
<p className="font-label-sm text-on-primary-container uppercase">Compliance Update</p>
<p className="font-body-md font-bold">New GST Rule #421</p>
<p className="text-xs opacity-70">Affects 12 client portfolios.</p>
</div>
</div>
<div className="flex gap-md group cursor-pointer">
<div className="w-1 h-12 bg-surface-container rounded-full group-hover:scale-y-125 transition-transform"></div>
<div>
<p className="font-label-sm text-on-primary-container uppercase">Audit Update</p>
<p className="font-body-md font-bold">Acme Corp Audit Draft</p>
<p className="text-xs opacity-70">Ready for Senior Partner review.</p>
</div>
</div>
</div>
<div className="mt-lg pt-lg border-t border-white/10">
<button className="w-full py-md rounded-lg border border-white/20 hover:bg-white/5 transition-colors font-bold text-sm">
                        Open Audit Calendar
                    </button>
</div>
</div>
</section>
{/*  CA Management Workspace (Visual Illustration)  */}
<section className="glass-panel rounded-xl p-lg">
<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md mb-lg">
<div>
<h3 className="font-headline-md text-headline-md text-primary">Advanced Audit Management</h3>
<p className="font-body-md text-on-surface-variant">Multi-firm workspace for tax professionals</p>
</div>
<div className="flex gap-sm">
<button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container transition-colors">
<span className="material-symbols-outlined" data-icon="filter_list">filter_list</span>
</button>
<button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container transition-colors">
<span className="material-symbols-outlined" data-icon="download">download</span>
</button>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
{/*  Card 1  */}
<div className="p-md rounded-xl border border-outline-variant/30 hover:shadow-lg transition-all duration-300">
<div className="flex justify-between items-start mb-md">
<div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
<span className="material-symbols-outlined" data-icon="corporate_fare">corporate_fare</span>
</div>
<span className="text-[10px] font-bold text-on-surface-variant">ID: #AUD-001</span>
</div>
<h5 className="font-body-md font-bold mb-xs">Stark Enterprises</h5>
<p className="text-xs text-on-surface-variant mb-md">Statutory Audit FY23-24</p>
<div className="flex items-center justify-between">
<div className="flex -space-x-2">
<div className="w-6 h-6 rounded-full border-2 border-surface bg-gray-200" title="Assignee 1"></div>
<div className="w-6 h-6 rounded-full border-2 border-surface bg-gray-300" title="Assignee 2"></div>
<div className="w-6 h-6 rounded-full border-2 border-surface bg-secondary text-white text-[8px] flex items-center justify-center">+2</div>
</div>
<span className="font-label-sm text-secondary">60%</span>
</div>
</div>
{/*  Card 2  */}
<div className="p-md rounded-xl border border-outline-variant/30 hover:shadow-lg transition-all duration-300">
<div className="flex justify-between items-start mb-md">
<div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center text-error">
<span className="material-symbols-outlined" data-icon="business">business</span>
</div>
<span className="text-[10px] font-bold text-on-surface-variant">ID: #AUD-042</span>
</div>
<h5 className="font-body-md font-bold mb-xs">Wayne Tech</h5>
<p className="text-xs text-on-surface-variant mb-md">Internal Controls Review</p>
<div className="flex items-center justify-between">
<div className="flex -space-x-2">
<div className="w-6 h-6 rounded-full border-2 border-surface bg-gray-200" title="Assignee 1"></div>
</div>
<span className="font-label-sm text-error">DELAYED</span>
</div>
</div>
{/*  Card 3  */}
<div className="p-md rounded-xl border border-outline-variant/30 hover:shadow-lg transition-all duration-300">
<div className="flex justify-between items-start mb-md">
<div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
<span className="material-symbols-outlined" data-icon="store">store</span>
</div>
<span className="text-[10px] font-bold text-on-surface-variant">ID: #AUD-089</span>
</div>
<h5 className="font-body-md font-bold mb-xs">Daily Bugle Inc.</h5>
<p className="text-xs text-on-surface-variant mb-md">Tax Consultation</p>
<div className="flex items-center justify-between">
<div className="flex -space-x-2">
<div className="w-6 h-6 rounded-full border-2 border-surface bg-gray-200" title="Assignee 1"></div>
<div className="w-6 h-6 rounded-full border-2 border-surface bg-gray-400" title="Assignee 2"></div>
</div>
<span className="font-label-sm text-on-surface-variant">COMPLETED</span>
</div>
</div>
{/*  Card 4 (Add New)  */}
<button className="p-md rounded-xl border-2 border-dashed border-outline-variant/50 hover:border-secondary hover:bg-surface-container-low transition-all group flex flex-col items-center justify-center gap-sm">
<span className="material-symbols-outlined text-on-surface-variant group-hover:text-secondary text-3xl" data-icon="add_circle">add_circle</span>
<span className="font-label-sm text-on-surface-variant group-hover:text-secondary uppercase">Initiate New Audit</span>
</button>
</div>
</section>
</main>
{/*  BottomNavBar (Mobile only)  */}
<nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center pb-safe pt-2 bg-surface-container-lowest/80 backdrop-blur-xl border-t border-outline-variant/20 shadow-lg z-50">
<a className="flex flex-col items-center justify-center text-on-surface-variant" href="#">
<span className="material-symbols-outlined" data-icon="home">home</span>
<span className="font-label-sm">Home</span>
</a>
<a className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-2xl px-4 py-1" href="#">
<span className="material-symbols-outlined" data-icon="list_alt">list_alt</span>
<span className="font-label-sm">Ledger</span>
</a>
<a className="flex flex-col items-center justify-center text-on-surface-variant" href="#">
<span className="material-symbols-outlined" data-icon="add_box">add_box</span>
<span className="font-label-sm">Entry</span>
</a>
<a className="flex flex-col items-center justify-center text-on-surface-variant" href="#">
<span className="material-symbols-outlined" data-icon="insights">insights</span>
<span className="font-label-sm">AI</span>
</a>
</nav>
{/*  Floating AI Assistant Button (Contextual)  */}
<button className="hidden md:flex fixed bottom-lg right-lg w-14 h-14 bg-primary text-white rounded-full items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 group ai-glow">
<span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform" data-icon="smart_toy">smart_toy</span>
<div className="absolute right-16 bg-primary-container text-surface-bright px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Ask FinPilot AI
        </div>
</button>


        </div>
    );
};

export default AuditAndCompliancePage;
