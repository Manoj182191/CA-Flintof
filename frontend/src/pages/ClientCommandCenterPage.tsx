import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import clientPortalService from '../services/clientPortalService';

const ClientCommandCenterPage: React.FC = () => {
    const navigate = useNavigate();
    const { activeCompanyId } = useAuth();
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (activeCompanyId) {
            fetchData();
        }
    }, [activeCompanyId]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await clientPortalService.getDashboard(parseInt(activeCompanyId!) || 0);
            setDashboardData(data);
        } catch (error) {
            console.error('Failed to fetch client dashboard data', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="stitch-app">
            
{/*  TopAppBar  */}
<header className="bg-surface/70 backdrop-blur-xl z-50 sticky top-0 border-b border-outline-variant/30 shadow-sm flex justify-between items-center w-full px-gutter h-16">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary cursor-pointer active:scale-95 duration-200" data-icon="menu">menu</span>
<h1 className="font-headline-md text-headline-md font-bold text-primary">FinPilot Pro</h1>
</div>
<div className="flex items-center gap-4">
<div className="relative">
<span className="material-symbols-outlined text-on-surface-variant cursor-pointer active:scale-95 duration-200" data-icon="notifications">notifications</span>
<span className="absolute -top-1 -right-1 w-2 h-2 bg-secondary rounded-full"></span>
</div>
<img alt="User Profile" className="w-8 h-8 rounded-full border border-outline-variant/50 cursor-pointer active:scale-95 duration-200" data-alt="A professional close-up studio portrait of a modern executive for a profile avatar. The lighting is soft and cinematic against a neutral, high-end corporate backdrop. The visual style is clean and sharp, using a shallow depth of field to keep the focus on the person. The color palette consists of soft grays and deep blues, reflecting a premium fintech brand identity." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTLnPhcNLL8oLfEKG42Nw0n2WDhU9iFY_CMPFQ_HVLTIriftrEfLL_dQWDe9wDr94DhEcIgGuuzqL1T1_Oj4mqvqUUN3gWcoO4dCaDHGZitpBrS6xRAz5M1sM7mxw3xyOTmtpDvQVBcfy-R7NqQWyPUoSsKej-DOcYOegQAVVaZs3t6eAaqLIbz3dHvZBH_eD93oZ8WQzI-T2enLSuCzeVoaSrVzuD2FR11M00VFAk8VNGIaoSzL07Nvnqt1o6Mm7SyL-LCIJOzjg"/>
</div>
</header>
{/*  Main Content Canvas  */}
<main className="px-gutter pt-lg space-y-lg">
{/*  Welcome Section  */}
<section className="space-y-1">
<p className="font-label-sm text-label-sm text-secondary-container uppercase tracking-wider">Welcome back</p>
<h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary">Hello, Acme Corp</h2>
</section>
{/*  KPI Grid (Bento Style)  */}
<div className="grid grid-cols-2 gap-4">
{/*  Compliance Score Card (Large)  */}
<div className="col-span-2 glass-card rounded-xl p-md ai-glow flex flex-col justify-between overflow-hidden relative group">
<div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
<span className="material-symbols-outlined text-6xl" data-icon="verified_user">verified_user</span>
</div>
<div className="space-y-4">
<div className="flex justify-between items-start">
<div>
<h3 className="font-label-sm text-label-sm text-on-surface-variant">Compliance Score</h3>
<div className="flex items-baseline gap-1">
<span className="font-display-lg text-4xl text-primary">94</span>
<span className="font-body-md text-body-md text-on-surface-variant">/100</span>
</div>
</div>
<span className="bg-emerald-100 text-emerald-700 font-label-sm text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter">Healthy</span>
</div>
<div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
<div className="bg-secondary h-full rounded-full transition-all duration-1000 ease-out" style={{ width: '94%' }}></div>
</div>
</div>
<p className="font-body-md text-[12px] text-on-surface-variant mt-3 flex items-center gap-1">
<span className="material-symbols-outlined text-[14px] text-secondary" data-icon="auto_awesome">auto_awesome</span>
                    AI Insight: 2 documents require renewal in 30 days.
                </p>
</div>
{/*  Active Filings  */}
<div className="glass-card rounded-xl p-md flex flex-col gap-2">
<span className="material-symbols-outlined text-secondary-container" data-icon="fact_check">fact_check</span>
<h3 className="font-label-sm text-label-sm text-on-surface-variant">Active Filings</h3>
<p className="font-headline-md text-headline-md text-primary">12</p>
<p className="font-label-sm text-[10px] text-emerald-600">+2 this month</p>
</div>
{/*  Pending Documents  */}
<div className="glass-card rounded-xl p-md flex flex-col gap-2">
<span className="material-symbols-outlined text-error" data-icon="pending_actions">pending_actions</span>
<h3 className="font-label-sm text-label-sm text-on-surface-variant">Pending Docs</h3>
<p className="font-headline-md text-headline-md text-primary">04</p>
<p className="font-label-sm text-[10px] text-error">Action required</p>
</div>
</div>
{/*  Recent Messages Widget  */}
<section className="glass-card rounded-xl p-md space-y-md">
<div className="flex justify-between items-center">
<h3 className="font-headline-md text-[18px] text-primary">Recent Messages</h3>
<button className="text-secondary font-label-sm text-label-sm flex items-center">View all</button>
</div>
<div className="divide-y divide-outline-variant/20">
{/*  Message Item  */}
<div className="py-3 flex gap-4 items-center active:bg-surface-container/50 transition-colors cursor-pointer">
<div className="relative">
<img className="w-10 h-10 rounded-full border border-outline-variant/30" data-alt="A professional headshot of a senior financial advisor in a light-filled modern office. The image has a clean, airy aesthetic with soft natural light coming from a large window. The color palette is dominated by whites, soft blues, and natural wood tones, creating a trustworthy and premium financial services mood." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRWgFyOZikVF8r56wkRr-ALE07jdv3e0plLljCT5KEfF3UbZkoQacnxzJTtJF-baByGAt51fmHgMb6yoLb3jlWcb_6lZ29WL0IluTRocha1Zs959537px-m2spB9rouOAhaaYqhynPgHtwInWuQLIt2Sk-eYJo01_uwf1CytqeIiT2xcGQWKYUYzCOiSZYrvGMV7XrhGOEbQOjognuCY4fB2QP4iKrtVCauDlNyK2DooqT56MT0OejckbsCXLRURv3jil1LbKTScw"/>
<span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
</div>
<div className="flex-1 min-w-0">
<div className="flex justify-between items-baseline">
<h4 className="font-label-sm text-label-sm text-primary truncate">CA Vikram Mehta</h4>
<span className="font-body-md text-[10px] text-on-surface-variant">10:45 AM</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant truncate">The GST filing for Q3 is ready for review...</p>
</div>
</div>
{/*  Message Item  */}
<div className="py-3 flex gap-4 items-center active:bg-surface-container/50 transition-colors cursor-pointer">
<img className="w-10 h-10 rounded-full border border-secondary-container/30 bg-secondary-container/10 p-1" data-alt="A conceptual 3D abstract sphere representing artificial intelligence, with glowing lines of code and data nodes. The style is futuristic and sleek, featuring deep indigo and vibrant cyan light trails against a dark, translucent backdrop. The overall mood is sophisticated, technical, and high-performance." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdkV2PToDuVcBP6vBdJMpPA6P_vdmfUgucDj8BvRUtwbpXSiXPz6s5A1VB-0fSzBxEVOLAwGY3VDjdmnkmNIcCRcTmf-Vco7wONFTftcH7ehx-XKzIbIIGkpRHFrutKe0maO27Z0jYYAio50RtlK6S04-MtJFKyFWJvBuUxLXMnKSLzQVp6jVu3WYiiYg42SYPwDQyBtnwnzHWVOLQhuR5MjBA5pyHlgSJVJfKTsPiDuTL6zyp1bzAYFHTsFA9a9ubaCibVolNhL0"/>
<div className="flex-1 min-w-0">
<div className="flex justify-between items-baseline">
<h4 className="font-label-sm text-label-sm text-secondary font-bold truncate">FinPilot AI</h4>
<span className="font-body-md text-[10px] text-on-surface-variant">Yesterday</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant truncate">I've categorized 42 new transactions for you.</p>
</div>
</div>
</div>
</section>
{/*  Quick Actions Grid  */}
<section className="space-y-sm">
<h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Quick Actions</h3>
<div className="grid grid-cols-4 gap-4">
<button className="flex flex-col items-center gap-1 group active:scale-90 transition-transform">
<div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center group-hover:bg-secondary-container/20">
<span className="material-symbols-outlined text-secondary" data-icon="upload_file">upload_file</span>
</div>
<span className="font-label-sm text-[10px] text-on-surface-variant">Upload</span>
</button>
<button className="flex flex-col items-center gap-1 group active:scale-90 transition-transform">
<div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center group-hover:bg-secondary-container/20">
<span className="material-symbols-outlined text-secondary" data-icon="history">history</span>
</div>
<span className="font-label-sm text-[10px] text-on-surface-variant">History</span>
</button>
<button className="flex flex-col items-center gap-1 group active:scale-90 transition-transform">
<div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center group-hover:bg-secondary-container/20">
<span className="material-symbols-outlined text-secondary" data-icon="account_balance">account_balance</span>
</div>
<span className="font-label-sm text-[10px] text-on-surface-variant">Taxes</span>
</button>
<button className="flex flex-col items-center gap-1 group active:scale-90 transition-transform">
<div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center group-hover:bg-secondary-container/20">
<span className="material-symbols-outlined text-secondary" data-icon="support_agent">support_agent</span>
</div>
<span className="font-label-sm text-[10px] text-on-surface-variant">Support</span>
</button>
</div>
</section>
</main>
{/*  FAB for AI Chat  */}
<button className="fixed right-6 bottom-24 w-14 h-14 bg-primary text-white rounded-full shadow-xl flex items-center justify-center active:scale-90 transition-transform z-40">
<span className="material-symbols-outlined" data-icon="auto_awesome" style={{ fontVariationSettings: '"FILL" 1' }}>auto_awesome</span>
</button>
{/*  BottomNavBar  */}
<nav className="fixed bottom-0 left-0 w-full flex justify-around items-center py-2 px-4 bg-surface border-t border-outline-variant/20 z-50">
{/*  Home (Active)  */}
<a className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-full px-4 py-1 tap-highlight-transparent active:scale-90 transition-transform" href="#">
<span className="material-symbols-outlined text-[24px]" data-icon="home" style={{ fontVariationSettings: '"FILL" 1' }}>home</span>
<span className="font-label-sm text-label-sm">Home</span>
</a>
{/*  Docs  */}
<a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-colors tap-highlight-transparent active:scale-90" href="#">
<span className="material-symbols-outlined text-[24px]" data-icon="account_balance_wallet">account_balance_wallet</span>
<span className="font-label-sm text-label-sm">Docs</span>
</a>
{/*  Compliance  */}
<a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-colors tap-highlight-transparent active:scale-90" href="#">
<span className="material-symbols-outlined text-[24px]" data-icon="verified_user">verified_user</span>
<span className="font-label-sm text-label-sm">Compliance</span>
</a>
{/*  Messages  */}
<a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-colors tap-highlight-transparent active:scale-90" href="#">
<div className="relative">
<span className="material-symbols-outlined text-[24px]" data-icon="chat_bubble">chat_bubble</span>
<span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-error rounded-full"></span>
</div>
<span className="font-label-sm text-label-sm">Messages</span>
</a>
{/*  More  */}
<a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-colors tap-highlight-transparent active:scale-90" href="#">
<span className="material-symbols-outlined text-[24px]" data-icon="more_horiz">more_horiz</span>
<span className="font-label-sm text-label-sm">More</span>
</a>
</nav>


        </div>
    );
};

export default ClientCommandCenterPage;
