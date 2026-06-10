import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import inventoryService, { InventorySummary } from '../services/inventoryService';

const StockAdjustmentCenterPage: React.FC = () => {
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
            
{/*  Top App Bar  */}
<header className="bg-surface/70 backdrop-blur-xl text-primary font-headline-md text-headline-md docked full-width top-0 sticky border-b border-outline-variant/30 shadow-sm flex justify-between items-center w-full px-gutter h-16 z-50">
<div className="flex items-center gap-3">
<button className="material-symbols-outlined cursor-pointer active:scale-95 duration-200">menu</button>
<h1 className="font-bold tracking-tight">FinPilot Pro</h1>
</div>
<div className="flex items-center gap-4">
<button className="material-symbols-outlined">notifications</button>
<div className="w-8 h-8 rounded-full bg-surface-variant overflow-hidden border border-outline-variant/50">
<img alt="User Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuABefPdoIKNTEtpmdaiUrI4vjKIzUXOAiWjJujDoWYT455bj_oUQdzmZxy7lpBeuLfQ0aIHm9DjTb3DoCNNLB1j708gOmZyfoP8ZqRJX8ScxIJ6q61xaLSsahux7OFD_DhFtkJ7qbyCdNnQSOsI34pob0MR7DjlE7GS9SmrohOSDWVLUemEkeRkGk93-XeYs5YeXRl_JThbfNsVxJku2uWiUgBY4tLKm_Vo-gQYNM6yQtmucG-EtWUzjbfDUfeFo4sskA1LqmF6wx8"/>
</div>
</div>
</header>
<main className="max-w-md mx-auto px-gutter py-md space-y-6">
{/*  Warehouse Selector  */}
<section>
<div className="flex items-center justify-between mb-sm">
<h2 className="font-headline-md text-headline-md text-primary">Adjustment Center</h2>
<span className="text-label-sm font-label-sm text-secondary bg-secondary-fixed px-2 py-0.5 rounded-full uppercase tracking-wider">Inventory</span>
</div>
<div className="glass-card rounded-xl p-md flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: '"FILL" 1' }}>warehouse</span>
<div>
<p className="text-label-sm font-label-sm text-on-surface-variant">Active Warehouse</p>
<p className="font-body-md font-bold text-primary">Main Distribution Center (DC-01)</p>
</div>
</div>
<span className="material-symbols-outlined text-outline">expand_more</span>
</div>
</section>
{/*  Search & Scan  */}
<section className="flex gap-2">
<div className="relative flex-grow">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
<input className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary font-body-md" placeholder="Search item or SKU..." type="text"/>
</div>
<button className="bg-primary text-on-primary w-12 flex items-center justify-center rounded-xl active:scale-90 transition-transform">
<span className="material-symbols-outlined">barcode_scanner</span>
</button>
</section>
{/*  Quick Adjust Actions  */}
<section>
<h3 className="text-label-sm font-label-sm text-on-surface-variant mb-sm uppercase px-1">Quick Adjust</h3>
<div className="grid grid-cols-2 gap-3">
<button className="flex flex-col items-center justify-center p-md rounded-2xl bg-white shadow-sm border border-outline-variant/20 active:bg-surface-container-high transition-colors text-center group">
<div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-active:scale-90 transition-transform">
<span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: '"FILL" 1' }}>add_circle</span>
</div>
<span className="font-headline-md text-headline-md text-primary text-sm">Stock In</span>
</button>
<button className="flex flex-col items-center justify-center p-md rounded-2xl bg-white shadow-sm border border-outline-variant/20 active:bg-surface-container-high transition-colors text-center group">
<div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-2 group-active:scale-90 transition-transform">
<span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: '"FILL" 1' }}>remove_circle</span>
</div>
<span className="font-headline-md text-headline-md text-primary text-sm">Stock Out</span>
</button>
<button className="flex flex-col items-center justify-center p-md rounded-2xl bg-white shadow-sm border border-outline-variant/20 active:bg-surface-container-high transition-colors text-center group">
<div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-2 group-active:scale-90 transition-transform">
<span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: '"FILL" 1' }}>garage</span>
</div>
<span className="font-headline-md text-headline-md text-primary text-sm">Damage</span>
</button>
<button className="flex flex-col items-center justify-center p-md rounded-2xl bg-white shadow-sm border border-outline-variant/20 active:bg-surface-container-high transition-colors text-center group">
<div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mb-2 group-active:scale-90 transition-transform">
<span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: '"FILL" 1' }}>inventory_2</span>
</div>
<span className="font-headline-md text-headline-md text-primary text-sm">Loss</span>
</button>
</div>
</section>
{/*  Adjustment History Timeline  */}
<section>
<div className="flex items-center justify-between mb-sm px-1">
<h3 className="text-label-sm font-label-sm text-on-surface-variant uppercase">Recent History</h3>
<button className="text-secondary font-label-sm text-label-sm">View All</button>
</div>
<div className="space-y-3">
{/*  Timeline Item 1  */}
<div className="glass-card rounded-xl p-md relative overflow-hidden">
<div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
<div className="flex justify-between items-start mb-2">
<div className="flex gap-3">
<div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center">
<span className="material-symbols-outlined text-primary">laptop_mac</span>
</div>
<div>
<h4 className="font-body-md font-bold text-primary">MacBook Pro M3</h4>
<p className="text-label-sm font-label-sm text-on-surface-variant">SKU: APP-MBP-14-M3</p>
</div>
</div>
<div className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Pending</div>
</div>
<div className="flex justify-between items-end border-t border-outline-variant/20 pt-2 mt-2">
<div className="flex gap-4">
<div>
<p className="text-[10px] text-on-surface-variant uppercase">Qty</p>
<p className="font-data-mono text-data-mono text-red-600">-2 units</p>
</div>
<div>
<p className="text-[10px] text-on-surface-variant uppercase">Type</p>
<p className="text-label-sm font-label-sm text-primary">Damage</p>
</div>
</div>
<p className="text-[10px] text-on-surface-variant">10:45 AM • CA Vikram</p>
</div>
</div>
{/*  Timeline Item 2  */}
<div className="glass-card rounded-xl p-md relative overflow-hidden">
<div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
<div className="flex justify-between items-start mb-2">
<div className="flex gap-3">
<div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center">
<span className="material-symbols-outlined text-primary">smartphone</span>
</div>
<div>
<h4 className="font-body-md font-bold text-primary">iPhone 15 Pro</h4>
<p className="text-label-sm font-label-sm text-on-surface-variant">SKU: APP-IP15-BK</p>
</div>
</div>
<div className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Approved</div>
</div>
<div className="flex justify-between items-end border-t border-outline-variant/20 pt-2 mt-2">
<div className="flex gap-4">
<div>
<p className="text-[10px] text-on-surface-variant uppercase">Qty</p>
<p className="font-data-mono text-data-mono text-emerald-600">+15 units</p>
</div>
<div>
<p className="text-[10px] text-on-surface-variant uppercase">Type</p>
<p className="text-label-sm font-label-sm text-primary">Stock In</p>
</div>
</div>
<p className="text-[10px] text-on-surface-variant">09:12 AM • System</p>
</div>
</div>
{/*  Timeline Item 3  */}
<div className="glass-card rounded-xl p-md relative overflow-hidden">
<div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
<div className="flex justify-between items-start mb-2">
<div className="flex gap-3">
<div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center">
<span className="material-symbols-outlined text-primary">headphones</span>
</div>
<div>
<h4 className="font-body-md font-bold text-primary">AirPods Max</h4>
<p className="text-label-sm font-label-sm text-on-surface-variant">SKU: APP-APM-SG</p>
</div>
</div>
<div className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Rejected</div>
</div>
<div className="flex justify-between items-end border-t border-outline-variant/20 pt-2 mt-2">
<div className="flex gap-4">
<div>
<p className="text-[10px] text-on-surface-variant uppercase">Qty</p>
<p className="font-data-mono text-data-mono text-red-600">-1 unit</p>
</div>
<div>
<p className="text-[10px] text-on-surface-variant uppercase">Type</p>
<p className="text-label-sm font-label-sm text-primary">Loss</p>
</div>
</div>
<p className="text-[10px] text-on-surface-variant">Yesterday • Staff A</p>
</div>
</div>
</div>
</section>
</main>
{/*  Bottom Navigation Bar  */}
<nav className="fixed bottom-0 left-0 w-full flex justify-around items-center py-2 px-4 bg-surface border-t border-outline-variant/20 shadow-lg z-50 rounded-t-xl">
<div className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer tap-highlight-transparent active:scale-90">
<span className="material-symbols-outlined">home</span>
<span className="font-label-sm text-label-sm">Home</span>
</div>
<div className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-full px-4 py-1 tap-highlight-transparent active:scale-90 transition-transform">
<span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>account_balance_wallet</span>
<span className="font-label-sm text-label-sm">Ledgers</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer tap-highlight-transparent active:scale-90">
<span className="material-symbols-outlined">verified_user</span>
<span className="font-label-sm text-label-sm">Compliance</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer tap-highlight-transparent active:scale-90">
<span className="material-symbols-outlined">groups</span>
<span className="font-label-sm text-label-sm">HR</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer tap-highlight-transparent active:scale-90">
<span className="material-symbols-outlined">more_horiz</span>
<span className="font-label-sm text-label-sm">More</span>
</div>
</nav>
{/*  Contextual FAB for New Manual Audit  */}
<button className="fixed right-6 bottom-24 w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-all z-40 border-4 border-surface">
<span className="material-symbols-outlined">playlist_add_check</span>
</button>


        </div>
    );
};

export default StockAdjustmentCenterPage;
