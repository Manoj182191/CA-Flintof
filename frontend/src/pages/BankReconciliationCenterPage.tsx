import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';

const BankReconciliationCenterPage: React.FC = () => {
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
<header className="bg-surface/70 backdrop-blur-xl text-primary font-headline-md text-headline-md-mobile docked full-width top-0 sticky border-b border-outline-variant/30 shadow-sm flex justify-between items-center w-full px-gutter h-16 z-50">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined cursor-pointer active:scale-95 duration-200">menu</span>
<span className="font-bold tracking-tight">FinPilot Pro</span>
</div>
<div className="h-8 w-8 rounded-full bg-secondary-container overflow-hidden border border-outline-variant/50">
<img alt="User" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAeUvm4taIr6cfGPti4-bsXguAWTvCA8RU79HoqJmiKjkOJ3znZNPyRqKC-QCS5Uz8R-UbnefML2VjwjlrBRIhTiIgw-cwO_RYVGxtBJ-Nc8wXl_3phdHx1NNYoayLa0lh35jhCGVmVZSd8BXdVBP2xfDvBjzbS8sJNp4mfpA71H2sa_0xD6PL4mXLO75GxODOEBa5GBmRQBPNsJFuq8trIGoR6u8Sma9ysXaAcz1XcwPafhZVJvZFFf41uVQIj3hOXgRVwMKrWMNI"/>
</div>
</header>
<main className="max-w-md mx-auto p-gutter space-y-md">
{/*  Hero Summary Card  */}
<section className="bg-primary text-on-primary p-lg rounded-xl shadow-lg relative overflow-hidden">
<div className="absolute top-0 right-0 p-4 opacity-10">
<span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: '"FILL" 1' }}>account_balance</span>
</div>
<div className="relative z-10">
<div className="flex justify-between items-start mb-4">
<div>
<p className="font-label-sm text-label-sm uppercase tracking-wider text-on-primary-fixed-variant">Match Confidence</p>
<h2 className="font-headline-lg-mobile text-headline-lg-mobile font-extrabold flex items-center gap-2">
                            98% <span className="material-symbols-outlined text-emerald-400 text-lg">verified</span>
</h2>
</div>
<div className="bg-secondary p-2 rounded-lg">
<span className="material-symbols-outlined text-white">auto_awesome</span>
</div>
</div>
<div className="grid grid-cols-2 gap-4 mt-6">
<div className="bg-white/10 p-md rounded-lg border border-white/10">
<p className="text-white/60 font-label-sm text-label-sm">Matched</p>
<p className="font-headline-md text-headline-md-mobile font-bold">42 <span className="text-sm font-normal">txns</span></p>
</div>
<div className="bg-white/10 p-md rounded-lg border border-white/10">
<p className="text-white/60 font-label-sm text-label-sm">Unmatched</p>
<p className="font-headline-md text-headline-md-mobile font-bold">3 <span className="text-sm font-normal">txns</span></p>
</div>
</div>
</div>
</section>
{/*  AI Alert: Duplicate Detection  */}
<section className="bg-error-container/30 border border-error/20 p-md rounded-xl flex gap-md items-center">
<div className="bg-error text-on-error w-10 h-10 rounded-full flex items-center justify-center shrink-0">
<span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>warning</span>
</div>
<div className="flex-1">
<h3 className="font-label-sm text-label-sm font-bold text-error">Duplicate Detection</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-tight">2 entries in Bank Statement likely correspond to a single ledger item.</p>
</div>
<button className="text-error font-label-sm text-label-sm font-bold active:scale-95 transition-transform">FIX</button>
</section>
{/*  Main Auto-Match Interface  */}
<section className="space-y-sm">
<div className="flex justify-between items-center px-xs">
<h3 className="font-headline-md text-headline-md-mobile text-primary">Live Sync</h3>
<div className="flex gap-xs">
<button className="p-2 bg-surface-container rounded-lg"><span className="material-symbols-outlined text-lg">tune</span></button>
</div>
</div>
{/*  Dual View Switcher (Simulated Segmented Control)  */}
<div className="bg-surface-container-high rounded-full p-1 flex">
<button className="flex-1 py-2 text-center rounded-full bg-surface-container-lowest shadow-sm font-label-sm text-label-sm text-primary transition-all duration-300" id="tab-bank">Bank Statement</button>
<button className="flex-1 py-2 text-center rounded-full font-label-sm text-label-sm text-on-surface-variant transition-all duration-300" id="tab-ledger">Ledger Details</button>
</div>
{/*  Scrollable List Area  */}
<div className="space-y-md mt-md">
{/*  Transaction Item 1: High Confidence Match  */}
<div className="glass-panel border border-outline-variant/30 rounded-xl p-md flex flex-col gap-sm relative overflow-hidden group">
<div className="absolute top-0 right-0 h-full w-1.5 bg-emerald-500"></div>
<div className="flex justify-between items-start">
<div className="space-y-1">
<span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
<span className="material-symbols-outlined text-xs">calendar_today</span> Oct 14, 2023
                            </span>
<h4 className="font-headline-md text-headline-md-mobile text-primary font-semibold">Stripe Payout Ref: 829-X</h4>
</div>
<div className="text-right">
<p className="font-data-mono text-data-mono font-bold text-primary">₹ 4,25,000.00</p>
<span className="bg-emerald-100 text-emerald-800 font-label-sm text-label-sm px-2 py-0.5 rounded-full inline-block mt-1">99% Match</span>
</div>
</div>
<div className="bg-surface-container-low/50 p-sm rounded-lg border border-dashed border-outline-variant flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-secondary text-sm">link</span>
<span className="font-body-md text-body-md text-secondary font-medium">Mapped to Ledger ID: L-9201</span>
</div>
<span className="material-symbols-outlined text-on-surface-variant text-md">chevron_right</span>
</div>
</div>
{/*  Transaction Item 2: AI Suggestion (Unmatched)  */}
<div className="bg-white border-2 border-secondary/20 rounded-xl p-md flex flex-col gap-sm relative shimmer-effect">
<div className="flex justify-between items-start">
<div className="space-y-1">
<span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
<span className="material-symbols-outlined text-xs">calendar_today</span> Oct 12, 2023
                            </span>
<h4 className="font-headline-md text-headline-md-mobile text-primary font-semibold">Unknown ACH: Amazon Web Svcs</h4>
</div>
<div className="text-right">
<p className="font-data-mono text-data-mono font-bold text-primary">₹ 12,490.15</p>
<span className="bg-secondary-container text-on-secondary-container font-label-sm text-label-sm px-2 py-0.5 rounded-full inline-block mt-1">AI Suggestion</span>
</div>
</div>
<div className="bg-secondary-fixed/30 p-md rounded-lg flex flex-col gap-2">
<div className="flex gap-2 items-start">
<span className="material-symbols-outlined text-secondary text-lg">psychology</span>
<p className="font-body-md text-body-md text-secondary-fixed-variant italic">"Found matching value in 'Cloud Hosting' expenses, but vendor name differs slightly. Manual approval required."</p>
</div>
<div className="flex gap-2 mt-1">
<button className="bg-secondary text-white px-4 py-2 rounded-lg font-label-sm text-label-sm flex-1 font-bold active:scale-95 transition-transform">APPROVE</button>
<button className="border border-outline-variant text-on-surface-variant px-4 py-2 rounded-lg font-label-sm text-label-sm flex-1 font-bold">REJECT</button>
</div>
</div>
</div>
{/*  Transaction Item 3: Missing in Ledger  */}
<div className="glass-panel border border-outline-variant/30 rounded-xl p-md flex flex-col gap-sm relative">
<div className="absolute top-0 right-0 h-full w-1.5 bg-tertiary-container"></div>
<div className="flex justify-between items-start">
<div className="space-y-1">
<span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
<span className="material-symbols-outlined text-xs">calendar_today</span> Oct 10, 2023
                            </span>
<h4 className="font-headline-md text-headline-md-mobile text-primary font-semibold">Atm Withdrawal #2938</h4>
</div>
<div className="text-right">
<p className="font-data-mono text-data-mono font-bold text-primary">₹ 5,000.00</p>
<span className="bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm px-2 py-0.5 rounded-full inline-block mt-1">Unmatched</span>
</div>
</div>
<button className="text-secondary font-label-sm text-label-sm font-bold flex items-center gap-1 mt-2 self-start active:scale-95 transition-transform">
<span className="material-symbols-outlined text-lg">add_circle</span> CREATE LEDGER ENTRY
                    </button>
</div>
</div>
</section>
{/*  Reconcile Now Primary Action  */}
<div className="pt-6">
<button className="w-full bg-primary text-on-primary py-4 rounded-xl font-headline-md text-headline-md-mobile font-bold shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all relative overflow-hidden group">
<span className="relative z-10">Reconcile Now</span>
<span className="material-symbols-outlined relative z-10 transition-transform group-hover:translate-x-1">arrow_forward</span>
<div className="absolute inset-0 bg-gradient-to-r from-secondary/50 to-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
</button>
<p className="text-center font-label-sm text-label-sm text-on-surface-variant mt-4">Safe Sync: FinPilot Pro will post 42 adjustments to Ledger.</p>
</div>
</main>
{/*  Bottom Navigation Bar  */}
<nav className="fixed bottom-0 left-0 w-full flex justify-around items-center py-2 px-4 bg-surface border-t border-outline-variant/20 shadow-lg z-50 rounded-t-xl">
<a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-colors" href="#">
<span className="material-symbols-outlined">home</span>
<span className="font-label-sm text-label-sm">Home</span>
</a>
<a className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-full px-4 py-1" href="#">
<span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>account_balance_wallet</span>
<span className="font-label-sm text-label-sm">Ledgers</span>
</a>
<a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-colors" href="#">
<span className="material-symbols-outlined">verified_user</span>
<span className="font-label-sm text-label-sm">Compliance</span>
</a>
<a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-colors" href="#">
<span className="material-symbols-outlined">groups</span>
<span className="font-label-sm text-label-sm">HR</span>
</a>
<a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-colors" href="#">
<span className="material-symbols-outlined">more_horiz</span>
<span className="font-label-sm text-label-sm">More</span>
</a>
</nav>
{/*  Interactive Layer: Simple Tab Toggle  */}


        </div>
    );
};

export default BankReconciliationCenterPage;
