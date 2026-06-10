import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';

const RoleBasedAccessControlPage: React.FC = () => {
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
            
{/*  Top App Bar  */}
<header className="bg-surface/70 backdrop-blur-xl text-primary font-headline-md text-headline-md docked full-width top-0 sticky border-b border-outline-variant/30 shadow-sm flex justify-between items-center w-full px-gutter h-16 z-50">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined cursor-pointer active:scale-95 duration-200">menu</span>
<h1 className="font-bold">FinPilot Pro</h1>
</div>
<div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center overflow-hidden border border-outline-variant/50">
<img alt="User" className="w-full h-full object-cover" data-alt="A professional headshot avatar of a senior partner in a high-end financial firm, featuring a clean, minimalist aesthetic with soft, studio lighting. The person is wearing a tailored navy blazer and has a confident, approachable expression, set against a neutral grey and blue gradient background that aligns with a modern corporate futurism style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRe3ytWSQvKmGaT3IDBp-7ao5EdMCs8E826hitriSfceEoESmHrclwbnAtHm41ukDpE6gTI71WQQ87cXVm9UCBV-bzIC-aPkT3TxDamNBVqIF2dSXU8CcyiO10OQxrMW1Rt3U-0ej_BKj-WC5LcJvaW_XFYfpSFCN35ryZGQ4I7TLfO7mQeuhhuj13RBqeqQ1tyokNqo3XGbjLikQc2DxyWv1HzV9HlZ25vrHXf7fsSQWYNTTauL6262Ks_oHIl2nigllTFv3TVq0"/>
</div>
</header>
<main className="px-4 py-6 max-w-lg mx-auto">
{/*  Breadcrumbs & Title  */}
<div className="mb-6">
<div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm mb-1">
<span>Settings</span>
<span className="material-symbols-outlined text-[12px]">chevron_right</span>
<span className="text-secondary">RBAC Matrix</span>
</div>
<h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary">Permission Matrix</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-1">Manage cross-role capabilities for enterprise modules.</p>
</div>
{/*  Search & Filter  */}
<div className="sticky top-[72px] z-40 bg-background/95 backdrop-blur-md pb-4 pt-1">
<div className="relative flex items-center">
<span className="material-symbols-outlined absolute left-3 text-on-surface-variant">search</span>
<input className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl font-body-md text-body-md focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all" placeholder="Search permissions (e.g. Ledgers)..." type="text"/>
</div>
{/*  Role Selector Tabs (Mobile Optimized Horizontal Scroll)  */}
<div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
<button className="whitespace-nowrap px-4 py-2 bg-secondary-container text-on-secondary-container rounded-lg font-label-sm text-label-sm shadow-sm active:scale-95 transition-transform">Super Admin</button>
<button className="whitespace-nowrap px-4 py-2 bg-surface-container-high text-on-surface-variant rounded-lg font-label-sm text-label-sm hover:bg-surface-container-highest active:scale-95 transition-transform">Accountant</button>
<button className="whitespace-nowrap px-4 py-2 bg-surface-container-high text-on-surface-variant rounded-lg font-label-sm text-label-sm hover:bg-surface-container-highest active:scale-95 transition-transform">HR Manager</button>
<button className="whitespace-nowrap px-4 py-2 bg-surface-container-high text-on-surface-variant rounded-lg font-label-sm text-label-sm hover:bg-surface-container-highest active:scale-95 transition-transform">Auditor</button>
</div>
</div>
{/*  Matrix List  */}
<div className="space-y-4 mt-2">
{/*  Module Group 1: General Ledger  */}
<div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm">
<div className="flex items-center justify-between p-4 bg-surface-container-low border-b border-outline-variant/20">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
<span className="material-symbols-outlined text-secondary">account_balance_wallet</span>
</div>
<h3 className="font-headline-md text-[18px] text-primary">General Ledger</h3>
</div>
<span className="material-symbols-outlined text-on-surface-variant">expand_more</span>
</div>
<div className="divide-y divide-outline-variant/20">
{/*  Permission Row 1  */}
<div className="p-4">
<div className="flex justify-between items-start mb-3">
<div>
<p className="font-body-md font-semibold text-on-surface">View Financial Statements</p>
<p className="text-[12px] text-on-surface-variant">Access P&amp;L and Balance Sheet</p>
</div>
<span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase tracking-wider">Active</span>
</div>
<div className="grid grid-cols-4 gap-2">
{/*  Toggle Cell: Read  */}
<div className="flex flex-col items-center gap-1.5">
<span className="font-label-sm text-[10px] text-on-surface-variant uppercase">Read</span>
<label className="relative inline-flex items-center cursor-pointer">
<input checked={true} className="sr-only compact-switch" type="checkbox"/>
<div className="switch-bg w-8 h-4.5 bg-outline-variant rounded-full transition-colors">
<div className="switch-dot absolute left-0.5 top-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform shadow-sm"></div>
</div>
</label>
</div>
{/*  Toggle Cell: Write  */}
<div className="flex flex-col items-center gap-1.5">
<span className="font-label-sm text-[10px] text-on-surface-variant uppercase">Write</span>
<label className="relative inline-flex items-center cursor-pointer">
<input checked={true} className="sr-only compact-switch" type="checkbox"/>
<div className="switch-bg w-8 h-4.5 bg-outline-variant rounded-full transition-colors">
<div className="switch-dot absolute left-0.5 top-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform shadow-sm"></div>
</div>
</label>
</div>
{/*  Toggle Cell: Delete  */}
<div className="flex flex-col items-center gap-1.5">
<span className="font-label-sm text-[10px] text-on-surface-variant uppercase">Delete</span>
<label className="relative inline-flex items-center cursor-pointer">
<input className="sr-only compact-switch" type="checkbox"/>
<div className="switch-bg w-8 h-4.5 bg-outline-variant rounded-full transition-colors">
<div className="switch-dot absolute left-0.5 top-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform shadow-sm"></div>
</div>
</label>
</div>
{/*  Toggle Cell: Approve  */}
<div className="flex flex-col items-center gap-1.5">
<span className="font-label-sm text-[10px] text-on-surface-variant uppercase">Approve</span>
<label className="relative inline-flex items-center cursor-pointer">
<input checked={true} className="sr-only compact-switch" type="checkbox"/>
<div className="switch-bg w-8 h-4.5 bg-outline-variant rounded-full transition-colors">
<div className="switch-dot absolute left-0.5 top-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform shadow-sm"></div>
</div>
</label>
</div>
</div>
</div>
{/*  Permission Row 2  */}
<div className="p-4">
<div className="flex justify-between items-start mb-3">
<div>
<p className="font-body-md font-semibold text-on-surface">Journal Voucher Entry</p>
<p className="text-[12px] text-on-surface-variant">Create/Edit standard entries</p>
</div>
</div>
<div className="grid grid-cols-4 gap-2">
<div className="flex flex-col items-center gap-1.5"><span className="font-label-sm text-[10px] text-on-surface-variant uppercase">Read</span><label className="relative inline-flex items-center cursor-pointer"><input checked={true} className="sr-only compact-switch" type="checkbox"/><div className="switch-bg w-8 h-4.5 bg-outline-variant rounded-full"><div className="switch-dot absolute left-0.5 top-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform"></div></div></label></div>
<div className="flex flex-col items-center gap-1.5"><span className="font-label-sm text-[10px] text-on-surface-variant uppercase">Write</span><label className="relative inline-flex items-center cursor-pointer"><input checked={true} className="sr-only compact-switch" type="checkbox"/><div className="switch-bg w-8 h-4.5 bg-outline-variant rounded-full"><div className="switch-dot absolute left-0.5 top-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform"></div></div></label></div>
<div className="flex flex-col items-center gap-1.5"><span className="font-label-sm text-[10px] text-on-surface-variant uppercase">Delete</span><label className="relative inline-flex items-center cursor-pointer"><input checked={true} className="sr-only compact-switch" type="checkbox"/><div className="switch-bg w-8 h-4.5 bg-outline-variant rounded-full"><div className="switch-dot absolute left-0.5 top-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform"></div></div></label></div>
<div className="flex flex-col items-center gap-1.5"><span className="font-label-sm text-[10px] text-on-surface-variant uppercase">Approve</span><label className="relative inline-flex items-center cursor-pointer"><input className="sr-only compact-switch" type="checkbox"/><div className="switch-bg w-8 h-4.5 bg-outline-variant rounded-full"><div className="switch-dot absolute left-0.5 top-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform"></div></div></label></div>
</div>
</div>
</div>
</div>
{/*  Module Group 2: Compliance & Audit  */}
<div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm">
<div className="flex items-center justify-between p-4 bg-surface-container-low border-b border-outline-variant/20">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
<span className="material-symbols-outlined text-emerald-600">verified_user</span>
</div>
<h3 className="font-headline-md text-[18px] text-primary">Compliance</h3>
</div>
<span className="material-symbols-outlined text-on-surface-variant">expand_more</span>
</div>
<div className="divide-y divide-outline-variant/20">
<div className="p-4">
<div className="flex justify-between items-start mb-3">
<div>
<p className="font-body-md font-semibold text-on-surface">TDS Filing Access</p>
<p className="text-[12px] text-on-surface-variant">Electronic filing and certificates</p>
</div>
</div>
<div className="grid grid-cols-4 gap-2">
<div className="flex flex-col items-center gap-1.5"><span className="font-label-sm text-[10px] text-on-surface-variant uppercase">Read</span><label className="relative inline-flex items-center cursor-pointer"><input checked={true} className="sr-only compact-switch" type="checkbox"/><div className="switch-bg w-8 h-4.5 bg-outline-variant rounded-full"><div className="switch-dot absolute left-0.5 top-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform"></div></div></label></div>
<div className="flex flex-col items-center gap-1.5"><span className="font-label-sm text-[10px] text-on-surface-variant uppercase">Write</span><label className="relative inline-flex items-center cursor-pointer"><input checked={true} className="sr-only compact-switch" type="checkbox"/><div className="switch-bg w-8 h-4.5 bg-outline-variant rounded-full"><div className="switch-dot absolute left-0.5 top-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform"></div></div></label></div>
<div className="flex flex-col items-center gap-1.5"><span className="font-label-sm text-[10px] text-on-surface-variant uppercase">Delete</span><label className="relative inline-flex items-center cursor-pointer"><input className="sr-only compact-switch" type="checkbox"/><div className="switch-bg w-8 h-4.5 bg-outline-variant rounded-full"><div className="switch-dot absolute left-0.5 top-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform"></div></div></label></div>
<div className="flex flex-col items-center gap-1.5"><span className="font-label-sm text-[10px] text-on-surface-variant uppercase">Approve</span><label className="relative inline-flex items-center cursor-pointer"><input checked={true} className="sr-only compact-switch" type="checkbox"/><div className="switch-bg w-8 h-4.5 bg-outline-variant rounded-full"><div className="switch-dot absolute left-0.5 top-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform"></div></div></label></div>
</div>
</div>
</div>
</div>
{/*  Module Group 3: Human Resources  */}
<div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm">
<div className="flex items-center justify-between p-4 bg-surface-container-low border-b border-outline-variant/20">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
<span className="material-symbols-outlined text-secondary">groups</span>
</div>
<h3 className="font-headline-md text-[18px] text-primary">HR Management</h3>
</div>
<span className="material-symbols-outlined text-on-surface-variant">expand_more</span>
</div>
<div className="p-8 text-center bg-surface-container-lowest">
<p className="font-body-md text-on-surface-variant italic">Expand to see HR permissions</p>
</div>
</div>
</div>
</main>
{/*  Save Changes Floating Action Button  */}
<div className="fixed bottom-24 right-6 z-[70]">
<button className="bg-secondary text-on-secondary px-6 py-4 rounded-full shadow-xl flex items-center gap-2 active:scale-90 transition-transform font-bold headline-md group">
<span className="material-symbols-outlined group-hover:rotate-12 transition-transform">save</span>
<span className="font-label-sm text-label-sm">Save Changes</span>
</button>
</div>
{/*  Bottom Navigation Bar  */}
<nav className="fixed bottom-0 left-0 w-full flex justify-around items-center py-2 px-4 bg-surface dark:bg-primary border-t border-outline-variant/20 shadow-lg z-50 rounded-t-xl">
<a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-colors tap-highlight-transparent active:scale-90 transition-transform" href="#">
<span className="material-symbols-outlined">home</span>
<span className="font-label-sm text-label-sm mt-1">Home</span>
</a>
<a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-colors tap-highlight-transparent active:scale-90 transition-transform" href="#">
<span className="material-symbols-outlined">account_balance_wallet</span>
<span className="font-label-sm text-label-sm mt-1">Ledgers</span>
</a>
<a className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-full px-4 py-1 tap-highlight-transparent active:scale-90 transition-transform" href="#">
<span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>verified_user</span>
<span className="font-label-sm text-label-sm">Compliance</span>
</a>
<a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-colors tap-highlight-transparent active:scale-90 transition-transform" href="#">
<span className="material-symbols-outlined">groups</span>
<span className="font-label-sm text-label-sm mt-1">HR</span>
</a>
<a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-colors tap-highlight-transparent active:scale-90 transition-transform" href="#">
<span className="material-symbols-outlined">more_horiz</span>
<span className="font-label-sm text-label-sm mt-1">More</span>
</a>
</nav>
{/*  Micro-interaction Script  */}


        </div>
    );
};

export default RoleBasedAccessControlPage;
