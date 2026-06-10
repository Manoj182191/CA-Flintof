import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { accountingService, Ledger, VoucherCreate, VoucherTransaction } from '../services/accountingService';

const JournalVoucherPage: React.FC = () => {
    const { activeCompanyId } = useAuth();
    const [ledgers, setLedgers] = useState<Ledger[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const [voucherDate, setVoucherDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [narration, setNarration] = useState('');
    
    const [transactions, setTransactions] = useState<VoucherTransaction[]>([
        { ledger_id: 0, debit: 0, credit: 0 },
        { ledger_id: 0, debit: 0, credit: 0 }
    ]);

    useEffect(() => {
        if (activeCompanyId) {
            fetchLedgers();
        }
    }, [activeCompanyId]);

    const fetchLedgers = async () => {
        try {
            const data = await accountingService.getLedgers(parseInt(activeCompanyId!));
            setLedgers(data);
        } catch (error) {
            console.error('Failed to fetch ledgers', error);
        }
    };

    const handleAddRow = () => {
        setTransactions([...transactions, { ledger_id: 0, debit: 0, credit: 0 }]);
    };

    const handleTransactionChange = (index: number, field: keyof VoucherTransaction, value: number) => {
        const updated = [...transactions];
        updated[index] = { ...updated[index], [field]: value };
        setTransactions(updated);
    };

    const handleRemoveRow = (index: number) => {
        const updated = transactions.filter((_, i) => i !== index);
        setTransactions(updated);
    };

    const totalDebit = transactions.reduce((sum, t) => sum + (t.debit || 0), 0);
    const totalCredit = transactions.reduce((sum, t) => sum + (t.credit || 0), 0);
    const difference = totalDebit - totalCredit;

    const handleSubmit = async () => {
        if (!activeCompanyId) return;
        if (difference !== 0) {
            alert('Debit and Credit totals must match.');
            return;
        }
        if (transactions.some(t => t.ledger_id === 0)) {
            alert('Please select a ledger for all rows.');
            return;
        }

        setIsLoading(true);
        try {
            const voucher: VoucherCreate = {
                company_id: parseInt(activeCompanyId!),
                voucher_type: 'JOURNAL',
                voucher_date: voucherDate,
                description,
                narration,
                transactions: transactions.filter(t => t.debit > 0 || t.credit > 0)
            };
            await accountingService.createVoucher(voucher);
            alert('Journal voucher posted successfully');
            setTransactions([
                { ledger_id: 0, debit: 0, credit: 0 },
                { ledger_id: 0, debit: 0, credit: 0 }
            ]);
            setDescription('');
            setNarration('');
        } catch (error) {
            console.error('Failed to create voucher', error);
            alert('Failed to post voucher');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="stitch-app">
            

<header className="bg-surface/70 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm flex justify-between items-center w-full px-gutter h-16 z-50 sticky top-0">
<div className="flex items-center gap-4">
<button className="material-symbols-outlined text-primary cursor-pointer active:scale-95 duration-200">menu</button>
<h1 className="font-headline-md text-headline-md font-bold text-primary">FinPilot Pro</h1>
</div>
<div className="flex items-center gap-4">
<span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:bg-surface-container-high/50 p-2 rounded-full transition-colors">search</span>
<div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold overflow-hidden cursor-pointer active:scale-95 duration-200">
<img alt="Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUfhihwVJ_WHe8F1DGmafbglaw4ohyBBkwQALQWF2G1XwDQqyU-cmwUAtNdNaadIWaFbqHUx37l6ROIlMt_W1OyUmVHNh-bqnJxG7rfGgLl0cf5ju93yf-j6E_N62xn_7D-vobI7Mh2-pXrI0J4KQLiEt3CsqTLNfldtSgHHZN3XnqekUst2fO_77IaEB2HUMT9miO3bae10E3Y0M98ZdAlxUTkEZRKCMe_qofduOlCmwxTxAQhyJF2ox1S0czVJgSaCkFtYw_53w"/>
</div>
</div>
</header>
<main className="max-w-[1440px] mx-auto px-gutter py-8 flex flex-col md:flex-row gap-8">

<aside className="hidden md:flex flex-col w-[280px] shrink-0 gap-2">
<div className="p-md mb-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl">
<div className="flex items-center gap-3">
<div className="w-12 h-12 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container">
<span className="material-symbols-outlined">account_balance</span>
</div>
<div>
<p className="font-bold text-primary">CA Vikram Mehta</p>
<p className="text-xs text-on-surface-variant">Senior Partner</p>
</div>
</div>
</div>
<nav className="flex flex-col gap-1">
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all" href="#">
<span className="material-symbols-outlined">fact_check</span>
<span className="font-body-md">Audit</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 bg-secondary-container text-on-secondary-container rounded-lg font-bold transition-all" href="#">
<span className="material-symbols-outlined">account_balance_wallet</span>
<span className="font-body-md">Ledgers</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all" href="#">
<span className="material-symbols-outlined">payments</span>
<span className="font-body-md">TDS</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all" href="#">
<span className="material-symbols-outlined">receipt_long</span>
<span className="font-body-md">GST</span>
</a>
</nav>
</aside>

<section className="flex-1 space-y-6">

<div className="glass-panel p-6 rounded-2xl ai-glow border-l-4 border-l-secondary relative overflow-hidden">
<div className="absolute top-0 right-0 p-4 opacity-10">
<span className="material-symbols-outlined text-6xl">auto_awesome</span>
</div>
<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
<div className="space-y-1">
<h2 className="font-headline-lg text-headline-lg text-primary">Journal Voucher</h2>
<p className="text-on-surface-variant">Enter multi-line adjustments and internal transfers.</p>
</div>
<button className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-full font-bold active:scale-95 transition-all shadow-md">
<span className="material-symbols-outlined text-[20px]">auto_awesome</span>
<span>AI Voucher Suggestion</span>
</button>
</div>

<div className="mt-4 flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-lg border border-secondary/20">
<span className="material-symbols-outlined text-secondary text-sm">info</span>
<p className="text-sm text-secondary font-medium">FinPilot Suggestion: This looks like a month-end depreciation entry. Would you like to auto-calculate?</p>
</div>
</div>

<div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 lg:p-8 space-y-8 shadow-sm">

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
<div className="space-y-2">
<label className="text-label-sm font-label-sm text-on-surface-variant px-1">Voucher Date</label>
<input 
    className="w-full bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-secondary text-body-md h-12" 
    type="date" 
    value={voucherDate}
    onChange={e => setVoucherDate(e.target.value)}
/>
</div>
<div className="space-y-2">
<label className="text-label-sm font-label-sm text-on-surface-variant px-1">Description</label>
<input 
    className="w-full bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-secondary text-body-md h-12" 
    placeholder="e.g. Month-end depreciation" 
    type="text"
    value={description}
    onChange={e => setDescription(e.target.value)}
/>
</div>
<div className="space-y-2">
<label className="text-label-sm font-label-sm text-on-surface-variant px-1">Currency</label>
<select className="w-full bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-secondary text-body-md h-12">
<option>INR - Indian Rupee</option>
<option>USD - US Dollar</option>
</select>
</div>
</div>

<div className="overflow-x-auto rounded-xl border border-outline-variant/20">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-low">
<th className="p-4 font-label-sm text-on-surface-variant">Ledger Account</th>
<th className="p-4 font-label-sm text-on-surface-variant w-40 text-right">Debit</th>
<th className="p-4 font-label-sm text-on-surface-variant w-40 text-right">Credit</th>
<th className="p-4 font-label-sm text-on-surface-variant w-12 text-center"></th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/20">
{transactions.map((t, index) => (
<tr key={index} className="hover:bg-surface-container-low/50 transition-colors">
<td className="p-2">
<select 
    className="w-full bg-transparent border-none focus:ring-0 text-body-md font-medium" 
    value={t.ledger_id}
    onChange={e => handleTransactionChange(index, 'ledger_id', parseInt(e.target.value))}
>
    <option value={0}>Select Ledger...</option>
    {ledgers.map(l => (
        <option key={l.id} value={l.id}>{l.name}</option>
    ))}
</select>
</td>
<td className="p-2">
<input 
    className="w-full bg-transparent border-none focus:ring-0 text-right font-data-mono text-body-md" 
    placeholder="0.00" 
    type="number" 
    value={t.debit || ''}
    onChange={e => {
        handleTransactionChange(index, 'debit', parseFloat(e.target.value) || 0);
        if (parseFloat(e.target.value) > 0) handleTransactionChange(index, 'credit', 0);
    }}
/>
</td>
<td className="p-2">
<input 
    className="w-full bg-transparent border-none focus:ring-0 text-right font-data-mono text-body-md" 
    placeholder="0.00" 
    type="number"
    value={t.credit || ''}
    onChange={e => {
        handleTransactionChange(index, 'credit', parseFloat(e.target.value) || 0);
        if (parseFloat(e.target.value) > 0) handleTransactionChange(index, 'debit', 0);
    }}
/>
</td>
<td className="p-2 text-center">
<button onClick={() => handleRemoveRow(index)} className="material-symbols-outlined text-outline hover:text-error transition-colors">delete</button>
</td>
</tr>
))}
</tbody>
<tfoot className="bg-surface-container-low/30 border-t border-outline-variant/40">
<tr>
<td className="p-4">
<button onClick={handleAddRow} className="flex items-center gap-2 text-secondary font-bold text-sm hover:underline">
<span className="material-symbols-outlined text-sm">add</span>
                                        Add Line
                                    </button>
</td>
<td className="p-4 text-right font-data-mono font-bold text-primary">₹ {totalDebit.toFixed(2)}</td>
<td className="p-4 text-right font-data-mono font-bold text-primary">₹ {totalCredit.toFixed(2)}</td>
<td className="p-4 text-center">
    {difference !== 0 && <span className="text-error font-bold text-xs">Diff: ₹{difference.toFixed(2)}</span>}
</td>
</tr>
</tfoot>
</table>
</div>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
<div className="space-y-2">
<label className="text-label-sm font-label-sm text-on-surface-variant px-1">Narration</label>
<textarea 
    className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-secondary text-body-md resize-none p-4" 
    placeholder="Enter transaction details..." 
    rows={4}
    value={narration}
    onChange={e => setNarration(e.target.value)}
/>
</div>
<div className="space-y-2">
<label className="text-label-sm font-label-sm text-on-surface-variant px-1">Supporting Documents</label>
<div className="border-2 border-dashed border-outline-variant/50 rounded-xl p-8 flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer group h-[124px]">
<span className="material-symbols-outlined text-3xl group-hover:text-secondary mb-2">cloud_upload</span>
<p className="text-xs font-medium">Click to upload or drag and drop</p>
<p className="text-[10px] opacity-60 mt-1">PDF, PNG, JPG up to 10MB</p>
</div>

<div className="flex items-center gap-3 bg-surface-container-low p-3 rounded-lg border border-outline-variant/30 mt-2">
<span className="material-symbols-outlined text-secondary">description</span>
<div className="flex-1 overflow-hidden">
<p className="text-sm font-medium truncate">Depreciation_Schedule_Nov23.pdf</p>
<p className="text-[10px] text-on-surface-variant">2.4 MB</p>
</div>
<button className="material-symbols-outlined text-outline hover:text-error text-sm">close</button>
</div>
</div>
</div>

<div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-outline-variant/20">
<button className="w-full sm:w-auto px-8 py-3 text-on-surface-variant font-bold hover:bg-surface-container-high rounded-lg transition-colors">
                        Save as Draft
                    </button>
<button 
    onClick={handleSubmit}
    disabled={isLoading}
    className="w-full sm:w-auto px-10 py-3 bg-secondary text-white font-bold rounded-lg shadow-lg shadow-secondary/20 hover:shadow-secondary/40 active:scale-95 transition-all disabled:opacity-50">
    {isLoading ? 'Posting...' : 'Post Voucher'}
</button>
</div>
</div>

<div className="fixed right-8 bottom-24 hidden xl:block w-80 glass-panel p-4 rounded-2xl shadow-2xl ai-glow border border-secondary/20">
<div className="flex items-center gap-3 mb-4 border-b border-outline-variant/20 pb-3">
<div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center">
<span className="material-symbols-outlined text-on-secondary-container text-sm">auto_awesome</span>
</div>
<div>
<h4 className="font-bold text-sm">FinPilot AI</h4>
<p className="text-[10px] text-on-surface-variant">Accounting Assistant</p>
</div>
</div>
<div className="space-y-4 h-64 overflow-y-auto custom-scrollbar pr-2 mb-4">
<div className="bg-surface-container p-3 rounded-xl rounded-tl-none">
<p className="text-xs">Based on the narration, I've matched the depreciation accounts. Do you need help verifying the asset values from the fixed asset register?</p>
</div>
<div className="bg-secondary/10 p-3 rounded-xl rounded-tr-none text-right ml-4">
<p className="text-xs">Yes, please cross-verify with register ID: FA-2023-09.</p>
</div>
</div>
<div className="relative">
<input className="w-full bg-surface-container border-none rounded-full px-4 py-2 text-xs focus:ring-1 focus:ring-secondary" placeholder="Ask AI anything..." type="text"/>
<button className="absolute right-2 top-1.5 material-symbols-outlined text-secondary text-lg">send</button>
</div>
</div>
</section>
</main>

<nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center py-2 px-4 bg-surface border-t border-outline-variant/20 z-50">
<a className="flex flex-col items-center justify-center text-on-surface-variant" href="#">
<span className="material-symbols-outlined">home</span>
<span className="text-[10px]">Home</span>
</a>
<a className="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-full px-4 py-1" href="#">
<span className="material-symbols-outlined">account_balance_wallet</span>
<span className="text-[10px] font-bold">Ledgers</span>
</a>
<a className="flex flex-col items-center justify-center text-on-surface-variant" href="#">
<span className="material-symbols-outlined">verified_user</span>
<span className="text-[10px]">Compliance</span>
</a>
<a className="flex flex-col items-center justify-center text-on-surface-variant" href="#">
<span className="material-symbols-outlined">more_horiz</span>
<span className="text-[10px]">More</span>
</a>
</nav>


        </div>
    );
};

export default JournalVoucherPage;
