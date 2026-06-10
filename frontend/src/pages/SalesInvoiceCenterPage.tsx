import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';

const SalesInvoiceCenterPage: React.FC = () => {
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
<header className="flex justify-between items-center w-full px-gutter h-16 z-50 bg-surface/70 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm sticky top-0">
<div className="flex items-center gap-md">
<span className="material-symbols-outlined text-primary cursor-pointer active:scale-95 duration-200">menu</span>
<h1 className="font-headline-md text-headline-md font-bold text-primary">FinPilot Pro</h1>
</div>
<div className="flex items-center gap-md">
<span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:bg-surface-container-high/50 p-2 rounded-full transition-colors">search</span>
<span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:bg-surface-container-high/50 p-2 rounded-full transition-colors">notifications</span>
<div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center cursor-pointer active:scale-95 duration-200 overflow-hidden">
<img alt="User Profile" className="w-full h-full object-cover" data-alt="A professional headshot of a senior financial partner with a confident expression, set against a blurred modern office background with soft indigo and corporate blue tones. The lighting is crisp and high-end, reflecting an enterprise software environment." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3RfvUij0RNQFjRZ5SlXrc8SKZBp4fj4ZuZwKPclHFbUaMT9VqWexaxapI3v21-xbgrpz6hubN6YKzl3Av05hSVRrMYvv2qZ-vovSGK8plgDailzrILfluUF547HhXHfhs1XImh10B7KpMhr6v6V1F766ciV34RE_e2yfnEzDMbnyZKkzA_DmXm7dBaQV4A2ALJvReJ-h0WjfQvZ8yr34QwuhxnrNvZS6q2lN3lDGwTaxuMXSI4juJTZ899ptN5w8s_M6aSeSG5uA"/>
</div>
</div>
</header>
<main className="max-w-container-max mx-auto px-gutter py-lg pb-32">
{/*  Dashboard Header & AI Summary Section  */}
<section className="grid grid-cols-1 lg:grid-cols-3 gap-lg mb-xl">
<div className="lg:col-span-2 flex flex-col justify-center">
<h2 className="font-headline-lg text-headline-lg mb-sm text-primary">Invoice Center</h2>
<p className="text-on-surface-variant font-body-lg">Manage your receivables with AI-driven cash flow insights.</p>
</div>
{/*  AI Summary Card  */}
<div className="bg-surface-container-lowest border border-primary/10 rounded-xl p-lg ai-glow relative overflow-hidden group">
<div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
<span className="material-symbols-outlined text-6xl text-secondary">auto_awesome</span>
</div>
<div className="flex items-center gap-xs mb-md">
<span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>auto_awesome</span>
<span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">AI Invoice Summary</span>
</div>
<div className="space-y-md">
<div>
<p className="text-on-surface-variant text-body-md mb-xs">Total Receivables</p>
<p className="font-headline-md text-headline-md text-primary">$428,590.00</p>
</div>
<div className="flex justify-between items-end border-t border-outline-variant/30 pt-md">
<div>
<p className="text-on-surface-variant text-xs">Avg. Days to Pay</p>
<p className="font-data-mono text-data-mono text-primary">14.2 Days</p>
</div>
<div className="text-right">
<p className="text-on-surface-variant text-xs">Collection Efficiency</p>
<p className="font-data-mono text-data-mono text-emerald-600">94.8%</p>
</div>
</div>
</div>
</div>
</section>
{/*  Status Tabs Navigation  */}
<nav className="flex overflow-x-auto no-scrollbar gap-sm mb-lg border-b border-outline-variant/20 pb-xs">
<button className="px-lg py-sm font-label-sm text-label-sm whitespace-nowrap border-b-2 border-secondary text-secondary">All Invoices</button>
<button className="px-lg py-sm font-label-sm text-label-sm whitespace-nowrap border-b-2 border-transparent text-on-surface-variant hover:text-primary transition-colors">Draft</button>
<button className="px-lg py-sm font-label-sm text-label-sm whitespace-nowrap border-b-2 border-transparent text-on-surface-variant hover:text-primary transition-colors">Sent</button>
<button className="px-lg py-sm font-label-sm text-label-sm whitespace-nowrap border-b-2 border-transparent text-on-surface-variant hover:text-primary transition-colors">Paid</button>
<button className="px-lg py-sm font-label-sm text-label-sm whitespace-nowrap border-b-2 border-transparent text-on-surface-variant hover:text-primary transition-colors flex items-center gap-xs">
                Overdue
                <span className="bg-error-container text-on-error-container px-1.5 py-0.5 rounded-full text-[10px]">3</span>
</button>
</nav>
{/*  Invoice List Table/Grid  */}
<div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-low border-b border-outline-variant/30">
<th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant">Customer Name</th>
<th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant text-right">Amount</th>
<th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant">Due Date</th>
<th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant">Status</th>
<th className="px-lg py-md font-label-sm text-label-sm text-on-surface-variant w-10"></th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/20">
{/*  Invoice Row 1  */}
<tr className="hover:bg-surface-container-high/30 transition-colors group">
<td className="px-lg py-md">
<div className="flex items-center gap-md">
<div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center font-bold text-primary">GS</div>
<div>
<p className="font-headline-md text-body-md font-semibold text-primary">Global Synergies Ltd</p>
<p className="text-xs text-on-surface-variant">INV-2024-001</p>
</div>
</div>
</td>
<td className="px-lg py-md text-right">
<p className="font-data-mono text-data-mono text-primary">$12,450.00</p>
</td>
<td className="px-lg py-md">
<p className="font-body-md text-on-surface-variant">Oct 24, 2024</p>
</td>
<td className="px-lg py-md">
<span className="px-sm py-xs bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded">Paid</span>
</td>
<td className="px-lg py-md">
<button className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">more_vert</button>
</td>
</tr>
{/*  Invoice Row 2  */}
<tr className="hover:bg-surface-container-high/30 transition-colors group">
<td className="px-lg py-md">
<div className="flex items-center gap-md">
<div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center font-bold text-primary">TR</div>
<div>
<p className="font-headline-md text-body-md font-semibold text-primary">Terra Research LLC</p>
<p className="text-xs text-on-surface-variant">INV-2024-002</p>
</div>
</div>
</td>
<td className="px-lg py-md text-right">
<p className="font-data-mono text-data-mono text-primary">$8,900.00</p>
</td>
<td className="px-lg py-md">
<p className="font-body-md text-error">Oct 12, 2024</p>
</td>
<td className="px-lg py-md">
<span className="px-sm py-xs bg-error-container text-on-error-container text-[10px] font-bold uppercase tracking-wider rounded">Overdue</span>
</td>
<td className="px-lg py-md">
<button className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">more_vert</button>
</td>
</tr>
{/*  Invoice Row 3  */}
<tr className="hover:bg-surface-container-high/30 transition-colors group">
<td className="px-lg py-md">
<div className="flex items-center gap-md">
<div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center font-bold text-primary">NK</div>
<div>
<p className="font-headline-md text-body-md font-semibold text-primary">Nexa Kraft Inc</p>
<p className="text-xs text-on-surface-variant">INV-2024-003</p>
</div>
</div>
</td>
<td className="px-lg py-md text-right">
<p className="font-data-mono text-data-mono text-primary">$24,120.00</p>
</td>
<td className="px-lg py-md">
<p className="font-body-md text-on-surface-variant">Nov 02, 2024</p>
</td>
<td className="px-lg py-md">
<span className="px-sm py-xs bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded">Sent</span>
</td>
<td className="px-lg py-md">
<button className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">more_vert</button>
</td>
</tr>
{/*  Invoice Row 4  */}
<tr className="hover:bg-surface-container-high/30 transition-colors group">
<td className="px-lg py-md">
<div className="flex items-center gap-md">
<div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center font-bold text-primary">VM</div>
<div>
<p className="font-headline-md text-body-md font-semibold text-primary">Vantage Media</p>
<p className="text-xs text-on-surface-variant">INV-2024-004</p>
</div>
</div>
</td>
<td className="px-lg py-md text-right">
<p className="font-data-mono text-data-mono text-primary">$4,550.00</p>
</td>
<td className="px-lg py-md">
<p className="font-body-md text-on-surface-variant">---</p>
</td>
<td className="px-lg py-md">
<span className="px-sm py-xs bg-surface-container-highest text-on-surface-variant text-[10px] font-bold uppercase tracking-wider rounded">Draft</span>
</td>
<td className="px-lg py-md">
<button className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">more_vert</button>
</td>
</tr>
</tbody>
</table>
</div>
{/*  Pagination-like footer  */}
<div className="p-lg flex justify-between items-center border-t border-outline-variant/30">
<p className="text-xs text-on-surface-variant">Showing 4 of 24 invoices</p>
<div className="flex gap-md">
<button className="p-1 border border-outline-variant/30 rounded-lg hover:bg-surface-container transition-colors disabled:opacity-30" disabled={true}>
<span className="material-symbols-outlined text-sm">chevron_left</span>
</button>
<button className="p-1 border border-outline-variant/30 rounded-lg hover:bg-surface-container transition-colors">
<span className="material-symbols-outlined text-sm">chevron_right</span>
</button>
</div>
</div>
</div>
</main>
{/*  FAB  */}
<button className="fixed bottom-20 right-6 md:bottom-8 md:right-8 bg-secondary text-on-secondary w-14 h-14 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-transform flex items-center justify-center group z-40">
<span className="material-symbols-outlined text-3xl">add</span>
{/*  Tooltip appearing on hover  */}
<span className="absolute right-full mr-4 bg-primary text-white text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Create Invoice</span>
</button>
{/*  BottomNavBar (Mobile Only)  */}
<footer className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center py-2 px-4 bg-surface dark:bg-primary border-t border-outline-variant/20 z-50">
<div className="flex flex-col items-center justify-center text-on-surface-variant dark:text-on-primary-fixed-variant cursor-pointer active:scale-90 transition-transform">
<span className="material-symbols-outlined">home</span>
<span className="font-label-sm text-label-sm">Home</span>
</div>
<div className="flex flex-col items-center justify-center bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-on-secondary rounded-full px-4 py-1 cursor-pointer active:scale-90 transition-transform">
<span className="material-symbols-outlined">account_balance_wallet</span>
<span className="font-label-sm text-label-sm">Ledgers</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant dark:text-on-primary-fixed-variant cursor-pointer active:scale-90 transition-transform">
<span className="material-symbols-outlined">verified_user</span>
<span className="font-label-sm text-label-sm">Compliance</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant dark:text-on-primary-fixed-variant cursor-pointer active:scale-90 transition-transform">
<span className="material-symbols-outlined">groups</span>
<span className="font-label-sm text-label-sm">HR</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant dark:text-on-primary-fixed-variant cursor-pointer active:scale-90 transition-transform">
<span className="material-symbols-outlined">more_horiz</span>
<span className="font-label-sm text-label-sm">More</span>
</div>
</footer>
{/*  Subtle atmospheric effect  */}
<div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
<div className="absolute -top-40 -left-40 w-96 h-96 bg-secondary/5 rounded-full blur-[100px]"></div>
<div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"></div>
</div>


        </div>
    );
};

export default SalesInvoiceCenterPage;
