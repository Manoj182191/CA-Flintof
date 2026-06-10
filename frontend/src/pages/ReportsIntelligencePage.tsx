import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';

const ReportsIntelligencePage: React.FC = () => {
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
            
{/*  Navigation Drawer (Sidebar)  */}
<aside className="hidden md:flex fixed left-0 top-0 h-full w-[280px] bg-surface-container border-r border-outline-variant flex-col gap-base p-md z-40">
<div className="mb-lg px-md pt-md">
<span className="font-headline-md text-headline-md text-primary">FinPilot AI</span>
<div className="mt-md flex items-center gap-md">
<div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
<span className="material-symbols-outlined">person</span>
</div>
<div>
<p className="font-label-sm text-on-surface font-bold">FinPilot AI Admin</p>
<p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Enterprise Tier</p>
</div>
</div>
</div>
<nav className="flex-1 overflow-y-auto space-y-1">
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1 transition-transform duration-200 rounded-lg" href="#">
<span className="material-symbols-outlined">analytics</span>
<span>Dashboard</span>
</a>
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1 transition-transform duration-200 rounded-lg" href="#">
<span className="material-symbols-outlined">business</span>
<span>Companies</span>
</a>
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1 transition-transform duration-200 rounded-lg" href="#">
<span className="material-symbols-outlined">payments</span>
<span>Payroll</span>
</a>
<a className="flex items-center gap-md px-md py-sm bg-secondary-container text-on-secondary-container font-semibold rounded-lg" href="#">
<span className="material-symbols-outlined">description</span>
<span>Reports</span>
</a>
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1 transition-transform duration-200 rounded-lg" href="#">
<span className="material-symbols-outlined">policy</span>
<span>Audit</span>
</a>
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1 transition-transform duration-200 rounded-lg" href="#">
<span className="material-symbols-outlined">account_balance</span>
<span>Gov Connect</span>
</a>
</nav>
<div className="mt-auto border-t border-outline-variant pt-md px-md">
<p className="text-[10px] text-on-surface-variant opacity-60">v2.4.0</p>
</div>
</aside>
{/*  Main Content Canvas  */}
<main className="md:pl-[280px] min-h-screen pb-24 md:pb-12">
{/*  TopAppBar  */}
<header className="sticky top-0 z-30 flex justify-between items-center px-md w-full h-16 bg-surface-bright border-b border-outline-variant transition-colors">
<div className="flex items-center gap-md">
<button className="md:hidden p-sm text-primary hover:bg-surface-container-high rounded-full transition-colors active:scale-95 duration-150">
<span className="material-symbols-outlined">menu</span>
</button>
<h1 className="font-headline-md text-headline-md text-primary font-bold">Reports Center</h1>
</div>
{/*  Global Search Bar  */}
<div className="hidden sm:flex flex-1 max-w-xl mx-xl">
<div className="relative w-full">
<span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
<input className="w-full bg-surface-container-low border-none rounded-full py-2 pl-12 pr-4 focus:ring-2 focus:ring-secondary transition-all font-body-md text-on-surface placeholder:text-on-surface-variant/50" placeholder="Search for financial, tax, or compliance reports..." type="text"/>
</div>
</div>
<div className="flex items-center gap-sm">
<button className="p-sm text-primary hover:bg-surface-container-high rounded-full transition-colors active:scale-95 duration-150">
<span className="material-symbols-outlined">notifications</span>
</button>
<div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant">
<img className="w-full h-full object-cover" data-alt="A professional headshot of a financial executive in a modern, light-filled office. The individual is wearing a charcoal suit and has a confident, approachable expression. The background shows a blurred high-tech workspace with subtle blue and white lighting, maintaining a clean corporate futuristic aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAcJe_471og7zyJWx53VOQ91D2fl7hUeumxPsCjdtOvaRVT6LRvTWA4-ob_8xHB2GkPFBRM_PKbKrIARASPecgJbelb3-crhkOIA1_rQ7k3yHDhqN8N3lDSMa2nB3zq4NrYHl17WL-pFuoRJgHgw5mjxbhMx4E4eog3bYgJWAO1ucJawkvNTeJTq2YKJeYNOgh6uqOg-dFqvvF-30nOJdtMH8J0EHHJLlPOUYMhYcXRPjJEZY-Oo1vTTpoTFIq_-H6Cisk-6uVSHLU"/>
</div>
</div>
</header>
{/*  Hero Section / Search for Mobile  */}
<div className="sm:hidden px-md pt-md">
<div className="relative w-full">
<span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
<input className="w-full bg-surface-container-low border-none rounded-full py-2 pl-12 pr-4 focus:ring-2 focus:ring-secondary transition-all font-body-md text-on-surface" placeholder="Search reports..." type="text"/>
</div>
</div>
{/*  Content Area  */}
<div className="max-w-[1200px] mx-auto p-md md:p-lg">
{/*  AI Insights Banner (Bento Style)  */}
<section className="mb-xl">
<div className="glass-panel ai-glow rounded-xl p-lg flex flex-col md:flex-row items-center gap-lg relative overflow-hidden">
{/*  Subtle background decoration  */}
<div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
<div className="flex-1 z-10">
<div className="flex items-center gap-sm mb-sm">
<span className="material-symbols-outlined text-secondary animate-pulse">auto_awesome</span>
<span className="font-label-sm text-secondary uppercase tracking-widest">FinPilot Intelligence</span>
</div>
<h2 className="font-headline-lg text-headline-lg text-primary mb-md">Quick Financial Health Pulse</h2>
<p className="text-on-surface-variant max-w-2xl mb-lg">Based on your recent transactions, I recommend reviewing the <span className="text-secondary font-semibold">TDS Compliance Summary</span>. There is a potential 4% discrepancy in vendor tax deductions for Q3.</p>
<button className="bg-primary text-on-primary px-xl py-3 rounded-lg font-label-sm hover:opacity-90 transition-opacity active:scale-95 duration-150">
                            GENERATE AI AUDIT
                        </button>
</div>
<div className="w-full md:w-auto z-10">
<div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/30 flex gap-md items-end">
<div className="flex flex-col gap-1">
<div className="h-12 w-6 bg-secondary/20 rounded-t-sm"></div>
<div className="h-16 w-6 bg-secondary/40 rounded-t-sm"></div>
<div className="h-24 w-6 bg-secondary rounded-t-sm"></div>
</div>
<div className="text-right">
<p className="font-data-mono text-headline-md text-primary">$42.8k</p>
<p className="text-[10px] text-on-surface-variant uppercase">Projected Savings</p>
</div>
</div>
</div>
</div>
</section>
{/*  Categories Grid  */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
{/*  Category: Financial Statements  */}
<div className="space-y-md">
<div className="flex items-center gap-sm px-sm">
<span className="material-symbols-outlined text-primary">account_balance_wallet</span>
<h3 className="font-headline-md text-headline-md text-primary">Financial Statements</h3>
</div>
<div className="grid gap-md">
{/*  Report Card  */}
<div className="report-card glass-panel p-md rounded-xl cursor-pointer transition-all">
<div className="flex justify-between items-start mb-sm">
<div className="p-sm bg-surface-container-high rounded-lg text-primary">
<span className="material-symbols-outlined">receipt_long</span>
</div>
<span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">READY</span>
</div>
<h4 className="font-label-sm text-on-surface mb-xs">Balance Sheet</h4>
<p className="text-on-surface-variant text-[13px] leading-snug">Real-time view of assets, liabilities, and equity at any given point.</p>
</div>
<div className="report-card glass-panel p-md rounded-xl cursor-pointer transition-all">
<div className="flex justify-between items-start mb-sm">
<div className="p-sm bg-surface-container-high rounded-lg text-primary">
<span className="material-symbols-outlined">equalizer</span>
</div>
<span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">READY</span>
</div>
<h4 className="font-label-sm text-on-surface mb-xs">Profit &amp; Loss</h4>
<p className="text-on-surface-variant text-[13px] leading-snug">Analyze revenue trends and expense categories over customizable periods.</p>
</div>
<div className="report-card glass-panel p-md rounded-xl cursor-pointer transition-all">
<div className="flex justify-between items-start mb-sm">
<div className="p-sm bg-surface-container-high rounded-lg text-primary">
<span className="material-symbols-outlined">account_tree</span>
</div>
<span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold">PENDING</span>
</div>
<h4 className="font-label-sm text-on-surface mb-xs">Trial Balance</h4>
<p className="text-on-surface-variant text-[13px] leading-snug">Verification of general ledger balances for auditing and closing.</p>
</div>
</div>
</div>
{/*  Category: Tax & Compliance  */}
<div className="space-y-md">
<div className="flex items-center gap-sm px-sm">
<span className="material-symbols-outlined text-primary">verified_user</span>
<h3 className="font-headline-md text-headline-md text-primary">Tax &amp; Compliance</h3>
</div>
<div className="grid gap-md">
<div className="report-card glass-panel p-md rounded-xl cursor-pointer transition-all">
<div className="flex justify-between items-start mb-sm">
<div className="p-sm bg-secondary-container/10 text-secondary rounded-lg">
<span className="material-symbols-outlined">gavel</span>
</div>
<span className="text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded font-bold">NEW AI</span>
</div>
<h4 className="font-label-sm text-on-surface mb-xs">GST GSTR-1 / 3B</h4>
<p className="text-on-surface-variant text-[13px] leading-snug">Automated reconciliation and filing preparation for GST returns.</p>
</div>
<div className="report-card glass-panel p-md rounded-xl cursor-pointer transition-all">
<div className="flex justify-between items-start mb-sm">
<div className="p-sm bg-surface-container-high rounded-lg text-primary">
<span className="material-symbols-outlined">money_off</span>
</div>
<span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">READY</span>
</div>
<h4 className="font-label-sm text-on-surface mb-xs">TDS Receivables</h4>
<p className="text-on-surface-variant text-[13px] leading-snug">Track tax deducted by customers and reconcile with Form 26AS.</p>
</div>
<div className="report-card glass-panel p-md rounded-xl cursor-pointer transition-all">
<div className="flex justify-between items-start mb-sm">
<div className="p-sm bg-surface-container-high rounded-lg text-primary">
<span className="material-symbols-outlined">assignment</span>
</div>
<span className="text-[10px] bg-error-container text-on-error-container px-2 py-0.5 rounded font-bold">ERROR</span>
</div>
<h4 className="font-label-sm text-on-surface mb-xs">Audit Trail Log</h4>
<p className="text-on-surface-variant text-[13px] leading-snug">MCA-compliant edit log tracking all transaction modifications.</p>
</div>
</div>
</div>
{/*  Category: Payroll & HR  */}
<div className="space-y-md">
<div className="flex items-center gap-sm px-sm">
<span className="material-symbols-outlined text-primary">groups</span>
<h3 className="font-headline-md text-headline-md text-primary">Payroll &amp; HR</h3>
</div>
<div className="grid gap-md">
<div className="report-card glass-panel p-md rounded-xl cursor-pointer transition-all">
<div className="flex justify-between items-start mb-sm">
<div className="p-sm bg-surface-container-high rounded-lg text-primary">
<span className="material-symbols-outlined">payments</span>
</div>
<span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">READY</span>
</div>
<h4 className="font-label-sm text-on-surface mb-xs">Salary Register</h4>
<p className="text-on-surface-variant text-[13px] leading-snug">Detailed breakdown of gross pay, deductions, and net payouts.</p>
</div>
<div className="report-card glass-panel p-md rounded-xl cursor-pointer transition-all">
<div className="flex justify-between items-start mb-sm">
<div className="p-sm bg-surface-container-high rounded-lg text-primary">
<span className="material-symbols-outlined">health_and_safety</span>
</div>
<span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">READY</span>
</div>
<h4 className="font-label-sm text-on-surface mb-xs">PF &amp; ESI Summary</h4>
<p className="text-on-surface-variant text-[13px] leading-snug">Statutory contribution reports for provident fund and insurance.</p>
</div>
<div className="report-card glass-panel p-md rounded-xl cursor-pointer transition-all">
<div className="flex justify-between items-start mb-sm">
<div className="p-sm bg-surface-container-high rounded-lg text-primary">
<span className="material-symbols-outlined">fact_check</span>
</div>
<span className="text-[10px] bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded font-bold">UPCOMING</span>
</div>
<h4 className="font-label-sm text-on-surface mb-xs">Reimbursement Tracker</h4>
<p className="text-on-surface-variant text-[13px] leading-snug">Consolidated view of employee expense claims and approval status.</p>
</div>
</div>
</div>
</div>
</div>
</main>
{/*  BottomNavBar (Mobile Only)  */}
<nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center px-sm pb-2 pt-2 bg-surface-container-lowest shadow-lg rounded-t-xl">
<a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-secondary transition-all active:scale-90 duration-200" href="#">
<span className="material-symbols-outlined">dashboard</span>
<span className="font-label-sm text-label-sm">Home</span>
</a>
<a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-secondary transition-all active:scale-90 duration-200" href="#">
<span className="material-symbols-outlined">group</span>
<span className="font-label-sm text-label-sm">Clients</span>
</a>
<a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-secondary transition-all active:scale-90 duration-200" href="#">
<span className="material-symbols-outlined">verified</span>
<span className="font-label-sm text-label-sm">TDS</span>
</a>
<a className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-full px-4 py-1 active:scale-90 transition-transform duration-200" href="#">
<span className="material-symbols-outlined">grid_view</span>
<span className="font-label-sm text-label-sm">More</span>
</a>
</nav>


        </div>
    );
};

export default ReportsIntelligencePage;
