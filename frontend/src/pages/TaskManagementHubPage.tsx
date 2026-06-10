import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';

const TaskManagementHubPage: React.FC = () => {
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
            
{/*  Navigation Drawer (Shell)  */}
<aside className="fixed h-full w-[280px] left-0 top-0 border-r border-outline-variant bg-surface flex flex-col h-screen py-md px-sm shadow-sm z-50 hidden md:flex">
<div className="mb-xl px-md">
<h1 className="font-display-lg text-headline-md text-primary tracking-tight">FinPilot Pro</h1>
<p className="text-on-primary-container font-label-sm opacity-70 uppercase tracking-widest mt-1">Enterprise OS</p>
</div>
<nav className="flex-1 space-y-xs overflow-y-auto">
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
<div className="pt-xl mt-xl border-t border-outline-variant/30">
<a className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-all duration-200" href="#">
<span className="material-symbols-outlined" data-icon="settings">settings</span>
<span className="font-body-md">Settings</span>
</a>
</div>
</nav>
<div className="mt-auto px-md py-sm flex items-center gap-sm bg-surface-container-low rounded-xl">
<div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant">
<img alt="User Profile" data-alt="A professional headshot of a corporate executive in a modern glass office. The individual is wearing a sharp, tailored navy suit and looking confidently at the camera. Soft, diffused daylight creates a high-key, professional aesthetic. The background features blurred architectural elements of a contemporary financial firm, emphasizing a clean and authoritative corporate mood." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDjO7mGU3cdrHnHYZAWnDSHNw00IsAOj433KwkKB7bbZzOmzzDtxxRxucR3jH-aG4bJHZhc4UMQJ_IjuowxXcLra1rBUHw6kkRKz4Xn7fmfcXD3pPzH5hpr7M_kV7ni5H4wXNvpsc4vpvkAUy9lW3pNJZ5T4JQebwQSQJ2AT_z9qm7qrNOzgDfwzksnG_ZRLDXmDLA9vTYVNi7eIqBg0pY8QoTRc1ePASDl9BQNKNgNtkJpLihGyMkqk4SJMmlJwVVJpdYeSh-pM8"/>
</div>
<div>
<p className="font-label-sm text-primary font-bold">Alex Sterling</p>
<p className="text-[10px] text-on-surface-variant uppercase">Senior Partner</p>
</div>
</div>
</aside>
{/*  Main Content Canvas  */}
<main className="md:ml-[280px] h-screen flex flex-col bg-background relative overflow-hidden">
{/*  Top App Bar  */}
<header className="sticky top-0 w-full z-40 bg-surface/70 backdrop-blur-md border-b border-outline-variant/30 flex justify-between items-center px-lg py-sm">
<div className="flex items-center gap-md">
<span className="material-symbols-outlined text-primary" data-icon="search">search</span>
<h2 className="font-headline-md text-headline-md text-primary">Global Search</h2>
</div>
<div className="flex items-center gap-lg">
<div className="hidden lg:flex items-center gap-xs px-sm py-1 bg-surface-container-high rounded-full border border-outline-variant/50">
<span className="material-symbols-outlined text-[18px] text-secondary" data-icon="auto_awesome">auto_awesome</span>
<span className="font-label-sm text-secondary">AI Optimization Active</span>
</div>
<button className="w-10 h-10 flex items-center justify-center text-primary-container hover:bg-surface-container-high rounded-full transition-colors">
<span className="material-symbols-outlined" data-icon="smart_toy">smart_toy</span>
</button>
</div>
</header>
{/*  Content Area  */}
<div className="flex-1 overflow-y-auto p-lg pb-24 md:pb-lg space-y-lg">
{/*  Dashboard Highlights (Bento Grid Style)  */}
<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-lg">
{/*  AI Insight Card  */}
<div className="md:col-span-2 lg:col-span-2 glass-panel p-lg rounded-xl ai-glow relative overflow-hidden group">
<div className="absolute -right-10 -top-10 w-40 h-40 bg-secondary/5 rounded-full blur-3xl group-hover:bg-secondary/10 transition-colors"></div>
<div className="flex items-start justify-between mb-md">
<div>
<span className="inline-flex items-center gap-xs text-secondary font-label-sm mb-xs">
<span className="material-symbols-outlined text-[16px]" data-icon="bolt">bolt</span>
                                WORKLOAD PREDICTION
                            </span>
<h3 className="font-headline-md text-headline-md text-primary">Potential Bottleneck</h3>
</div>
<div className="p-sm bg-secondary-container/20 rounded-lg">
<span className="material-symbols-outlined text-secondary" data-icon="insights">insights</span>
</div>
</div>
<p className="text-on-surface-variant text-body-md mb-lg max-w-md">
                        Audit engagement for <span className="font-bold text-primary">Quantico Ltd</span> is 40% ahead of schedule, but Q3 tax filings for <span className="font-bold text-primary">NexaCore</span> show a resource deficit starting next Tuesday.
                    </p>
<div className="flex gap-md">
<button className="px-md py-sm bg-primary text-on-primary rounded-lg font-label-sm transition-transform active:scale-95">Reallocate Staff</button>
<button className="px-md py-sm border border-outline text-on-surface-variant rounded-lg font-label-sm hover:bg-surface-container transition-colors">Dismiss</button>
</div>
</div>
{/*  Active Timer Card  */}
<div className="glass-panel p-lg rounded-xl flex flex-col justify-between">
<div>
<p className="font-label-sm text-on-surface-variant uppercase mb-sm tracking-wide">Currently Tracking</p>
<h4 className="font-headline-md text-headline-md text-secondary leading-tight">Corporate Restructuring</h4>
<p className="text-body-md text-on-surface-variant mt-xs">Client: BlueHarbor</p>
</div>
<div className="mt-lg">
<div className="font-data-mono text-display-lg text-primary tracking-tighter mb-sm">02:45:12</div>
<button className="w-full py-sm bg-error-container text-on-error-container rounded-lg font-label-sm flex items-center justify-center gap-sm">
<span className="material-symbols-outlined text-[18px]" data-icon="stop_circle">stop_circle</span>
                            Stop Timer
                        </button>
</div>
</div>
{/*  Engagement Health  */}
<div className="glass-panel p-lg rounded-xl">
<p className="font-label-sm text-on-surface-variant uppercase mb-md">Client Engagement Health</p>
<div className="space-y-md">
<div>
<div className="flex justify-between font-label-sm mb-xs">
<span>Utilization Rate</span>
<span className="text-primary font-bold">92%</span>
</div>
<div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-secondary w-[92%]"></div>
</div>
</div>
<div>
<div className="flex justify-between font-label-sm mb-xs">
<span>Profit Margin (Avg)</span>
<span className="text-primary font-bold">48.5%</span>
</div>
<div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-primary w-[48%]"></div>
</div>
</div>
<div className="pt-sm">
<button className="w-full py-sm bg-surface-container-high hover:bg-surface-container-highest rounded-lg text-primary font-label-sm transition-colors">
                                View Full Report
                            </button>
</div>
</div>
</div>
</div>
{/*  Task Center (Kanban / List Hybrid)  */}
<div className="space-y-md">
<div className="flex items-center justify-between">
<h3 className="font-headline-lg text-headline-lg text-primary">Engagement Pipeline</h3>
<div className="flex items-center gap-sm">
<div className="flex bg-surface-container p-1 rounded-lg border border-outline-variant/30">
<button className="p-sm bg-surface rounded-md shadow-sm text-secondary">
<span className="material-symbols-outlined text-[20px]" data-icon="view_kanban">view_kanban</span>
</button>
<button className="p-sm text-on-surface-variant">
<span className="material-symbols-outlined text-[20px]" data-icon="list_alt">list_alt</span>
</button>
</div>
<button className="flex items-center gap-sm px-md py-sm bg-primary text-on-primary rounded-lg font-label-sm">
<span className="material-symbols-outlined text-[18px]" data-icon="add">add</span>
                            New Engagement
                        </button>
</div>
</div>
{/*  Kanban Board  */}
<div className="grid grid-cols-1 lg:grid-cols-4 gap-lg overflow-x-auto pb-md">
{/*  Column: Preparation  */}
<div className="space-y-md min-w-[300px]">
<div className="flex items-center justify-between px-xs">
<h4 className="font-label-sm text-on-surface-variant uppercase tracking-widest flex items-center gap-xs">
<span className="w-2 h-2 rounded-full bg-outline"></span> Preparation
                            </h4>
<span className="font-data-mono text-on-surface-variant text-xs">2</span>
</div>
<div className="space-y-md">
<div className="bg-surface-container-lowest border border-outline-variant p-md rounded-xl shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
<div className="flex justify-between items-start mb-sm">
<span className="px-sm py-[2px] bg-secondary/10 text-secondary text-[10px] font-bold rounded uppercase">Audit</span>
<span className="material-symbols-outlined text-outline-variant group-hover:text-primary" data-icon="more_horiz">more_horiz</span>
</div>
<h5 className="font-body-md font-bold text-primary mb-xs">Starlight Energy Q4 Audit</h5>
<p className="text-[12px] text-on-surface-variant line-clamp-2">Initial document gathering and risk assessment phase.</p>
<div className="mt-md flex items-center justify-between">
<div className="flex -space-x-2">
<img className="w-6 h-6 rounded-full border-2 border-surface" data-alt="Corporate headshot of a professional male analyst with clean aesthetic, soft neutral background, high-end office lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCm9XnM5jduRmF6yrwq6lKrI2plO5SvOEwP9vTrq5OwMC9H692sVznZbr1XoxW6QkuegO6htaN8iGWojW0FxVwj1euJ_lvreak0Mv0tfZ8B1TlclY-1B1zuwZRfQPDrAncX01tc6mVzHH6s2g8QsBumMog-pKG3DtncosTbSD_fjN7R-guZq0vhHxXNhn2NEeVMxMkKiVFasmll5etOIrsSJ8tpUuX7NsaPtY9YuguKYN8JvXYJBg2QzFY-XMVsW_22T-ND8YNqNB8"/>
<div className="w-6 h-6 rounded-full border-2 border-surface bg-primary-container flex items-center justify-center text-[8px] text-white">+3</div>
</div>
<div className="flex items-center gap-xs text-error font-label-sm">
<span className="material-symbols-outlined text-[14px]" data-icon="event">event</span>
                                        Oct 12
                                    </div>
</div>
</div>
<div className="bg-surface-container-lowest border border-outline-variant p-md rounded-xl shadow-sm hover:shadow-md transition-shadow group cursor-pointer border-l-4 border-l-secondary">
<div className="flex justify-between items-start mb-sm">
<span className="px-sm py-[2px] bg-primary/10 text-primary text-[10px] font-bold rounded uppercase">Advisory</span>
<span className="material-symbols-outlined text-outline-variant" data-icon="more_horiz">more_horiz</span>
</div>
<h5 className="font-body-md font-bold text-primary mb-xs">Estate Planning - Sterling</h5>
<div className="flex items-center gap-xs text-on-surface-variant font-label-sm mt-md">
<span className="material-symbols-outlined text-[14px]" data-icon="schedule">schedule</span>
                                    Due in 4 days
                                </div>
</div>
</div>
</div>
{/*  Column: Fieldwork  */}
<div className="space-y-md min-w-[300px]">
<div className="flex items-center justify-between px-xs">
<h4 className="font-label-sm text-on-surface-variant uppercase tracking-widest flex items-center gap-xs">
<span className="w-2 h-2 rounded-full bg-secondary"></span> Fieldwork
                            </h4>
<span className="font-data-mono text-on-surface-variant text-xs">3</span>
</div>
<div className="space-y-md">
<div className="glass-panel p-md rounded-xl border-l-4 border-l-secondary ai-glow group cursor-pointer">
<div className="flex justify-between items-start mb-sm">
<span className="px-sm py-[2px] bg-on-tertiary-fixed-variant/10 text-on-tertiary-fixed-variant text-[10px] font-bold rounded uppercase">AI Recommended</span>
<span className="material-symbols-outlined text-secondary" data-icon="auto_awesome" style={{ fontVariationSettings: '"FILL" 1' }}>auto_awesome</span>
</div>
<h5 className="font-body-md font-bold text-primary mb-xs">NexaCore Tax Compliance</h5>
<p className="text-[12px] text-on-surface-variant mb-md">AI suggesting priority increase due to potential regulatory shift.</p>
<div className="w-full h-1.5 bg-surface-container rounded-full mb-md">
<div className="h-full bg-secondary w-3/4"></div>
</div>
<div className="flex items-center justify-between">
<div className="flex -space-x-2">
<img className="w-6 h-6 rounded-full border-2 border-surface" data-alt="A focused female professional in a modern office, wearing a grey blazer, engaged in strategic work. Minimalist corporate background with soft, cool lighting. The style is clean, modern, and high-performance financial aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOXLaKQ_cKk4C_iLQvh9XAR56X69Z1wYWDj1kChDeQ30NUPPd-1RO282pdVjpMsNmLfAQ-B5Ex3Ws_ELVcs5OSYVCa-MaXVmQwOQDiCKOjAksZZRFKEVCkc357j_A_C4bS3W1vyyTCt5_YfPgu-xvm1ep7Id2t9H3wRsbn70q37eoyNQx1iRVEuv6FRilLtVwfRwvHBvJRb1K-dpmumEB_H042wOIb0zCvTb_qulF4h5S0uu7ken2m5qJLPcy5KLSn28Xpy6qgVbw"/>
</div>
<span className="font-label-sm text-secondary">75% Complete</span>
</div>
</div>
</div>
</div>
{/*  Column: Review  */}
<div className="space-y-md min-w-[300px]">
<div className="flex items-center justify-between px-xs">
<h4 className="font-label-sm text-on-surface-variant uppercase tracking-widest flex items-center gap-xs">
<span className="w-2 h-2 rounded-full bg-tertiary-container"></span> Review
                            </h4>
<span className="font-data-mono text-on-surface-variant text-xs">1</span>
</div>
<div className="bg-surface-container-lowest border border-outline-variant p-md rounded-xl shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
<h5 className="font-body-md font-bold text-primary mb-xs">IronBound Logistics M&amp;A</h5>
<div className="flex items-center gap-md mt-md">
<div className="flex items-center gap-xs text-[10px] font-bold text-on-surface-variant uppercase">
<span className="material-symbols-outlined text-[14px]" data-icon="attach_file">attach_file</span>
                                    12 Docs
                                </div>
<div className="flex items-center gap-xs text-[10px] font-bold text-on-surface-variant uppercase">
<span className="material-symbols-outlined text-[14px]" data-icon="forum">forum</span>
                                    5 Comments
                                </div>
</div>
</div>
</div>
{/*  Column: Completion  */}
<div className="space-y-md min-w-[300px]">
<div className="flex items-center justify-between px-xs">
<h4 className="font-label-sm text-on-surface-variant uppercase tracking-widest flex items-center gap-xs">
<span className="w-2 h-2 rounded-full bg-emerald-500"></span> Completion
                            </h4>
<span className="font-data-mono text-on-surface-variant text-xs">0</span>
</div>
<div className="border-2 border-dashed border-outline-variant rounded-xl p-xl flex flex-col items-center justify-center text-on-surface-variant/40">
<span className="material-symbols-outlined text-[32px]" data-icon="task_alt">task_alt</span>
<p className="font-label-sm mt-sm">Drag to archive</p>
</div>
</div>
</div>
</div>
{/*  Timesheet Summary Section  */}
<div className="glass-panel rounded-xl overflow-hidden mt-lg">
<div className="px-lg py-md border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
<h3 className="font-body-md font-bold text-primary">Timesheet Approval Queue</h3>
<div className="flex gap-md">
<button className="text-secondary font-label-sm hover:underline">Select All</button>
<button className="text-primary font-label-sm flex items-center gap-xs">
<span className="material-symbols-outlined text-[18px]" data-icon="filter_list">filter_list</span> Filter
                        </button>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-lowest font-label-sm text-on-surface-variant uppercase tracking-wider">
<th className="px-lg py-sm">Staff Member</th>
<th className="px-lg py-sm">Client / Engagement</th>
<th className="px-lg py-sm">Duration</th>
<th className="px-lg py-sm">Status</th>
<th className="px-lg py-sm">Action</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/20">
<tr className="compact-table-row transition-colors">
<td className="px-lg py-md flex items-center gap-sm">
<div className="w-8 h-8 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary font-bold text-[10px]">JD</div>
<span className="font-body-md">John Doe</span>
</td>
<td className="px-lg py-md">
<span className="font-bold">NexaCore</span>
<p className="text-[12px] text-on-surface-variant">Tax Compliance Fieldwork</p>
</td>
<td className="px-lg py-md font-data-mono">06h 45m</td>
<td className="px-lg py-md">
<span className="px-sm py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">Pending Review</span>
</td>
<td className="px-lg py-md">
<div className="flex gap-sm">
<button className="p-1 hover:bg-emerald-100 text-emerald-600 rounded" title="Approve">
<span className="material-symbols-outlined" data-icon="check_circle">check_circle</span>
</button>
<button className="p-1 hover:bg-error-container text-error rounded" title="Reject">
<span className="material-symbols-outlined" data-icon="cancel">cancel</span>
</button>
</div>
</td>
</tr>
<tr className="compact-table-row transition-colors">
<td className="px-lg py-md flex items-center gap-sm">
<div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center text-primary font-bold text-[10px]">RW</div>
<span className="font-body-md">Rachel Wong</span>
</td>
<td className="px-lg py-md">
<span className="font-bold">Quantico Ltd</span>
<p className="text-[12px] text-on-surface-variant">Annual Audit Review</p>
</td>
<td className="px-lg py-md font-data-mono">03h 12m</td>
<td className="px-lg py-md">
<span className="px-sm py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full uppercase">Auto-Validated</span>
</td>
<td className="px-lg py-md">
<button className="px-md py-1 bg-surface-container-high rounded text-[10px] font-bold uppercase">View Logs</button>
</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
{/*  FAB for AI Interaction  */}
<button className="fixed bottom-24 right-8 md:bottom-8 md:right-8 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform ai-glow z-50">
<span className="material-symbols-outlined" data-icon="smart_toy">smart_toy</span>
</button>
{/*  Bottom NavBar (Mobile Only)  */}
<nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-lowest/80 backdrop-blur-xl border-t border-outline-variant/20 flex justify-around items-center pb-safe pt-2 z-50 rounded-t-xl shadow-lg">
<a className="flex flex-col items-center justify-center text-on-surface-variant" href="#">
<span className="material-symbols-outlined" data-icon="home">home</span>
<span className="font-label-sm">Home</span>
</a>
<a className="flex flex-col items-center justify-center text-on-surface-variant" href="#">
<span className="material-symbols-outlined" data-icon="list_alt">list_alt</span>
<span className="font-label-sm">Ledger</span>
</a>
<div className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-2xl px-4 py-1 animate-pulse-subtle">
<span className="material-symbols-outlined" data-icon="add_box">add_box</span>
<span className="font-label-sm">Entry</span>
</div>
<a className="flex flex-col items-center justify-center text-on-surface-variant" href="#">
<span className="material-symbols-outlined" data-icon="insights">insights</span>
<span className="font-label-sm">AI</span>
</a>
</nav>
</main>
{/*  Micro-interaction for Timer  */}


        </div>
    );
};

export default TaskManagementHubPage;
