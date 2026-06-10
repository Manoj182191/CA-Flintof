import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import inventoryService, { InventorySummary } from '../services/inventoryService';

const InventoryIntelligencePage: React.FC = () => {
    const navigate = useNavigate();
    const { activeCompanyId } = useAuth();
    const [summary, setSummary] = useState<InventorySummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (activeCompanyId) {
            fetchData();
        }
    }, [activeCompanyId]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await inventoryService.getSummary();
            setSummary(data);
        } catch (error) {
            console.error('Failed to fetch inventory dashboard data', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="stitch-app">
            
{/*  Navigation Drawer (SideNav)  */}
<aside className="hidden md:flex flex-col h-screen py-md px-sm fixed h-full w-[280px] left-0 top-0 bg-surface dark:bg-primary-container border-r border-outline-variant dark:border-outline shadow-sm z-50">
<div className="mb-xl px-md">
<h1 className="font-display-lg text-[24px] text-primary dark:text-surface-bright leading-none mb-1">FinPilot Pro</h1>
<p className="font-label-sm text-on-surface-variant uppercase tracking-widest text-[10px]">Enterprise OS</p>
</div>
<nav className="flex-1 space-y-1">
<a className="flex items-center gap-3 px-md py-3 bg-secondary-container text-on-secondary-container rounded-lg font-bold transition-all duration-200" href="#">
<span className="material-symbols-outlined">dashboard</span>
<span className="font-body-md">Dashboard</span>
</a>
<a className="flex items-center gap-3 px-md py-3 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-all duration-200" href="#">
<span className="material-symbols-outlined">account_balance_wallet</span>
<span className="font-body-md">Ledgers</span>
</a>
<a className="flex items-center gap-3 px-md py-3 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-all duration-200" href="#">
<span className="material-symbols-outlined">receipt_long</span>
<span className="font-body-md">Vouchers</span>
</a>
<a className="flex items-center gap-3 px-md py-3 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-all duration-200" href="#">
<span className="material-symbols-outlined">account_balance</span>
<span className="font-body-md">Taxes</span>
</a>
<a className="flex items-center gap-3 px-md py-3 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-all duration-200" href="#">
<span className="material-symbols-outlined">settings</span>
<span className="font-body-md">Settings</span>
</a>
</nav>
<div className="mt-auto p-md bg-surface-container-low rounded-xl border border-outline-variant/30">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">JD</div>
<div>
<p className="font-label-sm text-on-surface font-bold">Jane Doe</p>
<p className="text-[10px] text-on-surface-variant">v2.4.0</p>
</div>
</div>
</div>
</aside>
{/*  Main Content Area  */}
<main className="md:ml-[280px] min-h-screen pb-24 md:pb-8">
{/*  Top App Bar  */}
<header className="sticky top-0 w-full z-40 bg-surface/70 dark:bg-primary-container/70 backdrop-blur-md border-b border-outline-variant/30">
<div className="flex justify-between items-center px-lg py-sm max-w-container-max mx-auto h-16">
<div className="flex items-center gap-4">
<span className="material-symbols-outlined text-primary">search</span>
<h2 className="font-headline-md text-headline-md text-primary dark:text-surface-bright">Inventory Global Search</h2>
</div>
<div className="flex items-center gap-4">
<button className="p-2 hover:bg-surface-container rounded-full transition-colors">
<span className="material-symbols-outlined text-secondary">smart_toy</span>
</button>
<div className="hidden md:flex flex-col items-end">
<span className="text-[10px] font-bold text-secondary uppercase tracking-tighter">AI Ready</span>
<span className="text-[12px] text-on-surface-variant">System Optimal</span>
</div>
</div>
</div>
</header>
<div className="max-w-container-max mx-auto p-lg space-y-lg">
{/*  Hero Bento Grid Section  */}
<section className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
{/*  Main KPI: Stock Health  */}
<div className="md:col-span-8 glass-card rounded-2xl p-lg relative overflow-hidden group">

<div className="relative z-10 flex flex-col h-full justify-between">
<div>
<div className="flex justify-between items-start mb-4">
<div>
<h3 className="font-headline-lg text-headline-lg text-primary">Stock Health Overview</h3>
<p className="text-on-surface-variant">94.2% Optimization Score</p>
</div>
<span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Stable</span>
</div>
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
<div>
<p className="font-label-sm text-on-surface-variant">Total Value</p>
<p className="font-data-mono text-headline-md text-primary">$4.2M</p>
</div>
<div>
<p className="font-label-sm text-on-surface-variant">Active SKUs</p>
<p className="font-data-mono text-headline-md text-primary">12,840</p>
</div>
<div>
<p className="font-label-sm text-on-surface-variant">Turnover Rate</p>
<p className="font-data-mono text-headline-md text-secondary">6.4x</p>
</div>
<div>
<p className="font-label-sm text-on-surface-variant">Avg Lead Time</p>
<p className="font-data-mono text-headline-md text-primary">14d</p>
</div>
</div>
</div>
<div className="mt-12 h-24 flex items-end gap-1">
{/*  Visual representation of health over 30 days  */}
<div className="flex-1 bg-secondary/20 rounded-t-sm h-[60%] transition-all group-hover:h-[80%]"></div>
<div className="flex-1 bg-secondary/20 rounded-t-sm h-[70%] transition-all group-hover:h-[65%]"></div>
<div className="flex-1 bg-secondary/20 rounded-t-sm h-[55%] transition-all group-hover:h-[75%]"></div>
<div className="flex-1 bg-secondary/20 rounded-t-sm h-[80%] transition-all group-hover:h-[90%]"></div>
<div className="flex-1 bg-secondary/20 rounded-t-sm h-[65%] transition-all group-hover:h-[60%]"></div>
<div className="flex-1 bg-secondary/20 rounded-t-sm h-[90%] transition-all group-hover:h-[85%]"></div>
<div className="flex-1 bg-secondary/40 rounded-t-sm h-[95%] transition-all group-hover:h-[100%]"></div>
</div>
</div>
</div>
{/*  Reorder Alerts  */}
<div className="md:col-span-4 bg-primary text-white rounded-2xl p-lg flex flex-col justify-between shadow-lg">
<div>
<div className="flex items-center gap-2 mb-4 text-error-container">
<span className="material-symbols-outlined">warning</span>
<h3 className="font-headline-md text-headline-md">Critical Alerts</h3>
</div>
<div className="space-y-4">
<div className="p-3 bg-white/10 rounded-xl border border-white/5">
<p className="text-[12px] opacity-70">Item SKU-982 (Mainframe Chips)</p>
<div className="flex justify-between items-center mt-1">
<p className="font-bold">2 units left</p>
<button className="bg-secondary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Reorder</button>
</div>
</div>
<div className="p-3 bg-white/10 rounded-xl border border-white/5">
<p className="text-[12px] opacity-70">Item SKU-441 (Coolant Liquid)</p>
<div className="flex justify-between items-center mt-1">
<p className="font-bold">Out of stock</p>
<button className="bg-secondary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Source</button>
</div>
</div>
</div>
</div>
<div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
<span className="text-on-primary-container font-label-sm">8 Total Alerts</span>
<a className="text-secondary-fixed font-bold text-sm underline" href="#">View All</a>
</div>
</div>
</section>
{/*  Secondary Bento: Dead Stock & Fast Moving  */}
<section className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
{/*  Fast Moving Items with AI Prediction  */}
<div className="md:col-span-7 glass-card rounded-2xl overflow-hidden">
<div className="px-lg py-md border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest/30">
<h4 className="font-headline-md text-primary">Fast-Moving Inventory</h4>
<div className="flex items-center gap-2 text-[10px] font-bold text-secondary bg-secondary-container/20 px-2 py-1 rounded">
<span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: '"FILL" 1' }}>insights</span>
                            AI PREDICTION ACTIVE
                        </div>
</div>
<div className="p-0 overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-low text-on-surface-variant font-label-sm">
<th className="px-lg py-3 font-semibold">Product Name</th>
<th className="px-lg py-3 font-semibold text-right">Sold (30d)</th>
<th className="px-lg py-3 font-semibold text-center">7d Trend</th>
<th className="px-lg py-3 font-semibold">Risk Level</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/30">
<tr className="hover:bg-surface-container transition-colors">
<td className="px-lg py-4">
<p className="font-bold text-primary">Titanium Casings L-9</p>
<p className="text-[12px] text-on-surface-variant">SKU: CAS-0092</p>
</td>
<td className="px-lg py-4 text-right font-data-mono font-bold">2,482</td>
<td className="px-lg py-4 text-center">
<div className="w-24 h-6 mx-auto bg-emerald-50 relative rounded overflow-hidden">
<div className="absolute inset-y-0 left-0 bg-emerald-400 w-full" style={{ clipPath: 'polygon(0 80%, 15% 70%, 30% 85%, 50% 40%, 70% 50%, 85% 10%, 100% 20%, 100% 100%, 0% 100%)' }}></div>
</div>
</td>
<td className="px-lg py-4">
<span className="text-on-primary-fixed-variant bg-primary-fixed/30 px-2 py-1 rounded-full text-[10px] font-bold">Low Risk</span>
</td>
</tr>
<tr className="hover:bg-surface-container transition-colors">
<td className="px-lg py-4">
<p className="font-bold text-primary">Optical Sensors G-2</p>
<p className="text-[12px] text-on-surface-variant">SKU: SEN-0142</p>
</td>
<td className="px-lg py-4 text-right font-data-mono font-bold">1,894</td>
<td className="px-lg py-4 text-center">
<div className="w-24 h-6 mx-auto bg-amber-50 relative rounded overflow-hidden">
<div className="absolute inset-y-0 left-0 bg-amber-400 w-full" style={{ clipPath: 'polygon(0 20%, 20% 40%, 40% 10%, 60% 70%, 80% 60%, 100% 90%, 100% 100%, 0% 100%)' }}></div>
</div>
</td>
<td className="px-lg py-4">
<span className="text-amber-700 bg-amber-100 px-2 py-1 rounded-full text-[10px] font-bold">High Volatility</span>
</td>
</tr>
</tbody>
</table>
</div>
</div>
{/*  Dead Stock Analysis  */}
<div className="md:col-span-5 glass-card rounded-2xl p-lg flex flex-col justify-between ai-glow">
<div>
<h4 className="font-headline-md text-primary mb-2">Dead Stock Analysis</h4>
<p className="text-on-surface-variant text-sm mb-6">Capital tied in non-moving items: <span className="text-error font-bold">$142,000</span></p>
<div className="space-y-4">
<div className="flex items-center gap-4 group cursor-pointer">
<div className="w-12 h-12 bg-surface-container-highest rounded-lg flex items-center justify-center">
<span className="material-symbols-outlined text-outline">inventory_2</span>
</div>
<div className="flex-1">
<div className="flex justify-between items-center">
<p className="font-bold text-on-surface">Thermal Wraps X</p>
<p className="font-data-mono text-sm">180d+ Idle</p>
</div>
<div className="w-full bg-outline-variant/30 h-1 rounded-full mt-2">
<div className="bg-error h-full rounded-full" style={{ width: '85%' }}></div>
</div>
</div>
</div>
<div className="flex items-center gap-4 group cursor-pointer">
<div className="w-12 h-12 bg-surface-container-highest rounded-lg flex items-center justify-center">
<span className="material-symbols-outlined text-outline">package_2</span>
</div>
<div className="flex-1">
<div className="flex justify-between items-center">
<p className="font-bold text-on-surface">Legacy Cables v1</p>
<p className="font-data-mono text-sm">120d+ Idle</p>
</div>
<div className="w-full bg-outline-variant/30 h-1 rounded-full mt-2">
<div className="bg-amber-500 h-full rounded-full" style={{ width: '65%' }}></div>
</div>
</div>
</div>
</div>
</div>
<button className="mt-8 w-full border border-secondary text-secondary font-bold py-3 rounded-xl hover:bg-secondary hover:text-white transition-all">Generate Liquidation Strategy</button>
</div>
</section>
{/*  Warehouse Status & Map  */}
<section className="glass-card rounded-2xl p-lg">
<div className="flex flex-col md:flex-row gap-lg">
<div className="md:w-1/3 space-y-md">
<h4 className="font-headline-md text-primary">Warehouse Status</h4>
<div className="space-y-2">
<div className="p-4 bg-surface-container rounded-xl flex justify-between items-center border border-transparent hover:border-secondary transition-all cursor-pointer">
<div>
<p className="font-bold">North Logistics Hub</p>
<p className="text-xs text-on-surface-variant">Chicago, IL</p>
</div>
<div className="text-right">
<p className="font-data-mono font-bold">88% Full</p>
<div className="w-16 h-1 bg-outline-variant rounded-full mt-1">
<div className="bg-emerald-500 h-full rounded-full" style={{ width: '88%' }}></div>
</div>
</div>
</div>
<div className="p-4 bg-surface-container rounded-xl flex justify-between items-center border border-transparent hover:border-secondary transition-all cursor-pointer">
<div>
<p className="font-bold">South Distribution Center</p>
<p className="text-xs text-on-surface-variant">Austin, TX</p>
</div>
<div className="text-right">
<p className="font-data-mono font-bold">42% Full</p>
<div className="w-16 h-1 bg-outline-variant rounded-full mt-1">
<div className="bg-secondary h-full rounded-full" style={{ width: '42%' }}></div>
</div>
</div>
</div>
<div className="p-4 bg-surface-container rounded-xl flex justify-between items-center border border-transparent hover:border-secondary transition-all cursor-pointer">
<div>
<p className="font-bold">West Coast Depot</p>
<p className="text-xs text-on-surface-variant">Oakland, CA</p>
</div>
<div className="text-right">
<p className="font-data-mono font-bold">96% Full</p>
<div className="w-16 h-1 bg-outline-variant rounded-full mt-1">
<div className="bg-error h-full rounded-full" style={{ width: '96%' }}></div>
</div>
</div>
</div>
</div>
</div>
<div className="md:w-2/3 h-80 bg-surface-container-high rounded-2xl overflow-hidden relative group">
<div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" data-alt="A sophisticated digital map visualization of global logistics warehouses, featuring glowing data points and interconnected fiber-optic style paths. The style is a premium dark-mode aesthetic with deep blues and vibrant cyan accents, mirroring a high-tech operations center. Soft ambient lighting illuminates the UI overlay, creating a sense of depth and advanced technological monitoring." style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuArMBsPN8XGYoq61B1dqLLnXKHa3vOY2N9ylIEn40rbIhMO2GDjMfJxLXzf0v9UkoHUx-xMNzGlTNZliRFrGD8CUqG5ZmV94UpoKbA4G250Bw8dRSWTAk5UXCCMXkuz6Vo6hYRiOqMvujXtLtLcJb9VGuJtOt0IHWyJFqipH4Ppz_46f_mZUdKv0M1Ek_JcTW9e3ArVe_iMPeAEaBZc4RU9vcpI1z-6dDtQiXU4WBez-updGNWhv0G9t1jJ7C_ivZUeP47EZoBys6M")' }}></div>
<div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px]"></div>
<div className="absolute inset-0 p-lg flex flex-col justify-between pointer-events-none">
<div className="flex justify-end gap-2">
<div className="bg-white/90 backdrop-blur p-2 rounded-lg flex items-center gap-2 pointer-events-auto shadow-sm">
<span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
<span className="font-label-sm text-primary">Live Feeds Active</span>
</div>
</div>
<div className="pointer-events-auto">
<button className="bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:bg-secondary transition-colors">
<span className="material-symbols-outlined text-[20px]">map</span>
                                    Enter 3D View
                                </button>
</div>
</div>
</div>
</div>
</section>
</div>
</main>
{/*  Bottom Navigation Bar (Mobile only)  */}
<nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center bg-surface-container-lowest/80 dark:bg-primary-container/90 backdrop-blur-xl border-t border-outline-variant/20 shadow-lg pb-safe pt-2 z-50">
<a className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-2xl px-4 py-1 animate-pulse-subtle" href="#">
<span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>home</span>
<span className="font-label-sm text-[10px]">Home</span>
</a>
<a className="flex flex-col items-center justify-center text-on-surface-variant" href="#">
<span className="material-symbols-outlined">list_alt</span>
<span className="font-label-sm text-[10px]">Ledger</span>
</a>
<a className="flex flex-col items-center justify-center text-on-surface-variant" href="#">
<span className="material-symbols-outlined">add_box</span>
<span className="font-label-sm text-[10px]">Entry</span>
</a>
<a className="flex flex-col items-center justify-center text-on-surface-variant" href="#">
<span className="material-symbols-outlined">insights</span>
<span className="font-label-sm text-[10px]">AI</span>
</a>
</nav>
{/*  AI Floating Insight Panel (Contextual)  */}
<div className="fixed right-6 bottom-24 w-80 glass-card rounded-2xl p-md shadow-2xl z-40 transform translate-x-[110%] transition-transform duration-500 ease-out hidden lg:block border-secondary/30" id="ai-panel">
<div className="flex items-center gap-2 mb-4">
<div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white">
<span className="material-symbols-outlined text-[18px]">smart_toy</span>
</div>
<div>
<p className="font-bold text-primary text-sm">FinPilot AI</p>
<p className="text-[10px] text-on-surface-variant">Insight Generator</p>
</div>
<button className="ml-auto text-on-surface-variant hover:text-primary" onClick={() => {}}>
<span className="material-symbols-outlined">close</span>
</button>
</div>
<div className="space-y-4">
<div className="p-3 bg-secondary-container/10 rounded-xl border border-secondary/20">
<p className="text-[12px] leading-relaxed italic text-on-surface">"I've detected a 22% increase in demand for Titanium Casings over the next 14 days based on historical seasonal patterns and current market trends."</p>
</div>
<div className="p-3 bg-surface-container-high rounded-xl">
<p className="text-[11px] font-bold text-primary mb-1">Recommended Action:</p>
<p className="text-[11px] text-on-surface-variant">Increase safety stock at North Hub by 15% before Friday.</p>
<button className="mt-2 w-full bg-primary text-white text-[10px] font-bold py-1.5 rounded-lg">Execute Optimization</button>
</div>
</div>
</div>
{/*  Activation Button for AI Panel (Persistent)  */}
<button className="fixed right-6 bottom-24 md:bottom-8 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl z-40 hover:scale-110 transition-transform active:scale-95 group" onClick={() => {}}>
<span className="material-symbols-outlined text-[28px] group-hover:rotate-12 transition-transform">smart_toy</span>
</button>


        </div>
    );
};

export default InventoryIntelligencePage;
