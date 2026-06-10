import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { accountingService } from '../services/accountingService';

const LedgerDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { activeCompanyId } = useAuth();
    const [ledger, setLedger] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (activeCompanyId && id) {
            fetchData();
        }
    }, [activeCompanyId, id]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [ledgerData, txData] = await Promise.all([
                accountingService.getLedgerDetails(parseInt(id!)),
                accountingService.getGeneralLedger(parseInt(id!), '2023-01-01', '2024-12-31')
            ]);
            setLedger(ledgerData);
            setTransactions(txData);
        } catch (error) {
            console.error('Failed to fetch ledger details', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="stitch-app">
            

<header className="bg-surface/70 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm sticky top-0 z-50 flex justify-between items-center w-full px-gutter h-16">
<div className="flex items-center gap-md">
<span className="material-symbols-outlined text-primary cursor-pointer active:scale-95 duration-200 p-sm hover:bg-surface-container-high/50 rounded-lg" data-icon="menu">menu</span>
<h1 className="font-headline-md text-headline-md font-bold text-primary">FinPilot Pro</h1>
</div>
<nav className="hidden md:flex items-center gap-lg">
<a className="text-on-surface-variant hover:bg-surface-container-high/50 px-sm py-xs rounded transition-colors duration-200" href="#">Home</a>
<a className="text-primary font-bold px-sm py-xs rounded transition-colors duration-200" href="#">Ledgers</a>
<a className="text-on-surface-variant hover:bg-surface-container-high/50 px-sm py-xs rounded transition-colors duration-200" href="#">Compliance</a>
<a className="text-on-surface-variant hover:bg-surface-container-high/50 px-sm py-xs rounded transition-colors duration-200" href="#">HR</a>
</nav>
<div className="flex items-center gap-md">
<button className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-high/50 p-sm rounded-full transition-colors" data-icon="search">search</button>
<div className="w-10 h-10 rounded-full border-2 border-primary-fixed overflow-hidden cursor-pointer active:scale-95 duration-200">
<img alt="User Profile" data-alt="A professional headshot of a senior financial partner in a high-end corporate office setting. The lighting is soft and flattering, with a modern light-mode office background blurred in the distance. The style is clean and authoritative, reflecting the modern corporate futurism of FinPilot Pro's high-stakes environment." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwC8hdofRTU2M1yugqpPqrFkb5YJUE5341GGhcWs28MhkDbSocF9-CWxJOG7WIkQZyw8olVOUftrQIZ6Gn-om0JoDrIfr5zr-4ehhS-zD8463UkA99PvLyrhF7rUKjyXNgKur1BEvaV0wJmVoFPt_zOr7YMasfHhwSIpZ9nJbfm9f_QAT9irSdVGq78S7g1_Gg3GbLf1xiX4-mUEBlPY_2dZYxnKwD4Lh-Vqg0hoHagFpts3GQRpM0tP90YlHa-JIl0FY_d5c5LeE"/>
</div>
</div>
</header>
<main className="max-w-[1440px] mx-auto px-gutter py-lg flex flex-col gap-lg pb-24 md:pb-lg">

<section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-md">
<div>
<div className="flex items-center gap-sm mb-xs">
<span className="material-symbols-outlined text-secondary" data-icon="account_balance">account_balance</span>
<span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{ledger?.name || 'Loading...'}</span>
</div>
<h2 className="font-headline-lg text-headline-lg text-primary">{ledger?.name || 'Ledger Details'}</h2>
</div>
<div className="flex items-center gap-md">
<div className="bg-emerald-100 text-emerald-800 px-md py-xs rounded-full flex items-center gap-xs">
<span className="material-symbols-outlined text-[16px]" data-icon="verified" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
<span className="font-label-sm text-label-sm">98% Matched</span>
</div>
<button className="bg-primary text-on-primary px-lg py-sm rounded-xl font-bold flex items-center gap-sm shadow-sm hover:opacity-90 active:scale-95 transition-all">
<span className="material-symbols-outlined text-[20px]" data-icon="sync">sync</span>
                    Reconcile Now
                </button>
</div>
</section>

<div className="grid grid-cols-1 md:grid-cols-12 gap-lg">

<div className="md:col-span-4 glass-panel border border-outline-variant/30 rounded-xl p-lg shadow-sm flex flex-col justify-between h-48">
<div>
<p className="font-label-sm text-label-sm text-on-surface-variant mb-xs">Current Balance</p>
<p className="font-data-mono text-[36px] font-bold text-primary tracking-tight leading-none">₹ {ledger?.current_balance?.toLocaleString('en-IN') || '0.00'}</p>
</div>
<div className="flex items-center gap-sm">
<span className="text-emerald-600 flex items-center font-bold">
<span className="material-symbols-outlined" data-icon="trending_up">trending_up</span>
                        12.5%
                    </span>
<span className="text-on-surface-variant text-sm">vs last month</span>
</div>
</div>

<div className="md:col-span-5 glass-panel border border-outline-variant/30 rounded-xl p-lg shadow-sm h-48 relative overflow-hidden">
<div className="flex justify-between items-start mb-md">
<p className="font-label-sm text-label-sm text-on-surface-variant">Monthly Movement</p>
<span className="material-symbols-outlined text-on-surface-variant text-[20px]" data-icon="more_vert">more_vert</span>
</div>
<div className="flex items-end justify-between h-20 gap-xs">
<div className="w-full bg-secondary-container/20 rounded-t-sm h-[40%]"></div>
<div className="w-full bg-secondary-container/20 rounded-t-sm h-[65%]"></div>
<div className="w-full bg-secondary-container/20 rounded-t-sm h-[35%]"></div>
<div className="w-full bg-secondary-container/20 rounded-t-sm h-[80%]"></div>
<div className="w-full bg-secondary rounded-t-sm h-[100%]"></div>
<div className="w-full bg-secondary-container/20 rounded-t-sm h-[45%]"></div>
<div className="w-full bg-secondary-container/20 rounded-t-sm h-[60%]"></div>
</div>
<div className="flex justify-between mt-sm text-[10px] font-label-sm text-on-surface-variant uppercase">
<span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
</div>
</div>

<div className="md:col-span-3 glass-panel border border-outline-variant/30 rounded-xl p-lg shadow-sm h-48 flex flex-col justify-center">
<p className="font-label-sm text-label-sm text-on-surface-variant mb-md">Debit / Credit Split</p>
<div className="relative h-4 bg-surface-container-high rounded-full overflow-hidden flex">
<div className="h-full bg-primary" style={{ width: "62%" }}></div>
<div className="h-full bg-secondary" style={{ width: "38%" }}></div>
</div>
<div className="flex justify-between mt-md">
<div className="flex flex-col">
<span className="flex items-center gap-xs font-label-sm text-primary">
<div className="w-2 h-2 rounded-full bg-primary"></div> Debit
                        </span>
<span className="font-data-mono text-sm">62%</span>
</div>
<div className="flex flex-col items-end">
<span className="flex items-center gap-xs font-label-sm text-secondary">
                            Credit <div className="w-2 h-2 rounded-full bg-secondary"></div>
</span>
<span className="font-data-mono text-sm">38%</span>
</div>
</div>
</div>
</div>

<div className="glass-panel border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden ai-glow">

<div className="p-lg border-b border-outline-variant/20 flex flex-col md:flex-row gap-md justify-between items-center">
<div className="relative w-full md:w-96">
<span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant" data-icon="search">search</span>
<input className="w-full pl-xl pr-md py-sm bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-secondary text-sm" placeholder="Search transactions, tags or amounts..." type="text"/>
</div>
<div className="flex items-center gap-sm w-full md:w-auto">
<button className="flex-1 md:flex-none flex items-center justify-center gap-sm border border-outline-variant/30 px-md py-sm rounded-xl text-sm hover:bg-surface-container-high transition-colors">
<span className="material-symbols-outlined text-[18px]" data-icon="filter_list">filter_list</span>
                        Filters
                    </button>
<button className="flex-1 md:flex-none flex items-center justify-center gap-sm border border-outline-variant/30 px-md py-sm rounded-xl text-sm hover:bg-surface-container-high transition-colors">
<span className="material-symbols-outlined text-[18px]" data-icon="file_download">file_download</span>
                        Export
                    </button>
<button className="bg-secondary-container text-on-secondary-container p-sm rounded-xl hover:opacity-90 transition-opacity">
<span className="material-symbols-outlined block" data-icon="add">add</span>
</button>
</div>
</div>

<div className="overflow-x-auto scrollbar-hide">
<table className="w-full text-left border-collapse min-w-[800px]">
<thead className="bg-surface-container text-on-surface-variant sticky top-0">
<tr>
<th className="px-lg py-md font-label-sm text-label-sm uppercase tracking-wider">Date</th>
<th className="px-lg py-md font-label-sm text-label-sm uppercase tracking-wider">Description</th>
<th className="px-lg py-md font-label-sm text-label-sm uppercase tracking-wider">Category</th>
<th className="px-lg py-md font-label-sm text-label-sm uppercase tracking-wider text-right">Debit (Dr)</th>
<th className="px-lg py-md font-label-sm text-label-sm uppercase tracking-wider text-right">Credit (Cr)</th>
<th className="px-lg py-md font-label-sm text-label-sm uppercase tracking-wider text-right">Balance</th>
<th className="px-lg py-md font-label-sm text-label-sm uppercase tracking-wider text-center">Status</th>
</tr>
</thead>
<tbody className="custom-zebra divide-y divide-outline-variant/10">
{transactions.length === 0 ? (
    <tr>
        <td colSpan={7} className="text-center py-8 text-on-surface-variant">No transactions found</td>
    </tr>
) : (
    transactions.map((tx: any, idx: number) => (
        <tr key={idx}>
            <td className="px-lg py-md font-data-mono text-sm whitespace-nowrap">{tx.voucher_date}</td>
            <td className="px-lg py-md">
                <div className="flex flex-col">
                    <span className="font-bold text-primary">{tx.voucher_type} - {tx.voucher_id}</span>
                    <span className="text-xs text-on-surface-variant">{tx.description || tx.narration || '-'}</span>
                </div>
            </td>
            <td className="px-lg py-md">
                <span className="bg-surface-container-high px-sm py-1 rounded text-xs">{tx.voucher_type}</span>
            </td>
            <td className="px-lg py-md text-right font-data-mono text-primary">{tx.debit > 0 ? `₹${tx.debit}` : '—'}</td>
            <td className="px-lg py-md text-right font-data-mono text-secondary font-bold">{tx.credit > 0 ? `₹${tx.credit}` : '—'}</td>
            <td className="px-lg py-md text-right font-data-mono font-bold">₹{tx.running_balance || 0}</td>
            <td className="px-lg py-md text-center">
                <span className="material-symbols-outlined text-emerald-500" data-icon="check_circle" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </td>
        </tr>
    ))
)}
</tbody>
</table>
</div>

<div className="px-lg py-md bg-surface-container/30 flex justify-between items-center">
<span className="text-sm text-on-surface-variant">Showing {transactions.length} transactions</span>
<div className="flex gap-xs">
<button className="p-xs hover:bg-surface-container-high rounded border border-outline-variant/20"><span className="material-symbols-outlined block" data-icon="chevron_left">chevron_left</span></button>
<button className="bg-secondary text-on-secondary px-sm py-xs rounded text-sm font-bold">1</button>
<button className="px-sm py-xs hover:bg-surface-container-high rounded text-sm">2</button>
<button className="px-sm py-xs hover:bg-surface-container-high rounded text-sm">3</button>
<button className="p-xs hover:bg-surface-container-high rounded border border-outline-variant/20"><span className="material-symbols-outlined block" data-icon="chevron_right">chevron_right</span></button>
</div>
</div>
</div>
</main>

<nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center py-2 px-4 bg-surface border-t border-outline-variant/20 z-50 rounded-t-xl shadow-lg">
<div className="flex flex-col items-center justify-center text-on-surface-variant">
<span className="material-symbols-outlined" data-icon="home">home</span>
<span className="font-label-sm text-label-sm">Home</span>
</div>
<div className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-full px-4 py-1">
<span className="material-symbols-outlined" data-icon="account_balance_wallet" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
<span className="font-label-sm text-label-sm">Ledgers</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant">
<span className="material-symbols-outlined" data-icon="verified_user">verified_user</span>
<span className="font-label-sm text-label-sm">Verify</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant">
<span className="material-symbols-outlined" data-icon="groups">groups</span>
<span className="font-label-sm text-label-sm">HR</span>
</div>
<div className="flex flex-col items-center justify-center text-on-surface-variant">
<span className="material-symbols-outlined" data-icon="more_horiz">more_horiz</span>
<span className="font-label-sm text-label-sm">More</span>
</div>
</nav>

<button className="fixed bottom-20 right-gutter md:bottom-lg md:right-lg bg-primary-container text-on-primary-container w-14 h-14 rounded-full flex items-center justify-center shadow-2xl ai-glow cursor-pointer active:scale-95 transition-all z-[70]">
<span className="material-symbols-outlined" data-icon="auto_awesome" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
</button>

<div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-20">

</div>


        </div>
    );
};

export default LedgerDetailsPage;
