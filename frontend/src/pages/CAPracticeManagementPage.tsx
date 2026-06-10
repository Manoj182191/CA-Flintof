import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';

const CAPracticeManagementPage: React.FC = () => {
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
<aside className="hidden md:flex flex-col h-screen w-[280px] fixed inset-y-0 left-0 z-[60] bg-surface-container-lowest border-r border-outline-variant/30 p-md transition-transform duration-300 ease-in-out">
<div className="mb-lg px-sm">
<h1 className="font-headline-md text-headline-md font-bold text-primary">FinPilot Pro</h1>
<p className="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider mt-xs">CA Practice Suite</p>
</div>
<div className="flex items-center gap-md p-md mb-lg rounded-lg bg-surface-container shadow-sm border border-outline-variant/20">
<div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold overflow-hidden">
<img alt="CA Vikram Mehta" className="w-full h-full object-cover" data-alt="A professional headshot of a senior financial partner in a modern corporate setting. The man is wearing a tailored grey suit and has a confident, approachable expression. The background is a blurred office with soft blue and white lighting, maintaining a clean and minimalist aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSHKvhsaltOJ2f7DBDGFDAHX_r4hPnwEu-11NfQBm3wRwWa46tAy2rz4hsuLIzCCCWuG5UEjthUtRgCnjAAPEmzK_EQbO3UgBFdfHrdUddOF7rPEdcZqL9oFvmQImXiJ7LFAAYtCezV9BXagxeuktmrTAyyJ_7HTx4r30EvgSeXKpen52hDRuDZQ28fEGIrIs3uowYrDsKrGCl9SZUYhxO95O4F2_CD66iYpkNFrnxOqzgb8ZwLl04BDqFCysirE4IxcjAasdqLgo"/>
</div>
<div>
<p className="font-body-md font-bold text-on-surface">CA Vikram Mehta</p>
<p className="text-label-sm text-on-surface-variant">Senior Partner</p>
</div>
</div>
<nav className="flex-1 space-y-1">
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all" href="#">
<span className="material-symbols-outlined">fact_check</span>
<span className="font-body-md">Audit</span>
</a>
<a className="flex items-center gap-md px-md py-sm bg-secondary-container text-on-secondary-container rounded-lg font-bold transition-all" href="#">
<span className="material-symbols-outlined">business</span>
<span className="font-body-md">Engagements</span>
</a>
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all" href="#">
<span className="material-symbols-outlined">payments</span>
<span className="font-body-md">TDS</span>
</a>
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all" href="#">
<span className="material-symbols-outlined">receipt_long</span>
<span className="font-body-md">GST</span>
</a>
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all" href="#">
<span className="material-symbols-outlined">groups</span>
<span className="font-body-md">HR</span>
</a>
</nav>
<div className="mt-auto pt-md border-t border-outline-variant/30">
<p className="text-label-sm text-outline px-md">FinPilot Pro OS v4.2.0</p>
</div>
</aside>
{/*  Main Content Canvas  */}
<main className="flex-1 md:ml-[280px] flex flex-col min-h-screen">
{/*  Top App Bar  */}
<header className="sticky top-0 z-50 flex justify-between items-center w-full px-gutter h-16 bg-surface/70 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm">
<div className="flex items-center gap-md md:hidden">
<span className="material-symbols-outlined cursor-pointer text-primary">menu</span>
<h1 className="font-headline-md text-headline-md font-bold text-primary">FinPilot Pro</h1>
</div>
<div className="hidden md:flex items-center gap-sm">
<span className="material-symbols-outlined text-outline">search</span>
<input className="bg-transparent border-none focus:ring-0 text-body-md w-64" placeholder="Search clients, staff, or tasks..." type="text"/>
</div>
<div className="flex items-center gap-lg">
<div className="hidden sm:flex gap-md">
<span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:bg-surface-container-high/50 p-sm rounded-full transition-colors active:scale-95">notifications</span>
<span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:bg-surface-container-high/50 p-sm rounded-full transition-colors active:scale-95">help_outline</span>
</div>
<div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center cursor-pointer active:scale-95 duration-200">
<span className="material-symbols-outlined text-on-primary-container text-sm">settings</span>
</div>
</div>
</header>
{/*  Content Area  */}
<section className="p-gutter flex flex-col gap-lg flex-1 overflow-x-hidden">
{/*  Strategic Header & AI Card  */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
<div className="lg:col-span-2 flex flex-col justify-center">
<h2 className="font-headline-lg text-headline-lg text-primary">Practice Dashboard</h2>
<p className="text-body-lg text-on-surface-variant">Overseeing 42 active engagements across 4 senior partners.</p>
</div>
{/*  AI Insight Card  */}
<div className="ai-glow glass bg-white/80 border border-secondary/20 p-md rounded-xl flex items-center gap-md">
<div className="w-12 h-12 rounded-lg bg-gradient-to-br from-secondary to-tertiary-container flex items-center justify-center text-white shrink-0">
<span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>auto_awesome</span>
</div>
<div className="flex-1">
<p className="font-body-md font-bold text-primary">AI Insight</p>
<p className="text-body-md text-on-surface-variant leading-tight">3 Audits approaching deadline - Reallocate staff?</p>
</div>
<button className="bg-secondary text-white px-md py-xs rounded-lg font-label-sm text-label-sm hover:opacity-90 transition-opacity whitespace-nowrap">Optimize</button>
</div>
</div>
{/*  Tracking Widgets Grid  */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
<div className="bg-surface-container-lowest border border-outline-variant/30 p-md rounded-xl shadow-sm">
<div className="flex justify-between items-start mb-sm">
<span className="text-on-surface-variant font-label-sm text-label-sm uppercase">Avg Turnaround Time</span>
<span className="material-symbols-outlined text-secondary text-md">timelapse</span>
</div>
<div className="flex items-end gap-sm">
<span className="font-data-mono text-headline-md text-primary">12.4 Days</span>
<span className="text-label-sm text-emerald-600 pb-1 flex items-center"><span className="material-symbols-outlined text-xs">arrow_downward</span>8%</span>
</div>
</div>
<div className="bg-surface-container-lowest border border-outline-variant/30 p-md rounded-xl shadow-sm">
<div className="flex justify-between items-start mb-sm">
<span className="text-on-surface-variant font-label-sm text-label-sm uppercase">Staff Utilization</span>
<span className="material-symbols-outlined text-secondary text-md">query_stats</span>
</div>
<div className="flex items-end gap-sm">
<span className="font-data-mono text-headline-md text-primary">84%</span>
<span className="text-label-sm text-error pb-1 flex items-center"><span className="material-symbols-outlined text-xs">arrow_upward</span>3%</span>
</div>
</div>
<div className="bg-surface-container-lowest border border-outline-variant/30 p-md rounded-xl shadow-sm">
<div className="flex justify-between items-start mb-sm">
<span className="text-on-surface-variant font-label-sm text-label-sm uppercase">Active Audits</span>
<span className="material-symbols-outlined text-secondary text-md">fact_check</span>
</div>
<div className="flex items-end gap-sm">
<span className="font-data-mono text-headline-md text-primary">28</span>
<span className="text-label-sm text-on-surface-variant pb-1">Targets Met</span>
</div>
</div>
<div className="bg-surface-container-lowest border border-outline-variant/30 p-md rounded-xl shadow-sm">
<div className="flex justify-between items-start mb-sm">
<span className="text-on-surface-variant font-label-sm text-label-sm uppercase">Pending Approvals</span>
<span className="material-symbols-outlined text-secondary text-md">approval</span>
</div>
<div className="flex items-end gap-sm">
<span className="font-data-mono text-headline-md text-primary">06</span>
<span className="text-label-sm text-on-surface-variant pb-1 flex items-center">High Priority</span>
</div>
</div>
</div>
{/*  Kanban Board Section  */}
<div className="flex flex-col gap-md flex-1">
<div className="flex justify-between items-center">
<div className="flex items-center gap-md">
<h3 className="font-headline-md text-headline-md text-primary">Engagements</h3>
<div className="flex items-center bg-surface-container px-sm py-xs rounded-lg text-label-sm border border-outline-variant/20">
<span className="material-symbols-outlined text-xs mr-xs">filter_list</span>
                            Filter: Q3 2024
                        </div>
</div>
<button className="bg-primary text-white flex items-center gap-xs px-md py-sm rounded-lg font-label-sm hover:bg-primary-container active:scale-95 transition-all">
<span className="material-symbols-outlined text-sm">add</span> New Engagement
                    </button>
</div>
{/*  Kanban Columns  */}
<div className="flex gap-lg overflow-x-auto custom-scrollbar pb-lg -mx-gutter px-gutter">
{/*  Not Started  */}
<div className="kanban-col flex flex-col gap-md shrink-0">
<div className="flex items-center justify-between px-xs">
<div className="flex items-center gap-sm">
<div className="w-2 h-2 rounded-full bg-outline"></div>
<span className="font-body-md font-bold text-on-surface-variant uppercase tracking-wide">Not Started</span>
<span className="bg-surface-container-high px-xs rounded-md text-label-sm font-bold text-on-surface-variant">4</span>
</div>
<span className="material-symbols-outlined text-outline cursor-pointer">more_horiz</span>
</div>
<div className="flex flex-col gap-sm">
{/*  Card 1  */}
<div className="bg-white border border-outline-variant/30 p-md rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]">
<div className="flex justify-between items-start mb-sm">
<span className="text-label-sm font-bold bg-surface-container px-xs py-1 rounded text-primary">TDS Filing</span>
<span className="material-symbols-outlined text-outline text-sm">drag_indicator</span>
</div>
<p className="font-body-md font-bold text-on-surface mb-md">Reliance Ind. Logistics</p>
<div className="flex items-center justify-between">
<div className="flex -space-x-2">
<div className="w-6 h-6 rounded-full bg-tertiary-container border-2 border-white flex items-center justify-center text-[10px] text-white">AK</div>
</div>
<div className="flex items-center gap-xs text-on-surface-variant">
<span className="material-symbols-outlined text-sm">event</span>
<span className="text-label-sm">Sep 15</span>
</div>
</div>
</div>
{/*  Card 2  */}
<div className="bg-white border border-outline-variant/30 p-md rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]">
<div className="flex justify-between items-start mb-sm">
<span className="text-label-sm font-bold bg-surface-container px-xs py-1 rounded text-primary">Statutory Audit</span>
<span className="material-symbols-outlined text-outline text-sm">drag_indicator</span>
</div>
<p className="font-body-md font-bold text-on-surface mb-md">V-Guard Services</p>
<div className="flex items-center justify-between">
<div className="flex -space-x-2">
<div className="w-6 h-6 rounded-full bg-primary-container border-2 border-white flex items-center justify-center text-[10px] text-white">VS</div>
</div>
<div className="flex items-center gap-xs text-error font-bold">
<span className="material-symbols-outlined text-sm">event</span>
<span className="text-label-sm">Oct 02</span>
</div>
</div>
</div>
</div>
</div>
{/*  In Progress  */}
<div className="kanban-col flex flex-col gap-md shrink-0">
<div className="flex items-center justify-between px-xs">
<div className="flex items-center gap-sm">
<div className="w-2 h-2 rounded-full bg-secondary"></div>
<span className="font-body-md font-bold text-on-surface-variant uppercase tracking-wide">In Progress</span>
<span className="bg-secondary-container px-xs rounded-md text-label-sm font-bold text-on-secondary-container">12</span>
</div>
<span className="material-symbols-outlined text-outline cursor-pointer">more_horiz</span>
</div>
<div className="flex flex-col gap-sm">
<div className="bg-white border-l-4 border-l-secondary border border-outline-variant/30 p-md rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
<div className="flex justify-between items-start mb-sm">
<span className="text-label-sm font-bold bg-secondary-fixed text-on-secondary-fixed-variant px-xs py-1 rounded">Tax Compliance</span>
<span className="material-symbols-outlined text-outline text-sm">drag_indicator</span>
</div>
<p className="font-body-md font-bold text-on-surface mb-md">Adani Green Tech</p>
<div className="w-full bg-surface-container rounded-full h-1.5 mb-md">
<div className="bg-secondary h-1.5 rounded-full" style={{ width: '65%' }}></div>
</div>
<div className="flex items-center justify-between">
<div className="flex -space-x-2">
<img alt="Staff" className="w-6 h-6 rounded-full border-2 border-white" data-alt="A focused portrait of a young tech-savvy professional analyst in a high-contrast office setting with modern glass architecture. The lighting is crisp and energetic, highlighting the professional's sharp attire and modern aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoiL5r1mnXMnmOCuZLb-Au4d2tp-lvZT8m5i8cDcqhK8xQfNmqXlfg5eR7i2dYPDJGt6F-s9-QV7eKcZsKiYguTU299XOm_Q2RfithMaL_HhnXZ2yNoksjrdPYJYiQlyeGTxRcanqsQ15KUqQy_6F0kOpaDSaWutDUENyykICTgNtPC-Xn-dXFwrsWo6xjXHxyY9TxIk2FQvC2EUFiV7WEvMoM7UrrW2m_BiXYHJYtReRjoliV9k-q3bH-PB0d4-IHKHoJc5dKmDc"/>
<img alt="Staff" className="w-6 h-6 rounded-full border-2 border-white" data-alt="A portrait of a cheerful, professional woman in a modern minimalist workspace. The color palette is composed of soft whites and navy blues, creating a calm yet industrious atmosphere. Her professional attire and the clean lines of the background emphasize a high-end corporate futurism." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8OgCsgmPGoQozTzlZ2djAyxyW65GBp_mmZ5M5n8zAh9cd7kse4C-VHifWMkBbtfG802kM3U93x5VhXldxv79zNFM9jmYJQtnjRNLcI1xsVpBs-8_tdxZSpwofVndkm9kIzFJP1vrgsWRg50OcvF1vOCjUVCYMZa6ZrX2onzGSwgKEe8sBcRhfHg671zfqPWkCP_nAESSaJVwOBRO78nFe5VO5erewJk34fka6ikj7XVxP1w8A976PN_D_c9B1Kf_6pGJejPYgmMI"/>
</div>
<div className="flex items-center gap-xs text-on-surface-variant">
<span className="material-symbols-outlined text-sm">event</span>
<span className="text-label-sm">Sep 28</span>
</div>
</div>
</div>
</div>
</div>
{/*  Review  */}
<div className="kanban-col flex flex-col gap-md shrink-0">
<div className="flex items-center justify-between px-xs">
<div className="flex items-center gap-sm">
<div className="w-2 h-2 rounded-full bg-tertiary-container"></div>
<span className="font-body-md font-bold text-on-surface-variant uppercase tracking-wide">Review</span>
<span className="bg-tertiary-fixed px-xs rounded-md text-label-sm font-bold text-on-tertiary-fixed-variant">3</span>
</div>
<span className="material-symbols-outlined text-outline cursor-pointer">more_horiz</span>
</div>
<div className="flex flex-col gap-sm">
<div className="bg-white border-l-4 border-l-tertiary-container border border-outline-variant/30 p-md rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
<div className="flex justify-between items-start mb-sm">
<span className="text-label-sm font-bold bg-tertiary-fixed text-on-tertiary-fixed-variant px-xs py-1 rounded">Internal Audit</span>
<span className="material-symbols-outlined text-outline text-sm">drag_indicator</span>
</div>
<p className="font-body-md font-bold text-on-surface mb-md">Tata Motors Corp</p>
<div className="flex items-center gap-xs text-tertiary font-bold mb-md">
<span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>warning</span>
<span className="text-label-sm">Pending Partner Approval</span>
</div>
<div className="flex items-center justify-between">
<div className="flex -space-x-2">
<div className="w-6 h-6 rounded-full bg-secondary text-white border-2 border-white flex items-center justify-center text-[10px]">VM</div>
</div>
<div className="flex items-center gap-xs text-on-surface-variant">
<span className="material-symbols-outlined text-sm">event</span>
<span className="text-label-sm">Sep 12</span>
</div>
</div>
</div>
</div>
</div>
{/*  Completed  */}
<div className="kanban-col flex flex-col gap-md shrink-0">
<div className="flex items-center justify-between px-xs">
<div className="flex items-center gap-sm">
<div className="w-2 h-2 rounded-full bg-emerald-500"></div>
<span className="font-body-md font-bold text-on-surface-variant uppercase tracking-wide">Completed</span>
<span className="bg-emerald-100 px-xs rounded-md text-label-sm font-bold text-emerald-700">23</span>
</div>
<span className="material-symbols-outlined text-outline cursor-pointer">more_horiz</span>
</div>
<div className="flex flex-col gap-sm opacity-70 grayscale-[0.5]">
<div className="bg-surface-container-lowest border border-outline-variant/30 p-md rounded-xl shadow-sm">
<div className="flex justify-between items-start mb-sm">
<span className="text-label-sm font-bold bg-emerald-50 text-emerald-600 px-xs py-1 rounded">GST Filing</span>
<span className="material-symbols-outlined text-emerald-600 text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
</div>
<p className="font-body-md font-bold text-on-surface mb-md">Zomato Logistics</p>
<div className="flex items-center justify-between">
<div className="flex -space-x-2">
<div className="w-6 h-6 rounded-full bg-outline-variant text-white border-2 border-white flex items-center justify-center text-[10px]">RM</div>
</div>
<div className="flex items-center gap-xs text-emerald-600">
<span className="material-symbols-outlined text-sm">event_available</span>
<span className="text-label-sm">Aug 30</span>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</section>
</main>
{/*  Mobile Navigation Bar  */}
<nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center py-2 px-4 bg-surface border-t border-outline-variant/20 shadow-lg z-50 rounded-t-xl">
<div className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-full px-4 py-1 active:scale-90 transition-transform">
<span className="material-symbols-outlined">home</span>
<span className="font-label-sm text-label-sm">Home</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary active:scale-90 transition-transform">
<span className="material-symbols-outlined">account_balance_wallet</span>
<span className="font-label-sm text-label-sm">Ledgers</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary active:scale-90 transition-transform">
<span className="material-symbols-outlined">verified_user</span>
<span className="font-label-sm text-label-sm">Compliance</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary active:scale-90 transition-transform">
<span className="material-symbols-outlined">groups</span>
<span className="font-label-sm text-label-sm">HR</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary active:scale-90 transition-transform">
<span className="material-symbols-outlined">more_horiz</span>
<span className="font-label-sm text-label-sm">More</span>
</div>
</nav>
{/*  Contextual FAB  */}
<button className="fixed bottom-24 right-gutter md:bottom-gutter md:right-gutter bg-primary text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-[70]">
<span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>add</span>
</button>


        </div>
    );
};

export default CAPracticeManagementPage;
