import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';

const AIAssistantCenterPage: React.FC = () => {
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
            
{/*  Desktop Navigation Drawer  */}
<aside className="hidden md:flex fixed h-full w-[280px] left-0 top-0 bg-surface border-r border-outline-variant flex-col py-md px-sm z-50">
<div className="mb-xl px-md">
<h1 className="font-display-lg text-display-lg text-primary">FinPilot Pro</h1>
<p className="text-on-primary-container font-label-sm">Enterprise OS v2.4.0</p>
</div>
<nav className="flex-grow space-y-sm">
<div className="bg-secondary-container text-on-secondary-container rounded-lg font-bold flex items-center px-md py-sm cursor-pointer transition-all duration-200">
<span className="material-symbols-outlined mr-md">dashboard</span>
<span className="font-body-md">Dashboard</span>
</div>
<div className="text-on-surface-variant hover:bg-surface-container-low rounded-lg flex items-center px-md py-sm cursor-pointer transition-all duration-200">
<span className="material-symbols-outlined mr-md">account_balance_wallet</span>
<span className="font-body-md">Ledgers</span>
</div>
<div className="text-on-surface-variant hover:bg-surface-container-low rounded-lg flex items-center px-md py-sm cursor-pointer transition-all duration-200">
<span className="material-symbols-outlined mr-md">receipt_long</span>
<span className="font-body-md">Vouchers</span>
</div>
<div className="text-on-surface-variant hover:bg-surface-container-low rounded-lg flex items-center px-md py-sm cursor-pointer transition-all duration-200">
<span className="material-symbols-outlined mr-md">account_balance</span>
<span className="font-body-md">Taxes</span>
</div>
</nav>
<div className="mt-auto p-md border-t border-outline-variant flex items-center gap-md">
<img alt="User Profile" className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant" data-alt="A professional headshot of a financial executive in a modern, brightly lit office environment. The background is softly blurred, showing minimalist corporate architecture and glass partitions. The lighting is crisp and natural, emphasizing a high-end corporate futurism aesthetic with a clean white and navy color palette." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGLf0SiOaElExtl_3nvdA5x0kQY92z0N-1RVvF387pipLODwMdBHhFV-xDShVDa8Y2TuJpDgk6SdWRjsuZ-sTq5_CJyU6WmYEHwiCK__L36RInLVX6dpAo3RnrlrqT8un3Wcbe0EeLKy1jRQ8iGCsOLeynxKsJNbAWkK-1G8BL6BssFIj0E-dAxXBXQThMiLsG3eIavXMiQya3E1-H99vMkNwoGv3lqXRR1x2KJDahbTY9AIiJPU0WJIBJ2SXJ88LdO-tr99Hgf5I"/>
<div>
<p className="font-bold text-on-surface">Alex Chen</p>
<p className="text-xs text-on-surface-variant">CFO @ TechCorp</p>
</div>
<span className="material-symbols-outlined ml-auto text-on-surface-variant cursor-pointer">settings</span>
</div>
</aside>
{/*  Main Content Canvas  */}
<main className="md:ml-[280px] h-screen flex flex-col relative overflow-hidden bg-background">
{/*  Top App Bar  */}
<header className="sticky top-0 w-full z-40 bg-surface/70 backdrop-blur-md border-b border-outline-variant/30 flex justify-between items-center px-lg py-sm">
<div className="flex items-center gap-md">
<span className="material-symbols-outlined text-primary font-headline-md">search</span>
<h2 className="font-headline-md text-headline-md text-primary">Global Search</h2>
</div>
<div className="flex items-center gap-sm">
<button className="material-symbols-outlined text-primary hover:text-secondary transition-colors active:scale-90">smart_toy</button>
<div className="h-6 w-[1px] bg-outline-variant mx-sm hidden md:block"></div>
<button className="hidden md:flex items-center gap-xs px-md py-xs bg-primary text-on-primary rounded-full font-label-sm shadow-sm transition-all hover:opacity-90 active:scale-95">
<span className="material-symbols-outlined text-sm">add</span>
<span>New Entry</span>
</button>
</div>
</header>
{/*  Chat Workspace Layout  */}
<section className="flex-grow flex flex-col md:flex-row gap-gutter p-md md:p-lg h-[calc(100vh-140px)] md:h-[calc(100vh-72px)] overflow-hidden">
{/*  AI Chat & Document Area  */}
<div className="flex-grow flex flex-col glass-panel rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden relative">
{/*  Chat Feed  */}
<div className="flex-grow chat-scroll overflow-y-auto p-md md:p-lg space-y-lg flex flex-col">
{/*  System Message  */}
<div className="flex justify-center">
<span className="text-xs font-label-sm bg-surface-container-high px-md py-xs rounded-full text-on-surface-variant">Session: March Quarter Forecasting</span>
</div>
{/*  AI Bubble  */}
<div className="flex items-start gap-md max-w-[85%]">
<div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-on-secondary shadow-lg">
<span className="material-symbols-outlined">smart_toy</span>
</div>
<div className="p-md rounded-2xl bg-secondary-container text-on-secondary-container ai-glow">
<p className="font-body-md mb-sm">Welcome back, Alex. I've analyzed your recent ledger entries. Would you like to see a projection for tax liabilities or review the 12 overdue invoices detected in the general ledger?</p>
<div className="flex flex-wrap gap-xs">
<button className="px-sm py-xs bg-on-secondary-container/10 border border-on-secondary-container/20 rounded-lg text-xs hover:bg-on-secondary-container/20 transition-all">Show overdue invoices</button>
<button className="px-sm py-xs bg-on-secondary-container/10 border border-on-secondary-container/20 rounded-lg text-xs hover:bg-on-secondary-container/20 transition-all">Tax Forecast</button>
</div>
</div>
</div>
{/*  User Bubble  */}
<div className="flex items-start gap-md self-end max-w-[85%] flex-row-reverse">
<div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center">
<span className="material-symbols-outlined text-primary">person</span>
</div>
<div className="p-md rounded-2xl bg-surface-container text-on-surface border border-outline-variant/30">
<p className="font-body-md">Analyze the invoice I just uploaded. Check for fraud risk and verify tax compliance.</p>
</div>
</div>
{/*  OCR Progress / File Upload State  */}
<div className="flex items-start gap-md max-w-[85%]">
<div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-on-secondary">
<span className="material-symbols-outlined">description</span>
</div>
<div className="p-md rounded-2xl bg-surface-bright border border-outline-variant/40 w-full">
<div className="flex justify-between items-center mb-xs">
<span className="text-xs font-bold text-secondary">INV_9942_TECH.pdf</span>
<span className="text-xs text-on-surface-variant">OCR Processing 74%</span>
</div>
<div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
<div className="h-full bg-secondary w-3/4 rounded-full animate-pulse"></div>
</div>
</div>
</div>
{/*  AI Answer with Data (Bento Grid Insight)  */}
<div className="flex items-start gap-md max-w-[95%]">
<div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-on-secondary">
<span className="material-symbols-outlined">insights</span>
</div>
<div className="p-md rounded-2xl bg-secondary-container text-on-secondary-container ai-glow flex flex-col gap-md w-full">
<p className="font-body-md">Extraction complete. Here's the risk profile for **INV_9942**:</p>
<div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
<div className="bg-white/10 p-sm rounded-xl border border-white/20">
<p className="text-[10px] uppercase opacity-70">Fraud Risk</p>
<p className="text-lg font-bold">Low (2%)</p>
<p className="text-[10px] text-emerald-300">Verified Vendor ID</p>
</div>
<div className="bg-white/10 p-sm rounded-xl border border-white/20">
<p className="text-[10px] uppercase opacity-70">Tax Deductible</p>
<p className="text-lg font-bold">Partial</p>
<p className="text-[10px] text-amber-300">Awaiting categorization</p>
</div>
</div>
</div>
</div>
</div>
{/*  Input Zone  */}
<div className="p-md bg-surface-container-low border-t border-outline-variant/30">
<div className="flex flex-wrap gap-xs mb-sm">
<button className="px-md py-xs bg-surface text-on-surface-variant text-xs rounded-full border border-outline-variant/50 hover:bg-secondary hover:text-white transition-all">Tax Optimization</button>
<button className="px-md py-xs bg-surface text-on-surface-variant text-xs rounded-full border border-outline-variant/50 hover:bg-secondary hover:text-white transition-all">Fraud Detection</button>
<button className="px-md py-xs bg-surface text-on-surface-variant text-xs rounded-full border border-outline-variant/50 hover:bg-secondary hover:text-white transition-all">Categorize Entries</button>
</div>
<div className="flex items-center gap-sm bg-surface border border-outline-variant rounded-2xl px-md py-sm focus-within:ring-2 focus-within:ring-secondary transition-all">
<button className="material-symbols-outlined text-on-surface-variant hover:text-secondary">attach_file</button>
<input className="flex-grow bg-transparent border-none focus:ring-0 text-body-md" placeholder="Ask FinPilot anything..." type="text"/>
<button className="bg-secondary text-on-secondary rounded-xl p-xs hover:opacity-90 transition-all flex items-center justify-center">
<span className="material-symbols-outlined">send</span>
</button>
</div>
</div>
</div>
{/*  Analysis Sidebar (Desktop only)  */}
<aside className="hidden lg:flex w-80 flex-col gap-md">
<div className="bg-surface-container-high p-md rounded-2xl border border-outline-variant/20">
<h3 className="font-headline-md text-sm mb-md flex items-center gap-xs">
<span className="material-symbols-outlined text-secondary">trending_up</span>
                        Real-time Forecasting
                    </h3>
<div className="space-y-sm">
<div className="flex justify-between items-center text-xs">
<span className="text-on-surface-variant">Burn Rate</span>
<span className="font-data-mono text-primary">$12,400/mo</span>
</div>
<div className="w-full h-1 bg-white/40 rounded-full overflow-hidden">
<div className="h-full bg-secondary w-3/5"></div>
</div>
<div className="flex justify-between items-center text-xs">
<span className="text-on-surface-variant">Projected Tax</span>
<span className="font-data-mono text-primary">$4,821.00</span>
</div>
</div>
</div>
<div className="flex-grow bg-white p-md rounded-2xl border border-outline-variant/20 shadow-sm">
<h3 className="font-headline-md text-sm mb-md">Active Documents</h3>
<div className="space-y-md">
<div className="flex items-center gap-sm p-sm rounded-xl hover:bg-surface-container-low cursor-pointer border border-transparent hover:border-outline-variant/30">
<div className="bg-emerald-100 text-emerald-700 p-xs rounded-lg">
<span className="material-symbols-outlined">check_circle</span>
</div>
<div className="overflow-hidden">
<p className="text-xs font-bold truncate">Payroll_Summary_Feb.csv</p>
<p className="text-[10px] text-on-surface-variant">Analyzed 2m ago</p>
</div>
</div>
<div className="flex items-center gap-sm p-sm rounded-xl hover:bg-surface-container-low cursor-pointer border border-transparent hover:border-outline-variant/30">
<div className="bg-amber-100 text-amber-700 p-xs rounded-lg">
<span className="material-symbols-outlined">warning</span>
</div>
<div className="overflow-hidden">
<p className="text-xs font-bold truncate">Supplier_Bill_X92.pdf</p>
<p className="text-[10px] text-on-surface-variant">Flagged for review</p>
</div>
</div>
</div>
</div>
</aside>
</section>
{/*  Mobile Bottom Nav  */}
<nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center pb-safe pt-2 bg-surface-container-lowest/80 backdrop-blur-xl border-t border-outline-variant/20 z-50">
<div className="flex flex-col items-center justify-center text-on-surface-variant">
<span className="material-symbols-outlined">home</span>
<span className="font-label-sm text-label-sm">Home</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant">
<span className="material-symbols-outlined">list_alt</span>
<span className="font-label-sm text-label-sm">Ledger</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant">
<span className="material-symbols-outlined">add_box</span>
<span className="font-label-sm text-label-sm">Entry</span>
</div>
<div className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-2xl px-4 py-1">
<span className="material-symbols-outlined">insights</span>
<span className="font-label-sm text-label-sm">AI</span>
</div>
</nav>
</main>


        </div>
    );
};

export default AIAssistantCenterPage;
