import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';

const CompanyIntelligenceDashboardPage: React.FC = () => {
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
            
{/*  Sidebar Navigation  */}
<aside className="fixed h-full w-[280px] left-0 top-0 bg-surface dark:bg-primary-container border-r border-outline-variant dark:border-outline shadow-sm flex flex-col h-screen py-md px-sm z-50">
<div className="mb-xl px-sm">
<h1 className="font-display-lg text-[28px] text-primary dark:text-surface-bright leading-tight tracking-tight">FinPilot Pro</h1>
<p className="font-label-sm text-on-primary-container opacity-70">Enterprise OS v2.4.0</p>
</div>
{/*  Workspace Switcher  */}
<div className="mb-lg px-sm">
<button className="w-full flex items-center justify-between p-sm bg-surface-container-low dark:bg-primary rounded-xl border border-outline-variant/30 hover:border-secondary transition-all">
<div className="flex items-center gap-sm">
<div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-white font-bold">G</div>
<div className="text-left">
<p className="font-label-sm leading-none text-on-surface">Global Group</p>
<p className="text-[10px] opacity-60">12 Entities</p>
</div>
</div>
<span className="material-symbols-outlined text-[20px]">unfold_more</span>
</button>
</div>
<nav className="flex-1 space-y-1">
<a className="flex items-center gap-md p-sm bg-secondary-container text-on-secondary-container rounded-lg font-bold transition-all duration-200 ease-in-out" href="#">
<span className="material-symbols-outlined">dashboard</span>
<span className="font-body-md text-body-md">Dashboard</span>
</a>
<a className="flex items-center gap-md p-sm text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-all duration-200 ease-in-out" href="#">
<span className="material-symbols-outlined">account_balance_wallet</span>
<span className="font-body-md text-body-md">Ledgers</span>
</a>
<a className="flex items-center gap-md p-sm text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-all duration-200 ease-in-out" href="#">
<span className="material-symbols-outlined">receipt_long</span>
<span className="font-body-md text-body-md">Vouchers</span>
</a>
<a className="flex items-center gap-md p-sm text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-all duration-200 ease-in-out" href="#">
<span className="material-symbols-outlined">account_balance</span>
<span className="font-body-md text-body-md">Taxes</span>
</a>
</nav>
<div className="mt-auto space-y-1 border-t border-outline-variant pt-md">
<a className="flex items-center gap-md p-sm text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-all duration-200 ease-in-out" href="#">
<span className="material-symbols-outlined">settings</span>
<span className="font-body-md text-body-md">Settings</span>
</a>
<div className="flex items-center gap-sm p-sm mt-md">
<img alt="User Profile" className="w-10 h-10 rounded-full object-cover border-2 border-secondary" data-alt="A professional headshot of a financial executive in his 40s wearing a charcoal suit. He has a confident and friendly expression, set against a blurred modern office background with soft bokeh lighting. The photography is high-end, editorial style, with a clean and sharp focus on the subject." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQG7Uw48zuXtmOuOe4UglhzmTSycu2JHa8TzQGSOk2wj8D3WPuV7Ausw13zpneWBT22bJptNBcvg88GYKEwjNIe-uKdnwcQpoE5k7hI2GvWeMWIpZj_14AIh1g7NIzwcTIypCjoG23BSIcPMsS6hz2M8L-QZ9DmrhgIUMvsRl9A8XP5SnPXendY7_GuuDRTPPqONmG_dpcSaW6OKxS0j91Tw8JUo9DvE6MfqXEvH7HDkCIb0_-TNkj4sqXEWZQ-zVk3govSS_nR50"/>
<div>
<p className="font-label-sm text-on-surface leading-none">Marcus Vance</p>
<p className="text-[10px] text-on-surface-variant">Chief Controller</p>
</div>
</div>
</div>
</aside>
{/*  Main Content Area  */}
<main className="ml-[280px] min-h-screen bg-background relative pb-xl">
{/*  Top App Bar  */}
<header className="sticky top-0 w-full z-40 bg-surface/70 dark:bg-primary-container/70 backdrop-blur-md border-b border-outline-variant/30 px-lg py-sm flex justify-between items-center max-w-container-max mx-auto">
<div className="flex items-center gap-md">
<span className="material-symbols-outlined text-primary dark:text-surface-bright">search</span>
<h2 className="font-headline-md text-headline-md text-primary dark:text-surface-bright">Global Search</h2>
</div>
<div className="flex items-center gap-md">
<button className="p-2 rounded-full hover:bg-surface-container transition-colors relative">
<span className="material-symbols-outlined">notifications</span>
<span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
</button>
<button className="flex items-center gap-sm px-md py-sm bg-primary dark:bg-surface-bright text-white dark:text-primary rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-95">
<span className="material-symbols-outlined">smart_toy</span>
<span className="font-label-sm">AI Insights</span>
</button>
</div>
</header>
<div className="p-lg max-w-container-max mx-auto">
{/*  Bento Dashboard Header  */}
<div className="grid grid-cols-12 gap-lg mb-lg">
{/*  Group Roll-up KPI  */}
<div className="col-span-12 lg:col-span-8 glass-panel rounded-3xl p-lg relative overflow-hidden ai-glow">
<div className="relative z-10">
<div className="flex justify-between items-start mb-lg">
<div>
<h3 className="font-headline-lg text-headline-lg mb-xs">Group Company Roll-up</h3>
<p className="text-on-surface-variant">FY 2024-25 Q3 Status</p>
</div>
<span className="px-md py-sm bg-emerald-100 text-emerald-700 rounded-full font-label-sm flex items-center gap-xs">
<span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                Live Syncing
                            </span>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
<div>
<p className="font-label-sm uppercase tracking-wider opacity-60 mb-xs">Consolidated Revenue</p>
<h4 className="font-data-mono text-[32px] leading-none mb-sm text-primary">$142.8M</h4>
<div className="flex items-center gap-xs text-emerald-600 font-label-sm">
<span className="material-symbols-outlined text-[18px]">trending_up</span>
<span>+14.2% YoY</span>
</div>
</div>
<div>
<p className="font-label-sm uppercase tracking-wider opacity-60 mb-xs">Operating Margin</p>
<h4 className="font-data-mono text-[32px] leading-none mb-sm text-primary">28.4%</h4>
<div className="flex items-center gap-xs text-secondary font-label-sm">
<span className="material-symbols-outlined text-[18px]">show_chart</span>
<span>Optimized by AI</span>
</div>
</div>
<div>
<p className="font-label-sm uppercase tracking-wider opacity-60 mb-xs">Total Liabilities</p>
<h4 className="font-data-mono text-[32px] leading-none mb-sm text-primary">$41.2M</h4>
<div className="flex items-center gap-xs text-error font-label-sm">
<span className="material-symbols-outlined text-[18px]">trending_down</span>
<span>Debt Service OK</span>
</div>
</div>
</div>
</div>
{/*  Decorative Element  */}
<div className="absolute -right-20 -bottom-20 w-64 h-64 bg-secondary/5 blur-[100px] rounded-full"></div>
</div>
{/*  Business Health Index Radial  */}
<div className="col-span-12 lg:col-span-4 glass-panel rounded-3xl p-lg flex flex-col items-center justify-center text-center">
<h3 className="font-label-sm uppercase tracking-widest opacity-60 mb-md">Business Health Index</h3>
<div className="radial-progress relative mb-md" style={{ '--value': '92', '--size': '140px', '--thickness': '12px', '--progress-color': '#4b41e1'  } as React.CSSProperties}>
<span className="font-display-lg text-headline-lg text-primary">92</span>
</div>
<p className="font-body-md text-on-surface-variant px-md">Your conglomerate health is 8% higher than last quarter. Compliance is optimal.</p>
</div>
</div>
{/*  Entities Grid  */}
<div className="mb-lg flex justify-between items-center">
<h3 className="font-headline-md text-headline-md">Entity Management</h3>
<div className="flex gap-sm">
<button className="p-sm glass-panel rounded-lg hover:bg-surface-container transition-colors"><span className="material-symbols-outlined">filter_list</span></button>
<button className="p-sm glass-panel rounded-lg hover:bg-surface-container transition-colors"><span className="material-symbols-outlined">grid_view</span></button>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-lg">
{/*  Entity Card 1  */}
<div className="glass-panel rounded-2xl p-md hover:shadow-lg transition-all border-l-4 border-l-secondary group">
<div className="flex justify-between items-start mb-md">
<div>
<h4 className="font-headline-md text-body-lg group-hover:text-secondary transition-colors">Vortex Global Ltd</h4>
<p className="font-label-sm text-on-surface-variant">Singapore HQ</p>
</div>
<div className="radial-progress" style={{ '--value': '88', '--size': '48px', '--thickness': '4px', '--progress-color': '#10b981'  } as React.CSSProperties}>
<span className="text-[10px] font-bold">88%</span>
</div>
</div>
<div className="space-y-sm mb-md">
<div className="flex justify-between text-[12px]">
<span className="opacity-60">Revenue (MTD)</span>
<span className="font-data-mono font-bold">$4.2M</span>
</div>
<div className="w-full bg-surface-container-low h-1.5 rounded-full">
<div className="bg-secondary h-full rounded-full" style={{ width: '72%' }}></div>
</div>
</div>
<div className="flex justify-between items-center pt-sm border-t border-outline-variant/30">
<span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">Compliant</span>
<button className="text-secondary font-label-sm flex items-center gap-xs">View Ledger <span className="material-symbols-outlined text-[14px]">arrow_forward</span></button>
</div>
</div>
{/*  Entity Card 2  */}
<div className="glass-panel rounded-2xl p-md hover:shadow-lg transition-all border-l-4 border-l-error group">
<div className="flex justify-between items-start mb-md">
<div>
<h4 className="font-headline-md text-body-lg group-hover:text-secondary transition-colors">Nova Logistics</h4>
<p className="font-label-sm text-on-surface-variant">EU Branch</p>
</div>
<div className="radial-progress" style={{ '--value': '64', '--size': '48px', '--thickness': '4px', '--progress-color': '#ef4444'  } as React.CSSProperties}>
<span className="text-[10px] font-bold">64%</span>
</div>
</div>
<div className="space-y-sm mb-md">
<div className="flex justify-between text-[12px]">
<span className="opacity-60">Revenue (MTD)</span>
<span className="font-data-mono font-bold">$1.8M</span>
</div>
<div className="w-full bg-surface-container-low h-1.5 rounded-full">
<div className="bg-error h-full rounded-full" style={{ width: '45%' }}></div>
</div>
</div>
<div className="flex justify-between items-center pt-sm border-t border-outline-variant/30">
<span className="text-[11px] font-bold text-error bg-error-container px-2 py-0.5 rounded uppercase">Action Needed</span>
<button className="text-secondary font-label-sm flex items-center gap-xs">Resolve <span className="material-symbols-outlined text-[14px]">priority_high</span></button>
</div>
</div>
{/*  Entity Card 3  */}
<div className="glass-panel rounded-2xl p-md hover:shadow-lg transition-all border-l-4 border-l-primary group">
<div className="flex justify-between items-start mb-md">
<div>
<h4 className="font-headline-md text-body-lg group-hover:text-secondary transition-colors">Titan Ventures</h4>
<p className="font-label-sm text-on-surface-variant">US Operations</p>
</div>
<div className="radial-progress" style={{ '--value': '95', '--size': '48px', '--thickness': '4px', '--progress-color': '#4b41e1'  } as React.CSSProperties}>
<span className="text-[10px] font-bold">95%</span>
</div>
</div>
<div className="space-y-sm mb-md">
<div className="flex justify-between text-[12px]">
<span className="opacity-60">Revenue (MTD)</span>
<span className="font-data-mono font-bold">$12.5M</span>
</div>
<div className="w-full bg-surface-container-low h-1.5 rounded-full">
<div className="bg-secondary h-full rounded-full" style={{ width: '95%' }}></div>
</div>
</div>
<div className="flex justify-between items-center pt-sm border-t border-outline-variant/30">
<span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">Audit Ready</span>
<button className="text-secondary font-label-sm flex items-center gap-xs">View Ledger <span className="material-symbols-outlined text-[14px]">arrow_forward</span></button>
</div>
</div>
</div>
{/*  Financial Year Timeline & AI Chat  */}
<div className="grid grid-cols-12 gap-lg mt-xl">
<div className="col-span-12 lg:col-span-7 glass-panel rounded-3xl p-lg">
<h3 className="font-headline-md text-headline-md mb-lg">Financial Year Status</h3>
<div className="space-y-lg relative">
{/*  Vertical line  */}
<div className="absolute left-4 top-2 bottom-2 w-0.5 bg-outline-variant/30"></div>
{/*  Timeline Items  */}
<div className="relative pl-xl">
<div className="absolute left-2.5 top-1.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
<p className="font-label-sm text-emerald-600 font-bold mb-1">COMPLETED</p>
<h5 className="font-body-lg font-semibold">Q1 &amp; Q2 Statutory Audits</h5>
<p className="text-on-surface-variant text-sm">All filings submitted across 8 jurisdictions without flags.</p>
</div>
<div className="relative pl-xl">
<div className="absolute left-2.5 top-1.5 w-3 h-3 bg-secondary rounded-full border-2 border-white animate-pulse"></div>
<p className="font-label-sm text-secondary font-bold mb-1">IN PROGRESS</p>
<h5 className="font-body-lg font-semibold">Q3 Tax Provisioning</h5>
<p className="text-on-surface-variant text-sm">FinPilot AI is currently reconciling intercompany transactions for Vortex Global.</p>
</div>
<div className="relative pl-xl">
<div className="absolute left-2.5 top-1.5 w-3 h-3 bg-surface-container-highest rounded-full border-2 border-white"></div>
<p className="font-label-sm opacity-40 font-bold mb-1">UPCOMING</p>
<h5 className="font-body-lg font-semibold opacity-60">Year-End Consolidation</h5>
<p className="text-on-surface-variant text-sm opacity-60">Scheduled for March 15th start. All data streams locked.</p>
</div>
</div>
</div>
{/*  AI Chat Snippet  */}
<div className="col-span-12 lg:col-span-5 glass-panel rounded-3xl p-lg bg-primary-container text-white relative overflow-hidden flex flex-col">
<div className="flex items-center gap-sm mb-lg relative z-10">
<div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
<span className="material-symbols-outlined">smart_toy</span>
</div>
<div>
<h4 className="font-body-lg font-bold">FinPilot Analyst</h4>
<p className="text-[10px] opacity-70">Always active • Analyzing Group Health</p>
</div>
</div>
<div className="flex-1 space-y-md relative z-10">
<div className="p-md bg-white/10 rounded-2xl rounded-tl-none text-sm">
<p>I've detected a significant tax variance in your <strong>Nova Logistics</strong> entity. EU VAT regulation changes may impact your Q4 margin by <strong>-2.4%</strong>.</p>
</div>
<div className="p-md bg-secondary/80 rounded-2xl rounded-tr-none text-sm ml-auto max-w-[80%]">
<p>Generate a mitigation report for the board.</p>
</div>
<div className="flex gap-xs items-center p-md bg-white/5 rounded-2xl italic text-xs opacity-80">
<span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                            AI is drafting the impact analysis...
                        </div>
</div>
{/*  Decorative background glow for AI  */}
<div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-500/20 to-transparent pointer-events-none"></div>
</div>
</div>
</div>
</main>
{/*  Bottom Nav for Mobile  */}
<nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-lowest/80 backdrop-blur-xl border-t border-outline-variant/20 flex justify-around items-center pb-safe pt-2 z-50">
<a className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-2xl px-4 py-1" href="#">
<span className="material-symbols-outlined">home</span>
<span className="font-label-sm">Home</span>
</a>
<a className="flex flex-col items-center justify-center text-on-surface-variant" href="#">
<span className="material-symbols-outlined">list_alt</span>
<span className="font-label-sm">Ledger</span>
</a>
<a className="flex flex-col items-center justify-center text-on-surface-variant" href="#">
<span className="material-symbols-outlined">add_box</span>
<span className="font-label-sm">Entry</span>
</a>
<a className="flex flex-col items-center justify-center text-on-surface-variant" href="#">
<span className="material-symbols-outlined">insights</span>
<span className="font-label-sm">AI</span>
</a>
</nav>


        </div>
    );
};

export default CompanyIntelligenceDashboardPage;
