import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';

const CFODashboardPage: React.FC = () => {
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
            
{/*  Navigation Drawer (Desktop)  */}
<aside className="fixed h-full w-[280px] left-0 top-0 hidden md:flex flex-col bg-surface border-r border-outline-variant shadow-sm z-50 sidebar-transition">
<div className="flex flex-col h-screen py-md px-sm">
{/*  Brand Anchor  */}
<div className="px-md mb-lg">
<h1 className="font-display-lg text-display-lg text-primary">FinPilot Pro</h1>
<p className="text-on-primary-container font-label-sm">Enterprise OS v2.4.0</p>
</div>
{/*  Navigation Items  */}
<nav className="flex-1 space-y-1">
<a className="flex items-center gap-md px-md py-sm bg-secondary-container text-on-secondary-container rounded-lg font-bold transition-all duration-200" href="#">
<span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span className="font-body-md">Dashboard</span>
</a>
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-all duration-200" href="#">
<span className="material-symbols-outlined" data-icon="account_balance_wallet">account_balance_wallet</span>
<span className="font-body-md">Ledgers</span>
</a>
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-all duration-200" href="#">
<span className="material-symbols-outlined" data-icon="receipt_long">receipt_long</span>
<span className="font-body-md">Vouchers</span>
</a>
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-all duration-200" href="#">
<span className="material-symbols-outlined" data-icon="account_balance">account_balance</span>
<span className="font-body-md">Taxes</span>
</a>
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-all duration-200" href="#">
<span className="material-symbols-outlined" data-icon="settings">settings</span>
<span className="font-body-md">Settings</span>
</a>
</nav>
{/*  Profile Anchor  */}
<div className="mt-auto p-md bg-surface-container-low rounded-xl flex items-center gap-sm">
<div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
<span className="material-symbols-outlined" data-icon="person">person</span>
</div>
<div className="flex flex-col">
<span className="font-label-sm text-on-surface font-bold">Alex Sterling</span>
<span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Group CFO</span>
</div>
<button className="ml-auto text-on-surface-variant">
<span className="material-symbols-outlined" data-icon="more_vert">more_vert</span>
</button>
</div>
</div>
</aside>
{/*  Main Canvas  */}
<main className="md:ml-[280px] min-h-screen pb-24 md:pb-0">
{/*  Top App Bar  */}
<header className="sticky top-0 w-full z-40 bg-surface/70 backdrop-blur-md border-b border-outline-variant/30">
<div className="flex justify-between items-center px-lg py-sm max-w-container-max mx-auto h-16">
<div className="flex items-center gap-md">
<button className="md:hidden text-primary">
<span className="material-symbols-outlined" data-icon="menu">menu</span>
</button>
<h2 className="font-headline-md text-headline-md text-primary">Global Search</h2>
</div>
<div className="flex-1 max-w-md mx-lg hidden sm:block">
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" data-icon="search">search</span>
<input className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-body-md focus:ring-2 focus:ring-secondary/20" placeholder="Search transactions, entities, or AI commands..." type="text"/>
</div>
</div>
<div className="flex items-center gap-md">
<button className="p-2 text-on-surface-variant hover:text-secondary transition-colors">
<span className="material-symbols-outlined" data-icon="notifications">notifications</span>
</button>
<button className="flex items-center gap-sm px-4 py-2 bg-primary text-on-primary rounded-full font-label-sm scale-95 active:scale-90 transition-transform">
<span className="material-symbols-outlined text-[20px]" data-icon="smart_toy">smart_toy</span>
<span>Ask AI</span>
</button>
</div>
</div>
</header>
{/*  Dashboard Content  */}
<div className="px-lg py-lg max-w-container-max mx-auto space-y-lg">
{/*  Hero Section / Greeting  */}
<section className="flex flex-col md:flex-row md:items-end justify-between gap-md">
<div>
<h3 className="font-headline-lg text-headline-lg text-primary">Financial Intelligence Overview</h3>
<p className="text-on-surface-variant font-body-lg">Welcome back, Alex. Your financial health is <span className="text-emerald-600 font-bold">Optimized</span>.</p>
</div>
<div className="flex gap-sm">
<button className="px-md py-sm bg-surface-container text-on-surface rounded-lg font-label-sm flex items-center gap-xs">
<span className="material-symbols-outlined text-[18px]" data-icon="calendar_today">calendar_today</span>
                        Last 30 Days
                    </button>
<button className="px-md py-sm bg-surface-container text-on-surface rounded-lg font-label-sm flex items-center gap-xs">
<span className="material-symbols-outlined text-[18px]" data-icon="download">download</span>
                        Export
                    </button>
</div>
</section>
{/*  KPI Grid  */}
<section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
{/*  Revenue  */}
<div className="glass-card p-lg rounded-2xl ai-glow">
<div className="flex justify-between items-start mb-md">
<div className="p-sm bg-blue-100 text-blue-700 rounded-lg">
<span className="material-symbols-outlined" data-icon="payments">payments</span>
</div>
<span className="text-emerald-600 font-data-mono flex items-center text-label-sm">
<span className="material-symbols-outlined text-[16px]" data-icon="trending_up">trending_up</span>
                            +12.4%
                        </span>
</div>
<p className="text-on-surface-variant font-label-sm uppercase tracking-wider">Revenue</p>
<h4 className="font-display-lg text-headline-lg font-data-mono mt-xs">$4.28M</h4>
<div className="mt-md h-1 w-full bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-blue-500 rounded-full" style={{ width: '78%' }}></div>
</div>
</div>
{/*  Net Profit  */}
<div className="glass-card p-lg rounded-2xl">
<div className="flex justify-between items-start mb-md">
<div className="p-sm bg-emerald-100 text-emerald-700 rounded-lg">
<span className="material-symbols-outlined" data-icon="account_balance">account_balance</span>
</div>
<span className="text-emerald-600 font-data-mono flex items-center text-label-sm">
<span className="material-symbols-outlined text-[16px]" data-icon="trending_up">trending_up</span>
                            +4.1%
                        </span>
</div>
<p className="text-on-surface-variant font-label-sm uppercase tracking-wider">Net Profit</p>
<h4 className="font-display-lg text-headline-lg font-data-mono mt-xs">$1.12M</h4>
<div className="mt-md h-1 w-full bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-emerald-500 rounded-full" style={{ width: '62%' }}></div>
</div>
</div>
{/*  GST Liability  */}
<div className="glass-card p-lg rounded-2xl">
<div className="flex justify-between items-start mb-md">
<div className="p-sm bg-amber-100 text-amber-700 rounded-lg">
<span className="material-symbols-outlined" data-icon="gavel">gavel</span>
</div>
<span className="text-amber-600 font-data-mono flex items-center text-label-sm">
                            Upcoming
                        </span>
</div>
<p className="text-on-surface-variant font-label-sm uppercase tracking-wider">GST Liability</p>
<h4 className="font-display-lg text-headline-lg font-data-mono mt-xs">$242K</h4>
<div className="mt-md h-1 w-full bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-amber-500 rounded-full" style={{ width: '45%' }}></div>
</div>
</div>
{/*  Cash Flow  */}
<div className="glass-card p-lg rounded-2xl">
<div className="flex justify-between items-start mb-md">
<div className="p-sm bg-purple-100 text-purple-700 rounded-lg">
<span className="material-symbols-outlined" data-icon="sync_alt">sync_alt</span>
</div>
<span className="text-rose-600 font-data-mono flex items-center text-label-sm">
<span className="material-symbols-outlined text-[16px]" data-icon="trending_down">trending_down</span>
                            -2.3%
                        </span>
</div>
<p className="text-on-surface-variant font-label-sm uppercase tracking-wider">Cash Flow</p>
<h4 className="font-display-lg text-headline-lg font-data-mono mt-xs">$892K</h4>
<div className="mt-md h-1 w-full bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-purple-500 rounded-full" style={{ width: '85%' }}></div>
</div>
</div>
</section>
{/*  Main Content Area: Bento Grid  */}
<section className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
{/*  Chart Section (Forecasts)  */}
<div className="lg:col-span-8 glass-card p-lg rounded-3xl flex flex-col min-h-[400px]">
<div className="flex justify-between items-center mb-lg">
<h5 className="font-headline-md text-headline-md text-primary">Revenue Forecast</h5>
<div className="flex gap-sm">
<div className="flex items-center gap-xs">
<span className="w-3 h-3 bg-secondary rounded-full"></span>
<span className="text-label-sm text-on-surface-variant">Actual</span>
</div>
<div className="flex items-center gap-xs">
<span className="w-3 h-3 bg-secondary/30 rounded-full"></span>
<span className="text-label-sm text-on-surface-variant">Forecast</span>
</div>
</div>
</div>
<div className="flex-1 relative bg-surface-container-lowest rounded-xl border border-outline-variant/20 overflow-hidden">
{/*  Abstract Chart Visualization  */}
<div className="absolute inset-0 p-lg flex items-end gap-sm overflow-hidden">
{/*  Bars Simulation  */}
<div className="flex-1 bg-secondary/5 h-[40%] rounded-t-lg relative group">
<div className="absolute bottom-0 left-0 w-full bg-secondary h-[80%] rounded-t-lg transition-all group-hover:h-[85%]"></div>
</div>
<div className="flex-1 bg-secondary/5 h-[55%] rounded-t-lg relative group">
<div className="absolute bottom-0 left-0 w-full bg-secondary h-[75%] rounded-t-lg transition-all group-hover:h-[80%]"></div>
</div>
<div className="flex-1 bg-secondary/5 h-[70%] rounded-t-lg relative group">
<div className="absolute bottom-0 left-0 w-full bg-secondary h-[90%] rounded-t-lg transition-all group-hover:h-[95%]"></div>
</div>
<div className="flex-1 bg-secondary/5 h-[65%] rounded-t-lg relative group">
<div className="absolute bottom-0 left-0 w-full bg-secondary h-[60%] rounded-t-lg transition-all group-hover:h-[65%]"></div>
</div>
<div className="flex-1 bg-secondary/5 h-[80%] rounded-t-lg relative group">
<div className="absolute bottom-0 left-0 w-full bg-secondary h-[85%] rounded-t-lg transition-all group-hover:h-[90%]"></div>
</div>
<div className="flex-1 bg-secondary/5 h-[95%] rounded-t-lg relative group">
<div className="absolute bottom-0 left-0 w-full bg-secondary h-[92%] rounded-t-lg transition-all group-hover:h-[98%]"></div>
</div>
{/*  Forecast Dotted Bars  */}
<div className="flex-1 bg-secondary/5 h-[100%] rounded-t-lg border-x-2 border-t-2 border-dashed border-secondary/30"></div>
<div className="flex-1 bg-secondary/5 h-[90%] rounded-t-lg border-x-2 border-t-2 border-dashed border-secondary/30"></div>
</div>
<div className="absolute bottom-2 w-full flex justify-around px-lg text-[10px] font-bold text-on-surface-variant/50">
<span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span><span>JUL (EST)</span><span>AUG (EST)</span>
</div>
</div>
</div>
{/*  AI Insights Sidebar  */}
<div className="lg:col-span-4 space-y-lg">
{/*  AI Insights Card  */}
<div className="gradient-border-ai p-lg rounded-3xl ai-glow">
<div className="flex items-center gap-sm mb-md">
<div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white">
<span className="material-symbols-outlined text-[18px]" data-icon="smart_toy">smart_toy</span>
</div>
<h5 className="font-headline-md text-headline-md text-primary">AI Insights</h5>
</div>
<div className="space-y-md">
<div className="p-md bg-surface-container-low rounded-xl border-l-4 border-secondary">
<p className="text-body-md text-on-surface">"Revenue is projected to exceed Q3 targets by 14% based on current recurring contracts. Recommend increasing marketing spend by 5% in August."</p>
</div>
<div className="p-md bg-surface-container-low rounded-xl border-l-4 border-emerald-500">
<p className="text-body-md text-on-surface">"Tax compliance score increased to 98%. All local GST filings are ready for final review."</p>
</div>
<button className="w-full py-sm text-secondary font-label-sm hover:underline">View Detailed Analysis →</button>
</div>
</div>
{/*  Compliance Widget  */}
<div className="glass-card p-lg rounded-3xl">
<h5 className="font-headline-md text-headline-md text-primary mb-md">Compliance Score</h5>
<div className="flex items-center justify-center py-md relative">
{/*  Circular Progress  */}
<svg className="w-32 h-32 transform -rotate-90">
<circle className="text-surface-container" cx="64" cy="64" fill="transparent" r="56" stroke="currentColor" stroke-width="8"></circle>
<circle className="text-emerald-500 transition-all duration-1000" cx="64" cy="64" fill="transparent" r="56" stroke="currentColor" stroke-dasharray="351.8" stroke-dashoffset="35.18" stroke-width="8"></circle>
</svg>
<div className="absolute inset-0 flex flex-col items-center justify-center">
<span className="text-display-lg font-data-mono leading-none">98</span>
<span className="text-[10px] text-on-surface-variant font-bold uppercase">Excellent</span>
</div>
</div>
<div className="mt-md space-y-sm">
<div className="flex justify-between items-center text-body-md">
<span className="text-on-surface-variant">Regulatory Filings</span>
<span className="text-emerald-600 font-bold">100%</span>
</div>
<div className="flex justify-between items-center text-body-md">
<span className="text-on-surface-variant">Audit Readiness</span>
<span className="text-emerald-600 font-bold">96%</span>
</div>
</div>
</div>
</div>
</section>
{/*  Transactions / Ledger View (Lower Section)  */}
<section className="glass-card rounded-3xl overflow-hidden">
<div className="px-lg py-md flex justify-between items-center border-b border-outline-variant/30">
<h5 className="font-headline-md text-headline-md text-primary">Critical Actions</h5>
<button className="text-secondary font-label-sm">View All Ledger Entries</button>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left">
<thead className="bg-surface-container-low text-on-surface-variant font-label-sm">
<tr>
<th className="px-lg py-md">Entity</th>
<th className="px-lg py-md">Status</th>
<th className="px-lg py-md">Amount</th>
<th className="px-lg py-md">AI Confidence</th>
<th className="px-lg py-md">Action</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/10">
<tr className="hover:bg-surface-container-low/50 transition-colors">
<td className="px-lg py-md">
<div className="flex items-center gap-sm">
<div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">G</div>
<span className="font-body-md font-semibold">Global Cloud Services</span>
</div>
</td>
<td className="px-lg py-md">
<span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase">Cleared</span>
</td>
<td className="px-lg py-md font-data-mono text-body-md">$142,500.00</td>
<td className="px-lg py-md">
<div className="flex items-center gap-xs">
<div className="h-1.5 w-16 bg-surface-container rounded-full">
<div className="h-full bg-emerald-500 rounded-full w-[99%]"></div>
</div>
<span className="text-[10px] font-bold">99%</span>
</div>
</td>
<td className="px-lg py-md">
<button className="p-2 text-on-surface-variant hover:text-primary"><span className="material-symbols-outlined text-[20px]" data-icon="visibility">visibility</span></button>
</td>
</tr>
<tr className="hover:bg-surface-container-low/50 transition-colors">
<td className="px-lg py-md">
<div className="flex items-center gap-sm">
<div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">M</div>
<span className="font-body-md font-semibold">MicroStrategy Corp</span>
</div>
</td>
<td className="px-lg py-md">
<span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-[10px] font-bold uppercase">Pending AI Review</span>
</td>
<td className="px-lg py-md font-data-mono text-body-md">$89,200.00</td>
<td className="px-lg py-md">
<div className="flex items-center gap-xs">
<div className="h-1.5 w-16 bg-surface-container rounded-full">
<div className="h-full bg-amber-500 rounded-full w-[65%]"></div>
</div>
<span className="text-[10px] font-bold">65%</span>
</div>
</td>
<td className="px-lg py-md">
<button className="px-3 py-1 bg-secondary text-on-secondary rounded-lg text-label-sm">Verify</button>
</td>
</tr>
</tbody>
</table>
</div>
</section>
</div>
</main>
{/*  Bottom Nav Bar (Mobile)  */}
<nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center pb-6 pt-2 bg-surface-container-lowest/80 backdrop-blur-xl border-t border-outline-variant/20 shadow-lg z-50">
<a className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-2xl px-4 py-1 animate-pulse-subtle" href="#">
<span className="material-symbols-outlined" data-icon="home">home</span>
<span className="font-label-sm text-[10px]">Home</span>
</a>
<a className="flex flex-col items-center justify-center text-on-surface-variant" href="#">
<span className="material-symbols-outlined" data-icon="list_alt">list_alt</span>
<span className="font-label-sm text-[10px]">Ledger</span>
</a>
<a className="flex flex-col items-center justify-center text-on-surface-variant" href="#">
<span className="material-symbols-outlined" data-icon="add_box">add_box</span>
<span className="font-label-sm text-[10px]">Entry</span>
</a>
<a className="flex flex-col items-center justify-center text-on-surface-variant" href="#">
<span className="material-symbols-outlined" data-icon="insights">insights</span>
<span className="font-label-sm text-[10px]">AI</span>
</a>
</nav>
{/*  Floating Action Button  */}
<button className="fixed right-6 bottom-24 md:bottom-8 w-14 h-14 bg-secondary text-on-secondary rounded-full shadow-xl flex items-center justify-center scale-100 hover:scale-110 active:scale-95 transition-transform z-40">
<span className="material-symbols-outlined text-[28px]" data-icon="smart_toy">smart_toy</span>
</button>


        </div>
    );
};

export default CFODashboardPage;
