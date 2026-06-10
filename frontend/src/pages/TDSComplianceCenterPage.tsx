import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';

const TDSComplianceCenterPage: React.FC = () => {
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
            
{/*  TopAppBar  */}
<header className="sticky top-0 z-50 flex justify-between items-center px-md w-full h-16 bg-surface-bright dark:bg-surface-dim border-b border-outline-variant dark:border-outline flat no shadows">
<div className="flex items-center gap-md">
<button className="material-symbols-outlined text-primary hover:bg-surface-container-high dark:hover:bg-surface-container-low transition-colors p-2 rounded-full active:scale-95 duration-150" data-icon="menu">menu</button>
<span className="font-headline-md text-primary dark:text-primary-fixed font-bold">FinPilot AI</span>
</div>
<div className="flex items-center gap-md">
<div className="hidden md:flex gap-md px-md">
<a className="font-label-sm text-secondary dark:text-secondary-fixed font-bold" href="#">Dashboard</a>
<a className="font-label-sm text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container-high transition-colors px-2 py-1 rounded" href="#">Reports</a>
<a className="font-label-sm text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container-high transition-colors px-2 py-1 rounded" href="#">Compliance</a>
</div>
<div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant">
<img alt="User profile" data-alt="A professional studio portrait of a high-level financial executive with a clean, minimalist background. The lighting is soft and cinematic, using a high-key approach typical of a premium modern corporate brand like Mercury or Stripe. The aesthetic is polished, featuring cool blue and charcoal tones, reflecting authority and technological sophistication in a corporate futurism style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDb0B36zPtWj19MkAdxZ7o8_71-7B8_kYEGDBGN-sdNs_Y-JmMmzZ2y0h5Ja4hh9MHz4VZAtngz6LGvnyI-PtXq6pq3aVOOzPLYprQYGQaPN3_CdMWHuQNfzD6xEkNQZ4nFemZKS6H7FeVzUoOHFmT_1B3uWgE1NeSzSCjVpvFdE565_Gjq7wU4KFAX6RJcw83RztJQs5RkPCPtSKkUMtgaAwnAQa1TK6Wc97ntEaKB6MUhmjJdbSp_-Sy9yLutwUIHt7qIyB3Mzbo"/>
</div>
</div>
</header>
<div className="flex min-h-screen">
{/*  Navigation Drawer (Desktop)  */}
<aside className="hidden lg:flex flex-col gap-base p-md fixed left-0 top-16 h-[calc(100vh-64px)] w-[280px] bg-surface-container dark:bg-surface-dim border-r border-outline-variant shadow-xl z-40 overflow-y-auto">
<div className="flex items-center gap-md p-md mb-md">
<div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-on-primary-container">
<span className="material-symbols-outlined" data-icon="account_balance_wallet">account_balance_wallet</span>
</div>
<div>
<div className="font-body-md font-semibold text-primary">TDS Management</div>
<div className="text-[10px] text-on-surface-variant uppercase tracking-wider">Enterprise Tier</div>
</div>
</div>
<nav className="space-y-1">
<div className="flex items-center gap-md p-md text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1 transition-transform duration-200 cursor-pointer rounded-lg">
<span className="material-symbols-outlined" data-icon="analytics">analytics</span>
<span className="font-body-md">Dashboard</span>
</div>
<div className="flex items-center gap-md p-md text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1 transition-transform duration-200 cursor-pointer rounded-lg">
<span className="material-symbols-outlined" data-icon="business">compare</span>
<span className="font-body-md">Companies</span>
</div>
<div className="flex items-center gap-md p-md bg-secondary-container text-on-secondary-container font-semibold rounded-lg cursor-pointer">
<span className="material-symbols-outlined" data-icon="verified">verified</span>
<span className="font-body-md">TDS Filing</span>
</div>
<div className="flex items-center gap-md p-md text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1 transition-transform duration-200 cursor-pointer rounded-lg">
<span className="material-symbols-outlined" data-icon="payments">payments</span>
<span className="font-body-md">Payroll</span>
</div>
<div className="flex items-center gap-md p-md text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1 transition-transform duration-200 cursor-pointer rounded-lg">
<span className="material-symbols-outlined" data-icon="gavel">gavel</span>
<span className="font-body-md">Compliance</span>
</div>
<div className="flex items-center gap-md p-md text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1 transition-transform duration-200 cursor-pointer rounded-lg">
<span className="material-symbols-outlined" data-icon="description">description</span>
<span className="font-body-md">Reports</span>
</div>
<div className="flex items-center gap-md p-md text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1 transition-transform duration-200 cursor-pointer rounded-lg">
<span className="material-symbols-outlined" data-icon="notifications_active">notifications_active</span>
<span className="font-body-md">Notifications</span>
</div>
<div className="flex items-center gap-md p-md text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1 transition-transform duration-200 cursor-pointer rounded-lg">
<span className="material-symbols-outlined" data-icon="account_balance">account_balance</span>
<span className="font-body-md">Gov Connect</span>
</div>
</nav>
<div className="mt-auto pt-md border-t border-outline-variant opacity-60">
<div className="text-[10px] text-on-surface-variant">v2.4.0 • FinPilot AI Admin</div>
</div>
</aside>
{/*  Main Content Canvas  */}
<main className="flex-1 lg:ml-[280px] p-lg pb-32">
{/*  Header Section  */}
<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-xl gap-md">
<div>
<h1 className="font-headline-lg text-primary mb-1">TDS Compliance Dashboard</h1>
<p className="text-on-surface-variant font-body-md">Q3 Fiscal Year 2024 • Real-time Monitoring</p>
</div>
<div className="flex gap-md">
<button className="flex items-center gap-xs px-md py-2 glass-panel rounded-lg font-label-sm text-primary hover:bg-surface-container-high transition-all">
<span className="material-symbols-outlined text-[18px]" data-icon="file_download">file_download</span>
                        Export Summary
                    </button>
<button className="flex items-center gap-xs px-md py-2 bg-primary text-white rounded-lg font-label-sm hover:opacity-90 transition-all shadow-md">
<span className="material-symbols-outlined text-[18px]" data-icon="add">add</span>
                        New Deduction
                    </button>
</div>
</div>
{/*  KPI Grid  */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg mb-xl">
{/*  KPI 1  */}
<div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:shadow-lg transition-shadow">
<div className="flex justify-between items-start mb-md">
<span className="p-2 bg-surface-container-high rounded-lg text-primary material-symbols-outlined" data-icon="account_balance">account_balance</span>
<span className="text-error font-label-sm flex items-center bg-error-container/20 px-2 py-0.5 rounded-full">+12.5%</span>
</div>
<div className="font-body-md text-on-surface-variant mb-1">Total TDS Liability</div>
<div className="font-data-mono text-headline-md text-primary">$428,940.50</div>
</div>
{/*  KPI 2  */}
<div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:shadow-lg transition-shadow">
<div className="flex justify-between items-start mb-md">
<span className="p-2 bg-surface-container-high rounded-lg text-secondary material-symbols-outlined" data-icon="check_circle">check_circle</span>
<span className="text-primary-fixed-dim font-label-sm flex items-center bg-secondary-container/10 px-2 py-0.5 rounded-full">On Track</span>
</div>
<div className="font-body-md text-on-surface-variant mb-1">Paid vs Outstanding</div>
<div className="font-data-mono text-headline-md text-primary">82% <span className="text-body-md font-body-md text-on-surface-variant">/ 18%</span></div>
<div className="w-full bg-surface-container-high h-1.5 rounded-full mt-md overflow-hidden">
<div className="bg-secondary h-full" style={{ width: '82%' }}></div>
</div>
</div>
{/*  KPI 3  */}
<div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:shadow-lg transition-shadow">
<div className="flex justify-between items-start mb-md">
<span className="p-2 bg-error-container/30 rounded-lg text-error material-symbols-outlined" data-icon="event_busy">event_busy</span>
<span className="text-error font-label-sm">High Priority</span>
</div>
<div className="font-body-md text-on-surface-variant mb-1">Next Filing Deadline</div>
<div className="font-headline-md text-primary">Oct 07</div>
<div className="text-on-surface-variant font-label-sm mt-md">Form 24Q • 4 days remaining</div>
</div>
{/*  AI Insight Quick View  */}
<div className="ai-border-gradient ai-glow p-lg rounded-xl glass-panel relative overflow-hidden">
<div className="absolute -right-4 -top-4 opacity-10">
<span className="material-symbols-outlined text-6xl" data-icon="psychology">psychology</span>
</div>
<div className="flex items-center gap-xs text-secondary font-label-sm mb-md">
<span className="material-symbols-outlined text-[16px]" data-icon="auto_awesome">auto_awesome</span>
                        AI ANALYTICS
                    </div>
<div className="font-body-md text-primary leading-tight mb-md">3 anomalies detected in Section 194J payroll deductions.</div>
<button className="text-secondary font-label-sm hover:underline flex items-center gap-xs">
                        Review Reconciliation <span className="material-symbols-outlined text-[14px]" data-icon="arrow_forward">arrow_forward</span>
</button>
</div>
</div>
{/*  Dashboard Bento Grid  */}
<div className="grid grid-cols-12 gap-lg items-start">
{/*  Main Trend Chart  */}
<div className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-lg rounded-xl border border-outline-variant">
<div className="flex justify-between items-center mb-lg">
<h3 className="font-headline-md text-primary">Deduction Trends</h3>
<div className="flex bg-surface-container-high p-1 rounded-lg">
<button className="px-3 py-1 font-label-sm rounded-md bg-white shadow-sm text-primary">Monthly</button>
<button className="px-3 py-1 font-label-sm rounded-md text-on-surface-variant hover:text-primary transition-colors">Quarterly</button>
</div>
</div>
<div className="h-64 relative w-full flex items-end gap-2 px-md">
{/*  Mock Chart using Tailwind  */}
<div className="flex-1 bg-surface-container-high rounded-t h-[40%] relative group">
<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-primary text-white text-[10px] px-2 py-1 rounded hidden group-hover:block">$12k</div>
</div>
<div className="flex-1 bg-surface-container-high rounded-t h-[65%] relative group">
<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-primary text-white text-[10px] px-2 py-1 rounded hidden group-hover:block">$18k</div>
</div>
<div className="flex-1 bg-secondary rounded-t h-[55%] relative group">
<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-primary text-white text-[10px] px-2 py-1 rounded hidden group-hover:block">$15k</div>
</div>
<div className="flex-1 bg-surface-container-high rounded-t h-[80%] relative group">
<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-primary text-white text-[10px] px-2 py-1 rounded hidden group-hover:block">$22k</div>
</div>
<div className="flex-1 bg-secondary rounded-t h-[95%] relative group">
<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-primary text-white text-[10px] px-2 py-1 rounded hidden group-hover:block">$28k</div>
</div>
<div className="flex-1 bg-surface-container-high rounded-t h-[75%] relative group">
<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-primary text-white text-[10px] px-2 py-1 rounded hidden group-hover:block">$21k</div>
</div>
</div>
<div className="flex justify-between mt-md px-md text-on-surface-variant font-label-sm">
<span>APR</span><span>MAY</span><span>JUN</span><span>JUL</span><span>AUG</span><span>SEP</span>
</div>
</div>
{/*  AI Reconciliation Assistant  */}
<div className="col-span-12 lg:col-span-4 space-y-lg">
<div className="ai-border-gradient p-lg rounded-xl glass-panel">
<div className="flex items-center justify-between mb-md">
<h3 className="font-headline-md text-primary flex items-center gap-sm">
<span className="material-symbols-outlined text-secondary" data-icon="smart_toy">smart_toy</span>
                                AI Reconciliation
                            </h3>
<span className="font-label-sm text-secondary bg-secondary-container/10 px-2 py-1 rounded-full">Active</span>
</div>
<div className="space-y-md">
<div className="p-md bg-surface-container-low rounded-lg border border-outline-variant/30">
<div className="text-primary font-semibold mb-1 flex items-center gap-xs">
<span className="material-symbols-outlined text-[18px] text-error" data-icon="warning">warning</span>
                                    Mismatched PAN Data
                                </div>
<p className="text-on-surface-variant font-body-md text-sm">FinPilot found 5 vendors with invalid PAN formats in Section 194C.</p>
<button className="mt-md w-full py-2 bg-primary text-white font-label-sm rounded-lg hover:opacity-90">Auto-Remediate</button>
</div>
<div className="p-md bg-surface-container-low rounded-lg border border-outline-variant/30">
<div className="text-primary font-semibold mb-1 flex items-center gap-xs">
<span className="material-symbols-outlined text-[18px] text-secondary" data-icon="lightbulb">lightbulb</span>
                                    Optimized Threshold
                                </div>
<p className="text-on-surface-variant font-body-md text-sm">Reducing tax provision by $4,200 based on new rebate limits.</p>
<button className="mt-md w-full py-2 border border-outline-variant font-label-sm rounded-lg hover:bg-surface-container-high">Apply Adjustments</button>
</div>
</div>
</div>
</div>
{/*  Recent Deductions Table  */}
<div className="col-span-12 bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
<div className="p-lg border-b border-outline-variant flex justify-between items-center">
<h3 className="font-headline-md text-primary">Detailed Reconciliation Ledger</h3>
<div className="flex gap-md">
<div className="relative">
<input className="pl-10 pr-4 py-2 rounded-lg border border-outline-variant text-sm bg-surface-container-low focus:ring-2 focus:ring-secondary focus:border-transparent outline-none w-64" placeholder="Search by Vendor or Section..." type="text"/>
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" data-icon="search">search</span>
</div>
<button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors">
<span className="material-symbols-outlined" data-icon="filter_list">filter_list</span>
</button>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left font-body-md">
<thead>
<tr className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant">
<th className="px-lg py-md font-semibold text-sm">Vendor / Payee</th>
<th className="px-lg py-md font-semibold text-sm">Section</th>
<th className="px-lg py-md font-semibold text-sm">Gross Amount</th>
<th className="px-lg py-md font-semibold text-sm">TDS Rate</th>
<th className="px-lg py-md font-semibold text-sm">Tax Deducted</th>
<th className="px-lg py-md font-semibold text-sm">Status</th>
<th className="px-lg py-md font-semibold text-sm">AI Check</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/30">
<tr className="hover:bg-surface-container-high/30 transition-colors">
<td className="px-lg py-md font-semibold text-primary">CloudScale Solutions</td>
<td className="px-lg py-md text-on-surface-variant">194J</td>
<td className="px-lg py-md font-data-mono">$12,500.00</td>
<td className="px-lg py-md text-on-surface-variant">10%</td>
<td className="px-lg py-md font-data-mono">$1,250.00</td>
<td className="px-lg py-md"><span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-semibold">Processed</span></td>
<td className="px-lg py-md text-secondary"><span className="material-symbols-outlined text-[18px]" data-icon="check_circle">check_circle</span></td>
</tr>
<tr className="hover:bg-surface-container-high/30 transition-colors">
<td className="px-lg py-md font-semibold text-primary">Quantum Dynamics Corp</td>
<td className="px-lg py-md text-on-surface-variant">194C</td>
<td className="px-lg py-md font-data-mono">$8,900.00</td>
<td className="px-lg py-md text-on-surface-variant">2%</td>
<td className="px-lg py-md font-data-mono">$178.00</td>
<td className="px-lg py-md"><span className="bg-secondary-container text-on-secondary-container px-2 py-1 rounded text-xs font-semibold">Pending Deposit</span></td>
<td className="px-lg py-md text-on-surface-variant opacity-40"><span className="material-symbols-outlined text-[18px]" data-icon="pending">pending</span></td>
</tr>
<tr className="hover:bg-surface-container-high/30 transition-colors">
<td className="px-lg py-md font-semibold text-primary">Blue Horizon Logistics</td>
<td className="px-lg py-md text-on-surface-variant">194C</td>
<td className="px-lg py-md font-data-mono">$4,200.00</td>
<td className="px-lg py-md text-on-surface-variant">1%</td>
<td className="px-lg py-md font-data-mono">$42.00</td>
<td className="px-lg py-md"><span className="bg-error-container text-error px-2 py-1 rounded text-xs font-semibold">Overdue</span></td>
<td className="px-lg py-md text-error"><span className="material-symbols-outlined text-[18px]" data-icon="error">error</span></td>
</tr>
<tr className="hover:bg-surface-container-high/30 transition-colors">
<td className="px-lg py-md font-semibold text-primary">Vertex Creative Agency</td>
<td className="px-lg py-md text-on-surface-variant">194J</td>
<td className="px-lg py-md font-data-mono">$25,000.00</td>
<td className="px-lg py-md text-on-surface-variant">10%</td>
<td className="px-lg py-md font-data-mono">$2,500.00</td>
<td className="px-lg py-md"><span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-semibold">Processed</span></td>
<td className="px-lg py-md text-secondary"><span className="material-symbols-outlined text-[18px]" data-icon="check_circle">check_circle</span></td>
</tr>
</tbody>
</table>
</div>
<div className="p-md bg-surface-container-low flex justify-between items-center text-on-surface-variant font-label-sm border-t border-outline-variant">
<span>Showing 4 of 128 entries</span>
<div className="flex gap-md">
<button className="hover:text-primary">Previous</button>
<button className="hover:text-primary">Next</button>
</div>
</div>
</div>
</div>
</main>
</div>
{/*  BottomNavBar (Mobile Only)  */}
<nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center px-sm pb-2 pt-2 bg-surface-container-lowest dark:bg-primary-container shadow-lg rounded-t-xl">
<div className="flex flex-col items-center justify-center text-on-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-all active:scale-90 duration-200">
<span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span className="font-label-sm">Home</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-all active:scale-90 duration-200">
<span className="material-symbols-outlined" data-icon="group">group</span>
<span className="font-label-sm">Clients</span>
</div>
<div className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-full px-4 py-1 active:scale-90 transition-transform duration-200">
<span className="material-symbols-outlined" data-icon="verified">verified</span>
<span className="font-label-sm">TDS</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-all active:scale-90 duration-200">
<span className="material-symbols-outlined" data-icon="groups">groups</span>
<span className="font-label-sm">HR</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant hover:text-secondary dark:hover:text-secondary-fixed transition-all active:scale-90 duration-200">
<span className="material-symbols-outlined" data-icon="grid_view">grid_view</span>
<span className="font-label-sm">More</span>
</div>
</nav>
{/*  Contextual FAB for TDS Dash (Only on home screens)  */}
<button className="fixed bottom-24 right-8 w-14 h-14 bg-secondary text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-40 lg:bottom-12">
<span className="material-symbols-outlined text-[28px]" data-icon="chat_bubble">chat_bubble</span>
</button>

        </div>
    );
};

export default TDSComplianceCenterPage;
