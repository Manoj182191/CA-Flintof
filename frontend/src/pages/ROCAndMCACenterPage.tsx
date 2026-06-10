import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';

const ROCAndMCACenterPage: React.FC = () => {
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
            
{/*  Top Navigation Anchor  */}
<header className="bg-surface/70 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm flex justify-between items-center w-full px-gutter h-16 z-50 sticky top-0">
<div className="flex items-center gap-md">
<span className="material-symbols-outlined text-primary cursor-pointer active:scale-95 duration-200">menu</span>
<h1 className="font-headline-md text-headline-md font-bold text-primary">FinPilot Pro</h1>
</div>
<div className="flex items-center gap-lg">
<nav className="hidden md:flex gap-lg">
<a className="text-on-surface-variant hover:bg-surface-container-high/50 transition-colors px-3 py-1 rounded-lg" href="#">Audit</a>
<a className="text-on-surface-variant hover:bg-surface-container-high/50 transition-colors px-3 py-1 rounded-lg" href="#">TDS</a>
<a className="text-on-surface-variant hover:bg-surface-container-high/50 transition-colors px-3 py-1 rounded-lg" href="#">GST</a>
<a className="bg-secondary-container text-on-secondary-container rounded-lg font-bold px-3 py-1" href="#">ROC</a>
</nav>
<div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container text-xs font-bold cursor-pointer">VM</div>
</div>
</header>
<main className="max-w-[1440px] mx-auto p-gutter pb-32">
{/*  Header Section  */}
<section className="flex flex-col md:flex-row justify-between items-start md:items-center mb-lg gap-md">
<div>
<h2 className="font-headline-lg text-headline-lg text-primary">ROC &amp; MCA Compliance Center</h2>
<p className="text-on-surface-variant font-body-md mt-1">Unified surveillance of statutory filings and regulatory status for Reliance Ind.</p>
</div>
<button className="flex items-center gap-2 bg-secondary text-on-secondary px-6 py-3 rounded-full font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all duration-200" onClick={() => {}}>
<span className="material-symbols-outlined sync-icon">sync</span>
                Trigger Portal Sync
            </button>
</section>
{/*  Main Bento Content  */}
<div className="bento-grid">
{/*  Company Status Card  */}
<div className="col-span-12 md:col-span-4 glass-panel p-lg rounded-xl flex flex-col gap-md">
<div className="flex justify-between items-center">
<h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Company Health</h3>
<span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">Active</span>
</div>
<div className="flex items-end gap-sm">
<span className="font-headline-lg text-headline-lg">98%</span>
<span className="text-emerald-600 font-bold text-sm mb-1">+2.4%</span>
</div>
<div className="w-full bg-outline-variant/30 h-2 rounded-full overflow-hidden">
<div className="bg-secondary h-full" style={{ width: '98%' }}></div>
</div>
<p className="text-xs text-on-surface-variant italic">Next periodic audit due in 14 days.</p>
</div>
{/*  Director KYC Status  */}
<div className="col-span-12 md:col-span-8 glass-panel p-lg rounded-xl overflow-hidden">
<div className="flex justify-between items-center mb-md">
<h3 className="font-headline-md text-headline-md text-primary">Director KYC Status</h3>
<span className="text-xs text-on-surface-variant">4 Active Directors</span>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left">
<thead className="border-b border-outline-variant/30">
<tr>
<th className="py-3 font-label-sm text-label-sm text-on-surface-variant">Director Name</th>
<th className="py-3 font-label-sm text-label-sm text-on-surface-variant">DIN</th>
<th className="py-3 font-label-sm text-label-sm text-on-surface-variant">DIR-3 KYC</th>
<th className="py-3 font-label-sm text-label-sm text-on-surface-variant">Expiry</th>
<th className="py-3 font-label-sm text-label-sm text-on-surface-variant">Action</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/10">
<tr className="hover:bg-surface-container-low transition-colors">
<td className="py-4 font-bold">Vikram Mehta</td>
<td className="py-4 font-data-mono text-data-mono">02341982</td>
<td className="py-4">
<div className="flex items-center gap-2 text-emerald-600">
<span className="material-symbols-outlined text-sm">check_circle</span>
<span className="text-sm font-bold">Filed</span>
</div>
</td>
<td className="py-4 text-sm">30 Sep 2024</td>
<td className="py-4"><span className="material-symbols-outlined text-outline cursor-pointer">more_vert</span></td>
</tr>
<tr className="hover:bg-surface-container-low transition-colors">
<td className="py-4 font-bold">Ananya Sharma</td>
<td className="py-4 font-data-mono text-data-mono">08772314</td>
<td className="py-4">
<div className="flex items-center gap-2 text-amber-600">
<span className="material-symbols-outlined text-sm">pending</span>
<span className="text-sm font-bold">Pending</span>
</div>
</td>
<td className="py-4 text-sm text-error">EXPIRED</td>
<td className="py-4"><button className="bg-primary text-on-primary text-[10px] px-2 py-1 rounded uppercase">Remind</button></td>
</tr>
</tbody>
</table>
</div>
</div>
{/*  Annual Filings Pulse  */}
<div className="col-span-12 md:col-span-7 glass-panel p-lg rounded-xl">
<div className="flex justify-between items-center mb-lg">
<h3 className="font-headline-md text-headline-md text-primary">Annual Filings Summary</h3>
<div className="flex gap-2">
<span className="bg-surface-container px-3 py-1 rounded-md text-xs font-bold">FY 2023-24</span>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
<div className="p-md rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-2">
<div className="flex justify-between items-center">
<span className="text-sm font-bold">MGT-7</span>
<span className="material-symbols-outlined text-emerald-500" style={{ fontVariationSettings: '"FILL" 1' }}>task_alt</span>
</div>
<p className="text-xs text-on-surface-variant">Annual Return (Regular)</p>
<div className="mt-md flex justify-between items-end">
<span className="text-xs text-on-surface-variant">SRN: S44102931</span>
<span className="text-xs font-bold text-secondary cursor-pointer">View Challan</span>
</div>
</div>
<div className="p-md rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-2 border-l-4 border-l-secondary">
<div className="flex justify-between items-center">
<span className="text-sm font-bold">AOC-4</span>
<span className="material-symbols-outlined text-secondary animate-pulse">sync</span>
</div>
<p className="text-xs text-on-surface-variant">Financial Statement (XBRL)</p>
<div className="mt-md flex justify-between items-end">
<span className="text-xs text-on-surface-variant">Status: Validation</span>
<span className="text-xs font-bold text-secondary cursor-pointer">Check Logs</span>
</div>
</div>
</div>
</div>
{/*  Upcoming Filings Timeline  */}
<div className="col-span-12 md:col-span-5 glass-panel p-lg rounded-xl">
<h3 className="font-headline-md text-headline-md text-primary mb-lg">Upcoming Filings</h3>
<div className="relative ml-4 border-l-2 border-outline-variant/30 space-y-lg">
<div className="relative pl-6">
<div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-secondary border-4 border-white"></div>
<span className="text-[10px] font-bold text-secondary uppercase">Due in 5 Days</span>
<p className="font-bold text-sm">DPT-3: Return of Deposits</p>
<p className="text-xs text-on-surface-variant">Mandatory for all loan-carrying entities</p>
</div>
<div className="relative pl-6 opacity-60">
<div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-outline border-4 border-white"></div>
<span className="text-[10px] font-bold text-on-surface-variant uppercase">Due in 18 Days</span>
<p className="font-bold text-sm">DIR-3 KYC Filing</p>
<p className="text-xs text-on-surface-variant">Annual KYC for all DIN holders</p>
</div>
<div className="relative pl-6 opacity-40">
<div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-outline border-4 border-white"></div>
<span className="text-[10px] font-bold text-on-surface-variant uppercase">Due in 45 Days</span>
<p className="font-bold text-sm">MSME-1: Half Yearly Return</p>
</div>
</div>
</div>
{/*  MCA Notices with AI Risk Levels  */}
<div className="col-span-12 glass-panel p-lg rounded-xl ai-glow border-indigo-200">
<div className="flex items-center gap-sm mb-lg">
<span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: '"FILL" 1' }}>auto_awesome</span>
<h3 className="font-headline-md text-headline-md text-primary">MCA Notices &amp; Intelligence</h3>
<div className="ml-auto flex items-center gap-md bg-secondary-container/20 px-4 py-1 rounded-full">
<div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
<span className="text-[10px] font-bold text-secondary uppercase tracking-tight">AI Scanning Portals Live</span>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
{/*  Notice 1  */}
<div className="p-md rounded-xl bg-white/50 border border-outline-variant/30 hover:shadow-md transition-shadow">
<div className="flex justify-between items-start mb-md">
<span className="bg-error/10 text-error text-[10px] px-2 py-1 rounded font-bold">HIGH RISK</span>
<span className="text-[10px] text-on-surface-variant">Ref: 293/ROC/DPT</span>
</div>
<h4 className="font-bold text-sm mb-2">Suo Moto Order: Sec 73-76</h4>
<p className="text-xs text-on-surface-variant line-clamp-2 mb-md">Potential mismatch detected between balance sheet liabilities and DPT-3 filings for FY22.</p>
<div className="flex justify-between items-center pt-md border-t border-outline-variant/10">
<button className="text-secondary font-bold text-xs flex items-center gap-1">Draft Response <span className="material-symbols-outlined text-sm">arrow_forward</span></button>
</div>
</div>
{/*  Notice 2  */}
<div className="p-md rounded-xl bg-white/50 border border-outline-variant/30 hover:shadow-md transition-shadow">
<div className="flex justify-between items-start mb-md">
<span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-1 rounded font-bold">MEDIUM RISK</span>
<span className="text-[10px] text-on-surface-variant">Ref: 412/SYS/ALERT</span>
</div>
<h4 className="font-bold text-sm mb-2">Data Mismatch: PAN Linkage</h4>
<p className="text-xs text-on-surface-variant line-clamp-2 mb-md">Director PAN data doesn't align with MCA master data records for 2 directors.</p>
<div className="flex justify-between items-center pt-md border-t border-outline-variant/10">
<button className="text-secondary font-bold text-xs flex items-center gap-1">Verify Data <span className="material-symbols-outlined text-sm">verified</span></button>
</div>
</div>
{/*  Notice 3  */}
<div className="p-md rounded-xl bg-white/50 border border-outline-variant/30 hover:shadow-md transition-shadow">
<div className="flex justify-between items-start mb-md">
<span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-1 rounded font-bold">LOW RISK</span>
<span className="text-[10px] text-on-surface-variant">Ref: GEN/INFO/2024</span>
</div>
<h4 className="font-bold text-sm mb-2">Address Update Notification</h4>
<p className="text-xs text-on-surface-variant line-clamp-2 mb-md">Reminder to update Registered Office address if changed during the last AGM.</p>
<div className="flex justify-between items-center pt-md border-t border-outline-variant/10">
<button className="text-on-surface-variant font-bold text-xs flex items-center gap-1">Dismiss Notice <span className="material-symbols-outlined text-sm">close</span></button>
</div>
</div>
</div>
</div>
{/*  High End Feature Illustration  */}
<div className="col-span-12 h-64 rounded-xl overflow-hidden relative">

<div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent flex items-center px-lg">
<div className="max-w-md">
<h4 className="font-headline-lg text-headline-lg text-white mb-2">Automated Portal Surveillance</h4>
<p className="text-white/80 font-body-md">FinPilot Pro continuously polls the MCA portal for new notifications, master data changes, and filing status updates using high-concurrency bot engines.</p>
</div>
</div>
</div>
</div>
</main>
{/*  Bottom Navigation Shell (Mobile)  */}
<nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center py-2 px-4 bg-surface border-t border-outline-variant/20 shadow-lg z-50 rounded-t-xl">
<div className="flex flex-col items-center justify-center text-on-surface-variant">
<span className="material-symbols-outlined">home</span>
<span className="text-[10px] font-label-sm">Home</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant">
<span className="material-symbols-outlined">account_balance_wallet</span>
<span className="text-[10px] font-label-sm">Ledgers</span>
</div>
<div className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-full px-4 py-1">
<span className="material-symbols-outlined">verified_user</span>
<span className="text-[10px] font-label-sm">Compliance</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant">
<span className="material-symbols-outlined">groups</span>
<span className="text-[10px] font-label-sm">HR</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant">
<span className="material-symbols-outlined">more_horiz</span>
<span className="text-[10px] font-label-sm">More</span>
</div>
</nav>
{/*  Contextual FAB (Hidden by default, shown on specific page intent)  */}
<button className="fixed bottom-24 right-gutter md:bottom-12 md:right-12 w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 z-50">
<span className="material-symbols-outlined">add</span>
</button>


        </div>
    );
};

export default ROCAndMCACenterPage;
