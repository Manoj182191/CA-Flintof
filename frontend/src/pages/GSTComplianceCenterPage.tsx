import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';

const GSTComplianceCenterPage: React.FC = () => {
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
            
{/*  Navigation Drawer (Shared Component)  */}
<aside className="fixed h-full w-[280px] left-0 top-0 border-r border-outline-variant bg-surface flex flex-col h-screen py-md px-sm shadow-sm z-50 hidden md:flex">
<div className="px-md mb-xl">
<h1 className="font-display-lg text-[32px] text-primary leading-tight">FinPilot Pro</h1>
<p className="font-label-sm text-on-surface-variant uppercase tracking-wider">Enterprise OS v2.4.0</p>
</div>
<nav className="flex-1 space-y-xs">
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-low transition-all duration-200 ease-in-out rounded-lg" href="#">
<span className="material-symbols-outlined">dashboard</span>
<span className="font-body-md">Dashboard</span>
</a>
<a className="flex items-center gap-md px-md py-sm bg-secondary-container text-on-secondary-container rounded-lg font-bold transition-all duration-200 ease-in-out" href="#">
<span className="material-symbols-outlined">account_balance</span>
<span className="font-body-md">Taxes</span>
</a>
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-low transition-all duration-200 ease-in-out rounded-lg" href="#">
<span className="material-symbols-outlined">account_balance_wallet</span>
<span className="font-body-md">Ledgers</span>
</a>
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-low transition-all duration-200 ease-in-out rounded-lg" href="#">
<span className="material-symbols-outlined">receipt_long</span>
<span className="font-body-md">Vouchers</span>
</a>
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-low transition-all duration-200 ease-in-out rounded-lg" href="#">
<span className="material-symbols-outlined">settings</span>
<span className="font-body-md">Settings</span>
</a>
</nav>
<div className="mt-auto p-md bg-surface-container-low rounded-xl flex items-center gap-md">
<div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white">
<span className="material-symbols-outlined">person</span>
</div>
<div className="overflow-hidden">
<p className="font-bold text-on-surface truncate">Admin Terminal</p>
<p className="text-xs text-on-surface-variant">Global Controller</p>
</div>
</div>
</aside>
{/*  Main Content Area  */}
<main className="md:ml-[280px] h-screen flex flex-col relative">
{/*  Top App Bar (Shared Component)  */}
<header className="sticky top-0 w-full z-40 bg-surface/70 backdrop-blur-md border-b border-outline-variant/30 flex justify-between items-center px-lg py-sm">
<div className="flex items-center gap-md">
<span className="material-symbols-outlined text-primary">search</span>
<h2 className="font-headline-md text-headline-md text-primary">GST Compliance Center</h2>
</div>
<div className="flex items-center gap-lg">
<div className="hidden lg:flex items-center gap-sm px-md py-xs bg-surface-container rounded-full border border-outline-variant/30">
<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
<span className="text-xs font-medium text-on-surface-variant">Portal Status: Live</span>
</div>
<button className="material-symbols-outlined text-primary hover:text-secondary transition-colors scale-95 active:scale-90">smart_toy</button>
</div>
</header>
{/*  Scrollable Dashboard Content  */}
<div className="flex-1 overflow-y-auto p-lg custom-scrollbar">
<div className="max-w-container-max mx-auto space-y-lg">
{/*  Hero Section: Stats & AI Focus  */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
{/*  Filing Calendar & Summary  */}
<div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-md">
<div className="glass-card p-lg rounded-xl flex flex-col justify-between h-48">
<div className="flex justify-between items-start">
<span className="material-symbols-outlined text-secondary">event_repeat</span>
<span className="text-xs font-bold text-error uppercase">3 Days Left</span>
</div>
<div>
<h3 className="font-label-sm text-on-surface-variant">GSTR-1 (April)</h3>
<p className="font-headline-lg text-primary">11 May</p>
</div>
</div>
<div className="glass-card p-lg rounded-xl flex flex-col justify-between h-48">
<div className="flex justify-between items-start">
<span className="material-symbols-outlined text-secondary">account_balance</span>
</div>
<div>
<h3 className="font-label-sm text-on-surface-variant">GSTR-3B (April)</h3>
<p className="font-headline-lg text-primary">20 May</p>
</div>
</div>
<div className="glass-card p-lg rounded-xl flex flex-col justify-between h-48">
<div className="flex justify-between items-start">
<span className="material-symbols-outlined text-emerald-600">check_circle</span>
</div>
<div>
<h3 className="font-label-sm text-on-surface-variant">GSTR-9 (Annual)</h3>
<p className="font-headline-lg text-primary">Completed</p>
</div>
</div>
</div>
{/*  AI GST Assistant Panel  */}
<div className="lg:col-span-4 ai-glow bg-white rounded-xl p-lg flex flex-col gap-md relative overflow-hidden">
<div className="absolute top-0 right-0 p-4 opacity-10">
<span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: '"FILL" 1' }}>bolt</span>
</div>
<div className="flex items-center gap-sm">
<div className="bg-primary-container p-sm rounded-lg">
<span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>smart_toy</span>
</div>
<span className="font-bold text-primary">AI GST Assistant</span>
</div>
<div className="space-y-sm">
<p className="text-sm font-medium text-on-surface">ITC Optimization Suggestion</p>
<p className="text-xs text-on-surface-variant leading-relaxed">We found <span className="font-bold text-secondary">₹12.4L</span> in unclaimed ITC from Vendor A (mismatched invoice dates). Recommendation: Re-claim in current 3B cycle.</p>
</div>
<button className="mt-auto w-full py-sm bg-primary text-white font-bold rounded-lg text-sm hover:bg-secondary transition-colors">Apply Optimizations</button>
</div>
</div>
{/*  Bento Grid: Mismatch Detection & Detailed Status  */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
{/*  Mismatch Detection Alerts  */}
<div className="lg:col-span-2 glass-card rounded-xl overflow-hidden flex flex-col">
<div className="p-lg border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest/50">
<div className="flex items-center gap-sm">
<span className="material-symbols-outlined text-error">warning</span>
<h3 className="font-bold text-primary">Mismatch Detection</h3>
</div>
<button className="text-xs font-bold text-secondary hover:underline">View All 12 Alerts</button>
</div>
<div className="flex-1 p-lg overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="text-xs font-label-sm text-on-surface-variant border-b border-outline-variant/20">
<th className="pb-sm px-xs">VENDOR / ENTITY</th>
<th className="pb-sm px-xs">BOOK VALUE</th>
<th className="pb-sm px-xs">GSTR-2B</th>
<th className="pb-sm px-xs">DIFFERENCE</th>
<th className="pb-sm px-xs">ACTION</th>
</tr>
</thead>
<tbody className="text-xs md:text-sm font-data-mono">
<tr className="hover:bg-surface-container-low transition-colors group">
<td className="py-md px-xs font-bold text-primary">Vertex Solutions Inc.</td>
<td className="py-md px-xs">₹4,25,000</td>
<td className="py-md px-xs">₹3,80,000</td>
<td className="py-md px-xs text-error font-bold">-₹45,000</td>
<td className="py-md px-xs">
<button className="px-sm py-xs border border-outline-variant rounded hover:bg-white">Reconcile</button>
</td>
</tr>
<tr className="hover:bg-surface-container-low transition-colors group">
<td className="py-md px-xs font-bold text-primary">Global Logistics Ltd.</td>
<td className="py-md px-xs">₹88,200</td>
<td className="py-md px-xs">₹92,000</td>
<td className="py-md px-xs text-emerald-600 font-bold">+₹3,800</td>
<td className="py-md px-xs">
<button className="px-sm py-xs border border-outline-variant rounded hover:bg-white">Accept</button>
</td>
</tr>
<tr className="hover:bg-surface-container-low transition-colors group">
<td className="py-md px-xs font-bold text-primary">Cyber Systems Group</td>
<td className="py-md px-xs">₹12,40,000</td>
<td className="py-md px-xs">₹0</td>
<td className="py-md px-xs text-error font-bold">Missing</td>
<td className="py-md px-xs">
<button className="px-sm py-xs border border-outline-variant rounded hover:bg-white">Send Reminder</button>
</td>
</tr>
</tbody>
</table>
</div>
</div>
{/*  Entity Filing Tracker  */}
<div className="glass-card rounded-xl p-lg flex flex-col">
<h3 className="font-bold text-primary mb-lg">Entity Status Tracking</h3>
<div className="space-y-md">
<div className="flex items-center justify-between p-sm rounded-lg bg-surface-container-low border border-outline-variant/10">
<div className="flex items-center gap-md">
<div className="w-8 h-8 rounded bg-primary-container text-white flex items-center justify-center font-bold text-xs">MH</div>
<div>
<p className="text-sm font-bold">Maharashtra Hub</p>
<p className="text-[10px] text-on-surface-variant">27AAAAA0000A1Z5</p>
</div>
</div>
<span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">FILED</span>
</div>
<div className="flex items-center justify-between p-sm rounded-lg bg-surface-container-low border border-outline-variant/10">
<div className="flex items-center gap-md">
<div className="w-8 h-8 rounded bg-secondary-container text-white flex items-center justify-center font-bold text-xs">KA</div>
<div>
<p className="text-sm font-bold">Karnataka Office</p>
<p className="text-[10px] text-on-surface-variant">29BBBBB1111B1Z2</p>
</div>
</div>
<span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-[10px] font-bold">PENDING</span>
</div>
<div className="flex items-center justify-between p-sm rounded-lg bg-surface-container-low border border-outline-variant/10">
<div className="flex items-center gap-md">
<div className="w-8 h-8 rounded bg-on-primary-container text-white flex items-center justify-center font-bold text-xs">DL</div>
<div>
<p className="text-sm font-bold">Delhi HQ</p>
<p className="text-[10px] text-on-surface-variant">07CCCCC2222C1Z9</p>
</div>
</div>
<span className="px-2 py-1 bg-error-container text-error rounded text-[10px] font-bold">OVERDUE</span>
</div>
<div className="flex items-center justify-between p-sm rounded-lg bg-surface-container-low border border-outline-variant/10">
<div className="flex items-center gap-md">
<div className="w-8 h-8 rounded bg-primary-container text-white flex items-center justify-center font-bold text-xs">TS</div>
<div>
<p className="text-sm font-bold">Telangana Unit</p>
<p className="text-[10px] text-on-surface-variant">36DDDDD3333D1Z1</p>
</div>
</div>
<span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">FILED</span>
</div>
</div>
<button className="mt-lg w-full py-sm border-2 border-dashed border-outline-variant rounded-lg text-sm text-on-surface-variant font-medium hover:border-secondary transition-colors">
                            + Add New Entity
                        </button>
</div>
</div>
{/*  ITC Distribution Graph Mockup  */}
<div className="glass-card rounded-xl p-lg h-80 relative flex flex-col">
<div className="flex justify-between items-start mb-lg">
<div>
<h3 className="font-bold text-primary">ITC Trends &amp; Utilization</h3>
<p className="text-xs text-on-surface-variant">Last 6 Months Comparative Analysis</p>
</div>
<div className="flex gap-md">
<div className="flex items-center gap-xs">
<span className="w-3 h-3 rounded-full bg-secondary"></span>
<span className="text-xs">Utilized</span>
</div>
<div className="flex items-center gap-xs">
<span className="w-3 h-3 rounded-full bg-outline-variant"></span>
<span className="text-xs">Available</span>
</div>
</div>
</div>
<div className="flex-1 flex items-end justify-between gap-md pb-md">
{/*  Bar Charts Simulation  */}
<div className="flex-1 flex flex-col items-center gap-sm h-full justify-end">
<div className="w-full bg-secondary-container/20 rounded-t-md h-24 relative overflow-hidden">
<div className="absolute bottom-0 w-full bg-secondary h-16"></div>
</div>
<span className="text-[10px] font-bold">NOV</span>
</div>
<div className="flex-1 flex flex-col items-center gap-sm h-full justify-end">
<div className="w-full bg-secondary-container/20 rounded-t-md h-32 relative overflow-hidden">
<div className="absolute bottom-0 w-full bg-secondary h-20"></div>
</div>
<span className="text-[10px] font-bold">DEC</span>
</div>
<div className="flex-1 flex flex-col items-center gap-sm h-full justify-end">
<div className="w-full bg-secondary-container/20 rounded-t-md h-40 relative overflow-hidden">
<div className="absolute bottom-0 w-full bg-secondary h-36"></div>
</div>
<span className="text-[10px] font-bold">JAN</span>
</div>
<div className="flex-1 flex flex-col items-center gap-sm h-full justify-end">
<div className="w-full bg-secondary-container/20 rounded-t-md h-28 relative overflow-hidden">
<div className="absolute bottom-0 w-full bg-secondary h-22"></div>
</div>
<span className="text-[10px] font-bold">FEB</span>
</div>
<div className="flex-1 flex flex-col items-center gap-sm h-full justify-end">
<div className="w-full bg-secondary-container/20 rounded-t-md h-48 relative overflow-hidden">
<div className="absolute bottom-0 w-full bg-secondary h-42"></div>
</div>
<span className="text-[10px] font-bold">MAR</span>
</div>
<div className="flex-1 flex flex-col items-center gap-sm h-full justify-end">
<div className="w-full bg-secondary-container/20 rounded-t-md h-52 relative overflow-hidden border-2 border-primary">
<div className="absolute bottom-0 w-full bg-secondary h-46"></div>
<div className="absolute inset-0 bg-white/30 animate-pulse"></div>
</div>
<span className="text-[10px] font-bold text-primary">APR*</span>
</div>
</div>
</div>
<div className="pb-xl"></div>
</div>
</div>
{/*  Mobile Bottom Nav Bar (Shared Component)  */}
<nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-lowest/80 backdrop-blur-xl border-t border-outline-variant/20 flex justify-around items-center pb-safe pt-2 z-50">
<a className="flex flex-col items-center justify-center text-on-surface-variant p-2" href="#">
<span className="material-symbols-outlined">home</span>
<span className="font-label-sm text-[10px]">Home</span>
</a>
<a className="flex flex-col items-center justify-center text-on-surface-variant p-2" href="#">
<span className="material-symbols-outlined">list_alt</span>
<span className="font-label-sm text-[10px]">Ledger</span>
</a>
<div className="flex flex-col items-center justify-center -mt-8">
<div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg border-4 border-surface">
<span className="material-symbols-outlined text-white text-3xl">add</span>
</div>
</div>
<a className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-2xl px-4 py-1" href="#">
<span className="material-symbols-outlined">insights</span>
<span className="font-label-sm text-[10px]">AI</span>
</a>
<a className="flex flex-col items-center justify-center text-on-surface-variant p-2" href="#">
<span className="material-symbols-outlined">account_balance</span>
<span className="font-label-sm text-[10px]">GST</span>
</a>
</nav>
{/*  FAB for Rapid Filing (Only on Task-Relevant Screens)  */}
<button className="fixed bottom-24 right-8 lg:bottom-12 lg:right-12 w-14 h-14 bg-secondary text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-40">
<span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>send</span>
</button>
</main>


        </div>
    );
};

export default GSTComplianceCenterPage;
